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
    default: "text-cyan-100/80",
    good: "text-cyan-100/80",
    warn: "text-amber-100/85",
    danger: "text-rose-200/85"
  }[tone];

  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-semibold leading-8 text-white">{value}</p>
        </div>
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", toneClass)} aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}
