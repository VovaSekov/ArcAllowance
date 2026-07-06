import { NextResponse } from "next/server";
import { anchorSpendRequest, markAnchoredDecision } from "@/lib/arc-testnet-registry";
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
    typeof value.paymentType === "string" &&
    typeof value.status === "string"
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

export async function POST(request: Request) {
  try {
    const payload = parsePayload(await request.json());
    const result = payload.action === "anchor"
      ? await anchorSpendRequest(payload.request)
      : await markAnchoredDecision(payload.request, payload.status);

    return NextResponse.json({
      mode: "arc_testnet",
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Arc Testnet anchoring failed."
      },
      { status: 400 }
    );
  }
}
