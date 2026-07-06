import { Shield } from "lucide-react";
import { isArcTestnetMode, isRealSettlementMode, settlementModeLabel } from "@/lib/settlement-mode";

export function DemoModeBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-4 text-sm text-slate-300 shadow-glow md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-cyan-100/80" aria-hidden="true" />
        <div>
          <p className="font-semibold text-slate-100">
            {isRealSettlementMode
              ? "Real settlement mode. Approved spend calls a server-side payment adapter."
              : isArcTestnetMode
                ? "Arc Testnet mode. Decisions are anchored onchain."
                : "Mock mode today. Arc-native settlement tomorrow."}
          </p>
          <p className="mt-1 text-slate-400">
            {isRealSettlementMode
              ? "Policy-approved transfers are sent to the configured wallet/Gateway adapter; pending and failed transfers stay visible until provider webhooks confirm final status."
              : isArcTestnetMode
                ? "Automatic approvals, rejections, and review-required spend decisions create Arc Testnet registry transactions. No mainnet funds move."
                : "This demo generates mock Gateway authorization, mock Arc tx hash, and audit receipts. No real funds move."}
          </p>
        </div>
      </div>
      <span className="w-fit rounded-md border border-slate-500/30 bg-white/[0.035] px-3 py-1 text-xs font-medium text-slate-300">
        Mode: {settlementModeLabel()}{isRealSettlementMode ? "" : " audit"}
      </span>
    </div>
  );
}
