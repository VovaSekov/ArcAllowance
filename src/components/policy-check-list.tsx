import { AlertTriangle, Check, Info } from "lucide-react";
import type { PolicyCheck } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PolicyCheckList({ checks }: { checks: PolicyCheck[] }) {
  if (checks.length === 0) {
    return <p className="text-sm text-slate-400">Run a policy check to see rule-by-rule evaluation.</p>;
  }

  return (
    <div className="space-y-3">
      {checks.map((check) => {
        const Icon = check.result === "pass" ? Check : check.result === "fail" ? AlertTriangle : Info;
        return (
          <div key={`${check.rule}-${check.message}`} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div
              className={cn(
                "mt-0.5 rounded-md border p-1",
                check.result === "pass" && "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
                check.result === "fail" && "border-rose-400/30 bg-rose-400/10 text-rose-200",
                check.result === "warning" && "border-amber-400/30 bg-amber-400/10 text-amber-100"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{check.rule}</p>
              <p className="mt-1 text-sm text-slate-400">{check.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
