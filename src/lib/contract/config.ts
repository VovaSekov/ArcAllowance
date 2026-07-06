import deployment from "../../../deployments/arc-testnet.json";

type SeededRegistryEntity = {
  agentId: string;
  policyId: string;
};

type ArcDeployment = {
  network?: string;
  chainId?: number;
  contractName?: string;
  address?: string;
  deployer?: string;
  deployedAt?: string;
  explorerUrl?: string;
  seededRegistry?: Record<string, SeededRegistryEntity>;
};

const arcDeployment = deployment as ArcDeployment;

export const arcTestnet = {
  network: "Arc Testnet",
  chainId: Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? arcDeployment.chainId ?? 5042002),
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network",
  nativeCurrency: "USDC",
  explorerUrl: process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://testnet.arcscan.app",
  faucetUrl: "https://faucet.circle.com"
} as const;

export const arcAllowanceRegistry = {
  contractName: "ArcAllowanceRegistry",
  address: process.env.NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS || arcDeployment.address || "",
  deployedAt: arcDeployment.deployedAt || "",
  deployer: arcDeployment.deployer || "",
  seededRegistry: arcDeployment.seededRegistry ?? {}
} as const;

export function getRegistryExplorerUrl(address = arcAllowanceRegistry.address): string {
  return address ? `${arcTestnet.explorerUrl}/address/${address}` : "";
}

export function isRegistryConfigured(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(arcAllowanceRegistry.address);
}

export function getSeededRegistryEntity(agentId: string): SeededRegistryEntity | undefined {
  const envAgentId = process.env[`ARC_ONCHAIN_AGENT_ID_${agentId.toUpperCase()}`];
  const envPolicyId = process.env[`ARC_ONCHAIN_POLICY_ID_${agentId.toUpperCase()}`];
  if (envAgentId && envPolicyId) {
    return { agentId: envAgentId, policyId: envPolicyId };
  }

  return arcAllowanceRegistry.seededRegistry[agentId];
}
