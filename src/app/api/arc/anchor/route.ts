import { NextResponse } from "next/server";
import { assertWriteAccess, responseHeadersForError, responseStatusForError } from "@/lib/server/auth";
import { decideSpendRequest, parseSpendInput, submitSpendRequest } from "@/lib/server/spend-service";
import type { SpendRequest } from "@/lib/types";

type AnchorPayload =
  | {
      action: "anchor";
      request: SpendRequest;
    }
  | {
      action: "decision";
      request: SpendRequest;
      status: "approved" | "rejected";
    };

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isSpendRequest(value: unknown): value is SpendRequest {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.agentId === "string" &&
    typeof value.merchantId === "string" &&
    typeof value.amountUSDC === "number" &&
    Number.isFinite(value.amountUSDC) &&
    value.amountUSDC > 0 &&
    typeof value.purpose === "string" &&
    typeof value.paymentType === "string"
  );
}

function parsePayload(value: unknown): AnchorPayload {
  if (!isObject(value) || typeof value.action !== "string") {
    throw new Error("Invalid Arc anchor request.");
  }

  if (value.action === "anchor") {
    if (!isSpendRequest(value.request)) {
      throw new Error("Invalid spend request payload.");
    }
    return { action: "anchor", request: value.request };
  }

  if (value.action === "decision") {
    if (!isSpendRequest(value.request) || (value.status !== "approved" && value.status !== "rejected")) {
      throw new Error("Invalid decision payload.");
    }
    return { action: "decision", request: value.request, status: value.status };
  }

  throw new Error("Unsupported Arc anchor action.");
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertWriteAccess(request, { action: "legacy-arc-anchor", limit: 10, windowMs: 60_000 });
    const payload = parsePayload(await request.json());

    if (payload.action === "anchor") {
      const result = await submitSpendRequest(parseSpendInput(payload.request), `legacy:${payload.request.id}`);
      return NextResponse.json({
        mode: "arc_testnet",
        requestPatch: result.request,
        receipt: result.receipt
      });
    }

    const result = await decideSpendRequest(payload.request.id, payload.status);
    return NextResponse.json({
      mode: "arc_testnet",
      requestPatch: result.request,
      receipt: result.receipt
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Arc Testnet anchoring failed." },
      { status: responseStatusForError(error), headers: responseHeadersForError(error) }
    );
  }
}
