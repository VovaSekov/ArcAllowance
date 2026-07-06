"use client";

import Link from "next/link";
import { AlertTriangle, Bot, Clock3, DollarSign, FileText, Landmark, Route, Shield, Sparkles, WalletCards } from "lucide-react";
import { ContractStatusCard } from "@/components/contract-status-card";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { DemoFlowCard } from "@/components/demo-flow-card";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PolicyCheckList } from "@/components/policy-check-list";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { isArcTestnetMode } from "@/lib/settlement-mode";
import { formatDate, formatUSDC } from "@/lib/utils";

export default function DashboardPage() {
  const { agents, merchants, policies, spendRequests } = useAppStore();
  const totalBudget = policies.reduce((sum, policy) => sum + policy.dailyLimitUSDC, 0);
  const spentToday = spendRequests.filter((request) => request.status === "settled").reduce((sum, request) => sum + request.amountUSDC, 0);
  const pending = spendRequests.filter((request) => request.status === "needs_approval").length;
  const blocked = spendRequests.filter((request) => request.status === "rejected").length;
  const activeAgents = agents.filter((agent) => agent.status === "active").length;
  const latest = spendRequests.slice(0, 5);
  const productFlow = [
    {
      title: "Agent intent",
      body: "An AI agent proposes a merchant, amount, purpose, and payment type.",
      icon: Sparkles
    },
    {
      title: "Server policy check",
      body: "ArcAllowance validates allowlists, budgets, blocked purposes, risk, and approval thresholds.",
      icon: Shield
    },
    {
      title: "Arc Testnet proof",
      body: "The request and decision are written to the audit registry. No custody or mainnet funds.",
      icon: Landmark
    },
    {
      title: "Receipt ledger",
      body: "Receipts preserve memo IDs, transaction hashes, decisions, and review history.",
      icon: FileText
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Control room"
        title="Agent spend dashboard"
        description={isArcTestnetMode ? "Approve, reject, or audit every autonomous payment. This dashboard summarizes Arc Testnet anchored spend decisions and policy health." : "Approve, reject, or audit every autonomous payment. This dashboard summarizes seeded budgets, spend requests, and policy health in mock mode."}
        action={<Link href="/simulate" className="rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-sky-200">Simulate spend</Link>}
      />
      <DemoModeBanner />
      <div className="mt-6">
        <ContractStatusCard compact />
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Route className="h-5 w-5 text-cyan-100/80" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">How ArcAllowance works</h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              The product is a control plane between autonomous intent and payment execution. In current production mode it anchors audit proof on Arc Testnet while keeping real custody and settlement out of scope.
            </p>
          </div>
          <Link href="/simulate" className="inline-flex w-fit items-center justify-center rounded-md border border-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-50/90 hover:bg-cyan-300/10">
            Run the flow
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {productFlow.map((step, index) => (
            <div key={step.title} className="min-w-0 rounded-lg border border-white/10 bg-ink-950/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <step.icon className="h-5 w-5 text-cyan-100/80" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-600">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 text-sm font-semibold leading-5 text-slate-100">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <MetricCard label="Total agent budget" value={formatUSDC(totalBudget)} detail="Daily policy capacity across all seeded agents." icon={WalletCards} />
        <MetricCard label="Spent today" value={formatUSDC(spentToday)} detail={isArcTestnetMode ? "Arc Testnet anchored receipts currently in the ledger." : "Mock-settled receipts currently in the ledger."} icon={DollarSign} tone="good" />
        <MetricCard label="Pending approvals" value={String(pending)} detail="Human review queue for threshold-triggered requests." icon={Clock3} tone="warn" />
        <MetricCard label="Blocked attempts" value={String(blocked)} detail="Rejected spend requests with hard policy failures." icon={AlertTriangle} tone="danger" />
        <MetricCard label="Active agents" value={String(activeAgents)} detail="Agents currently allowed to request payments." icon={Bot} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Recent spend activity</h2>
          <div className="mt-5 space-y-3">
            {latest.map((request) => {
              const agent = agents.find((item) => item.id === request.agentId);
              const merchant = merchants.find((item) => item.id === request.merchantId);
              return (
                <div key={request.id} className="flex min-w-0 flex-col gap-3 rounded-lg border border-white/10 bg-ink-950/50 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-medium text-white">{agent?.name} → {merchant?.name}</p>
                    <p className="mt-1 break-words text-sm leading-6 text-slate-400">{formatUSDC(request.amountUSDC)} for <span className="break-all font-mono text-xs">{request.purpose}</span></p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <StatusBadge status={request.status} />
                    <span className="text-xs text-slate-500">{formatDate(request.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-cyan-100/85" aria-hidden="true" />
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
