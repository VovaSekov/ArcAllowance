import { NextResponse } from "next/server";
import { assertWriteAccess, responseHeadersForError, responseStatusForError } from "@/lib/server/auth";
import { parseSpendInput, submitSpendRequest } from "@/lib/server/spend-service";

type RequestBody = {
  input?: unknown;
  idempotencyKey?: unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertWriteAccess(request, { action: "spend-request", limit: 20, windowMs: 60_000 });
    const body = await request.json().catch(() => ({} as RequestBody)) as RequestBody;
    const idempotencyKey = typeof body.idempotencyKey === "string"
      ? body.idempotencyKey
      : request.headers.get("idempotency-key") ?? undefined;
    const result = await submitSpendRequest(parseSpendInput(body.input), idempotencyKey);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Spend request failed." },
      { status: responseStatusForError(error), headers: responseHeadersForError(error) }
    );
  }
}
