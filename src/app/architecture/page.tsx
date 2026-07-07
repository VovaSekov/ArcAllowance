import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { ContractStatusCard } from "@/components/contract-status-card";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { HowItWorksOnboarding, RealPaymentsRoadmap } from "@/components/how-it-works-onboarding";
import { PageHeader } from "@/components/page-header";
import { SettlementReadinessCard } from "@/components/settlement-readiness-card";
import { isArcTestnetMode, isRealSettlementMode } from "@/lib/settlement-mode";

const roadmap = [
  "Circle developer-controlled wallets for agent wallets.",
  "Circle Gateway/x402 for gas-free nanopayments.",
  "Arc transaction memos for payment reconciliation.",
  "Arc batched transactions for grouped settlements.",
  "ERC-8004 for agent identity and reputation.",
  "App Kit, CCTP, and Unified Balance for crosschain USDC funding.",
  "StableFX later for USDC/EURC agent budgets."
];

export default function ArchitecturePage() {
  const currentArchitecture = isRealSettlementMode
    ? [
        "Local policy engine evaluates merchant allowlists, limits, purposes, risk, and autonomy thresholds before any transfer.",
        "Approved spend calls a server-side settlement adapter that owns the Circle/Gateway wallet credentials.",
        "Transfers can return pending and are finalized by /api/settlement/webhook.",
        "Ledger receipts store provider payment IDs, memo IDs, transfer references, and optional Arc audit tx hashes.",
        "The frontend never receives private keys, wallet API keys, or custody credentials."
      ]
    : isArcTestnetMode
    ? [
        "Local policy engine evaluates seeded policies and browser-created requests.",
        "ArcAllowanceRegistry records agent registrations, policy hashes, spend requests, and spend decisions on Arc Testnet.",
        "The frontend never receives private keys; registry writes are handled by a server-side testnet signer.",
        "Receipts link to real Arc Testnet registry transaction hashes.",
        "The registry does not custody funds or execute production USDC transfers."
      ]
    : [
        "Local policy engine evaluates seeded policies and browser-created requests.",
        "Seeded agents, merchants, policies, receipts, and audit events power the demo.",
        "Mock x402/Gateway authorization creates readable payment artifacts.",
        "Mock Arc memo and tx hash show how receipts can reconcile future settlements.",
        "ArcAllowanceRegistry is deployed on Arc Testnet as an onchain audit layer."
      ];

  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="From local policy checks to Arc-native settlement"
        description={isRealSettlementMode ? "The product runs policy checks first, then calls a server-side wallet/Gateway settlement adapter and records provider receipts in the ledger." : isArcTestnetMode ? "The product runs policy checks locally and anchors spend decisions to Arc Testnet through a server-side registry adapter." : "The MVP is intentionally mock-first. It shows the control plane and audit trail before any real private keys, custody, or settlement integrations are introduced."}
      />
      <DemoModeBanner />
      <div className="mt-6">
        <ContractStatusCard />
      </div>
      <div className="mt-6">
        <ArchitectureDiagram />
      </div>
      <div className="mt-6">
        <HowItWorksOnboarding />
      </div>
      <div className="mt-6">
        <RealPaymentsRoadmap />
      </div>
      <div className="mt-6">
        <SettlementReadinessCard />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">{isRealSettlementMode ? "Current real settlement product" : isArcTestnetMode ? "Current testnet product" : "Current MVP"}</h2>
          <div className="mt-4 space-y-3">
            {currentArchitecture.map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-ink-950/50 p-4 text-sm leading-6 text-slate-300">{item}</div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Arc-native roadmap</h2>
          <div className="mt-4 space-y-3">
            {roadmap.map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-ink-950/50 p-4 text-sm leading-6 text-slate-300">{item}</div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
