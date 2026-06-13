import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowUpRight, ArrowRight, Plus } from "lucide-react";

/* ── Marquee ticker ─────────────────────────────────────────── */
const TICKER_TEXT =
  "AUTONOMOUS DLMM AGENTS  ·  BASE MAINNET  ·  x402 MICROPAYMENTS  ·  MAVERICK V2  ·  NON-CUSTODIAL  ·  LLM-DRIVEN  ·  REBALANCE ON-CHAIN  ·  ";

function Ticker() {
  return (
    <div className="overflow-hidden border-y border-primary/20 bg-primary/5 py-2 select-none">
      <div className="animate-marquee whitespace-nowrap font-mono text-[11px] text-primary/70 tracking-[0.15em] uppercase">
        {TICKER_TEXT.repeat(6)}
      </div>
    </div>
  );
}

/* ── Feature cards ─────────────────────────────────────────── */
const FEATURES = [
  {
    label: "Pool Explorer",
    href: "/pools",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-white/40">
        <circle cx="12" cy="12" r="3" /><path d="M12 3v2m0 14v2M3 12h2m14 0h2m-4.22-6.78-1.42 1.42M6.64 17.36l-1.42 1.42m0-12.36 1.42 1.42m11.3 11.3-1.42-1.42" />
      </svg>
    ),
    desc: "Discover and compare Maverick V2 DLMM pools. View TVL, price, active tick, and fee rates live from Base Mainnet.",
    active: false,
  },
  {
    label: "Deploy Agent",
    href: "/agent/setup",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-primary">
        <rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 10h2m4 0h2M12 10v4m-2-2h4" />
      </svg>
    ),
    desc: "Choose a strategy — Conservative, Balanced, or Aggressive. Set a budget and let the agent manage your bins automatically.",
    active: true,
  },
  {
    label: "Live Monitor",
    href: "/monitor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-white/40">
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    ),
    desc: "Stream every agent decision, LLM reasoning step, and on-chain transaction in real time from a live terminal.",
    active: false,
  },
  {
    label: "AI Advisor",
    href: "/advisor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-white/40">
        <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" /><path d="M17 14a7 7 0 0 1-10 0" />
      </svg>
    ),
    desc: "Describe your goal and get a GPT-powered recommendation: action, risk level, bin range, and suggested withdraw %.",
    active: false,
  },
];

/* ── Partners row ──────────────────────────────────────────── */
const PARTNERS = [
  { label: "Base",        href: "https://base.org" },
  { label: "Maverick V2", href: "https://mav.xyz" },
  { label: "x402",        href: "https://x402.org" },
  { label: "RainbowKit",  href: "https://rainbowkit.com" },
  { label: "OpenAI",      href: "https://openai.com" },
  { label: "viem",        href: "https://viem.sh" },
  { label: "Drizzle",     href: "https://orm.drizzle.team" },
];

export default function Landing() {
  return (
    <div className="flex flex-col -mt-6 sm:-mt-8">

      {/* ── Ticker ─────────────────────────────────────────── */}
      <div className="mb-0">
        <Ticker />
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 pt-10 sm:pt-14 pb-4 overflow-hidden">

        {/* Top row: badge + description */}
        <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
          {/* Badge pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full border-2 border-white/20 bg-white/[0.04] flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" strokeWidth={2.5} />
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-primary/40 bg-primary/10 flex items-center justify-center -ml-4">
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
          </div>
          {/* Description — top-right */}
          <p className="hidden sm:block text-[11px] text-white/35 leading-relaxed max-w-[220px] text-right font-mono">
            Powered by GPT-4 · Maverick V2 DLMM · x402 protocol on Base Mainnet · non-custodial LP management.
          </p>
        </div>

        {/* Giant headline */}
        <div className="relative">
          <h1
            className="font-black uppercase tracking-tighter leading-[0.88] text-white select-none"
            style={{ fontSize: "clamp(52px, 10.5vw, 130px)" }}
          >
            <span className="block">AUTONOMOUS</span>
            <span className="block text-primary">DLMM</span>
            <span className="block">LIQUIDITY</span>

            {/* Last line: text + CTA inline */}
            <span className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <span>AGENTS</span>
              {/* Circular arrow CTA */}
              <Link href="/dashboard">
                <div
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-[#080808] font-bold font-sans uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform glow-green shrink-0"
                  style={{ fontSize: "clamp(10px, 1.2vw, 14px)", padding: "clamp(10px,2vw,18px) clamp(16px,3vw,32px)" }}
                >
                  LAUNCH APP
                  <ArrowRight className="shrink-0" style={{ width: "clamp(12px,1.5vw,18px)", height: "clamp(12px,1.5vw,18px)" }} />
                </div>
              </Link>
            </span>
          </h1>
        </div>

        {/* Mobile description */}
        <p className="sm:hidden text-[11px] text-white/35 font-mono leading-relaxed mt-6 max-w-xs">
          GPT-4 agents managing Maverick V2 DLMM positions on Base · x402 micropayment gated · non-custodial.
        </p>

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,245,100,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,100,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </section>

      {/* Thin green rule */}
      <div className="px-4 sm:px-6 my-6 sm:my-8">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* ── Feature cards grid ─────────────────────────────── */}
      <section className="px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-0 sm:border sm:border-white/[0.07] sm:rounded-2xl sm:overflow-hidden">
          {FEATURES.map((f, i) => (
            <Link key={f.href} href={f.href}>
              <div className={`
                group relative p-6 sm:p-7 flex flex-col gap-5 cursor-pointer h-full
                sm:border-r sm:last:border-r-0 border-white/[0.07]
                transition-all duration-200
                ${f.active
                  ? "bg-white/[0.05] sm:bg-white/[0.04]"
                  : "hover:bg-white/[0.03]"
                }
                rounded-2xl sm:rounded-none border border-white/[0.07] sm:border-0 sm:border-r
              `}>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                  f.active
                    ? "border-primary/30 bg-primary/10"
                    : "border-white/[0.08] bg-white/[0.03] group-hover:border-primary/20"
                }`}>
                  {f.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className={`font-bold text-sm mb-2 transition-colors ${f.active ? "text-white" : "text-white/60 group-hover:text-white/90"}`}>
                    {f.label}
                  </div>
                  <p className="text-xs text-white/30 leading-relaxed">{f.desc}</p>
                </div>

                {/* Arrow */}
                <ArrowRight className={`w-4 h-4 transition-all ${
                  f.active ? "text-primary" : "text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5"
                }`} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats + CTA row ────────────────────────────────── */}
      <section className="px-4 sm:px-6 mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-0 sm:justify-between">

          {/* Stats */}
          <div className="flex items-center gap-6 sm:gap-10">
            {[
              { value: "V2",        label: "Maverick" },
              { value: "0.05",      label: "USDC / query" },
              { value: "100%",      label: "Non-custodial" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight leading-none">{value}</div>
                <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Big circular action */}
          <div className="flex items-center gap-4">
            <ConnectButton />
            <Link href="/dashboard">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:scale-105 transition-transform glow-green shrink-0">
                <ArrowUpRight className="w-6 h-6 text-[#080808]" strokeWidth={2.5} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Partners / Ecosystem ───────────────────────────── */}
      <section className="px-4 sm:px-6 mt-8 sm:mt-10 pt-6 border-t border-white/[0.05]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <div className="shrink-0 text-[10px] font-mono text-white/25 uppercase tracking-widest">Ecosystem</div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {PARTNERS.map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs text-white/30 hover:text-primary/80 transition-colors tracking-wide">
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* bottom padding for footer */}
      <div className="h-8" />
    </div>
  );
}
