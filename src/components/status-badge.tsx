import type { RiskTier, SpendStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusClasses: Record<SpendStatus, string> = {
  approved: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  rejected: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  needs_approval: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  settled: "border-blue-300/25 bg-blue-300/10 text-blue-100"
};

const riskClasses: Record<RiskTier, string> = {
  low: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  high: "border-rose-400/30 bg-rose-400/10 text-rose-200"
};

export function StatusBadge({ status, className }: { status: SpendStatus | "mock"; className?: string }) {
  const classes =
    status === "mock" ? "border-violet-400/30 bg-violet-400/10 text-violet-100" : statusClasses[status];

  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium", classes, className)}>
      {status.replace("_", " ")}
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
