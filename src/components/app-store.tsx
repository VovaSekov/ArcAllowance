"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { agents, initialAuditEvents, initialReceipts, initialSpendRequests, merchants, policies } from "@/lib/seed-data";
import { isArcTestnetMode, isRealSettlementMode } from "@/lib/settlement-mode";
import type { Agent, AppState, Merchant, PolicyEvaluation, Receipt, SpendInput, SpendRequest } from "@/lib/types";
import { createId } from "@/lib/utils";

type SubmitSpendRequestResult = {
  state: AppState;
  request: SpendRequest;
  receipt?: Receipt;
  evaluation: PolicyEvaluation;
};

type ApprovalResult = {
  state: AppState;
  request: SpendRequest;
  receipt?: Receipt;
};

type StoreContextValue = AppState & {
  agents: Agent[];
  merchants: Merchant[];
  policies: typeof policies;
  loading: boolean;
  submitSpendRequest: (input: SpendInput) => Promise<SubmitSpendRequestResult>;
  approveRequest: (requestId: string) => Promise<Receipt | undefined>;
  rejectRequest: (requestId: string) => Promise<void>;
  resetDemoState: () => Promise<void>;
};

const defaultState: AppState = {
  spendRequests: isArcTestnetMode || isRealSettlementMode ? [] : initialSpendRequests,
  receipts: isArcTestnetMode || isRealSettlementMode ? [] : initialReceipts,
  auditEvents: isArcTestnetMode || isRealSettlementMode ? [] : initialAuditEvents,
  idempotencyKeys: {}
};

const StoreContext = createContext<StoreContextValue | null>(null);

function adminHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem("arcallowance_admin_token")?.trim();
  return token ? { "x-arc-admin-token": token } : {};
}

async function parseJsonResponse<T>(response: Response, fallbackError: string): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data && typeof data === "object" && "error" in data)) {
    throw new Error(typeof data.error === "string" ? data.error : fallbackError);
  }
  return data as T;
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);

  const refreshState = useCallback(async () => {
    const response = await fetch("/api/app-state", { cache: "no-store" });
    const nextState = await parseJsonResponse<AppState>(response, "Could not load app state.");
    setState(nextState);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const response = await fetch("/api/app-state", { cache: "no-store" });
        const nextState = await parseJsonResponse<AppState>(response, "Could not load app state.");
        if (!cancelled) {
          setState(nextState);
        }
      } catch {
        if (!cancelled) {
          setState(defaultState);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitSpendRequest = useCallback(async (input: SpendInput) => {
    const response = await fetch("/api/spend-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": createId("idem"),
        ...adminHeaders()
      },
      body: JSON.stringify({ input })
    });
    const result = await parseJsonResponse<SubmitSpendRequestResult>(response, "Spend request failed.");
    setState(result.state);
    return result;
  }, []);

  const approveRequest = useCallback(async (requestId: string) => {
    const response = await fetch("/api/approvals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminHeaders()
      },
      body: JSON.stringify({ requestId, decision: "approved" })
    });
    const result = await parseJsonResponse<ApprovalResult>(response, "Approval failed.");
    setState(result.state);
    return result.receipt;
  }, []);

  const rejectRequest = useCallback(async (requestId: string) => {
    const response = await fetch("/api/approvals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminHeaders()
      },
      body: JSON.stringify({ requestId, decision: "rejected" })
    });
    const result = await parseJsonResponse<ApprovalResult>(response, "Rejection failed.");
    setState(result.state);
  }, []);

  const resetDemoState = useCallback(async () => {
    const response = await fetch("/api/app-state/reset", {
      method: "POST",
      headers: adminHeaders()
    });
    const nextState = await parseJsonResponse<AppState>(response, "State reset failed.");
    setState(nextState);
    await refreshState();
  }, [refreshState]);

  const value = useMemo<StoreContextValue>(
    () => ({
      agents,
      merchants,
      policies,
      spendRequests: state.spendRequests,
      receipts: state.receipts,
      auditEvents: state.auditEvents,
      idempotencyKeys: state.idempotencyKeys,
      loading,
      submitSpendRequest,
      approveRequest,
      rejectRequest,
      resetDemoState
    }),
    [approveRequest, loading, rejectRequest, resetDemoState, state, submitSpendRequest]
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
