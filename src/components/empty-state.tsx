import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
      <Icon className="mx-auto h-8 w-8 text-slate-500" aria-hidden="true" />
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{body}</p>
    </div>
  );
}
