import Link from "next/link";
import { ExternalLink, ScrollText } from "lucide-react";
import { arcAllowanceRegistry, arcTestnet, getRegistryExplorerUrl, isRegistryConfigured } from "@/lib/contract/config";
import { shortAddress } from "@/lib/utils";

export function ContractStatusCard({ compact = false }: { compact?: boolean }) {
  const configured = isRegistryConfigured();
  const explorerUrl = getRegistryExplorerUrl();

  return (
    <section className="rounded-lg border border-violet-400/20 bg-violet-400/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="rounded-md border border-violet-300/30 bg-violet-300/10 p-2 text-violet-100">
            <ScrollText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Real Arc Testnet contract</h2>
              <span className="inline-flex items-center rounded-full border border-violet-300/30 bg-violet-300/10 px-2.5 py-1 text-xs font-medium text-violet-50">
                Onchain audit registry
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-violet-100/80">
              Onchain audit registry for agent registrations, policy hashes, spend requests, and spend decisions. No custody.
            </p>
          </div>
        </div>
        <Link href="/contract" className="inline-flex items-center gap-2 rounded-md border border-violet-300/30 px-3 py-2 text-sm font-medium text-violet-50 hover:bg-violet-300/10">
          Contract page
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <dl className={compact ? "mt-4 grid gap-3 text-sm sm:grid-cols-3" : "mt-5 grid gap-3 text-sm md:grid-cols-4"}>
        <div>
          <dt className="text-violet-100/60">Network</dt>
          <dd className="mt-1 text-white">{arcTestnet.network}</dd>
        </div>
        <div>
          <dt className="text-violet-100/60">Chain ID</dt>
          <dd className="mt-1 text-white">{arcTestnet.chainId}</dd>
        </div>
        <div>
          <dt className="text-violet-100/60">Registry</dt>
          <dd className="mt-1 font-mono text-xs text-white">{configured ? shortAddress(arcAllowanceRegistry.address) : "Not deployed yet"}</dd>
        </div>
        {!compact ? (
          <div>
            <dt className="text-violet-100/60">Explorer</dt>
            <dd className="mt-1">
              {configured ? (
                <a href={explorerUrl} target="_blank" rel="noreferrer" className="text-violet-50 underline decoration-violet-300/40 underline-offset-4">
                  Arcscan
                </a>
              ) : (
                <span className="text-violet-100/70">Set address after deploy</span>
              )}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
