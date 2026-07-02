"use client";

import { PageHeader } from "@/components/page-header";
import { ContractStatusCard } from "@/components/contract-status-card";
import { LedgerTable } from "@/components/ledger-table";
import { useAppStore } from "@/components/app-store";

export default function LedgerPage() {
  const { agents, merchants, spendRequests, receipts } = useAppStore();

  return (
    <>
      <PageHeader
        eyebrow="Audit ledger"
        title="Receipts and spend requests"
        description="Filter all requests by status and inspect mock settlement receipts with memo IDs, mock Arc transaction hashes, and Gateway batch IDs."
      />
      <div className="mb-6">
        <ContractStatusCard compact />
      </div>
      <LedgerTable agents={agents} merchants={merchants} requests={spendRequests} receipts={receipts} />
    </>
  );
}
