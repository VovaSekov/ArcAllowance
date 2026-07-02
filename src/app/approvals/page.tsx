"use client";

import { Check, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PolicyCheckList } from "@/components/policy-check-list";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/components/app-store";
import { formatDate, formatUSDC } from "@/lib/utils";

export default function ApprovalsPage() {
  const { agents, merchants, spendRequests, approveRequest, rejectRequest } = useAppStore();
  const pending = spendRequests.filter((request) => request.status === "needs_approval");

  return (
    <>
      <PageHeader
        eyebrow="Human approval"
        title="Approval queue"
        description="Requests here passed hard policy controls but crossed an approval threshold. Approving creates a mock receipt; rejecting creates an audit event."
      />
      {pending.length === 0 ? (
        <EmptyState icon={Check} title="No pending approvals" body="Run the OpsAgent weekly compute scenario from the simulator to create a threshold-triggered request." />
      ) : (
        <div className="space-y-5">
          {pending.map((request) => {
            const agent = agents.find((item) => item.id === request.agentId);
            const merchant = merchants.find((item) => item.id === request.merchantId);
            return (
              <section key={request.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">{agent?.name} → {merchant?.name}</h2>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{formatUSDC(request.amountUSDC)} for <span className="font-mono text-xs">{request.purpose}</span> · {formatDate(request.createdAt)}</p>
                    <p className="mt-2 text-sm text-slate-500">Payment type: {request.paymentType}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => approveRequest(request.id)} className="inline-flex items-center gap-2 rounded-md bg-emerald-300 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-emerald-200">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Approve
                    </button>
                    <button type="button" onClick={() => rejectRequest(request.id)} className="inline-flex items-center gap-2 rounded-md border border-rose-400/30 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-400/10">
                      <X className="h-4 w-4" aria-hidden="true" />
                      Reject
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
