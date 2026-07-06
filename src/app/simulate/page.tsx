"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleDot, Clock3, Loader2, PlayCircle, Sparkles, XCircle } from "lucide-react";
import { useAppStore } from "@/components/app-store";
import { ContractStatusCard } from "@/components/contract-status-card";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { PolicyCheckList } from "@/components/policy-check-list";
import { ReceiptCard } from "@/components/receipt-card";
import { SpendTimeline } from "@/components/spend-timeline";
import { StatusBadge } from "@/components/status-badge";
import { isArcTestnetMode, settlementModeLabel } from "@/lib/settlement-mode";
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

type AiIntentResponse = {
  agentId: string;
  merchantId: string;
  amountUSDC: number;
  purpose: string;
  paymentType: PaymentType;
  rationale: string;
  source: "openai" | "fallback";
  error?: string;
};

const aiPromptExamples = [
  "ResearchAgent needs the latest CPI dataset and expects a tiny API charge.",
  "OpsAgent needs a weekly batch of model inference for deployment checks.",
  "TradingAgent wants to buy a private alpha signal from an unknown group."
];

export default function SimulatePage() {
  const { agents, merchants, policies, submitSpendRequest } = useAppStore();
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
  const [aiPrompt, setAiPrompt] = useState(aiPromptExamples[0]);
  const [aiResult, setAiResult] = useState<AiIntentResponse | undefined>();
  const [aiError, setAiError] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

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
    setFormError(undefined);
  }

  async function generateAiIntent(prompt = aiPrompt) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setAiError("Describe what the agent wants to buy.");
      return;
    }

    setAiLoading(true);
    setAiError(undefined);

    try {
      const response = await fetch("/api/ai/spend-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt, agentId: form.agentId })
      });
      const data = await response.json() as AiIntentResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "AI intent generation failed.");
      }

      setForm({
        agentId: data.agentId,
        merchantId: data.merchantId,
        amountUSDC: String(data.amountUSDC),
        purpose: data.purpose,
        paymentType: data.paymentType
      });
      setAiPrompt(cleanPrompt);
      setAiResult(data);
      setLatestRequest(undefined);
      setLatestReceipt(undefined);
      setEvaluation(undefined);
      setFormError(undefined);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI intent generation failed.");
    } finally {
      setAiLoading(false);
    }
  }

  async function runPolicyCheck() {
    if (!selectedPolicy || !selectedMerchant) {
      return;
    }

    const amountUSDC = Number(form.amountUSDC);
    if (!Number.isFinite(amountUSDC) || amountUSDC <= 0) {
      setFormError("Enter a positive USDC amount before running policy checks.");
      setLatestRequest(undefined);
      setLatestReceipt(undefined);
      setEvaluation(undefined);
      return;
    }

    setFormError(undefined);
    setSettlementLoading(true);
    const input = {
      agentId: form.agentId,
      merchantId: form.merchantId,
      amountUSDC,
      purpose: form.purpose,
      paymentType: form.paymentType
    };
    setLatestReceipt(undefined);

    try {
      const result = await submitSpendRequest(input);
      setEvaluation(result.evaluation);
      setLatestRequest(result.request);
      setLatestReceipt(result.receipt);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : `${settlementModeLabel()} anchoring failed.`);
    } finally {
      setSettlementLoading(false);
    }
  }

  const ResultIcon =
    latestRequest?.status === "rejected" ? XCircle : latestRequest?.status === "needs_approval" ? Clock3 : latestRequest ? CircleDot : PlayCircle;

  return (
    <>
      <PageHeader
        eyebrow="Spend simulator"
        title="Simulate agent spend"
        description={
          isArcTestnetMode
            ? "Select an agent, merchant, amount, purpose, and payment type. In-policy requests clear automatically; exceptions are routed to review and decisions are anchored on Arc Testnet."
            : "Select an agent, merchant, amount, purpose, and payment type. In-policy requests clear automatically; exceptions are routed to review and mock receipts are generated only when allowed."
        }
      />
      <DemoModeBanner />
      <div className="mt-6">
        <ContractStatusCard compact />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Payment request</h2>
          <div className="mt-5 rounded-lg border border-sky-300/20 bg-sky-300/[0.06] p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold text-white">AI intent builder</h3>
                  <span className="w-fit rounded-full border border-sky-300/20 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-sky-100">
                    {aiResult?.source === "openai" ? "OpenAI" : "Optional AI"}
                  </span>
                </div>
                <label className="mt-3 grid gap-2 text-sm">
                  <span className="text-slate-300">Agent intent</span>
                  <textarea
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    rows={3}
                    className="min-h-24 resize-y rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-sm leading-6 text-white placeholder:text-slate-500"
                  />
                </label>
                <div className="mt-3 grid gap-2">
                  {aiPromptExamples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setAiPrompt(example);
                        void generateAiIntent(example);
                      }}
                      className="min-w-0 rounded-md border border-white/10 px-3 py-2 text-left text-xs leading-5 text-slate-300 hover:bg-white/[0.06]"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void generateAiIntent()}
                  disabled={aiLoading}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                  Generate request
                </button>
                {aiResult ? (
                  <p className="mt-3 break-words text-sm leading-6 text-sky-100/80">{aiResult.rationale}</p>
                ) : null}
                {aiError ? (
                  <p className="mt-3 break-words text-sm leading-6 text-rose-100">{aiError}</p>
                ) : null}
              </div>
            </div>
          </div>
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
              <input value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} className="min-w-0 rounded-md border border-white/10 bg-ink-950 px-3 py-2 font-mono text-xs text-white" />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Payment type</span>
              <select value={form.paymentType} onChange={(event) => setForm({ ...form, paymentType: event.target.value as PaymentType })} className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white">
                <option value="x402">x402</option>
                <option value="usdc_transfer">usdc_transfer</option>
                <option value="batch">batch</option>
              </select>
            </label>
            <button type="button" onClick={() => void runPolicyCheck()} disabled={settlementLoading} className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-300 px-4 py-3 text-sm font-semibold text-ink-950 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60">
              {settlementLoading ? (isArcTestnetMode ? "Writing to Arc Testnet" : "Creating receipt") : "Run policy check"}
              {settlementLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlayCircle className="h-4 w-4" aria-hidden="true" />}
            </button>
            {formError ? (
              <p className="rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm leading-6 text-rose-100">{formError}</p>
            ) : null}
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-ink-950/50 p-4">
            <p className="text-sm font-medium text-white">Demo presets</p>
            <div className="mt-3 grid gap-2">
              {demoScenarios.map((scenario, index) => (
                <button key={scenario.title} type="button" onClick={() => applyScenario(index)} className="min-w-0 rounded-md border border-white/10 px-3 py-2 text-left text-sm leading-6 text-slate-300 hover:bg-white/[0.06]">
                  {scenario.title}: expected {scenario.expected.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <ResultIcon className="mt-1 h-5 w-5 text-sky-300" aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">Policy result</h2>
                  <p className="mt-1 break-words text-sm leading-6 text-slate-400">
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
              <p className="mt-2 text-sm leading-6 text-rose-100/80">
                Hard policy failures were found. {isArcTestnetMode ? "The rejection is anchored as an Arc Testnet audit decision when the registry write succeeds." : "No mock Gateway authorization, memo, or Arc tx hash was generated for this rejected request."}
              </p>
            </div>
          ) : latestRequest?.status === "needs_approval" ? (
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-5">
              <h3 className="font-semibold text-amber-100">Exception review required</h3>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">This request passed hard controls but exceeded the autonomy threshold. The budget owner can authorize or reject it in the review queue.</p>
              <Link href="/approvals" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-100 hover:text-white">
                Open review queue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
