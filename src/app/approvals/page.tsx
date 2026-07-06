"use client";

import { useState } from "react";
import { Inbox, Shield, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PolicyCheckList } from "@/components/policy-check-list";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { formatDate, formatUSDC } from "@/lib/utils";

export default function ApprovalsPage() {
  const { agents, merchants, spendRequests, approveRequest, rejectRequest } = useAppStore();
  const [busyRequestId, setBusyRequestId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const pending = spendRequests.filter((request) => request.status === "needs_approval");

  async function handleApprove(requestId: string) {
    setBusyRequestId(requestId);
    setError(undefined);
    try {
      await approveRequest(requestId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Approval failed.");
    } finally {
      setBusyRequestId(undefined);
    }
  }

  async function handleReject(requestId: string) {
    setBusyRequestId(requestId);
    setError(undefined);
    try {
      await rejectRequest(requestId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Rejection failed.");
    } finally {
      setBusyRequestId(undefined);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Exception review"
        title="Review queue"
        description="Routine in-policy spend clears automatically. This queue is only for requests above the autonomy threshold, where the budget owner must authorize or reject the exception."
      />
      {error ? (
        <p className="mb-4 rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm leading-6 text-rose-100">{error}</p>
      ) : null}
      {pending.length === 0 ? (
        <EmptyState icon={Inbox} title="No exception reviews" body="Run the OpsAgent weekly compute scenario from the simulator to create a threshold-triggered review item." />
      ) : (
        <div className="space-y-5">
          {pending.map((request) => {
            const agent = agents.find((item) => item.id === request.agentId);
            const merchant = merchants.find((item) => item.id === request.merchantId);
            return (
              <section key={request.id} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="break-words text-lg font-semibold text-white">{agent?.name} → {merchant?.name}</h2>
                      <div className="shrink-0">
                        <StatusBadge status={request.status} />
                      </div>
                    </div>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-400">{formatUSDC(request.amountUSDC)} for <span className="break-all font-mono text-xs">{request.purpose}</span> · {formatDate(request.createdAt)}</p>
                    <p className="mt-2 text-sm text-slate-500">Payment type: {request.paymentType}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" onClick={() => void handleApprove(request.id)} disabled={busyRequestId === request.id} className="inline-flex items-center gap-2 rounded-md bg-cyan-100 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60">
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      {busyRequestId === request.id ? "Authorizing" : "Authorize exception"}
                    </button>
                    <button type="button" onClick={() => void handleReject(request.id)} disabled={busyRequestId === request.id} className="inline-flex items-center gap-2 rounded-md border border-rose-400/30 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60">
                      <X className="h-4 w-4" aria-hidden="true" />
                      {busyRequestId === request.id ? "Rejecting" : "Reject exception"}
                    </button>
                  </div>
                </div>
                <div className="mt-5">
                  <PolicyCheckList checks={request.policyChecks} />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
