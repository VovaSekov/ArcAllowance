import type { Merchant, Policy, PolicyCheck, PolicyEvaluation, SpendInput, SpendRequest } from "@/lib/types";

type EvaluateSpendRequestArgs = {
  input: SpendInput;
  policy: Policy;
  merchant: Merchant;
  existingRequests?: SpendRequest[];
};

function normalizePurpose(purpose: string): string {
  return purpose.trim().toLowerCase().replace(/\s+/g, "_");
}

function requestsToday(requests: SpendRequest[]): SpendRequest[] {
  const today = new Date().toISOString().slice(0, 10);
  return requests.filter((request) => request.createdAt.slice(0, 10) === today && request.status !== "rejected");
}

function riskScoreFor(merchant: Merchant, amount: number, checks: PolicyCheck[]): number {
  const merchantRisk = merchant.riskLevel === "high" ? 45 : merchant.riskLevel === "medium" ? 25 : 10;
  const amountRisk = Number.isFinite(amount) ? Math.min(35, Math.round(Math.max(0, amount) * 1.5)) : 35;
  const failedRisk = checks.filter((check) => check.result === "fail").length * 15;
  const warningRisk = checks.filter((check) => check.result === "warning").length * 8;
  return Math.min(100, merchantRisk + amountRisk + failedRisk + warningRisk);
}

export function evaluateSpendRequest({
  input,
  policy,
  merchant,
  existingRequests = []
}: EvaluateSpendRequestArgs): PolicyEvaluation {
  const checks: PolicyCheck[] = [];
  const purpose = normalizePurpose(input.purpose);
  const amountValid = Number.isFinite(input.amountUSDC) && input.amountUSDC > 0;
  const merchantAllowed = policy.allowedMerchantIds.includes(input.merchantId);
  const purposeAllowed = policy.allowedPurposes.includes(purpose);
  const purposeBlocked = policy.blockedPurposes.includes(purpose);
  const dailySpent = requestsToday(existingRequests)
    .filter((request) => request.agentId === input.agentId)
    .reduce((sum, request) => sum + request.amountUSDC, 0);
  const remainingDaily = Math.max(0, policy.dailyLimitUSDC - dailySpent);

  checks.push({
    rule: "Merchant allowlist",
    result: merchantAllowed ? "pass" : "fail",
    message: merchantAllowed
      ? `${merchant.name} is approved for this agent policy.`
      : `${merchant.name} is not on this agent policy allowlist.`
  });

  checks.push({
    rule: "Amount validity",
    result: amountValid ? "pass" : "fail",
    message: amountValid
      ? `${input.amountUSDC.toFixed(2)} USDC is a valid positive amount.`
      : "Amount must be a positive USDC value."
  });

  checks.push({
    rule: "Per-transaction limit",
    result: amountValid && input.amountUSDC <= policy.maxPerTransactionUSDC ? "pass" : "fail",
    message:
      !amountValid
        ? "Invalid amounts cannot pass the transaction cap."
        : input.amountUSDC <= policy.maxPerTransactionUSDC
        ? `${input.amountUSDC.toFixed(2)} USDC is within the ${policy.maxPerTransactionUSDC.toFixed(2)} USDC transaction cap.`
        : `${input.amountUSDC.toFixed(2)} USDC exceeds the ${policy.maxPerTransactionUSDC.toFixed(2)} USDC transaction cap.`
  });

  checks.push({
    rule: "Daily budget",
    result: amountValid && input.amountUSDC <= remainingDaily ? "pass" : "fail",
    message:
      !amountValid
        ? "Invalid amounts cannot be applied to the daily budget."
        : input.amountUSDC <= remainingDaily
        ? `${remainingDaily.toFixed(2)} USDC remains in today's policy budget.`
        : `Only ${remainingDaily.toFixed(2)} USDC remains in today's policy budget.`
  });

  checks.push({
    rule: "Allowed purpose",
    result: purposeAllowed || (!purposeBlocked && merchant.riskLevel === "low") ? (purposeAllowed ? "pass" : "warning") : "fail",
    message: purposeAllowed
      ? `${purpose} is an allowed purpose.`
      : !purposeBlocked && merchant.riskLevel === "low"
        ? `${purpose} is free text, but low-risk merchant rules allow reviewable flexibility.`
        : `${purpose} is not allowed by this policy.`
  });

  checks.push({
    rule: "Blocked purpose",
    result: purposeBlocked ? "fail" : "pass",
    message: purposeBlocked ? `${purpose} is explicitly blocked.` : `${purpose} is not on the blocked-purpose list.`
  });

  checks.push({
    rule: "High-risk merchant control",
    result: merchant.riskLevel === "high" && !merchantAllowed ? "fail" : merchant.riskLevel === "high" ? "warning" : "pass",
    message:
      merchant.riskLevel === "high" && !merchantAllowed
        ? "High-risk merchants require explicit allowlisting and this merchant is not allowlisted."
        : merchant.riskLevel === "high"
          ? "High-risk merchant is explicitly allowlisted; retain receipt for review."
          : `${merchant.name} is not marked high risk.`
  });

  const hasHardFail = checks.some((check) => check.result === "fail");
  const thresholdTriggered = amountValid && input.amountUSDC > policy.approvalRequiredAboveUSDC;

  if (thresholdTriggered && !hasHardFail) {
    checks.push({
      rule: "Autonomy threshold",
      result: "warning",
      message: `${input.amountUSDC.toFixed(2)} USDC is above the ${policy.approvalRequiredAboveUSDC.toFixed(2)} USDC autonomy threshold.`
    });
  } else {
    checks.push({
      rule: "Autonomy threshold",
      result: amountValid ? "pass" : "fail",
      message: amountValid
        ? `${input.amountUSDC.toFixed(2)} USDC can clear automatically under this policy.`
        : "Invalid amounts cannot be routed for review."
    });
  }

  const riskScore = riskScoreFor(merchant, input.amountUSDC, checks);
  const status = hasHardFail ? "rejected" : thresholdTriggered ? "needs_approval" : "approved";

  return {
    status,
    policyChecks: checks,
    riskScore
  };
}
