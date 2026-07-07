import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileSearch,
  Landmark,
  PlayCircle,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { ContractStatusCard } from "@/components/contract-status-card";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { SettlementReadinessCard } from "@/components/settlement-readiness-card";
import { arcAllowanceRegistry, getRegistryExplorerUrl, isRegistryConfigured } from "@/lib/contract/config";
import { isArcTestnetMode, isRealSettlementMode } from "@/lib/settlement-mode";
import { shortAddress } from "@/lib/utils";

const demoSteps = [
  {
    label: "Auto-approved spend",
    title: "ResearchAgent buys a tiny data query",
    body: "Shows the happy path: allowlisted merchant, tiny amount, allowed purpose, and automatic policy clearance.",
    href: "/simulate?scenario=approved",
    cta: "Run approved flow",
    result: isRealSettlementMode ? "Provider adapter receives the approved transfer." : isArcTestnetMode ? "Arc Testnet receipt is created." : "Mock receipt is created.",
    icon: CheckCircle2,
    tone: "cyan"
  },
  {
    label: "Policy rejection",
    title: "TradingAgent attempts unsafe alpha spend",
    body: "Shows hard controls: unknown merchant, risky purpose, high amount, and no settlement artifact.",
    href: "/simulate?scenario=rejected",
    cta: "Run rejected flow",
    result: "Hard-fail rules are visible and no payment is created.",
    icon: Ban,
    tone: "rose"
  },
  {
    label: "Exception review",
    title: "OpsAgent crosses the autonomy threshold",
    body: "Shows why manual review exists: normal requests clear automatically, but above-threshold spend needs budget-owner authorization.",
    href: "/simulate?scenario=review",
    cta: "Create review item",
    result: "Request waits in review queue until authorized or rejected.",
    icon: ClipboardList,
    tone: "amber"
  }
];

const proofSteps = [
  {
    title: "Policy result",
    body: "Every rule is visible: merchant, amount, daily budget, purpose, risk, and autonomy threshold.",
    href: "/simulate",
    icon: ShieldCheck
  },
  {
    title: "Review queue",
    body: "Budget owners only handle exceptions. Routine in-policy spend does not need manual approval.",
    href: "/approvals",
    icon: ClipboardList
  },
  {
    title: "Ledger receipt",
    body: "Receipts preserve memo IDs, provider IDs, settlement status, and Arc Testnet transaction references.",
    href: "/ledger",
    icon: FileSearch
  },
  {
    title: "Arc registry",
    body: "The contract page links the deployed audit registry and latest transaction references.",
    href: "/contract",
    icon: Landmark
  }
];

function toneClasses(tone: string) {
  if (tone === "rose") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-100";
  }

  if (tone === "amber") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
}

export default function DemoPage() {
  const registryConfigured = isRegistryConfigured();
  const registryUrl = getRegistryExplorerUrl();

  return (
    <>
      <PageHeader
        eyebrow="Live walkthrough"
        title="Demo ArcAllowance in five minutes"
        description="Use this page as the product script: run one approved spend, one rejected spend, one exception review, then inspect the ledger and Arc Testnet audit proof."
        action={<Link href="/simulate?scenario=approved" className="rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-sky-200">Start walkthrough</Link>}
      />

      <DemoModeBanner />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200/80">Run these first</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Three core product outcomes</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                These scenarios prove the product goal: agents request spend, policies decide, exceptions are reviewed, and every outcome is auditable.
              </p>
            </div>
            <Link href="/ledger" className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.06]">
              Open ledger
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {demoSteps.map((step, index) => (
              <div key={step.title} className="flex min-w-0 flex-col rounded-lg border border-white/10 bg-ink-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClasses(step.tone)}`}>
                    {String(index + 1).padStart(2, "0")} · {step.label}
                  </span>
                  <step.icon className="h-5 w-5 shrink-0 text-cyan-100/75" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold leading-6 text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.body}</p>
                <div className="mt-4 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-slate-300">
                  Expected: <span className="text-slate-100">{step.result}</span>
                </div>
                <Link href={step.href} className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-sky-300 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-sky-200">
                  {step.cta}
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-5 shadow-glow">
            <div className="flex items-center gap-3">
              <WalletCards className="h-5 w-5 text-cyan-100/85" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">What to say</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              ArcAllowance is not a wallet UI. It is the control layer before an AI agent can spend USDC: policy, review, audit, and settlement receipts.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Production currently uses Arc Testnet audit proof. The sandbox adapter proves the provider lifecycle without moving funds. Real USDC testnet settlement comes after Circle/Gateway credentials.
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <h2 className="text-lg font-semibold text-white">Arc proof</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Registry: <span className="font-mono text-xs text-sky-100">{registryConfigured ? shortAddress(arcAllowanceRegistry.address) : "not configured"}</span>
            </p>
            {registryConfigured ? (
              <a href={registryUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-50/90 hover:bg-cyan-300/10">
                View Arcscan
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </section>
        </aside>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200/80">Then verify proof</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Four places to inspect after running scenarios</h2>
          </div>
          <Link href="/contract" className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.06]">
            Contract page
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {proofSteps.map((step) => (
            <Link key={step.title} href={step.href} className="min-w-0 rounded-lg border border-white/10 bg-ink-950/50 p-4 transition hover:border-sky-400/30 hover:bg-white/[0.06]">
              <step.icon className="h-5 w-5 text-cyan-100/80" aria-hidden="true" />
              <h3 className="mt-4 text-sm font-semibold leading-5 text-white">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{step.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ContractStatusCard />
        <SettlementReadinessCard />
      </div>
    </>
  );
}
