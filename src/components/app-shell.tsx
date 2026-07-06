"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, ClipboardList, FileKey2, FileText, Github, Landmark, PlayCircle, Shield } from "lucide-react";
import { AppStoreProvider } from "@/components/app-store";
import { externalLinks } from "@/lib/links";
import { isArcTestnetMode } from "@/lib/settlement-mode";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/simulate", label: "Simulate", icon: PlayCircle },
  { href: "/approvals", label: "Approvals", icon: ClipboardList },
  { href: "/ledger", label: "Ledger", icon: FileText },
  { href: "/policies/new", label: "Policy Builder", icon: Shield },
  { href: "/contract", label: "Contract", icon: FileKey2 },
  { href: "/architecture", label: "Architecture", icon: Landmark }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <AppStoreProvider>
      {isLanding ? (
        <main className="min-h-screen bg-ink-950 text-white">{children}</main>
      ) : (
        <div className="min-h-screen bg-ink-950 text-white">
          <div className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-ink-900/90 p-5 lg:block">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/brand/arcallowance-mark.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg border border-sky-300/20 bg-ink-950 object-cover" />
              <div>
                <p className="font-semibold">ArcAllowance</p>
                <p className="text-xs text-slate-500">Policy controls for agent USDC</p>
              </div>
            </Link>
            <nav className="mt-8 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.06] hover:text-white",
                      active && "bg-white/[0.08] text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-4">
              <p className="text-sm font-medium text-slate-100">{isArcTestnetMode ? "Arc Testnet registry" : "Mock settlement"}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{isArcTestnetMode ? "Spend decisions are anchored as Arc Testnet audit transactions." : "Built for Gateway/x402-style nanopayments, Arc transaction memos, and Circle Wallets."}</p>
              <div className="mt-4 flex items-center gap-3 text-xs font-medium">
                <a href={externalLinks.x} target="_blank" rel="noreferrer" className="text-slate-400 transition hover:text-slate-100">
                  X
                </a>
                <span className="h-1 w-1 rounded-full bg-slate-700" aria-hidden="true" />
                <a href={externalLinks.github} target="_blank" rel="noreferrer" className="text-slate-400 transition hover:text-slate-100">
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <div className="border-b border-white/10 bg-ink-900/95 p-3 lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex min-w-0 items-center gap-2">
                <Image src="/brand/arcallowance-mark.png" alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-md border border-sky-300/20 bg-ink-950 object-cover" />
                <span className="truncate font-semibold">ArcAllowance</span>
              </Link>
              <Link href="/simulate" className="rounded-md bg-sky-300 px-3 py-2 text-sm font-medium text-ink-950">Simulate</Link>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border border-white/10 px-2 py-2 text-center text-[11px] leading-4 text-slate-400",
                    (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) && "border-cyan-300/25 bg-cyan-300/10 text-cyan-50"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="w-full truncate">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={externalLinks.x} target="_blank" rel="noreferrer" className="rounded-md border border-white/10 px-3 py-2 text-center text-xs font-medium text-slate-300">
                X / Twitter
              </a>
              <a href={externalLinks.github} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-slate-300">
                <Github className="h-3.5 w-3.5" aria-hidden="true" />
                GitHub
              </a>
            </div>
          </div>
          <main className="lg:pl-72">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      )}
    </AppStoreProvider>
  );
}
