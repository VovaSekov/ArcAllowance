import { ShieldCheck } from "lucide-react";

export function DemoModeBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-sky-400/20 bg-sky-400/10 p-4 text-sm text-sky-100 shadow-glow md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
        <div>
          <p className="font-semibold text-white">Mock mode today. Arc-native settlement tomorrow.</p>
          <p className="mt-1 text-sky-100/80">
            This demo generates mock Gateway authorization, mock Arc tx hash, and audit receipts. No real funds move.
          </p>
        </div>
      </div>
      <span className="w-fit rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100">
        NEXT_PUBLIC_SETTLEMENT_MODE=mock
      </span>
    </div>
  );
}
