import type { RiskTier, SpendStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusClasses: Record<SpendStatus, string> = {
  approved: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  rejected: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  needs_approval: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  settled: "border-blue-300/25 bg-blue-300/10 text-blue-100",
  settlement_pending: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  settlement_failed: "border-rose-400/30 bg-rose-400/10 text-rose-200"
};

const riskClasses: Record<RiskTier, string> = {
  low: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  high: "border-rose-400/30 bg-rose-400/10 text-rose-200"
};

export function StatusBadge({ status, className }: { status: SpendStatus | "mock" | "arc_testnet" | "real_settlement"; className?: string }) {
  const classes =
    status === "mock"
      ? "border-violet-400/30 bg-violet-400/10 text-violet-100"
      : status === "arc_testnet"
        ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
        : status === "real_settlement"
          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
          : statusClasses[status];
  const label =
    status === "needs_approval"
      ? "needs review"
      : status === "arc_testnet"
        ? "arc testnet"
        : status === "real_settlement"
          ? "real settlement"
          : status === "settlement_pending"
            ? "settlement pending"
            : status === "settlement_failed"
              ? "settlement failed"
              : status.replace("_", " ");

  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium", classes, className)}>
      {label}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskTier }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium", riskClasses[risk])}>
      {risk} risk
    </span>
  );
}
