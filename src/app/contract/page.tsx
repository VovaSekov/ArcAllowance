"use client";

import { ExternalLink, FileText, Shield, WalletCards } from "lucide-react";
import { ContractStatusCard } from "@/components/contract-status-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { buildExplorerTxUrl } from "@/lib/contract/client";
import { arcTestnet, isRegistryConfigured } from "@/lib/contract/config";
import { isArcTestnetMode, isRealSettlementMode } from "@/lib/settlement-mode";
import { formatDate, formatUSDC } from "@/lib/utils";

const records = [
  "Agent registrations",
  "Policy hashes and budget limits",
  "Spend requests",
  "Approved, rejected, and review-required decisions"
];

const boundaries = [
  "No custody",
  "No ERC-20 transfers",
  "No frontend private keys",
  "No claim that mainnet funds moved"
];

export default function ContractPage() {
  const { receipts } = useAppStore();
  const configured = isRegistryConfigured();
  const latestTxHashes = receipts.filter((receipt) => receipt.txHash).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow="Onchain audit layer"
        title="ArcAllowanceRegistry"
        description={isRealSettlementMode ? "The registry is audit proof for policy decisions. Real settlement references come from the configured server-side wallet/Gateway adapter." : isArcTestnetMode ? "The registry anchors spend requests and decisions on Arc Testnet. It is proof, not custody." : "The registry can anchor the same spend-control flow on Arc Testnet without moving real funds."}
      />

      <ContractStatusCard action="arcscan" />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-cyan-100/85" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">What the contract records</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {records.map((item) => (
              <div key={item} className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-4 text-sm font-medium leading-6 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <WalletCards className="h-5 w-5 text-amber-100/85" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Security boundary</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {boundaries.map((item) => (
              <div key={item} className="rounded-md border border-amber-300/20 bg-amber-300/[0.075] p-4 text-sm font-medium leading-6 text-amber-50/85">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">{isRealSettlementMode ? "Latest settlement references" : isArcTestnetMode ? "Latest Arc Testnet audit receipts" : "Latest demo receipt hashes"}</h2>
          </div>
          <div className="shrink-0">
            <StatusBadge status={isRealSettlementMode ? "real_settlement" : isArcTestnetMode ? "arc_testnet" : "mock"} />
          </div>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          {isRealSettlementMode ? "Receipts can include provider payment IDs, transfer references, and optional Arc audit transaction hashes." : isArcTestnetMode ? "Simulator and review receipts link back to Arc Testnet registry transactions when a tx hash is available." : "Local mock receipts use mock tx hashes. Switch to Arc Testnet mode for real registry transactions."}
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {latestTxHashes.length ? latestTxHashes.map((receipt) => (
            <div key={receipt.id} className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-words text-sm font-medium text-white">{receipt.agentName} → {receipt.merchantName}</p>
                <p className="shrink-0 text-xs text-slate-500">{formatDate(receipt.createdAt)}</p>
              </div>
              <p className="mt-2 break-all text-sm leading-6 text-slate-400">{formatUSDC(receipt.amountUSDC)} · {receipt.memoId}</p>
              <p className="mt-2 break-all font-mono text-xs text-sky-100">{receipt.txHash}</p>
              {configured && isArcTestnetMode ? (
                <a href={buildExplorerTxUrl(arcTestnet.explorerUrl, receipt.txHash)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs text-sky-200 hover:text-sky-100">
                  View transaction on Arcscan
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : isRealSettlementMode ? (
                <p className="mt-3 text-xs text-slate-500">Provider payment ID: {receipt.providerPaymentId ?? "not supplied"}</p>
              ) : null}
            </div>
          )) : (
            <div className="rounded-md border border-white/10 bg-ink-950/50 p-4 text-sm leading-6 text-slate-400">
              Run an approved scenario in the simulator to create the first receipt.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
