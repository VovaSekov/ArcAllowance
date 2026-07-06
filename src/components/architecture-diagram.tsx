import { Bot, FileText, Landmark, ReceiptText, Shield, WalletCards } from "lucide-react";

const nodes = [
  { label: "Agent", detail: "Autonomous request", icon: Bot },
  { label: "Policy Engine", detail: "Budget and controls", icon: Shield },
  { label: "x402/Gateway Authorization", detail: "Mock approval artifact", icon: WalletCards },
  { label: "Arc Memo", detail: "Reconciliation ID", icon: FileText },
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
              <node.icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-100/80" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5 text-slate-100">{node.label}</p>
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
