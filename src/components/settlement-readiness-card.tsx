"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, PlugZap, TriangleAlert } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

type Readiness = {
  mode: string;
  ready: boolean;
  enabled: boolean;
  provider: "custom" | "circle" | "gateway_x402";
  sandboxAdapterEnabled: boolean;
  adapterUrlConfigured: boolean;
  adapterTokenConfigured: boolean;
  webhookSecretConfigured: boolean;
  anchorArcTestnet: boolean;
  missing: string[];
  warnings: string[];
};

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  const Icon = ok ? CheckCircle2 : CircleDashed;
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-white/10 bg-ink-950/45 px-3 py-2 text-sm">
      <Icon className={ok ? "h-4 w-4 shrink-0 text-emerald-200" : "h-4 w-4 shrink-0 text-slate-500"} aria-hidden="true" />
      <span className={ok ? "text-slate-200" : "text-slate-500"}>{label}</span>
    </div>
  );
}

export function SettlementReadinessCard() {
  const [readiness, setReadiness] = useState<Readiness | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function loadReadiness() {
      try {
        const response = await fetch("/api/settlement/readiness", { cache: "no-store" });
        const data = await response.json() as unknown;
        const errorMessage = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : undefined;
        if (!response.ok || errorMessage) {
          throw new Error(errorMessage ?? "Could not load settlement readiness.");
        }
        if (!cancelled) {
          setReadiness(data as Readiness);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not load settlement readiness.");
        }
      }
    }

    void loadReadiness();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <PlugZap className="h-5 w-5 text-cyan-100/80" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Settlement readiness</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Real wallets and transfers stay disabled until the server has a funded settlement adapter, webhook secret, and provider configuration. Sandbox adapter mode can test the same lifecycle without moving funds.
          </p>
        </div>
        <div className="shrink-0">
          {readiness ? <StatusBadge status={readiness.ready ? "approved" : "settlement_pending"} /> : <StatusBadge status="approved" />}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-rose-400/20 bg-rose-400/10 p-3 text-sm leading-6 text-rose-100">{error}</div>
      ) : null}

      {readiness ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <CheckRow label="Real settlement enabled" ok={readiness.enabled} />
            <CheckRow label={`${readiness.provider} adapter URL`} ok={readiness.adapterUrlConfigured} />
            <CheckRow label="Webhook secret" ok={readiness.webhookSecretConfigured} />
            <CheckRow label="Adapter token" ok={readiness.adapterTokenConfigured} />
            <CheckRow label="Sandbox adapter" ok={readiness.sandboxAdapterEnabled} />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-ink-950/45 p-4">
              <p className="text-sm font-semibold text-white">Current mode</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-300">{readiness.mode}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Arc audit during real settlement: {readiness.anchorArcTestnet ? "enabled" : "disabled"}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-ink-950/45 p-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-amber-200" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">Before enabling transfers</p>
              </div>
              <div className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
                {(readiness.missing.length ? readiness.missing : ["No blocking items detected."]).map((item) => (
                  <p key={item} className="break-words">{item}</p>
                ))}
                {readiness.warnings.map((item) => (
                  <p key={item} className="break-words text-amber-100/80">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
