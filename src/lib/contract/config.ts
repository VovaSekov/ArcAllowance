import deployment from "../../../deployments/arc-testnet.json";

export const arcTestnet = {
  network: "Arc Testnet",
  chainId: Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? deployment.chainId ?? 5042002),
  rpcUrl: process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network",
  nativeCurrency: "USDC",
  explorerUrl: process.env.NEXT_PUBLIC_ARC_EXPLORER_URL ?? "https://testnet.arcscan.app",
  faucetUrl: "https://faucet.circle.com"
} as const;

export const arcAllowanceRegistry = {
  contractName: "ArcAllowanceRegistry",
  address: process.env.NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS || deployment.address || "",
  deployedAt: deployment.deployedAt || "",
  deployer: deployment.deployer || ""
} as const;

export function getRegistryExplorerUrl(address = arcAllowanceRegistry.address): string {
  return address ? `${arcTestnet.explorerUrl}/address/${address}` : "";
}

export function isRegistryConfigured(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(arcAllowanceRegistry.address);
}
