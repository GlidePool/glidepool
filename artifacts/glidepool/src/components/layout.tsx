import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Bot, Activity, Layers, Wallet2,
  Terminal, Settings, ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/agent/setup", label: "Setup Agent", icon: Bot },
  { href: "/monitor",     label: "Monitor",     icon: Activity },
  { href: "/pools",       label: "Pools",       icon: Layers },
  { href: "/positions",   label: "Positions",   icon: Wallet2 },
  { href: "/cli",         label: "CLI Guide",   icon: Terminal },
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
            <w3m-button balance="hide" />
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
              {/* Social icons */}
              <div className="flex items-center gap-2 mt-1">
                {[
                  { href: "https://github.com/glidepool", label: "GitHub",
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg> },
                  { href: "https://x.com/glidepool", label: "X / Twitter",
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                  { href: "https://warpcast.com/glidepool", label: "Farcaster",
                    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.24 2.4H5.76A3.36 3.36 0 002.4 5.76v12.48a3.36 3.36 0 003.36 3.36h12.48a3.36 3.36 0 003.36-3.36V5.76a3.36 3.36 0 00-3.36-3.36zM15.6 16.8h-2.16v-3.6c0-.9-.66-1.56-1.44-1.56s-1.44.66-1.44 1.56v3.6H8.4V7.2h2.16v1.32c.54-.84 1.44-1.32 2.4-1.32 1.8 0 2.64 1.32 2.64 3.12v6.48z" /></svg> },
                ].map(({ href, label, svg }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 border border-white/[0.07] bg-white/[0.02] flex items-center justify-center text-white/30 hover:text-white/80 hover:border-white/15 transition-all">
                    {svg}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">Product</div>
              {[
                { label: "Dashboard",   href: "/dashboard" },
                { label: "Pools",       href: "/pools" },
                { label: "Positions",   href: "/positions" },
                { label: "AI Advisor",  href: "/advisor" },
                { label: "Monitor",     href: "/monitor" },
                { label: "Setup Agent", href: "/agent/setup" },
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
                { label: "CLI Guide",  href: "/cli",                                    ext: false },
                { label: "SDK",        href: "https://docs.glidepool.com/sdk",          ext: true },
                { label: "API Docs",   href: "https://docs.glidepool.com/api",          ext: true },
                { label: "GitHub",     href: "https://github.com/glidepool",            ext: true },
                { label: "Changelog",  href: "https://github.com/glidepool/releases",   ext: true },
                { label: "Settings",   href: "/settings",                               ext: false },
              ].map(({ label, href, ext }) => (
                ext ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/75 transition-colors font-mono w-fit">
                    {label} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <Link key={label} href={href}>
                    <span className="text-xs text-white/40 hover:text-white/75 transition-colors cursor-pointer font-mono">{label}</span>
                  </Link>
                )
              ))}
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-3">
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">Resources</div>
              {[
                { label: "Docs",           href: "https://docs.glidepool.com",              ext: true },
                { label: "Roadmap",        href: "https://github.com/glidepool/roadmap",    ext: true },
                { label: "Ecosystem",      href: "https://ecosystem.glidepool.com",         ext: true },
                { label: "Maverick V2",    href: "https://mav.xyz",                         ext: true },
                { label: "Privacy Policy", href: "/privacy",                                ext: false },
                { label: "Terms",          href: "/terms",                                  ext: false },
              ].map(({ label, href, ext }) => (
                ext ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/75 transition-colors font-mono w-fit">
                    {label} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <Link key={label} href={href}>
                    <span className="text-xs text-white/40 hover:text-white/75 transition-colors cursor-pointer font-mono">{label}</span>
                  </Link>
                )
              ))}
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
