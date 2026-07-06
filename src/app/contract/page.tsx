"use client";

import { ExternalLink, FileKey2, Landmark, Shield, WalletCards } from "lucide-react";
import { ContractStatusCard } from "@/components/contract-status-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { buildExplorerTxUrl, formatUSDC as formatContractUSDC, parseUSDC } from "@/lib/contract/client";
import { arcAllowanceRegistry, arcTestnet, getRegistryExplorerUrl, isRegistryConfigured } from "@/lib/contract/config";
import { isArcTestnetMode } from "@/lib/settlement-mode";
import { formatDate, formatUSDC, shortAddress } from "@/lib/utils";

const realOnchain = [
  "ArcAllowanceRegistry is a Solidity contract for Arc Testnet audit proof.",
  "It records agent registrations, policy hashes, spend requests, and final spend decisions.",
  "The deployed address is loaded from NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS or deployments/arc-testnet.json."
];

const boundaries = [
  "USDC transfers are not executed by the registry.",
  "The frontend never handles private keys.",
  "Gateway/x402 payment execution remains a separate adapter from the audit registry."
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
        description={isArcTestnetMode ? "Policy decisions are anchored on Arc Testnet through a server-side registry adapter. The frontend never handles private keys." : "Policy decisions can be anchored on Arc Testnet without custody, private-key handling in the frontend, or real USDC movement."}
      />

      <ContractStatusCard />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Deployment proof</h2>
          </div>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Network</dt>
              <dd className="mt-1 text-white">{arcTestnet.network}</dd>
            </div>
            <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Chain ID</dt>
              <dd className="mt-1 text-white">{arcTestnet.chainId}</dd>
            </div>
            <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Contract name</dt>
              <dd className="mt-1 text-white">{arcAllowanceRegistry.contractName}</dd>
            </div>
            <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-4">
              <dt className="text-slate-500">Contract address</dt>
              <dd className="mt-1 break-all font-mono text-xs text-sky-100">{configured ? arcAllowanceRegistry.address : "Deploy script has not written an address yet."}</dd>
            </div>
            <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-4">
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

        <section className="min-w-0 space-y-6">
          <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-cyan-100/85" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-100">What is real onchain</h2>
            </div>
            <div className="mt-4 space-y-3">
              {realOnchain.map((item) => (
                <div key={item} className="min-w-0 break-words rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-4 text-sm leading-6 text-slate-300">{item}</div>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center gap-3">
              <WalletCards className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Security boundaries</h2>
            </div>
            <div className="mt-4 space-y-3">
              {boundaries.map((item) => (
                <div key={item} className="min-w-0 break-words rounded-md border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50/85">{item}</div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <FileKey2 className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">USDC unit handling</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">The registry stores USDC amounts in 6-decimal units. Frontend helpers expose parseUSDC and formatUSDC for contract-facing values.</p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            {["0.03", "2", "25"].map((amount) => (
              <div key={amount} className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-4">
                <p className="text-slate-500">{amount} USDC</p>
                <p className="mt-1 break-all font-mono text-xs text-white">{parseUSDC(amount).toString()}</p>
                <p className="mt-1 text-xs text-slate-500">{formatContractUSDC(parseUSDC(amount))}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="break-words text-lg font-semibold text-white">{isArcTestnetMode ? "Latest Arc Testnet registry tx" : "Latest demo tx hashes"}</h2>
            <div className="shrink-0">
              <StatusBadge status={isArcTestnetMode ? "arc_testnet" : "mock"} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {isArcTestnetMode ? "Receipts created in the simulator and review flow link to Arcscan transaction pages." : "These are mock Arc tx hashes from the existing demo ledger. After deployment, real registry transactions should be linked from Arcscan separately."}
          </p>
          <div className="mt-4 space-y-3">
            {latestTxHashes.map((receipt) => (
              <div key={receipt.id} className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="break-words text-sm font-medium text-white">{receipt.agentName} → {receipt.merchantName}</p>
                  <p className="shrink-0 text-xs text-slate-500">{formatDate(receipt.createdAt)}</p>
                </div>
                <p className="mt-2 break-all text-sm leading-6 text-slate-400">{formatUSDC(receipt.amountUSDC)} · {receipt.memoId}</p>
                <p className="mt-2 break-all font-mono text-xs text-sky-100">{receipt.txHash}</p>
                {configured && isArcTestnetMode ? (
                  <a href={buildExplorerTxUrl(arcTestnet.explorerUrl, receipt.txHash)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs text-sky-200 hover:text-sky-100">
                    View transaction on Arcscan
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
