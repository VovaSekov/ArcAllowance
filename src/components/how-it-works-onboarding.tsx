import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, Landmark, Shield, Sparkles, WalletCards } from "lucide-react";
import { isArcTestnetMode } from "@/lib/settlement-mode";

const flowSteps = [
  {
    title: "Agent requests spend",
    body: "An AI agent proposes a merchant, amount, purpose, and payment type before any payment action happens.",
    icon: Sparkles
  },
  {
    title: "Policy engine checks it",
    body: "ArcAllowance verifies merchant allowlists, amount caps, daily budget, purpose, blocked purposes, and merchant risk.",
    icon: Shield
  },
  {
    title: "Decision is anchored",
    body: "Approved, rejected, and review-required outcomes are written to the Arc Testnet audit registry.",
    icon: Landmark
  },
  {
    title: "Exception review only",
    body: "The queue is for requests above the autonomy threshold or outside normal risk. Routine in-policy spend clears automatically.",
    icon: ClipboardList
  },
  {
    title: "Ledger proves the trail",
    body: "Receipts show memo IDs, status, registry transaction hashes, and the audit trail for later review.",
    icon: FileText
  }
];

const realPaymentSteps = [
  "Connect Circle Wallets or another custody provider for funded agent wallets.",
  "Add Gateway/x402 authorization so approved requests can execute real USDC settlement.",
  "Handle webhooks, balances, failed payments, retries, refunds, and reconciliation.",
  "Add stronger workspace auth, roles, and spending approvals before enabling real funds."
];

export function HowItWorksOnboarding() {
  return (
    <section className="rounded-lg border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(103,232,249,0.08),rgba(255,255,255,0.035)_42%,rgba(14,165,233,0.04))] p-5 shadow-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <WalletCards className="h-5 w-5 text-cyan-100/80" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">How ArcAllowance works</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            ArcAllowance lets agents spend automatically inside policy, then stops only the exceptions that cross a budget owner&apos;s trust boundary.
          </p>
        </div>
        <Link href="/simulate" className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-sky-200">
          Run the flow
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {flowSteps.map((step, index) => (
          <div key={step.title} className="min-w-0 rounded-lg border border-white/10 bg-ink-950/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-50">
                {String(index + 1).padStart(2, "0")}
              </span>
              <step.icon className="h-4 w-4 shrink-0 text-cyan-100/75" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-sm font-semibold leading-5 text-slate-100">{step.title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RealPaymentsRoadmap() {
  return (
    <section className="rounded-lg border border-amber-300/20 bg-amber-300/[0.055] p-5">
      <div className="flex items-start gap-3">
        <WalletCards className="mt-1 h-5 w-5 shrink-0 text-amber-100/85" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-100/80">Real payments roadmap</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Current product is Arc Testnet audit proof, not custody or real settlement</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-50/75">
            Today the product proves the control layer: policy decisions, exception review, memos, receipts, and Arc Testnet registry transactions. To move real USDC, ArcAllowance needs a settlement adapter with keys, webhooks, balances, payment failures, and stronger authorization.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {realPaymentSteps.map((step) => (
          <div key={step} className="rounded-md border border-amber-200/15 bg-ink-950/45 p-4 text-sm leading-6 text-amber-50/80">
            {step}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-amber-50/60">
        {isArcTestnetMode ? "Production is currently configured for Arc Testnet audit writes only." : "Local mode uses mock artifacts only."}
      </p>
    </section>
  );
}
