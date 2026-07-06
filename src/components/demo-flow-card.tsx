import Link from "next/link";
import { ArrowRight, Ban, ClipboardList, FileKey2, FileText, PlayCircle } from "lucide-react";

const demoSteps = [
  {
    title: "Approve a safe nanopayment",
    detail: "ResearchAgent buys a CPI dataset query for 0.03 USDC.",
    href: "/simulate",
    icon: PlayCircle
  },
  {
    title: "Block unsafe spend",
    detail: "TradingAgent is rejected when attempting a private alpha payment.",
    href: "/simulate",
    icon: Ban
  },
  {
    title: "Route human approval",
    detail: "OpsAgent compute spend crosses the approval threshold.",
    href: "/approvals",
    icon: ClipboardList
  },
  {
    title: "Audit receipts",
    detail: "Ledger rows show memo IDs, mock tx hashes, and settlement mode.",
    href: "/ledger",
    icon: FileText
  },
  {
    title: "Prove Arc Testnet registry",
    detail: "Contract page links the deployed onchain audit registry.",
    href: "/contract",
    icon: FileKey2
  }
];

export function DemoFlowCard() {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-200/80">Demo path</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-100">Five screens to explain the product</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Use this path for a live product walkthrough: policy result, approval queue, ledger receipt, and real Arc Testnet proof.
          </p>
        </div>
        <Link href="/simulate" className="inline-flex items-center gap-2 rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-sky-200">
          Start demo
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {demoSteps.map((step, index) => (
          <Link key={step.title} href={step.href} className="min-w-0 rounded-lg border border-white/10 bg-ink-950/50 p-4 transition hover:border-sky-400/30 hover:bg-white/[0.06]">
            <div className="flex items-center justify-between gap-3">
              <step.icon className="h-5 w-5 text-cyan-100/85" aria-hidden="true" />
              <span className="text-xs text-slate-500">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-4 break-words text-sm font-semibold leading-5 text-slate-100">{step.title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">{step.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
