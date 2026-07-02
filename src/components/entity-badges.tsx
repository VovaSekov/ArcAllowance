import type { Merchant } from "@/lib/types";
import { RiskBadge } from "@/components/status-badge";

export function MerchantBadge({ merchant }: { merchant: Merchant }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-200">
      {merchant.name}
      <span className="text-slate-500">/</span>
      {merchant.category}
    </span>
  );
}

export function PolicyPill({ children }: { children: string }) {
  return <span className="break-all rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">{children}</span>;
}

export function RiskSummary({ risk }: { risk: "low" | "medium" | "high" }) {
  return (
    <div className="flex items-center gap-2">
      <RiskBadge risk={risk} />
      <span className="text-xs text-slate-400">policy-weighted profile</span>
    </div>
  );
}
