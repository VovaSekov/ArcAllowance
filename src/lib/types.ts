export type RiskTier = "low" | "medium" | "high";
export type AgentStatus = "active" | "paused";
export type MerchantCategory = "api" | "data" | "compute" | "research" | "tooling";
export type PaymentType = "x402" | "usdc_transfer" | "batch";
export type SpendStatus = "approved" | "rejected" | "needs_approval" | "settled";
export type PolicyCheckResult = "pass" | "fail" | "warning";
export type SettlementMode = "mock" | "arc_testnet";
export type EntityType = "agent" | "policy" | "spend_request" | "receipt";

export type Agent = {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  erc8004AgentId?: string;
  capabilities: string[];
  riskTier: RiskTier;
  status: AgentStatus;
  createdAt: string;
};

export type Policy = {
  id: string;
  agentId: string;
  name: string;
  maxPerTransactionUSDC: number;
  dailyLimitUSDC: number;
  monthlyLimitUSDC: number;
  approvalRequiredAboveUSDC: number;
  allowedMerchantIds: string[];
  allowedPurposes: string[];
  blockedPurposes: string[];
  cooldownMinutes: number;
  expiresAt?: string;
};

export type Merchant = {
  id: string;
  name: string;
  category: MerchantCategory;
  walletAddress: string;
  x402Endpoint?: string;
  riskLevel: RiskTier;
};

export type PolicyCheck = {
  rule: string;
  result: PolicyCheckResult;
  message: string;
};

export type SpendRequest = {
  id: string;
  agentId: string;
  merchantId: string;
  amountUSDC: number;
  purpose: string;
  paymentType: PaymentType;
  status: SpendStatus;
  policyChecks: PolicyCheck[];
  riskScore: number;
  memoId?: string;
  gatewayAuthorizationHash?: string;
  txHash?: string;
  createdAt: string;
};

export type Receipt = {
  id: string;
  spendRequestId: string;
  agentName: string;
  merchantName: string;
  amountUSDC: number;
  memoId: string;
  txHash?: string;
  gatewayBatchId?: string;
  settlementMode: SettlementMode;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
};

export type SpendInput = {
  agentId: string;
  merchantId: string;
  amountUSDC: number;
  purpose: string;
  paymentType: PaymentType;
};

export type PolicyEvaluation = {
  status: Exclude<SpendStatus, "settled">;
  policyChecks: PolicyCheck[];
  riskScore: number;
};

export type PolicyTemplate = {
  id: string;
  name: string;
  description: string;
  policy: Omit<Policy, "id" | "agentId">;
};
