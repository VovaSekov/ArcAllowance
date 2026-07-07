import { CircleDashed, CircleDot, FileText, Shield } from "lucide-react";
import { isArcTestnetMode, isRealSettlementMode } from "@/lib/settlement-mode";
import type { SpendRequest } from "@/lib/types";

export function SpendTimeline({ request }: { request?: SpendRequest }) {
  if (!request) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-start gap-3">
          <CircleDashed className="mt-1 h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">Flow preview</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Run a policy check to see whether the request is approved, rejected, routed to review, or sent to settlement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isRejected = request?.status === "rejected" || request?.status === "settlement_failed";
  const needsApproval = request?.status === "needs_approval";
  const pendingSettlement = request?.status === "settlement_pending";
  const items = [
    { label: "Agent request", detail: "Agent proposes a USDC payment.", active: true, icon: CircleDashed },
    { label: "Policy engine", detail: "Merchant, amount, purpose, and threshold rules are evaluated.", active: true, icon: Shield },
    {
      label: needsApproval ? "Exception review" : isRejected ? "Settlement stopped" : isRealSettlementMode ? "Settlement adapter" : isArcTestnetMode ? "Arc Testnet registry" : "Mock Gateway authorization",
      detail: needsApproval
        ? "Request waits for the budget owner because it crossed the autonomy threshold."
        : isRejected
          ? request?.status === "settlement_failed" ? "The provider rejected or failed the payment." : "No settlement artifact is generated."
          : isRealSettlementMode
            ? pendingSettlement ? "The payment provider accepted the transfer and is waiting for final confirmation." : "The approved request is sent to the server-side payment provider."
            : isArcTestnetMode
              ? "Request and decision are written to Arc Testnet."
              : "Mock Gateway/x402 authorization is generated.",
      active: true,
      icon: CircleDot
    },
    {
      label: "Receipt ledger",
      detail: request?.status === "approved" || request?.status === "settled" ? (isRealSettlementMode ? "Provider payment ID, memo, and tx reference are recorded." : isArcTestnetMode ? "Memo and Arc Testnet tx hash are recorded." : "Memo and mock Arc tx hash are recorded.") : "Audit event is retained.",
      active: true,
      icon: FileText
    }
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="grid gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-md border border-white/10 bg-ink-950/45 p-3">
          <div className="flex items-center gap-2">
            <item.icon className={item.active ? "h-4 w-4 shrink-0 text-cyan-100/85" : "h-4 w-4 shrink-0 text-slate-600"} aria-hidden="true" />
            <p className="break-words text-sm font-medium leading-5 text-slate-100">{item.label}</p>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">{item.detail}</p>
        </div>
      ))}
      </div>
    </div>
  );
}
