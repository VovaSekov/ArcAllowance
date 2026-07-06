import { ReceiptText } from "lucide-react";
import type { Receipt } from "@/lib/types";
import { formatDate, formatUSDC, shortAddress } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <ReceiptText className="mt-1 h-5 w-5 shrink-0 text-cyan-100/80" aria-hidden="true" />
          <div>
            <p className="text-sm text-slate-400">Audit receipt</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{receipt.agentName} paid {receipt.merchantName}</h3>
          </div>
        </div>
        <StatusBadge status="mock" />
      </div>
      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="text-slate-500">Amount</dt>
          <dd className="mt-1 text-white">{formatUSDC(receipt.amountUSDC)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Created</dt>
          <dd className="mt-1 text-white">{formatDate(receipt.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Memo ID</dt>
          <dd className="mt-1 break-all font-mono text-xs text-sky-100">{receipt.memoId}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Mock Arc tx hash</dt>
          <dd className="mt-1 break-all font-mono text-xs text-sky-100">{shortAddress(receipt.txHash)}</dd>
        </div>
        {receipt.gatewayBatchId ? (
          <div className="md:col-span-2">
            <dt className="text-slate-500">Mock Gateway batch</dt>
            <dd className="mt-1 break-all font-mono text-xs text-violet-100">{receipt.gatewayBatchId}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
