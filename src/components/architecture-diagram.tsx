import { Bot, FileCheck, Landmark, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";

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
    <div className="rounded-lg border border-white/10 bg-ink-950/45 p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {nodes.map((node, index) => (
          <div key={node.label} className="min-w-0 rounded-lg border border-white/10 bg-ink-900/80 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-sky-300/20 bg-sky-300/10">
                <node.icon className="h-4 w-4 text-sky-300" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5 text-white">{node.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{node.detail}</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-600">Step {index + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
