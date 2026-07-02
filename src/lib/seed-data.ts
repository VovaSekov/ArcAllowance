import type { Agent, AuditEvent, Merchant, Policy, PolicyTemplate, Receipt, SpendRequest } from "@/lib/types";

export const agents: Agent[] = [
  {
    id: "agent_research",
    name: "ResearchAgent",
    description: "Buys market data, wallet reports, and research datasets.",
    walletAddress: "0xA110w000000000000000000000000000000001",
    erc8004AgentId: "erc8004:arc:research-agent",
    capabilities: ["market_research", "wallet_risk_report", "data_purchase"],
    riskTier: "low",
    status: "active",
    createdAt: "2026-06-20T09:00:00.000Z"
  },
  {
    id: "agent_ops",
    name: "OpsAgent",
    description: "Pays for compute, deployment tooling, and model inference.",
    walletAddress: "0xA110w000000000000000000000000000000002",
    erc8004AgentId: "erc8004:arc:ops-agent",
    capabilities: ["compute_purchase", "deployment_tooling", "model_inference"],
    riskTier: "medium",
    status: "active",
    createdAt: "2026-06-21T10:30:00.000Z"
  },
  {
    id: "agent_trading",
    name: "TradingAgent",
    description: "High-risk agent with strict spending limits for market tools.",
    walletAddress: "0xA110w000000000000000000000000000000003",
    erc8004AgentId: "erc8004:arc:trading-agent",
    capabilities: ["signal_check", "wallet_risk_report"],
    riskTier: "high",
    status: "active",
    createdAt: "2026-06-22T12:00:00.000Z"
  }
];

export const merchants: Merchant[] = [
  {
    id: "merchant_market_data",
    name: "MarketData API",
    category: "data",
    walletAddress: "0xC1rc1e00000000000000000000000000000001",
    x402Endpoint: "/api/mock/market-data",
    riskLevel: "low"
  },
  {
    id: "merchant_llm_inference",
    name: "LLM Inference Hub",
    category: "compute",
    walletAddress: "0xC1rc1e00000000000000000000000000000002",
    x402Endpoint: "/api/mock/inference",
    riskLevel: "low"
  },
  {
    id: "merchant_wallet_risk",
    name: "Wallet Risk Oracle",
    category: "research",
    walletAddress: "0xC1rc1e00000000000000000000000000000003",
    x402Endpoint: "/api/mock/wallet-risk",
    riskLevel: "medium"
  },
  {
    id: "merchant_unknown_alpha",
    name: "Unknown Alpha Group",
    category: "research",
    walletAddress: "0xC1rc1e00000000000000000000000000000004",
    riskLevel: "high"
  }
];

export const policies: Policy[] = [
  {
    id: "policy_research",
    agentId: "agent_research",
    name: "ResearchAgent Daily Data Budget",
    maxPerTransactionUSDC: 2,
    dailyLimitUSDC: 25,
    monthlyLimitUSDC: 500,
    approvalRequiredAboveUSDC: 5,
    allowedMerchantIds: ["merchant_market_data", "merchant_wallet_risk"],
    allowedPurposes: ["cpi_dataset_query", "wallet_risk_report", "market_research"],
    blockedPurposes: ["private_alpha_signal"],
    cooldownMinutes: 2
  },
  {
    id: "policy_ops",
    agentId: "agent_ops",
    name: "OpsAgent Compute Control",
    maxPerTransactionUSDC: 50,
    dailyLimitUSDC: 200,
    monthlyLimitUSDC: 3000,
    approvalRequiredAboveUSDC: 25,
    allowedMerchantIds: ["merchant_llm_inference"],
    allowedPurposes: ["weekly_compute_budget", "model_inference", "deployment_tooling"],
    blockedPurposes: [],
    cooldownMinutes: 5
  },
  {
    id: "policy_trading",
    agentId: "agent_trading",
    name: "TradingAgent Restricted Spend",
    maxPerTransactionUSDC: 5,
    dailyLimitUSDC: 20,
    monthlyLimitUSDC: 300,
    approvalRequiredAboveUSDC: 3,
    allowedMerchantIds: ["merchant_wallet_risk"],
    allowedPurposes: ["wallet_risk_report", "market_risk_check"],
    blockedPurposes: ["private_alpha_signal", "unknown_group_payment"],
    cooldownMinutes: 15
  }
];

export const initialSpendRequests: SpendRequest[] = [
  {
    id: "spend_seed_market_data",
    agentId: "agent_research",
    merchantId: "merchant_market_data",
    amountUSDC: 0.03,
    purpose: "cpi_dataset_query",
    paymentType: "x402",
    status: "settled",
    policyChecks: [
      { rule: "Merchant allowlist", result: "pass", message: "MarketData API is approved for this agent policy." },
      { rule: "Per-transaction limit", result: "pass", message: "0.03 USDC is within the transaction cap." }
    ],
    riskScore: 10,
    memoId: "ARC-ALLOW-20260702-A19F",
    gatewayAuthorizationHash: "gw_auth_9c3e82a414a0f7281fd51d2d7a10",
    txHash: "0x19fa42c91fc8c94a1c72d028b3b169bc582d4bf37e77aaf1b08edc52c6418af7",
    createdAt: "2026-07-02T08:15:00.000Z"
  },
  {
    id: "spend_seed_blocked",
    agentId: "agent_trading",
    merchantId: "merchant_unknown_alpha",
    amountUSDC: 250,
    purpose: "private_alpha_signal",
    paymentType: "usdc_transfer",
    status: "rejected",
    policyChecks: [
      { rule: "Merchant allowlist", result: "fail", message: "Unknown Alpha Group is not on this agent policy allowlist." },
      { rule: "Blocked purpose", result: "fail", message: "private_alpha_signal is explicitly blocked." }
    ],
    riskScore: 100,
    createdAt: "2026-07-02T09:10:00.000Z"
  },
  {
    id: "spend_seed_ops_pending",
    agentId: "agent_ops",
    merchantId: "merchant_llm_inference",
    amountUSDC: 45,
    purpose: "weekly_compute_budget",
    paymentType: "batch",
    status: "needs_approval",
    policyChecks: [
      { rule: "Merchant allowlist", result: "pass", message: "LLM Inference Hub is approved for this agent policy." },
      { rule: "Human approval threshold", result: "warning", message: "45.00 USDC is above the 25.00 USDC approval threshold." }
    ],
    riskScore: 85,
    createdAt: "2026-07-02T10:35:00.000Z"
  }
];

export const initialReceipts: Receipt[] = [
  {
    id: "receipt_seed_market_data",
    spendRequestId: "spend_seed_market_data",
    agentName: "ResearchAgent",
    merchantName: "MarketData API",
    amountUSDC: 0.03,
    memoId: "ARC-ALLOW-20260702-A19F",
    txHash: "0x19fa42c91fc8c94a1c72d028b3b169bc582d4bf37e77aaf1b08edc52c6418af7",
    settlementMode: "mock",
    createdAt: "2026-07-02T08:15:08.000Z"
  },
  {
    id: "receipt_seed_batch",
    spendRequestId: "spend_seed_batch",
    agentName: "ResearchAgent",
    merchantName: "MarketData API",
    amountUSDC: 0.42,
    memoId: "ARC-ALLOW-20260702-B42C",
    txHash: "0xb42c04ad931079729483279d74bbf3853089e1144f3de29f915035ba4bdc20aa",
    gatewayBatchId: "gw_batch_batchstyleusage000042",
    settlementMode: "mock",
    createdAt: "2026-07-02T08:45:00.000Z"
  }
];

export const initialAuditEvents: AuditEvent[] = [
  {
    id: "audit_seed_1",
    entityType: "spend_request",
    entityId: "spend_seed_blocked",
    action: "policy_rejected",
    metadata: { reason: "merchant_not_allowlisted", amountUSDC: 250 },
    createdAt: "2026-07-02T09:10:01.000Z"
  }
];

export const policyTemplates: PolicyTemplate[] = [
  {
    id: "template_conservative_research",
    name: "Conservative Research Agent",
    description: "Small API purchases, tight daily budget, low approval threshold.",
    policy: {
      name: "Conservative Research Policy",
      maxPerTransactionUSDC: 2,
      dailyLimitUSDC: 25,
      monthlyLimitUSDC: 500,
      approvalRequiredAboveUSDC: 5,
      allowedMerchantIds: ["merchant_market_data", "merchant_wallet_risk"],
      allowedPurposes: ["cpi_dataset_query", "wallet_risk_report", "market_research"],
      blockedPurposes: ["private_alpha_signal"],
      cooldownMinutes: 2
    }
  },
  {
    id: "template_ops_compute",
    name: "Ops Compute Agent",
    description: "Model inference and deployment spend with human review on larger requests.",
    policy: {
      name: "Ops Compute Policy",
      maxPerTransactionUSDC: 50,
      dailyLimitUSDC: 200,
      monthlyLimitUSDC: 3000,
      approvalRequiredAboveUSDC: 25,
      allowedMerchantIds: ["merchant_llm_inference"],
      allowedPurposes: ["weekly_compute_budget", "model_inference", "deployment_tooling"],
      blockedPurposes: [],
      cooldownMinutes: 5
    }
  },
  {
    id: "template_high_risk_trading",
    name: "High-Risk Trading Agent",
    description: "Restricted market-tool access with strict amount and purpose controls.",
    policy: {
      name: "High-Risk Trading Policy",
      maxPerTransactionUSDC: 5,
      dailyLimitUSDC: 20,
      monthlyLimitUSDC: 300,
      approvalRequiredAboveUSDC: 3,
      allowedMerchantIds: ["merchant_wallet_risk"],
      allowedPurposes: ["wallet_risk_report", "market_risk_check"],
      blockedPurposes: ["private_alpha_signal", "unknown_group_payment"],
      cooldownMinutes: 15
    }
  }
];

export const demoScenarios = [
  {
    title: "Approved nanopayment",
    agentId: "agent_research",
    merchantId: "merchant_market_data",
    amountUSDC: 0.03,
    purpose: "cpi_dataset_query",
    paymentType: "x402" as const,
    expected: "approved"
  },
  {
    title: "Blocked unsafe spend",
    agentId: "agent_trading",
    merchantId: "merchant_unknown_alpha",
    amountUSDC: 250,
    purpose: "private_alpha_signal",
    paymentType: "usdc_transfer" as const,
    expected: "rejected"
  },
  {
    title: "Needs approval",
    agentId: "agent_ops",
    merchantId: "merchant_llm_inference",
    amountUSDC: 45,
    purpose: "weekly_compute_budget",
    paymentType: "batch" as const,
    expected: "needs_approval"
  }
];
