"use client";

import Link from "next/link";
import { AlertTriangle, Bot, Clock3, DollarSign, ShieldCheck, WalletCards } from "lucide-react";
import { ContractStatusCard } from "@/components/contract-status-card";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { DemoFlowCard } from "@/components/demo-flow-card";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PolicyCheckList } from "@/components/policy-check-list";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { formatDate, formatUSDC } from "@/lib/utils";

export default function DashboardPage() {
  const { agents, merchants, policies, spendRequests } = useAppStore();
  const totalBudget = policies.reduce((sum, policy) => sum + policy.dailyLimitUSDC, 0);
  const spentToday = spendRequests.filter((request) => request.status === "settled").reduce((sum, request) => sum + request.amountUSDC, 0);
  const pending = spendRequests.filter((request) => request.status === "needs_approval").length;
  const blocked = spendRequests.filter((request) => request.status === "rejected").length;
  const activeAgents = agents.filter((agent) => agent.status === "active").length;
  const latest = spendRequests.slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Control room"
        title="Agent spend dashboard"
        description="Approve, reject, or audit every autonomous payment. This dashboard summarizes seeded budgets, spend requests, and policy health in mock mode."
        action={<Link href="/simulate" className="rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-sky-200">Simulate spend</Link>}
      />
      <DemoModeBanner />
      <div className="mt-6">
        <ContractStatusCard compact />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total agent budget" value={formatUSDC(totalBudget)} detail="Daily policy capacity across all seeded agents." icon={WalletCards} />
        <MetricCard label="Spent today" value={formatUSDC(spentToday)} detail="Mock-settled receipts currently in the ledger." icon={DollarSign} tone="good" />
        <MetricCard label="Pending approvals" value={String(pending)} detail="Human review queue for threshold-triggered requests." icon={Clock3} tone="warn" />
        <MetricCard label="Blocked attempts" value={String(blocked)} detail="Rejected spend requests with hard policy failures." icon={AlertTriangle} tone="danger" />
        <MetricCard label="Active agents" value={String(activeAgents)} detail="Agents currently allowed to request payments." icon={Bot} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Recent spend activity</h2>
          <div className="mt-5 space-y-3">
            {latest.map((request) => {
              const agent = agents.find((item) => item.id === request.agentId);
              const merchant = merchants.find((item) => item.id === request.merchantId);
              return (
                <div key={request.id} className="flex flex-col gap-3 rounded-lg border border-white/10 bg-ink-950/50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-white">{agent?.name} → {merchant?.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{formatUSDC(request.amountUSDC)} for <span className="font-mono text-xs">{request.purpose}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={request.status} />
                    <span className="text-xs text-slate-500">{formatDate(request.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-sky-300" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Policy health</h2>
          </div>
          <div className="mt-5 space-y-4">
            {policies.map((policy) => {
              const agent = agents.find((item) => item.id === policy.agentId);
              return (
                <div key={policy.id} className="rounded-lg border border-white/10 bg-ink-950/50 p-4">
                  <p className="font-medium text-white">{agent?.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{policy.name}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Daily limit</p>
                      <p className="mt-1 text-white">{formatUSDC(policy.dailyLimitUSDC)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Approval above</p>
                      <p className="mt-1 text-white">{formatUSDC(policy.approvalRequiredAboveUSDC)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <h2 className="text-lg font-semibold text-white">Latest policy check trace</h2>
        <div className="mt-4">
          <PolicyCheckList checks={latest[0]?.policyChecks ?? []} />
        </div>
      </section>

      <div className="mt-6">
        <DemoFlowCard />
      </div>
    </>
  );
}
