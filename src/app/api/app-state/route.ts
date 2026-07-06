import { NextResponse } from "next/server";
import { readAppState } from "@/lib/server/state-store";

export const runtime = "nodejs";

export async function GET() {
  const state = await readAppState();
  return NextResponse.json(state);
}
