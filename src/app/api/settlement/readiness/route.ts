import { NextResponse } from "next/server";
import { getRealSettlementReadiness } from "@/lib/server/real-settlement";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getRealSettlementReadiness());
}
