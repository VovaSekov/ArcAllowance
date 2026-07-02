"use client";

import { ExternalLink, FileKey2, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { ContractStatusCard } from "@/components/contract-status-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { buildExplorerTxUrl, formatUSDC as formatContractUSDC, parseUSDC } from "@/lib/contract/client";
import { arcAllowanceRegistry, arcTestnet, getRegistryExplorerUrl, isRegistryConfigured } from "@/lib/contract/config";
import { formatDate, formatUSDC, shortAddress } from "@/lib/utils";

const realOnchain = [
  "ArcAllowanceRegistry is a Solidity contract for Arc Testnet audit proof.",
  "It records agent registrations, policy hashes, spend requests, and final spend decisions.",
  "The deployed address is loaded from NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS or deployments/arc-testnet.json."
];

const mocked = [
  "Gateway/x402 settlement is mocked in this MVP.",
  "USDC transfers are not executed by the app or registry.",
  "Frontend policy evaluation remains the active product flow until real Gateway/x402 adapters are added."
];

export default function ContractPage() {
  const { receipts } = useAppStore();
  const configured = isRegistryConfigured();
  const explorerUrl = getRegistryExplorerUrl();
  const latestTxHashes = receipts.filter((receipt) => receipt.txHash).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow="Onchain audit layer"
        title="ArcAllowanceRegistry"
        description="Policy decisions can be anchored on Arc Testnet without custody, private-key handling in the frontend, or real USDC movement."
      />

      <ContractStatusCard />

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Deployment proof</h2>
          </div>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Network</dt>
              <dd className="mt-1 text-white">{arcTestnet.network}</dd>
            </div>
            <div className="rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Chain ID</dt>
              <dd className="mt-1 text-white">{arcTestnet.chainId}</dd>
            </div>
            <div className="rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Contract name</dt>
              <dd className="mt-1 text-white">{arcAllowanceRegistry.contractName}</dd>
            </div>
            <div className="rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Contract address</dt>
              <dd className="mt-1 break-all font-mono text-xs text-sky-100">{configured ? arcAllowanceRegistry.address : "Deploy script has not written an address yet."}</dd>
            </div>
            <div className="rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Explorer link</dt>
              <dd className="mt-1">
                {configured ? (
                  <a href={explorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sky-200 hover:text-sky-100">
                    View on Arcscan
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-slate-400">Available after Arc Testnet deployment.</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">What is real onchain</h2>
            </div>
            <div className="mt-4 space-y-3">
              {realOnchain.map((item) => (
                <div key={item} className="rounded-md border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50/85">{item}</div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center gap-3">
              <WalletCards className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">What remains mocked</h2>
            </div>
            <div className="mt-4 space-y-3">
              {mocked.map((item) => (
                <div key={item} className="rounded-md border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50/85">{item}</div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <FileKey2 className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">USDC unit handling</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">The registry stores USDC amounts in 6-decimal units. Frontend helpers expose parseUSDC and formatUSDC for contract-facing values.</p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            {["0.03", "2", "25"].map((amount) => (
              <div key={amount} className="rounded-md border border-white/10 bg-ink-950/50 p-4">
                <p className="text-slate-500">{amount} USDC</p>
                <p className="mt-1 font-mono text-xs text-white">{parseUSDC(amount).toString()}</p>
                <p className="mt-1 text-xs text-slate-500">{formatContractUSDC(parseUSDC(amount))}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Latest demo tx hashes</h2>
            <StatusBadge status="mock" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            These are mock Arc tx hashes from the existing demo ledger. After deployment, real registry transactions should be linked from Arcscan separately.
          </p>
          <div className="mt-4 space-y-3">
            {latestTxHashes.map((receipt) => (
              <div key={receipt.id} className="rounded-md border border-white/10 bg-ink-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{receipt.agentName} → {receipt.merchantName}</p>
                  <p className="text-xs text-slate-500">{formatDate(receipt.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm text-slate-400">{formatUSDC(receipt.amountUSDC)} · {receipt.memoId}</p>
                <p className="mt-2 break-all font-mono text-xs text-sky-100">{receipt.txHash}</p>
                {configured ? (
                  <a href={buildExplorerTxUrl(arcTestnet.explorerUrl, receipt.txHash)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs text-sky-200 hover:text-sky-100">
                    Mock hash format only; not guaranteed to exist on explorer
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">Registry explorer link appears after deployment. Hash shown as mock receipt evidence.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
