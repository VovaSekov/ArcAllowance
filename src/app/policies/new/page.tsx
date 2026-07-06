"use client";

import { useMemo, useState } from "react";
import { Copy, Shield } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PolicyPill } from "@/components/entity-badges";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { policyTemplates } from "@/lib/seed-data";
import type { PolicyTemplate } from "@/lib/types";
import { formatUSDC } from "@/lib/utils";

type BuilderState = {
  agentId: string;
  policyName: string;
  maxPerTransactionUSDC: string;
  dailyLimitUSDC: string;
  monthlyLimitUSDC: string;
  approvalRequiredAboveUSDC: string;
  allowedMerchantIds: string[];
  allowedPurposes: string;
  blockedPurposes: string;
  cooldownMinutes: string;
};

function fromTemplate(template: PolicyTemplate, agentId: string): BuilderState {
  return {
    agentId,
    policyName: template.policy.name,
    maxPerTransactionUSDC: String(template.policy.maxPerTransactionUSDC),
    dailyLimitUSDC: String(template.policy.dailyLimitUSDC),
    monthlyLimitUSDC: String(template.policy.monthlyLimitUSDC),
    approvalRequiredAboveUSDC: String(template.policy.approvalRequiredAboveUSDC),
    allowedMerchantIds: template.policy.allowedMerchantIds,
    allowedPurposes: template.policy.allowedPurposes.join(", "),
    blockedPurposes: template.policy.blockedPurposes.join(", "),
    cooldownMinutes: String(template.policy.cooldownMinutes)
  };
}

export default function NewPolicyPage() {
  const { agents, merchants } = useAppStore();
  const [state, setState] = useState<BuilderState>(() => fromTemplate(policyTemplates[0], agents[0]?.id ?? ""));
  const selectedAgent = agents.find((agent) => agent.id === state.agentId);
  const selectedMerchants = merchants.filter((merchant) => state.allowedMerchantIds.includes(merchant.id));
  const allowedPurposes = useMemo(() => state.allowedPurposes.split(",").map((item) => item.trim()).filter(Boolean), [state.allowedPurposes]);
  const blockedPurposes = useMemo(() => state.blockedPurposes.split(",").map((item) => item.trim()).filter(Boolean), [state.blockedPurposes]);

  function applyTemplate(template: PolicyTemplate) {
    setState(fromTemplate(template, state.agentId));
  }

  function toggleMerchant(merchantId: string) {
    setState((current) => ({
      ...current,
      allowedMerchantIds: current.allowedMerchantIds.includes(merchantId)
        ? current.allowedMerchantIds.filter((id) => id !== merchantId)
        : [...current.allowedMerchantIds, merchantId]
    }));
  }

  return (
    <>
      <PageHeader
        eyebrow="Policy builder"
        title="Preview a spend policy"
        description="Create a policy shape without backend persistence. This page shows how ArcAllowance will translate agent intent into budget, merchant, purpose, and approval controls."
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
          <h2 className="text-lg font-semibold text-white">Policy form</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Agent</span>
              <select value={state.agentId} onChange={(event) => setState({ ...state, agentId: event.target.value })} className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white">
                {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Policy name</span>
              <input value={state.policyName} onChange={(event) => setState({ ...state, policyName: event.target.value })} className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["maxPerTransactionUSDC", "Max per transaction USDC"],
                ["dailyLimitUSDC", "Daily limit USDC"],
                ["monthlyLimitUSDC", "Monthly limit USDC"],
                ["approvalRequiredAboveUSDC", "Approval required above USDC"],
                ["cooldownMinutes", "Cooldown minutes"]
              ].map(([key, label]) => (
                <label key={key} className="grid gap-2 text-sm">
                  <span className="text-slate-400">{label}</span>
                  <input value={state[key as keyof BuilderState] as string} onChange={(event) => setState({ ...state, [key]: event.target.value })} inputMode="decimal" className="rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white" />
                </label>
              ))}
            </div>
            <div>
              <p className="text-sm text-slate-400">Allowed merchants</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {merchants.map((merchant) => (
                  <label key={merchant.id} className="flex items-center gap-3 rounded-md border border-white/10 bg-ink-950/60 p-3 text-sm text-slate-300">
                    <input type="checkbox" checked={state.allowedMerchantIds.includes(merchant.id)} onChange={() => toggleMerchant(merchant.id)} className="h-4 w-4" />
                    {merchant.name}
                  </label>
                ))}
              </div>
            </div>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Allowed purposes</span>
              <textarea value={state.allowedPurposes} onChange={(event) => setState({ ...state, allowedPurposes: event.target.value })} className="min-h-20 rounded-md border border-white/10 bg-ink-950 px-3 py-2 font-mono text-xs text-white" />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-400">Blocked purposes</span>
              <textarea value={state.blockedPurposes} onChange={(event) => setState({ ...state, blockedPurposes: event.target.value })} className="min-h-20 rounded-md border border-white/10 bg-ink-950 px-3 py-2 font-mono text-xs text-white" />
            </label>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center gap-3">
              <Copy className="h-5 w-5 text-sky-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">Policy templates</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {policyTemplates.map((template) => (
                <button key={template.id} type="button" onClick={() => applyTemplate(template)} className="rounded-lg border border-white/10 bg-ink-950/50 p-4 text-left hover:bg-white/[0.06]">
                  <p className="font-medium text-white">{template.name}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-cyan-100/85" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-white">Live preview</h2>
              </div>
              <StatusBadge status="mock" />
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-ink-950/50 p-4">
              <p className="text-sm text-slate-400">Agent</p>
              <p className="mt-1 font-semibold text-white">{selectedAgent?.name}</p>
              <p className="mt-4 text-sm text-slate-400">Policy</p>
              <p className="mt-1 font-semibold text-white">{state.policyName}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500">Max tx</p><p className="text-white">{formatUSDC(Number(state.maxPerTransactionUSDC) || 0)}</p></div>
                <div><p className="text-slate-500">Daily</p><p className="text-white">{formatUSDC(Number(state.dailyLimitUSDC) || 0)}</p></div>
                <div><p className="text-slate-500">Monthly</p><p className="text-white">{formatUSDC(Number(state.monthlyLimitUSDC) || 0)}</p></div>
                <div><p className="text-slate-500">Approval</p><p className="text-white">{formatUSDC(Number(state.approvalRequiredAboveUSDC) || 0)}</p></div>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-sm text-slate-400">Allowed merchants</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedMerchants.map((merchant) => <PolicyPill key={merchant.id}>{merchant.name}</PolicyPill>)}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-sm text-slate-400">Allowed purposes</p>
              <div className="mt-2 flex flex-wrap gap-2">{allowedPurposes.map((purpose) => <PolicyPill key={purpose}>{purpose}</PolicyPill>)}</div>
            </div>
            <div className="mt-5">
              <p className="text-sm text-slate-400">Blocked purposes</p>
              <div className="mt-2 flex flex-wrap gap-2">{blockedPurposes.map((purpose) => <PolicyPill key={purpose}>{purpose}</PolicyPill>)}</div>
            </div>
            <p className="mt-5 text-sm text-slate-500">Preview only. This MVP does not persist custom policies yet.</p>
          </div>
        </section>
      </div>
    </>
  );
}
