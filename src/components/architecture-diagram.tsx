import { ArrowRight, Bot, FileCheck, Landmark, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";

const nodes = [
  { label: "Agent", detail: "Autonomous request", icon: Bot },
  { label: "Policy Engine", detail: "Budget and controls", icon: ShieldCheck },
  { label: "x402/Gateway Authorization", detail: "Mock approval artifact", icon: WalletCards },
  { label: "Arc Memo", detail: "Reconciliation ID", icon: FileCheck },
  { label: "USDC Settlement", detail: "Mock mode today", icon: Landmark },
  { label: "Receipt Ledger", detail: "Audit trail", icon: ReceiptText }
];

export function ArchitectureDiagram() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {nodes.map((node, index) => (
          <div key={node.label} className="relative min-w-0 rounded-lg border border-white/10 bg-ink-900/80 p-4">
            <node.icon className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <p className="mt-3 break-words text-sm font-semibold leading-5 text-white">{node.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{node.detail}</p>
            {index < nodes.length - 1 ? (
              <div className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-950 text-slate-500 2xl:flex">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
