import "server-only";

import type { Agent, Merchant, PaymentType, Receipt, SettlementProvider, SpendRequest } from "@/lib/types";
import { createId } from "@/lib/utils";

type AdapterStatus = "settled" | "pending" | "failed";

type SettlementAdapterResponse = {
  status?: unknown;
  provider?: unknown;
  providerPaymentId?: unknown;
  providerStatus?: unknown;
  providerReference?: unknown;
  txHash?: unknown;
  gatewayAuthorizationHash?: unknown;
  gatewayBatchId?: unknown;
  memoId?: unknown;
  error?: unknown;
};

type NormalizedSettlementResult = {
  status: AdapterStatus;
  provider: SettlementProvider;
  providerPaymentId: string;
  providerStatus?: string;
  providerReference?: string;
  txHash?: string;
  gatewayAuthorizationHash?: string;
  gatewayBatchId?: string;
  memoId: string;
};

export type SettlementWebhookPayload = {
  spendRequestId: string;
  status: AdapterStatus;
  provider?: SettlementProvider;
  providerPaymentId?: string;
  providerStatus?: string;
  providerReference?: string;
  txHash?: string;
  gatewayAuthorizationHash?: string;
  gatewayBatchId?: string;
  memoId?: string;
  error?: string;
};

export type RealSettlementReadiness = {
  mode: string;
  ready: boolean;
  enabled: boolean;
  provider: SettlementProvider;
  adapterUrlConfigured: boolean;
  adapterTokenConfigured: boolean;
  webhookSecretConfigured: boolean;
  anchorArcTestnet: boolean;
  missing: string[];
  warnings: string[];
};

const providers = ["custom", "circle", "gateway_x402"] as const satisfies readonly SettlementProvider[];

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function settlementProvider(): SettlementProvider {
  const value = env("REAL_SETTLEMENT_PROVIDER");
  return providers.includes(value as SettlementProvider) ? value as SettlementProvider : "custom";
}

function requireRealSettlementEnabled() {
  if (env("REAL_SETTLEMENT_ENABLED") !== "true") {
    throw new Error("Real settlement is not enabled. Set REAL_SETTLEMENT_ENABLED=true only after a funded wallet provider is configured.");
  }
}

function validateAdapterUrl(value: string): URL {
  if (!value) {
    throw new Error("REAL_SETTLEMENT_ADAPTER_URL is required for real settlement mode.");
  }

  const url = new URL(value);
  const localhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && localhost)) {
    throw new Error("REAL_SETTLEMENT_ADAPTER_URL must be HTTPS in production.");
  }

  return url;
}

export function realSettlementConfigured(): boolean {
  return env("REAL_SETTLEMENT_ENABLED") === "true" && Boolean(env("REAL_SETTLEMENT_ADAPTER_URL"));
}

export function getRealSettlementReadiness(): RealSettlementReadiness {
  const enabled = env("REAL_SETTLEMENT_ENABLED") === "true";
  const adapterUrlConfigured = Boolean(env("REAL_SETTLEMENT_ADAPTER_URL"));
  const adapterTokenConfigured = Boolean(env("REAL_SETTLEMENT_ADAPTER_TOKEN"));
  const webhookSecretConfigured = Boolean(env("REAL_SETTLEMENT_WEBHOOK_SECRET"));
  const anchorArcTestnet = env("REAL_SETTLEMENT_ANCHOR_ARC_TESTNET") === "true";
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!enabled) {
    missing.push("REAL_SETTLEMENT_ENABLED=true");
  }

  if (!adapterUrlConfigured) {
    missing.push("REAL_SETTLEMENT_ADAPTER_URL");
  }

  if (!adapterTokenConfigured) {
    warnings.push("REAL_SETTLEMENT_ADAPTER_TOKEN is empty; only use this for a private internal adapter.");
  }

  if (!webhookSecretConfigured) {
    missing.push("REAL_SETTLEMENT_WEBHOOK_SECRET");
  }

  if (anchorArcTestnet && !process.env.ARC_TESTNET_PRIVATE_KEY && !process.env.DEPLOYER_PRIVATE_KEY) {
    missing.push("ARC_TESTNET_PRIVATE_KEY for REAL_SETTLEMENT_ANCHOR_ARC_TESTNET=true");
  }

  return {
    mode: process.env.NEXT_PUBLIC_SETTLEMENT_MODE ?? "mock",
    ready: enabled && adapterUrlConfigured && webhookSecretConfigured && missing.length === 0,
    enabled,
    provider: settlementProvider(),
    adapterUrlConfigured,
    adapterTokenConfigured,
    webhookSecretConfigured,
    anchorArcTestnet,
    missing,
    warnings
  };
}

function normalizeString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeAdapterResponse(value: SettlementAdapterResponse, fallbackMemoId: string): NormalizedSettlementResult {
  const status = value.status === "settled" || value.status === "pending" || value.status === "failed"
    ? value.status
    : undefined;

  if (!status) {
    throw new Error("Settlement adapter returned an invalid status.");
  }

  if (status === "failed") {
    throw new Error(normalizeString(value.error) ?? "Settlement adapter rejected the transfer.");
  }

  const providerCandidate = normalizeString(value.provider);
  const provider = providers.includes(providerCandidate as SettlementProvider)
    ? providerCandidate as SettlementProvider
    : settlementProvider();
  const providerPaymentId = normalizeString(value.providerPaymentId);

  if (!providerPaymentId) {
    throw new Error("Settlement adapter response is missing providerPaymentId.");
  }

  return {
    status,
    provider,
    providerPaymentId,
    providerStatus: normalizeString(value.providerStatus),
    providerReference: normalizeString(value.providerReference),
    txHash: normalizeString(value.txHash),
    gatewayAuthorizationHash: normalizeString(value.gatewayAuthorizationHash),
    gatewayBatchId: normalizeString(value.gatewayBatchId),
    memoId: normalizeString(value.memoId) ?? fallbackMemoId
  };
}

function createReceiptFromSettlement({
  request,
  agent,
  merchant,
  result
}: {
  request: SpendRequest;
  agent: Agent;
  merchant: Merchant;
  result: NormalizedSettlementResult;
}): Receipt {
  return {
    id: createId("receipt_real"),
    spendRequestId: request.id,
    agentName: agent.name,
    merchantName: merchant.name,
    amountUSDC: request.amountUSDC,
    memoId: result.memoId,
    txHash: result.txHash,
    gatewayBatchId: result.gatewayBatchId,
    settlementMode: "real_settlement",
    settlementProvider: result.provider,
    providerPaymentId: result.providerPaymentId,
    providerStatus: result.providerStatus,
    providerReference: result.providerReference,
    merchantWalletAddress: merchant.walletAddress,
    onchainRequestId: request.onchainRequestId,
    recordTxHash: request.onchainRecordTxHash,
    decisionTxHash: request.onchainDecisionTxHash,
    createdAt: new Date().toISOString()
  };
}

function adapterPayload({
  request,
  agent,
  merchant,
  memoId,
  idempotencyKey
}: {
  request: SpendRequest;
  agent: Agent;
  merchant: Merchant;
  memoId: string;
  idempotencyKey: string;
}) {
  return {
    idempotencyKey,
    spendRequestId: request.id,
    agent: {
      id: agent.id,
      name: agent.name,
      walletAddress: agent.walletAddress,
      erc8004AgentId: agent.erc8004AgentId
    },
    merchant: {
      id: merchant.id,
      name: merchant.name,
      walletAddress: merchant.walletAddress,
      x402Endpoint: merchant.x402Endpoint,
      category: merchant.category,
      riskLevel: merchant.riskLevel
    },
    transfer: {
      amountUSDC: request.amountUSDC,
      currency: "USDC",
      paymentType: request.paymentType satisfies PaymentType,
      purpose: request.purpose,
      memoId
    },
    policy: {
      riskScore: request.riskScore,
      checks: request.policyChecks
    },
    arcAudit: {
      onchainRequestId: request.onchainRequestId,
      recordTxHash: request.onchainRecordTxHash,
      decisionTxHash: request.onchainDecisionTxHash
    },
    callbackUrl: `${env("NEXT_PUBLIC_APP_URL") || "https://arcallowance.xyz"}/api/settlement/webhook`
  };
}

export async function executeRealSettlement({
  request,
  agent,
  merchant,
  memoId
}: {
  request: SpendRequest;
  agent: Agent;
  merchant: Merchant;
  memoId: string;
}): Promise<{ requestPatch: Partial<SpendRequest>; receipt?: Receipt; eventAction: string }> {
  requireRealSettlementEnabled();
  const adapterUrl = validateAdapterUrl(env("REAL_SETTLEMENT_ADAPTER_URL"));
  const token = env("REAL_SETTLEMENT_ADAPTER_TOKEN");
  const timeoutMs = Number(env("REAL_SETTLEMENT_TIMEOUT_MS") || 15_000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 15_000);
  const idempotencyKey = `settle:${request.id}:${memoId}`;

  try {
    const response = await fetch(adapterUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(adapterPayload({ request, agent, merchant, memoId, idempotencyKey })),
      signal: controller.signal
    });

    const body = await response.json().catch(() => ({} as SettlementAdapterResponse)) as SettlementAdapterResponse;
    if (!response.ok) {
      throw new Error(normalizeString(body.error) ?? `Settlement adapter returned HTTP ${response.status}.`);
    }

    const result = normalizeAdapterResponse(body, memoId);
    const requestPatch: Partial<SpendRequest> = {
      status: result.status === "settled" ? "settled" : "settlement_pending",
      settlementMode: "real_settlement",
      settlementProvider: result.provider,
      providerPaymentId: result.providerPaymentId,
      providerStatus: result.providerStatus,
      providerReference: result.providerReference,
      memoId: result.memoId,
      txHash: result.txHash,
      gatewayAuthorizationHash: result.gatewayAuthorizationHash,
      settlementError: undefined
    };

    return {
      requestPatch,
      receipt: result.status === "settled"
        ? createReceiptFromSettlement({ request: { ...request, ...requestPatch }, agent, merchant, result })
        : undefined,
      eventAction: result.status === "settled" ? "real_settlement_settled" : "real_settlement_pending"
    };
  } finally {
    clearTimeout(timer);
  }
}

export function validateSettlementWebhookAuth(request: Request) {
  const secret = env("REAL_SETTLEMENT_WEBHOOK_SECRET");
  if (!secret) {
    throw new Error("REAL_SETTLEMENT_WEBHOOK_SECRET is not configured.");
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (authorization !== `Bearer ${secret}`) {
    throw new Error("Invalid settlement webhook authorization.");
  }
}

export function normalizeSettlementWebhookPayload(value: unknown): SettlementWebhookPayload {
  if (!value || typeof value !== "object") {
    throw new Error("Settlement webhook payload is required.");
  }

  const candidate = value as Partial<Record<keyof SettlementWebhookPayload, unknown>>;
  const spendRequestId = normalizeString(candidate.spendRequestId);
  const status = candidate.status;

  if (!spendRequestId) {
    throw new Error("Settlement webhook payload is missing spendRequestId.");
  }

  if (status !== "settled" && status !== "pending" && status !== "failed") {
    throw new Error("Settlement webhook payload has an invalid status.");
  }

  const providerCandidate = normalizeString(candidate.provider);
  return {
    spendRequestId,
    status,
    provider: providers.includes(providerCandidate as SettlementProvider) ? providerCandidate as SettlementProvider : undefined,
    providerPaymentId: normalizeString(candidate.providerPaymentId),
    providerStatus: normalizeString(candidate.providerStatus),
    providerReference: normalizeString(candidate.providerReference),
    txHash: normalizeString(candidate.txHash),
    gatewayAuthorizationHash: normalizeString(candidate.gatewayAuthorizationHash),
    gatewayBatchId: normalizeString(candidate.gatewayBatchId),
    memoId: normalizeString(candidate.memoId),
    error: normalizeString(candidate.error)
  };
}

export function createReceiptFromWebhook(request: SpendRequest, agent: Agent, merchant: Merchant, payload: SettlementWebhookPayload): Receipt {
  return {
    id: createId("receipt_real"),
    spendRequestId: request.id,
    agentName: agent.name,
    merchantName: merchant.name,
    amountUSDC: request.amountUSDC,
    memoId: payload.memoId ?? request.memoId ?? createId("memo"),
    txHash: payload.txHash ?? request.txHash,
    gatewayBatchId: payload.gatewayBatchId,
    settlementMode: "real_settlement",
    settlementProvider: payload.provider ?? request.settlementProvider,
    providerPaymentId: payload.providerPaymentId ?? request.providerPaymentId,
    providerStatus: payload.providerStatus ?? request.providerStatus,
    providerReference: payload.providerReference ?? request.providerReference,
    merchantWalletAddress: merchant.walletAddress,
    onchainRequestId: request.onchainRequestId,
    recordTxHash: request.onchainRecordTxHash,
    decisionTxHash: request.onchainDecisionTxHash,
    createdAt: new Date().toISOString()
  };
}
