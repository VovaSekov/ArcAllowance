import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Landmark,
  Shield,
  Sparkles,
  WalletCards
} from "lucide-react";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { arcAllowanceRegistry, arcTestnet, getRegistryExplorerUrl, isRegistryConfigured } from "@/lib/contract/config";
import { externalLinks } from "@/lib/links";
import { isArcTestnetMode } from "@/lib/settlement-mode";
import { shortAddress } from "@/lib/utils";

const controls = [
  {
    eyebrow: "AI intent",
    title: "Natural language becomes a spend request",
    body: "GPT-5.5 can draft merchant, amount, purpose, and payment type from an agent goal. The model proposes the request; policy still owns the decision.",
    icon: Sparkles
  },
  {
    eyebrow: "Policy gate",
    title: "Budgets are enforced before settlement",
    body: "Allowlists, amount caps, daily limits, blocked purposes, merchant risk, and autonomy thresholds run before a receipt can be created.",
    icon: Shield
  },
  {
    eyebrow: "Audit proof",
    title: "Every outcome leaves a trail",
    body: isArcTestnetMode ? "Automatic approvals, exception reviews, rejections, memos, Arc Testnet transaction hashes, and registry events make the flow reviewable." : "Automatic approvals, exception reviews, rejections, memos, Gateway-style authorization hashes, mock Arc tx hashes, and registry events make the flow reviewable.",
    icon: Landmark
  }
];

const demoScenarios = [
  {
    agent: "ResearchAgent",
    request: "MarketData API, 0.03 USDC",
    result: isArcTestnetMode ? "Approved with Arc Testnet receipt" : "Approved with mock receipt",
    tone: "text-cyan-100"
  },
  {
    agent: "TradingAgent",
    request: "Unknown Alpha Group, 250 USDC",
    result: "Rejected by policy",
    tone: "text-rose-200"
  },
  {
    agent: "OpsAgent",
    request: "LLM Inference Hub, 45 USDC",
    result: "Routed to exception review",
    tone: "text-amber-200"
  },
  {
    agent: "Batch settlement",
    request: "Tiny API calls, 0.42 USDC total",
    result: isArcTestnetMode ? "Arc Testnet batch audit" : "Mock Gateway batch",
    tone: "text-sky-200"
  }
];

const policyRows = [
  { label: "Merchant allowlist", value: "Clear", tone: "text-cyan-100" },
  { label: "Purpose check", value: "Clear", tone: "text-cyan-100" },
  { label: "Daily budget", value: "Warning", tone: "text-amber-200" },
  { label: "Autonomy threshold", value: "Route", tone: "text-sky-200" }
];

export const dynamic = "force-dynamic";

export default function LandingPage() {
  const registryConfigured = isRegistryConfigured();
  const explorerUrl = getRegistryExplorerUrl();

  return (
    <div className="relative overflow-hidden bg-ink-950">
      <div className="absolute inset-0 surface-grid opacity-30" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-[620px] bg-[linear-gradient(90deg,rgba(10,22,34,0.96),rgba(8,12,20,0.88)_48%,rgba(5,7,12,0.98))]" aria-hidden="true" />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/brand/arcallowance-mark.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg border border-sky-300/20 bg-ink-900 object-cover"
            priority
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white sm:text-base">ArcAllowance</p>
            <p className="hidden text-xs text-slate-500 sm:block">Agent spend control on Arc</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <a href={externalLinks.x} target="_blank" rel="noreferrer" className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-100 sm:inline-flex">
            X
          </a>
          <a href={externalLinks.github} target="_blank" rel="noreferrer" className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-100 sm:inline-flex">
            GitHub
          </a>
          <Link href="/dashboard" className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06]">
            Open app
          </Link>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:px-8 lg:pb-20 lg:pt-20">
          <div className="flex min-w-0 flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-xs font-semibold uppercase text-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-200/80" aria-hidden="true" />
              Arc-native agent spend control
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              AI agents can request spend. Policies decide what clears.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              ArcAllowance lets agents spend automatically inside policy and routes only risky or above-threshold requests to a budget owner before settlement artifacts are created.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-300 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-sky-200">
                Open Demo Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/simulate" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
                Build AI Spend Intent
                <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-2xl font-semibold text-white">3</p>
                <p className="mt-1 text-slate-400">core demo flows</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-2xl font-semibold text-white">0</p>
                <p className="mt-1 text-slate-400">real funds moved</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-2xl font-semibold text-white">Arc</p>
                <p className="mt-1 text-slate-400">testnet proof</p>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="rounded-lg border border-white/10 bg-ink-900/80 p-4 shadow-glow backdrop-blur">
              <div className="rounded-lg border border-sky-300/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(15,23,42,0.92)_42%,rgba(2,6,23,0.96))] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Image
                      src="/brand/arcallowance-mark.png"
                      alt=""
                      width={58}
                      height={58}
                      className="h-14 w-14 shrink-0 rounded-xl border border-sky-300/20 bg-ink-950 object-cover"
                      priority
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Spend request</p>
                      <p className="mt-1 text-xs text-slate-400">OpsAgent → LLM Inference Hub</p>
                    </div>
                  </div>
                  <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
                    Exception review
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-[0.95fr_1.35fr_1fr]">
                  <div className="rounded-lg border border-white/10 bg-ink-950/55 p-4">
                    <p className="text-xs text-slate-500">Amount</p>
                    <p className="mt-2 text-2xl font-semibold text-white">45.00</p>
                    <p className="mt-1 text-xs text-slate-400">USDC</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-ink-950/55 p-4">
                    <p className="text-xs text-slate-500">Purpose</p>
                    <p className="mt-2 break-words text-sm font-semibold leading-5 text-white">weekly_compute_budget</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-ink-950/55 p-4">
                    <p className="text-xs text-slate-500">Payment type</p>
                    <p className="mt-2 text-sm font-semibold text-white">{isArcTestnetMode ? "Testnet audit" : "Mock batch"}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-white/10 bg-ink-950/55 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Policy result</p>
                    <p className="text-sm font-semibold text-amber-200">Budget owner review</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {policyRows.map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="min-w-0 text-sm text-slate-300">{row.label}</span>
                        <span className={`shrink-0 text-xs font-semibold ${row.tone}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-100/85" aria-hidden="true" />
                    <p className="text-sm font-semibold text-slate-100">Live Arc Testnet audit proof</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Registry events anchor agent registration, policy hashes, spend requests, and decisions. No custody and no mainnet payments.
                  </p>
                </div>
                <div className="grid gap-2 text-sm sm:w-44">
                  <div>
                    <p className="text-slate-500">Network</p>
                    <p className="text-slate-100">{arcTestnet.network}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Registry</p>
                    <p className="font-mono text-xs text-slate-100">{registryConfigured ? shortAddress(arcAllowanceRegistry.address) : "Pending deploy"}</p>
                  </div>
                  {registryConfigured ? (
                    <a href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center justify-center gap-2 rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-semibold text-cyan-50/90 transition hover:bg-cyan-300/10">
                      View Arcscan
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <Link href="/contract" className="inline-flex w-fit items-center justify-center gap-2 rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-semibold text-cyan-50/90 transition hover:bg-cyan-300/10">
                      Contract status
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-4 md:grid-cols-3">
            {controls.map((control) => (
              <div key={control.title} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-6">
                <control.icon className="h-6 w-6 text-sky-300" aria-hidden="true" />
                <p className="mt-5 text-xs font-semibold uppercase text-slate-500">{control.eyebrow}</p>
                <h2 className="mt-2 text-xl font-semibold leading-7 text-white">{control.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{control.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-lg border border-white/10 bg-white/[0.035] p-5 sm:p-6 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] lg:items-center">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-violet-200">{isArcTestnetMode ? "Arc Testnet audit layer" : "Mock mode today, Arc-native tomorrow"}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">
                Designed for Gateway-style nanopayments, Arc memos, and controlled agent wallets.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                {isArcTestnetMode ? "The product anchors spend requests and decisions on Arc Testnet while keeping custody and real payment execution separate." : "The MVP stays local and safe while making the path to Circle Wallets, Gateway/x402, Arc batching, and ERC-8004 agent identity explicit."}
              </p>
            </div>
            <ArchitectureDiagram />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
                  <h2 className="text-xl font-semibold text-white">Demo scenarios</h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  The main product flows are ready to test: automatic approval, rejection, exception review, and batched settlement.
                </p>
              </div>
              <Link href="/simulate" className="inline-flex w-fit items-center justify-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
                Run simulator
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-6 grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-4">
              {demoScenarios.map((scenario, index) => (
                <div key={scenario.agent} className="flex min-w-0 flex-col rounded-lg border border-white/10 bg-ink-950/50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-[10px] font-semibold text-cyan-100" aria-hidden="true">
                      {index + 1}
                    </span>
                    <p className="min-w-0 text-sm font-semibold text-white">{scenario.agent}</p>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">{scenario.request}</p>
                  <p className={`mt-auto pt-4 text-sm font-semibold ${scenario.tone}`}>{scenario.result}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
