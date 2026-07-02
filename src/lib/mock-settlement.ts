import type { Agent, Merchant, PaymentType, Receipt, SpendRequest } from "@/lib/types";

const alphabet = "0123456789abcdef";

function randomHex(length: number): string {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length);
  }

  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function dateStamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function generateMemoId(date = new Date()): string {
  return `ARC-ALLOW-${dateStamp(date)}-${randomHex(4).toUpperCase()}`;
}

export function generateMockGatewayAuthorizationHash(): string {
  return `gw_auth_${randomHex(28)}`;
}

export function generateMockArcTxHash(): string {
  return `0x${randomHex(64)}`;
}

export function createMockGatewayBatchId(): string {
  return `gw_batch_${randomHex(24)}`;
}

export function createMockReceipt(
  request: SpendRequest,
  agent: Agent,
  merchant: Merchant,
  paymentType: PaymentType = request.paymentType
): Receipt {
  return {
    id: `receipt_${randomHex(12)}`,
    spendRequestId: request.id,
    agentName: agent.name,
    merchantName: merchant.name,
    amountUSDC: request.amountUSDC,
    memoId: request.memoId ?? generateMemoId(),
    txHash: request.txHash ?? generateMockArcTxHash(),
    gatewayBatchId: paymentType === "batch" ? createMockGatewayBatchId() : undefined,
    settlementMode: "mock",
    createdAt: new Date().toISOString()
  };
}
