import { NextResponse } from "next/server";
import { assertWriteAccess, responseHeadersForError, responseStatusForError } from "@/lib/server/auth";
import { decideSpendRequest } from "@/lib/server/spend-service";

type RequestBody = {
  requestId?: unknown;
  decision?: unknown;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertWriteAccess(request, { action: "approval", limit: 30, windowMs: 60_000 });
    const body = await request.json().catch(() => ({} as RequestBody)) as RequestBody;

    if (typeof body.requestId !== "string" || (body.decision !== "approved" && body.decision !== "rejected")) {
      throw new Error("Invalid approval payload.");
    }

    return NextResponse.json(await decideSpendRequest(body.requestId, body.decision));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Approval action failed." },
      { status: responseStatusForError(error), headers: responseHeadersForError(error) }
    );
  }
}
