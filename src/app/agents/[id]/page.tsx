import { notFound } from "next/navigation";
import { AgentDetailClient } from "@/components/agent-detail-client";
import { agents } from "@/lib/seed-data";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!agents.some((agent) => agent.id === id)) {
    notFound();
  }

  return <AgentDetailClient id={id} />;
}
