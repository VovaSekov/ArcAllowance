import type { SettlementMode } from "@/lib/types";

export const settlementMode: SettlementMode =
  process.env.NEXT_PUBLIC_SETTLEMENT_MODE === "arc_testnet" ? "arc_testnet" : "mock";

export const isArcTestnetMode = settlementMode === "arc_testnet";

export function settlementModeLabel(mode: SettlementMode = settlementMode): string {
  return mode === "arc_testnet" ? "Arc Testnet" : "mock";
}
