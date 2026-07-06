import type { Policy, SpendInput } from "@/lib/types";

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function policyHashPayload(policy: Policy): string {
  return stableStringify({
    agentId: policy.agentId,
    name: policy.name,
    maxPerTransactionUSDC: policy.maxPerTransactionUSDC,
    dailyLimitUSDC: policy.dailyLimitUSDC,
    monthlyLimitUSDC: policy.monthlyLimitUSDC,
    approvalRequiredAboveUSDC: policy.approvalRequiredAboveUSDC,
    allowedMerchantIds: policy.allowedMerchantIds,
    allowedPurposes: policy.allowedPurposes,
    blockedPurposes: policy.blockedPurposes,
    cooldownMinutes: policy.cooldownMinutes
  });
}

export function memoHashPayload(input: SpendInput, memoId: string): string {
  return stableStringify({
    memoId,
    agentId: input.agentId,
    merchantId: input.merchantId,
    amountUSDC: input.amountUSDC,
    purpose: input.purpose,
    paymentType: input.paymentType
  });
}
