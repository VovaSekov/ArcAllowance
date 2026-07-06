import { AlertTriangle, Info } from "lucide-react";
import type { PolicyCheck } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PolicyCheckList({ checks }: { checks: PolicyCheck[] }) {
  if (checks.length === 0) {
    return <p className="text-sm text-slate-400">Run a policy check to see rule-by-rule evaluation.</p>;
  }

  return (
    <div className="space-y-3">
      {checks.map((check) => {
        const Icon = check.result === "fail" ? AlertTriangle : check.result === "warning" ? Info : null;
        return (
          <div key={`${check.rule}-${check.message}`} className="flex min-w-0 gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div
              className={cn(
                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                check.result === "pass" && "border-cyan-300/25 bg-cyan-300/10",
                check.result === "fail" && "border-rose-400/30 bg-rose-400/10 text-rose-200",
                check.result === "warning" && "border-amber-400/30 bg-amber-400/10 text-amber-100"
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : <span className="h-1.5 w-1.5 rounded-full bg-cyan-200/80" aria-hidden="true" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="break-words text-sm font-medium text-slate-100">{check.rule}</p>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase",
                    check.result === "pass" && "border-cyan-300/20 bg-cyan-300/5 text-cyan-100/80",
                    check.result === "fail" && "border-rose-400/25 bg-rose-400/10 text-rose-100",
                    check.result === "warning" && "border-amber-400/25 bg-amber-400/10 text-amber-100"
                  )}
                >
                  {check.result === "pass" ? "clear" : check.result}
                </span>
              </div>
              <p className="mt-1.5 break-words text-sm leading-6 text-slate-400">{check.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
