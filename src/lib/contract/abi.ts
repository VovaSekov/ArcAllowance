export const arcAllowanceRegistryAbi = [
  {
    type: "function",
    name: "registerAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "riskTier", type: "uint8" }
    ],
    outputs: [{ name: "agentId", type: "uint256" }]
  },
  {
    type: "function",
    name: "createPolicy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "policyHash", type: "bytes32" },
      { name: "maxPerTransactionUSDC", type: "uint256" },
      { name: "dailyLimitUSDC", type: "uint256" },
      { name: "monthlyLimitUSDC", type: "uint256" },
      { name: "approvalRequiredAboveUSDC", type: "uint256" }
    ],
    outputs: [{ name: "policyId", type: "uint256" }]
  },
  {
    type: "function",
    name: "recordSpendRequest",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "policyId", type: "uint256" },
      { name: "merchant", type: "address" },
      { name: "amountUSDC", type: "uint256" },
      { name: "purpose", type: "string" },
      { name: "memoHash", type: "bytes32" }
    ],
    outputs: [{ name: "requestId", type: "uint256" }]
  },
  {
    type: "function",
    name: "markSpendDecision",
    stateMutability: "nonpayable",
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "status", type: "uint8" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getAgentPolicies",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }]
  },
  {
    type: "function",
    name: "getAgentSpendRequests",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }]
  },
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { indexed: true, name: "agentId", type: "uint256" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "name", type: "string" },
      { indexed: false, name: "riskTier", type: "uint8" },
      { indexed: false, name: "metadataURI", type: "string" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PolicyCreated",
    inputs: [
      { indexed: true, name: "policyId", type: "uint256" },
      { indexed: true, name: "agentId", type: "uint256" },
      { indexed: false, name: "policyHash", type: "bytes32" },
      { indexed: false, name: "maxPerTransactionUSDC", type: "uint256" },
      { indexed: false, name: "dailyLimitUSDC", type: "uint256" },
      { indexed: false, name: "monthlyLimitUSDC", type: "uint256" },
      { indexed: false, name: "approvalRequiredAboveUSDC", type: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "SpendRequestRecorded",
    inputs: [
      { indexed: true, name: "requestId", type: "uint256" },
      { indexed: true, name: "agentId", type: "uint256" },
      { indexed: true, name: "policyId", type: "uint256" },
      { indexed: false, name: "merchant", type: "address" },
      { indexed: false, name: "amountUSDC", type: "uint256" },
      { indexed: false, name: "purpose", type: "string" },
      { indexed: false, name: "memoHash", type: "bytes32" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "SpendDecisionMarked",
    inputs: [
      { indexed: true, name: "requestId", type: "uint256" },
      { indexed: false, name: "status", type: "uint8" },
      { indexed: false, name: "memoHash", type: "bytes32" }
    ],
    anonymous: false
  }
] as const;
