import { NextResponse } from "next/server";
import { normalizeSettlementWebhookPayload, validateSettlementWebhookAuth } from "@/lib/server/real-settlement";
import { recordSettlementWebhook } from "@/lib/server/spend-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validateSettlementWebhookAuth(request);
    const body = await request.json().catch(() => ({} as unknown));
    const payload = normalizeSettlementWebhookPayload(body);
    return NextResponse.json(await recordSettlementWebhook(payload));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Settlement webhook failed." },
      { status: error instanceof Error && error.message.includes("authorization") ? 401 : 400 }
    );
  }
}
