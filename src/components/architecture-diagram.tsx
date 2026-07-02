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
    <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 lg:grid-cols-[repeat(11,minmax(0,1fr))]">
      {nodes.map((node, index) => (
        <div key={node.label} className="contents">
          <div className="rounded-lg border border-white/10 bg-ink-900/80 p-4 lg:col-span-1">
            <node.icon className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-white">{node.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{node.detail}</p>
          </div>
          {index < nodes.length - 1 ? (
            <div className="hidden items-center justify-center text-slate-600 lg:flex">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
