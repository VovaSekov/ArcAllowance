import { CheckCircle2, CircleDashed, FileText, ShieldCheck } from "lucide-react";
import type { SpendRequest } from "@/lib/types";

export function SpendTimeline({ request }: { request?: SpendRequest }) {
  const isRejected = request?.status === "rejected";
  const needsApproval = request?.status === "needs_approval";
  const items = [
    { label: "Agent request", detail: "Agent proposes a USDC payment.", active: Boolean(request), icon: CircleDashed },
    { label: "Policy engine", detail: "Merchant, amount, purpose, and threshold rules are evaluated.", active: Boolean(request), icon: ShieldCheck },
    {
      label: needsApproval ? "Human approval" : isRejected ? "Settlement stopped" : "Mock Gateway authorization",
      detail: needsApproval
        ? "Request waits in the approval queue."
        : isRejected
          ? "No settlement artifact is generated."
          : "Mock Gateway/x402 authorization is generated.",
      active: Boolean(request),
      icon: CheckCircle2
    },
    {
      label: "Receipt ledger",
      detail: request?.status === "approved" || request?.status === "settled" ? "Memo and mock Arc tx hash are recorded." : "Audit event is retained.",
      active: Boolean(request),
      icon: FileText
    }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <item.icon className={item.active ? "h-5 w-5 text-sky-300" : "h-5 w-5 text-slate-600"} aria-hidden="true" />
          <p className="mt-3 break-words text-sm font-medium leading-5 text-white">{item.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}
