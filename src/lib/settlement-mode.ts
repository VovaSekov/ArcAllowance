import type { SettlementMode } from "@/lib/types";

function parseSettlementMode(value?: string): SettlementMode {
  if (value === "arc_testnet" || value === "real_settlement") {
    return value;
  }

  return "mock";
}

export const settlementMode: SettlementMode = parseSettlementMode(process.env.NEXT_PUBLIC_SETTLEMENT_MODE);
export const isArcTestnetMode = settlementMode === "arc_testnet";
export const isRealSettlementMode = settlementMode === "real_settlement";
export const isAuditOnlyMode = settlementMode === "arc_testnet" || settlementMode === "mock";

export function settlementModeLabel(mode: SettlementMode = settlementMode): string {
  if (mode === "arc_testnet") {
    return "Arc Testnet";
  }

  if (mode === "real_settlement") {
    return "real settlement";
  }

  return "mock";
}
