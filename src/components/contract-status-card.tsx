import Link from "next/link";
import { ExternalLink, Landmark } from "lucide-react";
import { arcAllowanceRegistry, arcTestnet, getRegistryExplorerUrl, isRegistryConfigured } from "@/lib/contract/config";
import { shortAddress } from "@/lib/utils";

export function ContractStatusCard({ compact = false }: { compact?: boolean }) {
  const configured = isRegistryConfigured();
  const explorerUrl = getRegistryExplorerUrl();

  return (
    <section className="min-w-0 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <Landmark className="mt-1 h-5 w-5 shrink-0 text-cyan-100/80" aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="break-words text-lg font-semibold text-slate-100">Real Arc Testnet contract</h2>
              <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-medium text-cyan-50/90">
                Onchain audit registry
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Onchain audit registry for agent registrations, policy hashes, spend requests, and spend decisions. No custody.
            </p>
          </div>
        </div>
        <Link href="/contract" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-cyan-300/20 px-3 py-2 text-sm font-medium text-cyan-50/90 hover:bg-cyan-300/10">
          Contract page
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <dl className={compact ? "mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3" : "mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4"}>
        <div>
          <dt className="text-slate-500">Network</dt>
          <dd className="mt-1 text-slate-100">{arcTestnet.network}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Chain ID</dt>
          <dd className="mt-1 text-slate-100">{arcTestnet.chainId}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Registry</dt>
          <dd className="mt-1 break-all font-mono text-xs text-slate-100">{configured ? shortAddress(arcAllowanceRegistry.address) : "Not deployed yet"}</dd>
        </div>
        {!compact ? (
          <div>
            <dt className="text-slate-500">Explorer</dt>
            <dd className="mt-1">
              {configured ? (
                <a href={explorerUrl} target="_blank" rel="noreferrer" className="text-cyan-100 underline decoration-cyan-300/30 underline-offset-4">
                  Arcscan
                </a>
              ) : (
                <span className="text-slate-400">Set address after deploy</span>
              )}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
