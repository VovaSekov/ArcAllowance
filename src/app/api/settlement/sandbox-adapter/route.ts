import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

type SandboxAdapterBody = {
  idempotencyKey?: unknown;
  spendRequestId?: unknown;
  transfer?: {
    amountUSDC?: unknown;
    paymentType?: unknown;
    purpose?: unknown;
    memoId?: unknown;
  };
  callbackUrl?: unknown;
};

type SandboxResultMode = "settled" | "pending" | "pending_then_settled" | "failed";

export const runtime = "nodejs";

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function hashHex(value: string, length: number): string {
  return createHash("sha256").update(value).digest("hex").slice(0, length);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function sandboxMode(): SandboxResultMode {
  const value = env("SANDBOX_SETTLEMENT_ADAPTER_RESULT");
  if (value === "settled" || value === "pending" || value === "pending_then_settled" || value === "failed") {
    return value;
  }

  return "pending_then_settled";
}

function requireSandboxEnabled(request: Request) {
  if (env("SANDBOX_SETTLEMENT_ADAPTER_ENABLED") !== "true") {
    throw new Error("Sandbox settlement adapter is disabled.");
  }

  const token = env("REAL_SETTLEMENT_ADAPTER_TOKEN");
  if (!token) {
    throw new Error("REAL_SETTLEMENT_ADAPTER_TOKEN is required for sandbox adapter access.");
  }

  if (request.headers.get("authorization") !== `Bearer ${token}`) {
    throw new Error("Invalid sandbox adapter authorization.");
  }
}

function parsePayload(value: unknown) {
  if (!value || typeof value !== "object") {
    throw new Error("Sandbox adapter payload is required.");
  }

  const body = value as SandboxAdapterBody;
  const spendRequestId = asString(body.spendRequestId);
  const idempotencyKey = asString(body.idempotencyKey);
  const memoId = asString(body.transfer?.memoId);
  const callbackUrl = asString(body.callbackUrl);
  const amountUSDC = typeof body.transfer?.amountUSDC === "number" ? body.transfer.amountUSDC : Number(body.transfer?.amountUSDC);
  const purpose = asString(body.transfer?.purpose);
  const paymentType = asString(body.transfer?.paymentType);

  if (!spendRequestId || !idempotencyKey || !memoId) {
    throw new Error("Sandbox adapter payload is missing spendRequestId, idempotencyKey, or memoId.");
  }

  if (!Number.isFinite(amountUSDC) || amountUSDC <= 0) {
    throw new Error("Sandbox adapter payload has an invalid amountUSDC.");
  }

  return {
    spendRequestId,
    idempotencyKey,
    memoId,
    callbackUrl,
    amountUSDC,
    purpose: purpose ?? "unknown_purpose",
    paymentType: paymentType ?? "unknown_payment_type"
  };
}

function providerFields(input: ReturnType<typeof parsePayload>) {
  const base = `${input.spendRequestId}:${input.idempotencyKey}:${input.memoId}`;
  return {
    provider: "custom",
    providerPaymentId: `sandbox_pay_${hashHex(base, 24)}`,
    providerReference: `sandbox_ref_${hashHex(`${base}:ref`, 18)}`,
    txHash: `0x${hashHex(`${base}:tx`, 64)}`,
    gatewayAuthorizationHash: `0x${hashHex(`${base}:gateway`, 64)}`,
    gatewayBatchId: input.paymentType === "batch" ? `sandbox_batch_${hashHex(`${base}:batch`, 18)}` : undefined
  };
}

async function postWebhook(callbackUrl: string, payload: Record<string, string | undefined>) {
  const secret = env("REAL_SETTLEMENT_WEBHOOK_SECRET");
  if (!secret) {
    return;
  }

  await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${secret}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  }).catch(() => undefined);
}

function scheduleWebhook(callbackUrl: string, payload: Record<string, string | undefined>) {
  const delayMs = Number(env("SANDBOX_SETTLEMENT_WEBHOOK_DELAY_MS") || 1500);
  const safeDelayMs = Number.isFinite(delayMs) && delayMs >= 0 ? Math.min(delayMs, 30_000) : 1500;
  setTimeout(() => {
    void postWebhook(callbackUrl, payload);
  }, safeDelayMs);
}

export async function POST(request: Request) {
  try {
    requireSandboxEnabled(request);
    const input = parsePayload(await request.json().catch(() => ({} as unknown)));
    const fields = providerFields(input);
    const mode = sandboxMode();

    if (mode === "failed") {
      return NextResponse.json({
        status: "failed",
        provider: fields.provider,
        providerPaymentId: fields.providerPaymentId,
        providerStatus: "sandbox_failed",
        providerReference: fields.providerReference,
        error: "Sandbox settlement adapter forced failure."
      });
    }

    if (mode === "settled") {
      return NextResponse.json({
        status: "settled",
        ...fields,
        providerStatus: "sandbox_settled",
        memoId: input.memoId
      });
    }

    if (mode === "pending_then_settled") {
      if (!input.callbackUrl) {
        throw new Error("callbackUrl is required for pending_then_settled sandbox mode.");
      }

      scheduleWebhook(input.callbackUrl, {
        spendRequestId: input.spendRequestId,
        status: "settled",
        provider: fields.provider,
        providerPaymentId: fields.providerPaymentId,
        providerStatus: "sandbox_settled",
        providerReference: fields.providerReference,
        txHash: fields.txHash,
        gatewayAuthorizationHash: fields.gatewayAuthorizationHash,
        gatewayBatchId: fields.gatewayBatchId,
        memoId: input.memoId
      });
    }

    return NextResponse.json({
      status: "pending",
      provider: fields.provider,
      providerPaymentId: fields.providerPaymentId,
      providerStatus: "sandbox_pending",
      providerReference: fields.providerReference,
      memoId: input.memoId
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sandbox settlement adapter failed." },
      { status: error instanceof Error && error.message.includes("authorization") ? 401 : 400 }
    );
  }
}
