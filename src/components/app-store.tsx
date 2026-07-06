"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createMockReceipt, generateMemoId, generateMockArcTxHash, generateMockGatewayAuthorizationHash } from "@/lib/mock-settlement";
import { agents, initialAuditEvents, initialReceipts, initialSpendRequests, merchants, policies } from "@/lib/seed-data";
import type { Agent, AuditEvent, Merchant, PaymentType, Receipt, SpendInput, SpendRequest } from "@/lib/types";
import { createId } from "@/lib/utils";

type AppState = {
  spendRequests: SpendRequest[];
  receipts: Receipt[];
  auditEvents: AuditEvent[];
};

type StoreContextValue = AppState & {
  agents: Agent[];
  merchants: Merchant[];
  policies: typeof policies;
  addSpendRequest: (input: Omit<SpendRequest, "id" | "createdAt">) => SpendRequest;
  settleApprovedRequest: (request: SpendRequest) => Receipt | undefined;
  approveRequest: (requestId: string) => Receipt | undefined;
  rejectRequest: (requestId: string) => void;
  resetDemoState: () => void;
};

const storageKey = "arcallowance_state_v1";

const defaultState: AppState = {
  spendRequests: initialSpendRequests,
  receipts: initialReceipts,
  auditEvents: initialAuditEvents
};

const StoreContext = createContext<StoreContextValue | null>(null);

function findAgent(agentId: string): Agent | undefined {
  return agents.find((agent) => agent.id === agentId);
}

function findMerchant(merchantId: string): Merchant | undefined {
  return merchants.find((merchant) => merchant.id === merchantId);
}

function auditEvent(entityId: string, action: string, metadata: AuditEvent["metadata"] = {}): AuditEvent {
  return {
    id: createId("audit"),
    entityType: "spend_request",
    entityId,
    action,
    metadata,
    createdAt: new Date().toISOString()
  };
}

function settlementFields(paymentType: PaymentType) {
  return {
    memoId: generateMemoId(),
    gatewayAuthorizationHash: paymentType === "usdc_transfer" ? undefined : generateMockGatewayAuthorizationHash(),
    txHash: generateMockArcTxHash()
  };
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        setState(JSON.parse(raw) as AppState);
      } catch {
        setState(defaultState);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const addSpendRequest = useCallback((input: Omit<SpendRequest, "id" | "createdAt">) => {
    const request: SpendRequest = {
      ...input,
      id: createId("spend"),
      createdAt: new Date().toISOString()
    };

    setState((current) => ({
      ...current,
      spendRequests: [request, ...current.spendRequests],
      auditEvents: [
        auditEvent(request.id, request.status === "rejected" ? "policy_rejected" : "policy_evaluated", {
          status: request.status,
          amountUSDC: request.amountUSDC
        }),
        ...current.auditEvents
      ]
    }));

    return request;
  }, []);

  const settleApprovedRequest = useCallback((request: SpendRequest) => {
    const agent = findAgent(request.agentId);
    const merchant = findMerchant(request.merchantId);
    if (!agent || !merchant || request.status === "rejected" || request.status === "needs_approval") {
      return undefined;
    }

    const fields = settlementFields(request.paymentType);
    const withSettlement: SpendRequest = {
      ...request,
      status: "settled",
      memoId: request.memoId ?? fields.memoId,
      gatewayAuthorizationHash: request.gatewayAuthorizationHash ?? fields.gatewayAuthorizationHash,
      txHash: request.txHash ?? fields.txHash
    };
    const receipt = createMockReceipt(withSettlement, agent, merchant, request.paymentType);

    setState((current) => ({
      ...current,
      spendRequests: current.spendRequests.map((item) => (item.id === request.id ? withSettlement : item)),
      receipts: [receipt, ...current.receipts],
      auditEvents: [auditEvent(request.id, "mock_settled", { receiptId: receipt.id }), ...current.auditEvents]
    }));

    return receipt;
  }, []);

  const approveRequest = useCallback((requestId: string) => {
    let createdReceipt: Receipt | undefined;

    setState((current) => {
      const request = current.spendRequests.find((item) => item.id === requestId);
      if (!request) {
        return current;
      }
      const agent = findAgent(request.agentId);
      const merchant = findMerchant(request.merchantId);
      if (!agent || !merchant) {
        return current;
      }

      const fields = settlementFields(request.paymentType);
      const settledRequest: SpendRequest = {
        ...request,
        status: "settled",
        memoId: request.memoId ?? fields.memoId,
        gatewayAuthorizationHash: request.gatewayAuthorizationHash ?? fields.gatewayAuthorizationHash,
        txHash: request.txHash ?? fields.txHash
      };
      createdReceipt = createMockReceipt(settledRequest, agent, merchant, request.paymentType);

      return {
        ...current,
        spendRequests: current.spendRequests.map((item) => (item.id === requestId ? settledRequest : item)),
        receipts: [createdReceipt, ...current.receipts],
        auditEvents: [
          auditEvent(requestId, "human_approved", { receiptId: createdReceipt.id }),
          auditEvent(requestId, "mock_settled", { receiptId: createdReceipt.id }),
          ...current.auditEvents
        ]
      };
    });

    return createdReceipt;
  }, []);

  const rejectRequest = useCallback((requestId: string) => {
    setState((current) => ({
      ...current,
      spendRequests: current.spendRequests.map((request) =>
        request.id === requestId ? { ...request, status: "rejected" } : request
      ),
      auditEvents: [auditEvent(requestId, "human_rejected"), ...current.auditEvents]
    }));
  }, []);

  const resetDemoState = useCallback(() => {
    setState(defaultState);
    window.localStorage.removeItem(storageKey);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      agents,
      merchants,
      policies,
      spendRequests: state.spendRequests,
      receipts: state.receipts,
      auditEvents: state.auditEvents,
      addSpendRequest,
      settleApprovedRequest,
      approveRequest,
      rejectRequest,
      resetDemoState
    }),
    [addSpendRequest, approveRequest, rejectRequest, resetDemoState, settleApprovedRequest, state]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}

export function createSpendRequestFromInput(input: SpendInput, evaluation: Pick<SpendRequest, "status" | "policyChecks" | "riskScore">): Omit<SpendRequest, "id" | "createdAt"> {
  const settlement = evaluation.status === "approved" ? settlementFields(input.paymentType) : {};

  return {
    ...input,
    ...evaluation,
    ...settlement
  };
}
