import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import {
  LayoutDashboard, Bot, Activity, Layers, Wallet2,
  Terminal, Settings, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/agent/setup", label: "Setup Agent", icon: Bot },
  { href: "/monitor",     label: "Monitor",     icon: Activity },
  { href: "/pools",       label: "Pools",       icon: Layers },
  { href: "/positions",   label: "Positions",   icon: Wallet2 },
  { href: "/cli",         label: "CLI Guide",   icon: Terminal },
  { href: "/settings",    label: "Settings",    icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">

      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl"
        style={{ background: "rgba(8,8,8,0.93)" }}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/logo.png" alt="GlidePool"
              className="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(0,245,100,0.5)] transition-all group-hover:drop-shadow-[0_0_10px_rgba(0,245,100,0.8)]"
            />
            <span className="font-bold text-sm sm:text-base tracking-tight">GlidePool</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center overflow-x-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href}>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-mono tracking-wide cursor-pointer whitespace-nowrap transition-all ${
                    active
                      ? "text-primary bg-primary/8 border border-primary/20"
                      : "text-white/45 hover:text-white/85 hover:bg-white/[0.05] border border-transparent"
                  }`}>
                    <Icon className={`w-3 h-3 shrink-0 ${active ? "text-primary" : "text-white/30"}`} />
                    {label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:block">
              <ConnectButton showBalance={false} />
            </div>
            <div className="sm:hidden">
              <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="none" />
            </div>
            <button
              className="lg:hidden p-1.5 rounded border border-white/[0.08] text-white/40 hover:text-white/80 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/[0.06] bg-[#080808]">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href}>
                  <div
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm font-mono border-b border-white/[0.04] cursor-pointer transition-colors ${
                      active ? "text-primary bg-primary/5" : "text-white/50 hover:text-white/80"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-white/25"}`} />
                    {label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-4">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] sm:text-xs text-white/20">GlidePool · DLMM Agent Platform · Maverick V2 on Base</span>
          <span className="font-mono text-[10px] sm:text-xs text-white/20 hidden sm:block">glidepool.com</span>
        </div>
      </footer>
    </div>
  );
}
