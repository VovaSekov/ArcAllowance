"use client";

import { useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import type { Merchant, Agent, Receipt, SpendRequest, SpendStatus } from "@/lib/types";
import { formatDate, formatUSDC, shortAddress } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { ReceiptCard } from "@/components/receipt-card";
import { StatusBadge } from "@/components/status-badge";

const filters: Array<SpendStatus | "all"> = ["all", "approved", "rejected", "needs_approval", "settled"];

export function LedgerTable({
  requests,
  receipts,
  agents,
  merchants
}: {
  requests: SpendRequest[];
  receipts: Receipt[];
  agents: Agent[];
  merchants: Merchant[];
}) {
  const [filter, setFilter] = useState<SpendStatus | "all">("all");
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | undefined>(receipts[0]?.id);
  const visible = useMemo(() => (filter === "all" ? requests : requests.filter((request) => request.status === filter)), [filter, requests]);
  const selectedReceipt = receipts.find((receipt) => receipt.id === selectedReceiptId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="rounded-lg border border-white/10 bg-white/[0.035]">
        <div className="flex flex-wrap gap-2 border-b border-white/10 p-4">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={item === filter ? "rounded-full bg-sky-300 px-3 py-1.5 text-xs font-medium text-ink-950" : "rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300"}
            >
              {item.replace("_", " ")}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={FileSearch} title="No ledger rows" body="Adjust the status filter or run a new simulation to create spend activity." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Merchant</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Memo</th>
                  <th className="px-4 py-3 font-medium">Tx</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((request) => {
                  const agent = agents.find((item) => item.id === request.agentId);
                  const merchant = merchants.find((item) => item.id === request.merchantId);
                  const receipt = receipts.find((item) => item.spendRequestId === request.id);
                  return (
                    <tr key={request.id} className="border-b border-white/5 text-slate-300">
                      <td className="px-4 py-4 text-white">{agent?.name ?? "Unknown"}</td>
                      <td className="px-4 py-4">{merchant?.name ?? "Unknown"}</td>
                      <td className="px-4 py-4">{formatUSDC(request.amountUSDC)}</td>
                      <td className="px-4 py-4 font-mono text-xs">{request.purpose}</td>
                      <td className="px-4 py-4"><StatusBadge status={request.status} /></td>
                      <td className="px-4 py-4 font-mono text-xs">{request.memoId ?? "none"}</td>
                      <td className="px-4 py-4 font-mono text-xs">{shortAddress(request.txHash)}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => receipt && setSelectedReceiptId(receipt.id)}
                          className={receipt ? "text-sky-200 hover:text-sky-100" : "text-slate-500"}
                          disabled={!receipt}
                        >
                          {formatDate(request.createdAt)}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <aside>
        {selectedReceipt ? (
          <ReceiptCard receipt={selectedReceipt} />
        ) : (
          <EmptyState icon={FileSearch} title="No receipt selected" body="Select a settled ledger row to inspect its mock receipt." />
        )}
      </aside>
    </div>
  );
}
