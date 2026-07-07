import Link from "next/link";
import { ArrowRight, CheckCircle2, PlugZap, Shield, WalletCards } from "lucide-react";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { ContractStatusCard } from "@/components/contract-status-card";
import { PageHeader } from "@/components/page-header";
import { isArcTestnetMode, isRealSettlementMode } from "@/lib/settlement-mode";

const currentLayer = isRealSettlementMode
  ? [
      "Policy checks run before the payment adapter is called.",
      "Approved requests move through provider pending, settled, or failed states.",
      "Ledger receipts store provider references, memo IDs, and optional Arc audit hashes."
    ]
  : isArcTestnetMode
    ? [
        "Policy checks run before any audit write.",
        "Approved, rejected, and review-required decisions are anchored on Arc Testnet.",
        "The registry stores audit facts only; it does not custody or transfer USDC."
      ]
    : [
        "Policy checks run against local seeded agents, merchants, and policies.",
        "Approved requests create readable mock receipts.",
        "The same flow can be upgraded to Arc Testnet audit or a real settlement adapter."
      ];

const realTransferLayer = [
  "Connect a funded wallet provider such as Circle Wallets or Gateway/x402.",
  "Keep wallet keys and provider credentials on the server, never in the frontend.",
  "Use webhooks to reconcile pending, settled, and failed transfers back into the ledger."
];

export default function ArchitecturePage() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="How ArcAllowance is put together"
        description={isRealSettlementMode ? "ArcAllowance separates spend control from payment execution: policy and review stay in the app, while the server-side adapter owns transfers." : isArcTestnetMode ? "ArcAllowance currently proves the control layer on Arc Testnet: requests are checked locally and decisions are anchored onchain as audit evidence." : "ArcAllowance starts as a safe control-plane demo: no custody, no private keys, and no real USDC movement until a settlement adapter is enabled."}
        action={<Link href="/demo" className="inline-flex items-center gap-2 rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-sky-200">Open demo <ArrowRight className="h-4 w-4" /></Link>}
      />

      <ArchitectureDiagram />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-cyan-100/85" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">{isRealSettlementMode ? "Current real-settlement layer" : isArcTestnetMode ? "Current Arc Testnet layer" : "Current local layer"}</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {currentLayer.map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-ink-950/45 p-4 text-sm leading-6 text-slate-300">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-100/80" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <ContractStatusCard compact />
      </div>

      <section className="mt-6 rounded-lg border border-amber-300/20 bg-amber-300/[0.055] p-5">
        <div className="flex items-start gap-3">
          <WalletCards className="mt-1 h-5 w-5 shrink-0 text-amber-100/85" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">Real USDC transfer path</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-50/75">
              Real transfers are intentionally separate from the audit contract. They require a funded provider adapter, webhook reconciliation, and stronger workspace authorization before being enabled.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {realTransferLayer.map((item) => (
            <div key={item} className="rounded-md border border-amber-200/15 bg-ink-950/45 p-4 text-sm leading-6 text-amber-50/80">
              {item}
            </div>
          ))}
        </div>
        <Link href="/contract" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-100 hover:text-white">
          View audit contract
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center gap-3">
          <PlugZap className="h-5 w-5 text-sky-300" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-white">What to test first</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link href="/simulate?scenario=approved" className="rounded-md border border-white/10 bg-ink-950/45 p-4 text-sm font-semibold text-slate-100 hover:bg-white/[0.06]">
            Approved spend
          </Link>
          <Link href="/simulate?scenario=rejected" className="rounded-md border border-white/10 bg-ink-950/45 p-4 text-sm font-semibold text-slate-100 hover:bg-white/[0.06]">
            Policy rejection
          </Link>
          <Link href="/simulate?scenario=review" className="rounded-md border border-white/10 bg-ink-950/45 p-4 text-sm font-semibold text-slate-100 hover:bg-white/[0.06]">
            Threshold review
          </Link>
        </div>
      </section>
    </>
  );
}
