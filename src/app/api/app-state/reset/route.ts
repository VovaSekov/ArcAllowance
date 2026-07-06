import { NextResponse } from "next/server";
import { assertWriteAccess, responseHeadersForError, responseStatusForError } from "@/lib/server/auth";
import { resetAppState } from "@/lib/server/state-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertWriteAccess(request, { action: "state-reset", limit: 5, windowMs: 60_000, requireToken: true });
    return NextResponse.json(await resetAppState());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "State reset failed." },
      { status: responseStatusForError(error), headers: responseHeadersForError(error) }
    );
  }
}
