import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "default"
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "default" | "good" | "warn" | "danger";
}) {
  const toneClass = {
    default: "text-sky-200 bg-sky-400/10 border-sky-400/20",
    good: "text-emerald-200 bg-emerald-400/10 border-emerald-400/20",
    warn: "text-amber-100 bg-amber-400/10 border-amber-400/20",
    danger: "text-rose-200 bg-rose-400/10 border-rose-400/20"
  }[tone];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className={cn("rounded-md border p-2", toneClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
