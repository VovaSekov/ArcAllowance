"use client";

import Link from "next/link";
import { ArrowRight, Bot, FileText, Shield, WalletCards } from "lucide-react";
import { MerchantBadge, PolicyPill, RiskSummary } from "@/components/entity-badges";
import { PageHeader } from "@/components/page-header";
import { ReceiptCard } from "@/components/receipt-card";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { formatDate, formatUSDC, shortAddress } from "@/lib/utils";

export function AgentDetailClient({ id }: { id: string }) {
  const { agents, merchants, policies, spendRequests, receipts } = useAppStore();
  const agent = agents.find((item) => item.id === id);
  if (!agent) {
    return null;
  }

  const policy = policies.find((item) => item.agentId === agent.id);
  const recentRequests = spendRequests.filter((request) => request.agentId === agent.id).slice(0, 5);
  const recentReceipts = receipts.filter((receipt) => receipt.agentName === agent.name).slice(0, 2);

  return (
    <>
      <PageHeader
        eyebrow="Agent detail"
        title={agent.name}
        description={agent.description}
        action={<Link href={`/simulate?agent=${agent.id}`} className="inline-flex items-center gap-2 rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-sky-200">Simulate as agent <ArrowRight className="h-4 w-4" /></Link>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Agent profile</h2>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Wallet address</dt>
              <dd className="mt-1 break-all font-mono text-sky-100">{agent.walletAddress}</dd>
            </div>
            <div>
              <dt className="text-slate-500">ERC-8004 placeholder ID</dt>
              <dd className="mt-1 font-mono text-slate-200">{agent.erc8004AgentId}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Risk summary</dt>
              <dd className="mt-2"><RiskSummary risk={agent.riskTier} /></dd>
            </div>
            <div>
              <dt className="text-slate-500">Created</dt>
              <dd className="mt-1 text-slate-200">{formatDate(agent.createdAt)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {agent.capabilities.map((capability) => <PolicyPill key={capability}>{capability}</PolicyPill>)}
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-cyan-100/85" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Active policy</h2>
          </div>
          {policy ? (
            <div className="mt-5">
              <h3 className="font-semibold text-white">{policy.name}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-3">
                  <p className="text-xs text-slate-500">Max tx</p>
                  <p className="mt-1 break-words font-medium text-white">{formatUSDC(policy.maxPerTransactionUSDC)}</p>
                </div>
                <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-3">
                  <p className="text-xs text-slate-500">Daily</p>
                  <p className="mt-1 break-words font-medium text-white">{formatUSDC(policy.dailyLimitUSDC)}</p>
                </div>
                <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-3">
                  <p className="text-xs text-slate-500">Monthly</p>
                  <p className="mt-1 break-words font-medium text-white">{formatUSDC(policy.monthlyLimitUSDC)}</p>
                </div>
                <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/50 p-3">
                  <p className="text-xs text-slate-500">Review above</p>
                  <p className="mt-1 break-words font-medium text-white">{formatUSDC(policy.approvalRequiredAboveUSDC)}</p>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-sm text-slate-500">Allowed merchants</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {policy.allowedMerchantIds.map((merchantId) => {
                    const merchant = merchants.find((item) => item.id === merchantId);
                    return merchant ? <MerchantBadge key={merchantId} merchant={merchant} /> : null;
                  })}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-sm text-slate-500">Allowed purposes</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {policy.allowedPurposes.map((purpose) => <PolicyPill key={purpose}>{purpose}</PolicyPill>)}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <WalletCards className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Recent spend requests</h2>
          </div>
          <div className="mt-5 space-y-3">
            {recentRequests.map((request) => {
              const merchant = merchants.find((item) => item.id === request.merchantId);
              return (
                <div key={request.id} className="min-w-0 rounded-lg border border-white/10 bg-ink-950/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="break-words font-medium text-white">{merchant?.name}</p>
                    <div className="shrink-0">
                      <StatusBadge status={request.status} />
                    </div>
                  </div>
                  <p className="mt-2 break-words text-sm leading-6 text-slate-400">{formatUSDC(request.amountUSDC)} for <span className="break-all font-mono text-xs">{request.purpose}</span></p>
                  <p className="mt-2 break-all text-xs leading-5 text-slate-500">Memo: {request.memoId ?? "none"} · Tx: {shortAddress(request.txHash)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Recent receipts</h2>
          </div>
          <div className="mt-5 space-y-4">
            {recentReceipts.map((receipt) => <ReceiptCard key={receipt.id} receipt={receipt} />)}
          </div>
        </section>
      </div>
    </>
  );
}
