import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bot, Activity, Layers, Wallet2,
  Terminal, Settings, ExternalLink, Plus,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/agent/setup", label: "Deploy Agent", icon: Bot },
  { href: "/monitor",     label: "Monitor",     icon: Activity },
  { href: "/pools",       label: "Pools",       icon: Layers },
  { href: "/pools/create", label: "Create Pool", icon: Plus },
  { href: "/positions",   label: "Positions",   icon: Wallet2 },
  { href: "/cli",         label: "API Guide",   icon: Terminal },
  { href: "/settings",    label: "Settings",    icon: Settings },
];

/* 5 tabs shown in the mobile bottom bar */
const BOTTOM_TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pools",     label: "Pools",     icon: Layers },
  { href: "/positions", label: "Positions", icon: Wallet2 },
  { href: "/monitor",   label: "Monitor",   icon: Activity },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans overflow-x-hidden">

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

          {/* Desktop nav - only on lg+ */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href}>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono tracking-wide cursor-pointer whitespace-nowrap transition-all ${
                    active
                      ? "text-primary bg-primary/[0.07] border border-primary/20"
                      : "text-white/45 hover:text-white/85 hover:bg-white/[0.04] border border-transparent"
                  }`}>
                    <Icon className={`w-3 h-3 shrink-0 ${active ? "text-primary" : "text-white/30"}`} />
                    {label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Wallet connect button - always visible in header */}
          <div className="shrink-0">
            <w3m-button balance="hide" size="sm" />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      {/* pb-20 on mobile to clear the fixed bottom tab bar */}
      <main className={[
        "flex-1 w-full",
        "pb-20 lg:pb-0",
        location === "/"
          ? "px-4 sm:px-6"
          : "max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8",
      ].join(" ")}>
        {children}
      </main>

      {/* ── Mobile bottom tab bar - hidden on lg+ ──────────── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.08]"
        style={{ background: "rgba(8,8,8,0.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-stretch h-16">
          {BOTTOM_TABS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} className="flex-1">
                <div className={[
                  "h-full flex flex-col items-center justify-center gap-1 transition-all",
                  active
                    ? "text-primary border-t-2 border-primary"
                    : "text-white/30 hover:text-white/60 border-t-2 border-transparent",
                ].join(" ")}>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-mono text-[9px] uppercase tracking-widest leading-none">
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] mt-8">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

          {/* Top grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-6 mb-10">

            {/* Brand col */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <img src="/logo.png" alt="GlidePool"
                  className="w-6 h-6 object-contain drop-shadow-[0_0_6px_rgba(0,245,100,0.5)] transition-all group-hover:drop-shadow-[0_0_10px_rgba(0,245,100,0.8)]" />
                <span className="font-bold text-sm tracking-tight">GlidePool</span>
              </Link>
              <p className="text-[11px] text-white/30 leading-relaxed max-w-xs">
                Autonomous DLMM liquidity agent platform for Maverick V2 pools on Base Mainnet.
                Non-custodial · x402 micropayment gated · LLM-driven.
              </p>
              {/* Social placeholder — add real links when accounts exist */}
            </div>

            {/* Product */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">Product</div>
              {[
                { label: "Dashboard",   href: "/dashboard" },
                { label: "Pools",       href: "/pools" },
                { label: "Create Pool", href: "/pools/create" },
                { label: "Positions",   href: "/positions" },
                { label: "AI Advisor",  href: "/advisor" },
                { label: "Monitor",     href: "/monitor" },
                { label: "Deploy Agent", href: "/agent/setup" },
              ].map(({ label, href }) => (
                <Link key={href} href={href}>
                  <span className="text-xs text-white/40 hover:text-white/75 transition-colors cursor-pointer font-mono">{label}</span>
                </Link>
              ))}
            </div>

            {/* Developers */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">Developers</div>
              {[
                { label: "API Guide",   href: "/cli",      ext: false },
                { label: "Settings",   href: "/settings", ext: false },
              ].map(({ label, href }) => (
                <Link key={label} href={href}>
                  <span className="text-xs text-white/40 hover:text-white/75 transition-colors cursor-pointer font-mono">{label}</span>
                </Link>
              ))}
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">Resources</div>
              <a href="https://mav.xyz" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/75 transition-colors font-mono w-fit">
                Maverick V2 <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://basescan.org" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/75 transition-colors font-mono w-fit">
                Basescan <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://x402.org" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/75 transition-colors font-mono w-fit">
                x402 Protocol <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-mono text-[10px] text-white/18">© 2026 GlidePool. All rights reserved.</span>
              <span className="font-mono text-[10px] text-white/12 hidden sm:inline">·</span>
              <span className="font-mono text-[10px] text-white/18">Built on Base Mainnet · Maverick V2 DLMM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-primary/15 bg-primary/[0.05]">
                <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
                <span className="font-mono text-[10px] text-primary/60">Base Mainnet</span>
              </span>
              <span className="font-mono text-[10px] text-white/20">glidepool.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
