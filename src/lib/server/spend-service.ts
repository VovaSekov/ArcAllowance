import "server-only";

import { anchorSpendRequest, markAnchoredDecision } from "@/lib/arc-testnet-registry";
import { createMockReceipt, generateMemoId, generateMockArcTxHash, generateMockGatewayAuthorizationHash } from "@/lib/mock-settlement";
import { evaluateSpendRequest } from "@/lib/policy-engine";
import { isArcTestnetMode, settlementMode } from "@/lib/settlement-mode";
import { agents, merchants, policies } from "@/lib/seed-data";
import { mutateAppState } from "@/lib/server/state-store";
import type { AppState, AuditEvent, PaymentType, PolicyEvaluation, Receipt, SpendInput, SpendRequest } from "@/lib/types";
import { createId } from "@/lib/utils";

type SubmitSpendRequestResult = {
  state: AppState;
  request: SpendRequest;
  receipt?: Receipt;
  evaluation: PolicyEvaluation;
};

type ApprovalDecision = "approved" | "rejected";

const paymentTypes = ["x402", "usdc_transfer", "batch"] as const satisfies readonly PaymentType[];

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

export function parseSpendInput(value: unknown): SpendInput {
  if (!value || typeof value !== "object") {
    throw new Error("Spend input is required.");
  }

  const candidate = value as Partial<Record<keyof SpendInput, unknown>>;
  const amountUSDC = typeof candidate.amountUSDC === "number" ? candidate.amountUSDC : Number(candidate.amountUSDC);
  const paymentType = candidate.paymentType;

  if (typeof candidate.agentId !== "string" || !agents.some((agent) => agent.id === candidate.agentId)) {
    throw new Error("Unknown agent.");
  }
  if (typeof candidate.merchantId !== "string" || !merchants.some((merchant) => merchant.id === candidate.merchantId)) {
    throw new Error("Unknown merchant.");
  }
  if (!Number.isFinite(amountUSDC) || amountUSDC <= 0 || amountUSDC > 1_000_000) {
    throw new Error("Amount must be a positive USDC value.");
  }
  if (typeof candidate.purpose !== "string" || !candidate.purpose.trim()) {
    throw new Error("Purpose is required.");
  }
  if (typeof paymentType !== "string" || !paymentTypes.includes(paymentType as PaymentType)) {
    throw new Error("Unsupported payment type.");
  }

  return {
    agentId: candidate.agentId,
    merchantId: candidate.merchantId,
    amountUSDC: Number(amountUSDC.toFixed(6)),
    purpose: candidate.purpose.trim().slice(0, 96),
    paymentType: paymentType as PaymentType
  };
}

function createEvaluatedRequest(input: SpendInput, evaluation: PolicyEvaluation): SpendRequest {
  const settlement = !isArcTestnetMode && evaluation.status === "approved" ? settlementFields(input.paymentType) : {};
  return {
    ...input,
    ...evaluation,
    ...settlement,
    id: createId("spend"),
    settlementMode,
    createdAt: new Date().toISOString()
  };
}

function findRequestReceipt(state: AppState, requestId: string): Receipt | undefined {
  return state.receipts.find((receipt) => receipt.spendRequestId === requestId);
}

function cloneState(state: AppState): AppState {
  return {
    spendRequests: [...state.spendRequests],
    receipts: [...state.receipts],
    auditEvents: [...state.auditEvents],
    idempotencyKeys: { ...(state.idempotencyKeys ?? {}) }
  };
}

async function settleApprovedRequest(request: SpendRequest): Promise<{ request: SpendRequest; receipt?: Receipt; eventAction: string }> {
  if (isArcTestnetMode) {
    const anchored = await anchorSpendRequest(request);
    return {
      request: { ...request, ...anchored.requestPatch },
      receipt: anchored.receipt,
      eventAction: anchored.receipt ? "arc_testnet_settled" : "arc_testnet_anchored"
    };
  }

  const agent = agents.find((item) => item.id === request.agentId);
  const merchant = merchants.find((item) => item.id === request.merchantId);
  if (!agent || !merchant) {
    throw new Error("Unknown agent or merchant.");
  }

  const nextRequest: SpendRequest = {
    ...request,
    status: "settled",
    settlementMode: "mock",
    memoId: request.memoId ?? generateMemoId(),
    gatewayAuthorizationHash: request.gatewayAuthorizationHash ?? (request.paymentType === "usdc_transfer" ? undefined : generateMockGatewayAuthorizationHash()),
    txHash: request.txHash ?? generateMockArcTxHash()
  };

  return {
    request: nextRequest,
    receipt: createMockReceipt(nextRequest, agent, merchant, request.paymentType),
    eventAction: "mock_settled"
  };
}

async function anchorNonSettledRequest(request: SpendRequest): Promise<{ request: SpendRequest; receipt?: Receipt; eventAction: string }> {
  if (!isArcTestnetMode) {
    return {
      request,
      eventAction: request.status === "rejected" ? "policy_rejected" : "policy_evaluated"
    };
  }

  const anchored = await anchorSpendRequest(request);
  return {
    request: { ...request, ...anchored.requestPatch },
    eventAction: request.status === "rejected" ? "arc_testnet_rejected" : "arc_testnet_anchored"
  };
}

export async function submitSpendRequest(input: SpendInput, idempotencyKey?: string): Promise<SubmitSpendRequestResult> {
  return mutateAppState(async (state) => {
    const cleanKey = idempotencyKey?.trim().slice(0, 120);
    const previousId = cleanKey ? state.idempotencyKeys?.[cleanKey] : undefined;
    const previousRequest = previousId ? state.spendRequests.find((request) => request.id === previousId) : undefined;

    if (previousRequest) {
      const receipt = findRequestReceipt(state, previousRequest.id);
      return {
        state: cloneState(state),
        request: previousRequest,
        receipt,
        evaluation: {
          status: previousRequest.status === "settled" ? "approved" : previousRequest.status,
          policyChecks: previousRequest.policyChecks,
          riskScore: previousRequest.riskScore
        }
      };
    }

    const policy = policies.find((item) => item.agentId === input.agentId);
    const merchant = merchants.find((item) => item.id === input.merchantId);
    if (!policy || !merchant) {
      throw new Error("Unknown policy or merchant.");
    }

    const evaluation = evaluateSpendRequest({ input, policy, merchant, existingRequests: state.spendRequests });
    const request = createEvaluatedRequest(input, evaluation);
    const settlement = evaluation.status === "approved"
      ? await settleApprovedRequest(request)
      : await anchorNonSettledRequest(request);

    state.spendRequests = [settlement.request, ...state.spendRequests];
    if (settlement.receipt) {
      state.receipts = [settlement.receipt, ...state.receipts];
    }
    state.auditEvents = [
      auditEvent(settlement.request.id, evaluation.status === "rejected" ? "policy_rejected" : "policy_evaluated", {
        status: evaluation.status,
        amountUSDC: input.amountUSDC
      }),
      auditEvent(settlement.request.id, settlement.eventAction, {
        onchainRequestId: settlement.request.onchainRequestId ?? null,
        txHash: settlement.request.txHash ?? null,
        receiptId: settlement.receipt?.id ?? null
      }),
      ...state.auditEvents
    ];
    state.idempotencyKeys = state.idempotencyKeys ?? {};
    if (cleanKey) {
      state.idempotencyKeys[cleanKey] = settlement.request.id;
    }

    return {
      state: cloneState(state),
      request: settlement.request,
      receipt: settlement.receipt,
      evaluation
    };
  });
}

export async function decideSpendRequest(requestId: string, decision: ApprovalDecision): Promise<{ state: AppState; request: SpendRequest; receipt?: Receipt }> {
  return mutateAppState(async (state) => {
    const request = state.spendRequests.find((item) => item.id === requestId);
    if (!request) {
      throw new Error("Spend request not found.");
    }

    if (request.status !== "needs_approval") {
      return {
        state: cloneState(state),
        request,
        receipt: findRequestReceipt(state, request.id)
      };
    }

    let nextRequest: SpendRequest;
    let receipt: Receipt | undefined;
    let settlementAction: string;

    if (decision === "approved") {
      if (isArcTestnetMode) {
        const anchored = await markAnchoredDecision(request, "approved");
        nextRequest = { ...request, ...anchored.requestPatch };
        receipt = anchored.receipt;
        settlementAction = "arc_testnet_settled";
      } else {
        const settlement = await settleApprovedRequest({ ...request, status: "approved" });
        nextRequest = settlement.request;
        receipt = settlement.receipt;
        settlementAction = settlement.eventAction;
      }
    } else {
      if (isArcTestnetMode) {
        const anchored = await markAnchoredDecision(request, "rejected");
        nextRequest = { ...request, ...anchored.requestPatch };
        settlementAction = "arc_testnet_rejected";
      } else {
        nextRequest = { ...request, status: "rejected" };
        settlementAction = "human_rejected";
      }
    }

    state.spendRequests = state.spendRequests.map((item) => (item.id === requestId ? nextRequest : item));
    if (receipt) {
      state.receipts = [receipt, ...state.receipts];
    }
    state.auditEvents = [
      auditEvent(requestId, decision === "approved" ? "human_approved" : "human_rejected", {
        receiptId: receipt?.id ?? null
      }),
      auditEvent(requestId, settlementAction, {
        onchainRequestId: nextRequest.onchainRequestId ?? null,
        txHash: nextRequest.txHash ?? null,
        receiptId: receipt?.id ?? null
      }),
      ...state.auditEvents
    ];

    return {
      state: cloneState(state),
      request: nextRequest,
      receipt
    };
  });
}
