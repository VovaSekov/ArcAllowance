export const usdcDecimals = BigInt(6);
const usdcScale = BigInt(10) ** usdcDecimals;

export function parseUSDC(amount: string): bigint {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d{0,6})?$/.test(trimmed)) {
    throw new Error("USDC amount must be a non-negative decimal with up to 6 decimals.");
  }

  const [whole, fractional = ""] = trimmed.split(".");
  return BigInt(whole) * usdcScale + BigInt(fractional.padEnd(Number(usdcDecimals), "0"));
}

export function formatUSDC(amount: bigint): string {
  const whole = amount / usdcScale;
  const fractional = amount % usdcScale;
  const fractionalText = fractional.toString().padStart(Number(usdcDecimals), "0").replace(/0+$/, "");
  return fractionalText ? `${whole}.${fractionalText} USDC` : `${whole} USDC`;
}

export function mapSpendStatusToContract(status: "approved" | "rejected" | "needs_approval"): 1 | 2 | 3 {
  if (status === "approved") {
    return 1;
  }

  if (status === "rejected") {
    return 2;
  }

  return 3;
}

export function buildExplorerTxUrl(explorerUrl: string, txHash?: string): string {
  return txHash ? `${explorerUrl}/tx/${txHash}` : "";
}
