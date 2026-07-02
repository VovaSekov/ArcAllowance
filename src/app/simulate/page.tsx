"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, PlayCircle, XCircle } from "lucide-react";
import { createSpendRequestFromInput, useAppStore } from "@/components/app-store";
import { ContractStatusCard } from "@/components/contract-status-card";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { PolicyCheckList } from "@/components/policy-check-list";
import { ReceiptCard } from "@/components/receipt-card";
import { SpendTimeline } from "@/components/spend-timeline";
import { StatusBadge } from "@/components/status-badge";
import { evaluateSpendRequest } from "@/lib/policy-engine";
import { demoScenarios } from "@/lib/seed-data";
import type { PaymentType, PolicyEvaluation, Receipt, SpendRequest } from "@/lib/types";
import { formatUSDC } from "@/lib/utils";

type SimForm = {
  agentId: string;
  merchantId: string;
  amountUSDC: string;
  purpose: string;
  paymentType: PaymentType;
};

export default function SimulatePage() {
  const { agents, merchants, policies, spendRequests, addSpendRequest, settleApprovedRequest } = useAppStore();
  const [form, setForm] = useState<SimForm>({
    agentId: agents[0]?.id ?? "",
    merchantId: merchants[0]?.id ?? "",
    amountUSDC: "0.03",
    purpose: "cpi_dataset_query",
    paymentType: "x402"
  });
  const [latestRequest, setLatestRequest] = useState<SpendRequest | undefined>();
  const [latestReceipt, setLatestReceipt] = useState<Receipt | undefined>();
  const [evaluation, setEvaluation] = useState<PolicyEvaluation | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const agentId = params.get("agent");
    if (agentId && agents.some((agent) => agent.id === agentId)) {
      const policy = policies.find((item) => item.agentId === agentId);
      setForm((current) => ({
        ...current,
        agentId,
        merchantId: policy?.allowedMerchantIds[0] ?? current.merchantId,
        purpose: policy?.allowedPurposes[0] ?? current.purpose
      }));
    }
  }, [agents, policies]);

  const selectedPolicy = useMemo(() => policies.find((policy) => policy.agentId === form.agentId), [form.agentId, policies]);
  const selectedMerchant = useMemo(() => merchants.find((merchant) => merchant.id === form.merchantId), [form.merchantId, merchants]);

  function applyScenario(index: number) {
    const scenario = demoScenarios[index];
    setForm({
      agentId: scenario.agentId,
      merchantId: scenario.merchantId,
      amountUSDC: String(scenario.amountUSDC),
      purpose: scenario.purpose,
      paymentType: scenario.paymentType
    });
    setLatestRequest(undefined);
    setLatestReceipt(undefined);
    setEvaluation(undefined);
  }

  function runPolicyCheck() {
    if (!selectedPolicy || !selectedMerchant) {
      return;
    }

    const amountUSDC = Number(form.amountUSDC);
    const result = evaluateSpendRequest({
      input: {
        agentId: form.agentId,
        merchantId: form.merchantId,
        amountUSDC,
        purpose: form.purpose,
        paymentType: form.paymentType
      },
      policy: selectedPolicy,
      merchant: selectedMerchant,
      existingRequests: spendRequests
    });
    const request = addSpendRequest(
      createSpendRequestFromInput(
        {
          agentId: form.agentId,
          merchantId: form.merchantId,
          amountUSDC,
          purpose: form.purpose,
          paymentType: form.paymentType
        },
        result
      )
    );
    const receipt = result.status === "approved" ? settleApprovedRequest(request) : undefined;
    setEvaluation(result);
    setLatestRequest(request);
    setLatestReceipt(receipt);
  }

  const ResultIcon =
    latestRequest?.status === "rejected" ? XCircle : latestRequest?.status === "needs_approval" ? Clock3 : latestRequest ? CheckCircle2 : PlayCircle;

  return (
    <>
      <PageHeader
        eyebrow="Spend simulator"
        title="Simulate agent spend"
        description="Select an agent, merchant, amount, purpose, and payment type. ArcAllowance evaluates the policy and generates mock settlement artifacts only when allowed."
      />
      <DemoModeBanner />
      <div className="mt-6">
        <ContractStatusCard compact />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Payment request</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Agent</span>
              <select value={form.agentId} onChange={(event) => setForm({ ...form, agentId: event.target.value })} className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white">
                {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Merchant</span>
              <select value={form.merchantId} onChange={(event) => setForm({ ...form, merchantId: event.target.value })} className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white">
                {merchants.map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Amount USDC</span>
              <input value={form.amountUSDC} onChange={(event) => setForm({ ...form, amountUSDC: event.target.value })} inputMode="decimal" className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white" />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Purpose</span>
              <input value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 font-mono text-xs text-white" />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Payment type</span>
              <select value={form.paymentType} onChange={(event) => setForm({ ...form, paymentType: event.target.value as PaymentType })} className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white">
                <option value="x402">x402</option>
                <option value="usdc_transfer">usdc_transfer</option>
                <option value="batch">batch</option>
              </select>
            </label>
            <button type="button" onClick={runPolicyCheck} className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-300 px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-sky-200">
              Run policy check
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-ink-950/50 p-4">
            <p className="text-sm font-medium text-white">Demo presets</p>
            <div className="mt-3 grid gap-2">
              {demoScenarios.map((scenario, index) => (
                <button key={scenario.title} type="button" onClick={() => applyScenario(index)} className="rounded-md border border-white/10 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.06]">
                  {scenario.title}: expected {scenario.expected.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <ResultIcon className="mt-1 h-5 w-5 text-sky-300" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Policy result</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {latestRequest ? `${formatUSDC(latestRequest.amountUSDC)} request evaluated with risk score ${latestRequest.riskScore}.` : "Run a policy check to create a request."}
                  </p>
                </div>
              </div>
              {latestRequest ? <StatusBadge status={latestRequest.status} /> : null}
            </div>
            <div className="mt-5">
              <PolicyCheckList checks={evaluation?.policyChecks ?? []} />
            </div>
          </div>

          <SpendTimeline request={latestRequest} />

          {latestReceipt ? (
            <ReceiptCard receipt={latestReceipt} />
          ) : latestRequest?.status === "rejected" ? (
            <div className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-5">
              <h3 className="font-semibold text-rose-100">Settlement stopped</h3>
              <p className="mt-2 text-sm leading-6 text-rose-100/80">Hard policy failures were found. No mock Gateway authorization, memo, or Arc tx hash was generated for this rejected request.</p>
            </div>
          ) : latestRequest?.status === "needs_approval" ? (
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-5">
              <h3 className="font-semibold text-amber-100">Human approval required</h3>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">This request passed hard controls but exceeded the approval threshold. It is waiting in the approval queue.</p>
              <Link href="/approvals" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-100 hover:text-white">
                Open approvals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
