import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { ContractStatusCard } from "@/components/contract-status-card";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";

const mvp = [
  "Local policy engine evaluates seeded policies and browser-created requests.",
  "Seeded agents, merchants, policies, receipts, and audit events power the demo.",
  "Mock x402/Gateway authorization creates readable payment artifacts.",
  "Mock Arc memo and tx hash show how receipts can reconcile future settlements.",
  "ArcAllowanceRegistry is deployed on Arc Testnet as an onchain audit layer. It records agent registrations, policy hashes, spend requests, and spend decisions. It does not custody funds and does not execute production payments. The MVP uses a frontend policy engine and mock Gateway/x402 settlement, while Arc Testnet provides real onchain proof that agent spending decisions can be anchored and audited."
];

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
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="From local policy checks to Arc-native settlement"
        description="The MVP is intentionally mock-first. It shows the control plane and audit trail before any real private keys, custody, or settlement integrations are introduced."
      />
      <DemoModeBanner />
      <div className="mt-6">
        <ContractStatusCard />
      </div>
      <div className="mt-6">
        <ArchitectureDiagram />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Current MVP</h2>
          <div className="mt-4 space-y-3">
            {mvp.map((item) => (
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
