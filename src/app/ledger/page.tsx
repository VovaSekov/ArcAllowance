"use client";

import { PageHeader } from "@/components/page-header";
import { LedgerTable } from "@/components/ledger-table";
import { useAppStore } from "@/components/app-store";
import { isArcTestnetMode } from "@/lib/settlement-mode";

export default function LedgerPage() {
  const { agents, merchants, spendRequests, receipts } = useAppStore();

  return (
    <>
      <PageHeader
        eyebrow="Audit ledger"
        title="Receipts and spend requests"
        description={isArcTestnetMode ? "Filter all requests by status and inspect Arc Testnet audit receipts with memo IDs and registry transaction hashes." : "Filter all requests by status and inspect mock settlement receipts with memo IDs, mock Arc transaction hashes, and Gateway batch IDs."}
      />
      <LedgerTable agents={agents} merchants={merchants} requests={spendRequests} receipts={receipts} />
    </>
  );
}
