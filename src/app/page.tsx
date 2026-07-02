import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, CircleDollarSign, ExternalLink, FileText, Landmark, ScrollText, ShieldCheck, WalletCards } from "lucide-react";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { arcAllowanceRegistry, arcTestnet, getRegistryExplorerUrl, isRegistryConfigured } from "@/lib/contract/config";
import { shortAddress } from "@/lib/utils";

const sections = [
  {
    title: "Problem",
    body: "Agents should not get unlimited wallets. Budgets, merchant allowlists, approval thresholds, policy checks, and audit receipts are the minimum operating layer for autonomous USDC spend.",
    icon: ShieldCheck
  },
  {
    title: "How it works",
    body: "An agent requests a payment, ArcAllowance evaluates its policy, and the flow either approves, rejects, or routes the request to a human approver before mock settlement.",
    icon: Bot
  },
  {
    title: "Why Arc / USDC / Circle",
    body: "USDC keeps budgets readable, Circle Wallets point toward controlled agent custody, Gateway/x402 supports small payments, and Arc memos make reconciliation native.",
    icon: Landmark
  }
];

const scenarios = [
  "ResearchAgent buys a CPI dataset query for 0.03 USDC.",
  "TradingAgent is blocked from paying an unknown alpha seller.",
  "OpsAgent requests 45 USDC of compute and waits for approval.",
  "Tiny API calls are batched into one mock Gateway settlement."
];

export default function LandingPage() {
  const registryConfigured = isRegistryConfigured();
  const explorerUrl = getRegistryExplorerUrl();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 surface-grid opacity-40" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(71,213,255,0.18),transparent_58%)]" aria-hidden="true" />
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-lg border border-sky-400/30 bg-sky-400/10 p-2 text-sky-200">
            <WalletCards className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-semibold tracking-tight">ArcAllowance</span>
        </Link>
        <Link href="/dashboard" className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.06]">
          Open app
        </Link>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="max-w-5xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-300">Arc-native agent spend control</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-white md:text-7xl">Budgets before autonomy</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Policy controls for AI agents spending USDC on Arc. Approve, reject, or audit every autonomous payment before an agent can touch a budget.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-300 px-5 py-3 text-sm font-semibold text-ink-950 hover:bg-sky-200">
                Open Demo Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/simulate" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.06]">
                Simulate Agent Spend
                <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-10 grid max-w-5xl gap-4 rounded-lg border border-violet-400/20 bg-violet-400/10 p-4 shadow-glow lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <div className="flex min-w-0 gap-3">
                <div className="shrink-0 rounded-md border border-violet-300/30 bg-violet-300/10 p-2 text-violet-100">
                  <ScrollText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Live on Arc Testnet</p>
                  <p className="mt-1 text-sm leading-6 text-violet-100/80">
                    ArcAllowanceRegistry anchors agent registrations, policy hashes, spend requests, and spend decisions as audit proof. No custody.
                  </p>
                </div>
              </div>
              <div className="grid min-w-0 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
                <div>
                  <p className="text-violet-100/60">Network</p>
                  <p className="mt-1 text-white">{arcTestnet.network}</p>
                </div>
                <div>
                  <p className="text-violet-100/60">Registry</p>
                  <p className="mt-1 break-all font-mono text-xs text-white">{registryConfigured ? shortAddress(arcAllowanceRegistry.address) : "Pending deploy"}</p>
                </div>
                {registryConfigured ? (
                  <a href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center justify-center gap-2 rounded-md border border-violet-300/30 px-3 py-2 text-xs font-semibold text-violet-50 hover:bg-violet-300/10">
                    View Arcscan
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <Link href="/contract" className="inline-flex w-fit items-center justify-center gap-2 rounded-md border border-violet-300/30 px-3 py-2 text-xs font-semibold text-violet-50 hover:bg-violet-300/10">
                    Contract status
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {sections.map((section) => (
              <div key={section.title} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-6">
                <section.icon className="h-6 w-6 text-sky-300" aria-hidden="true" />
                <h2 className="mt-5 break-words text-xl font-semibold text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-violet-300">Mock mode today, Arc-native tomorrow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Built for Gateway/x402-style nanopayments, Arc transaction memos, and Circle Wallets.</h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                The MVP is local and safe. It simulates authorization, settlement, memos, and receipts while making the upgrade path to Circle Wallets, Gateway/x402, Arc batching, and ERC-8004 agent identity explicit.
              </p>
            </div>
            <ArchitectureDiagram />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-white">Demo scenarios</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {scenarios.map((scenario) => (
                <div key={scenario} className="flex min-w-0 gap-3 rounded-md border border-white/10 bg-ink-950/50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                  <p className="min-w-0 text-sm leading-6 text-slate-300">{scenario}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
