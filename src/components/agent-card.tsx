import Link from "next/link";
import { ArrowUpRight, WalletCards } from "lucide-react";
import type { Agent, Policy } from "@/lib/types";
import { formatUSDC, shortAddress } from "@/lib/utils";
import { PolicyPill } from "@/components/entity-badges";
import { RiskBadge } from "@/components/status-badge";

export function AgentCard({ agent, policy }: { agent: Agent; policy?: Policy }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 transition hover:border-sky-400/30 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{agent.description}</p>
        </div>
        <RiskBadge risk={agent.riskTier} />
      </div>
      <div className="mt-5 rounded-md border border-white/10 bg-ink-950/60 p-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <WalletCards className="h-4 w-4 text-sky-300" aria-hidden="true" />
          <span className="font-mono text-xs">{shortAddress(agent.walletAddress)}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Daily budget</p>
            <p className="mt-1 font-medium text-white">{policy ? formatUSDC(policy.dailyLimitUSDC) : "Not assigned"}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="mt-1 font-medium capitalize text-white">{agent.status}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {agent.capabilities.map((capability) => (
          <PolicyPill key={capability}>{capability}</PolicyPill>
        ))}
      </div>
      <Link href={`/agents/${agent.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-200 hover:text-sky-100">
        Open agent detail
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
