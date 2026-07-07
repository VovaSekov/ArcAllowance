import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  ExternalLink,
  FileText,
  Landmark,
  PlayCircle,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { ContractStatusCard } from "@/components/contract-status-card";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { arcAllowanceRegistry, getRegistryExplorerUrl, isRegistryConfigured } from "@/lib/contract/config";
import { isArcTestnetMode, isRealSettlementMode } from "@/lib/settlement-mode";
import { shortAddress } from "@/lib/utils";

const outcomes = [
  {
    eyebrow: "01",
    title: "Approved spend",
    agent: "ResearchAgent",
    request: "MarketData API · 0.03 USDC · cpi_dataset_query",
    body: "A small allowlisted request clears automatically. Policy approves it and the ledger receives an audit receipt.",
    href: "/simulate?scenario=approved",
    cta: "Run approved spend",
    result: isRealSettlementMode ? "Sent to settlement adapter" : isArcTestnetMode ? "Anchored on Arc Testnet" : "Mock receipt created",
    icon: CheckCircle2,
    tone: "cyan"
  },
  {
    eyebrow: "02",
    title: "Rejected spend",
    agent: "TradingAgent",
    request: "Unknown Alpha Group · 250 USDC · private_alpha_signal",
    body: "A risky merchant and blocked purpose are stopped before settlement. No payment receipt is created.",
    href: "/simulate?scenario=rejected",
    cta: "Run rejection",
    result: "Hard-fail policy rules",
    icon: Ban,
    tone: "rose"
  },
  {
    eyebrow: "03",
    title: "Review required",
    agent: "OpsAgent",
    request: "LLM Inference Hub · 45 USDC · weekly_compute_budget",
    body: "The request is valid but above the autonomy threshold, so a budget owner must approve or reject it.",
    href: "/simulate?scenario=review",
    cta: "Create review item",
    result: "Waiting in review queue",
    icon: ClipboardList,
    tone: "amber"
  }
];

const flow = [
  {
    title: "Agent asks",
    body: "Merchant, amount, purpose, payment type.",
    icon: Sparkles
  },
  {
    title: "Policy checks",
    body: "Allowlist, limits, purpose, risk, threshold.",
    icon: ShieldCheck
  },
  {
    title: "Decision happens",
    body: "Approve, reject, or route to review.",
    icon: ClipboardCheck
  },
  {
    title: "Proof is saved",
    body: "Ledger receipt and Arc Testnet audit trail.",
    icon: FileText
  }
];

function outcomeTone(tone: string) {
  if (tone === "rose") {
    return {
      shell: "border-rose-300/20 bg-rose-300/[0.055]",
      badge: "border-rose-300/25 bg-rose-300/10 text-rose-100",
      icon: "text-rose-100"
    };
  }

  if (tone === "amber") {
    return {
      shell: "border-amber-300/20 bg-amber-300/[0.055]",
      badge: "border-amber-300/25 bg-amber-300/10 text-amber-100",
      icon: "text-amber-100"
    };
  }

  return {
    shell: "border-cyan-300/20 bg-cyan-300/[0.055]",
    badge: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    icon: "text-cyan-100"
  };
}

export default function DemoPage() {
  const registryConfigured = isRegistryConfigured();
  const registryUrl = getRegistryExplorerUrl();

  return (
    <>
      <section className="relative overflow-hidden rounded-lg border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(15,23,42,0.76)_44%,rgba(2,6,23,0.92))] p-5 shadow-glow sm:p-7">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100/80">Guided product demo</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
            Run the three outcomes ArcAllowance controls.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Agents request USDC spend. ArcAllowance checks policy first, then approves, rejects, or sends the exception to review. Afterward, the ledger and Arc Testnet registry show the proof.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/simulate?scenario=approved" className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-300 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-sky-200">
            Start with approved spend
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/ledger" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
            Open ledger
            <FileText className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="mt-6">
        <DemoModeBanner />
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100/70">Run in this order</p>
          <h2 className="text-2xl font-semibold text-white">Three demo scenarios</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-400">
            These are the only flows you need to understand the product: one automatic approval, one hard rejection, and one larger request that requires a budget owner.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {outcomes.map((outcome) => {
            const tone = outcomeTone(outcome.tone);
            return (
              <article key={outcome.title} className={`flex min-w-0 flex-col rounded-lg border p-4 ${tone.shell}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                      {outcome.eyebrow} · {outcome.title}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold leading-6 text-white">{outcome.agent}</h3>
                  </div>
                  <outcome.icon className={`mt-1 h-5 w-5 shrink-0 ${tone.icon}`} aria-hidden="true" />
                </div>
                <p className="mt-3 break-words text-sm font-medium leading-6 text-slate-200">{outcome.request}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{outcome.body}</p>
                <div className="mt-5 rounded-md border border-white/10 bg-ink-950/45 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Expected result</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">{outcome.result}</p>
                </div>
                <Link href={outcome.href} className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-sky-300 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-sky-200">
                  {outcome.cta}
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-100/70">What is happening</p>
          <h2 className="text-2xl font-semibold text-white">The product flow</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {flow.map((step, index) => (
            <div key={step.title} className="min-w-0 rounded-lg border border-white/10 bg-ink-950/45 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                  {index + 1}
                </span>
                <step.icon className="h-4 w-4 text-cyan-100/80" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.65fr)]">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100/70">After the run</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Verify the proof</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                The demo ends in two places: the ledger for business-readable receipts, and the contract page for Arc Testnet audit evidence.
              </p>
            </div>
            {registryConfigured ? (
              <a href={registryUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-md border border-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-50/90 hover:bg-cyan-300/10">
                View Arcscan
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Link href="/ledger" className="rounded-lg border border-white/10 bg-ink-950/45 p-4 transition hover:border-sky-400/30 hover:bg-white/[0.06]">
              <FileText className="h-5 w-5 text-cyan-100/80" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-white">Ledger</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Shows the request, status, memo, receipt, and audit trail for each outcome.
              </p>
            </Link>
            <Link href="/contract" className="rounded-lg border border-white/10 bg-ink-950/45 p-4 transition hover:border-sky-400/30 hover:bg-white/[0.06]">
              <Landmark className="h-5 w-5 text-cyan-100/80" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-white">Arc Testnet registry</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Registry <span className="font-mono text-xs text-sky-100">{registryConfigured ? shortAddress(arcAllowanceRegistry.address) : "not configured"}</span> records audit facts only. It does not custody or move USDC.
              </p>
            </Link>
          </div>
        </div>

        <ContractStatusCard compact />
      </section>
    </>
  );
}
