import { CircleDashed, CircleDot, FileText, Shield } from "lucide-react";
import { isArcTestnetMode } from "@/lib/settlement-mode";
import type { SpendRequest } from "@/lib/types";

export function SpendTimeline({ request }: { request?: SpendRequest }) {
  const isRejected = request?.status === "rejected";
  const needsApproval = request?.status === "needs_approval";
  const items = [
    { label: "Agent request", detail: "Agent proposes a USDC payment.", active: Boolean(request), icon: CircleDashed },
    { label: "Policy engine", detail: "Merchant, amount, purpose, and threshold rules are evaluated.", active: Boolean(request), icon: Shield },
    {
      label: needsApproval ? "Exception review" : isRejected ? "Settlement stopped" : isArcTestnetMode ? "Arc Testnet registry" : "Mock Gateway authorization",
      detail: needsApproval
        ? "Request waits for the budget owner because it crossed the autonomy threshold."
        : isRejected
          ? "No settlement artifact is generated."
          : isArcTestnetMode
            ? "Request and decision are written to Arc Testnet."
            : "Mock Gateway/x402 authorization is generated.",
      active: Boolean(request),
      icon: CircleDot
    },
    {
      label: "Receipt ledger",
      detail: request?.status === "approved" || request?.status === "settled" ? (isArcTestnetMode ? "Memo and Arc Testnet tx hash are recorded." : "Memo and mock Arc tx hash are recorded.") : "Audit event is retained.",
      active: Boolean(request),
      icon: FileText
    }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <item.icon className={item.active ? "h-5 w-5 text-cyan-100/85" : "h-5 w-5 text-slate-600"} aria-hidden="true" />
          <p className="mt-3 break-words text-sm font-medium leading-5 text-slate-100">{item.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}
