"use client";

import Link from "next/link";
import { AgentCard } from "@/components/agent-card";
import { PageHeader } from "@/components/page-header";
import { useAppStore } from "@/components/app-store";

export default function AgentsPage() {
  const { agents, policies } = useAppStore();

  return (
    <>
      <PageHeader
        eyebrow="Agent registry"
        title="Seeded agent wallets"
        description="Review autonomous agents, their wallet addresses, spending posture, and active capabilities before simulating USDC payments."
        action={<Link href="/policies/new" className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.06]">Build policy</Link>}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} policy={policies.find((policy) => policy.agentId === agent.id)} />
        ))}
      </div>
    </>
  );
}
