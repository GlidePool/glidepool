import { useState } from "react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Plus, ArrowRight, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TICKER
───────────────────────────────────────────────────────────── */
const TICKER =
  "AUTONOMOUS DLMM AGENTS  ·  BASE MAINNET  ·  x402 MICROPAYMENTS  ·  MAVERICK V2  ·  NON-CUSTODIAL  ·  LLM-DRIVEN  ·  REBALANCE ON-CHAIN  ·  OPEN SOURCE  ·  ";

function Ticker() {
  return (
    <div className="-mx-4 sm:-mx-6 overflow-hidden border-y border-primary/25 bg-primary/[0.06] py-2 select-none">
      <div className="animate-marquee whitespace-nowrap font-mono text-[11px] text-primary/80 tracking-[0.12em] uppercase">
        {TICKER.repeat(6)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────────────────────── */
function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 sm:mb-8">
      <span className="font-mono text-[10px] text-primary/50 tracking-widest">{index}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FAQ DATA
───────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "What is GlidePool?",
    a: "GlidePool is an autonomous liquidity management platform for Maverick V2 DLMM pools on Base Mainnet. AI agents analyze on-chain pool state, decide when to rebalance bins, and propose transactions — you sign every action from your own wallet.",
  },
  {
    q: "Does GlidePool hold my funds?",
    a: "No. GlidePool is strictly non-custodial. The agent server only reads on-chain data and generates transaction proposals. All writes require your explicit wallet signature via RainbowKit. GlidePool never holds private keys or funds.",
  },
  {
    q: "How does x402 micropayment work?",
    a: "Each LLM analysis request costs ~0.05 USDC, paid on-chain via the x402 payment protocol on Base. No subscriptions or API keys — you pay per insight. The payment is made directly to the GlidePool treasury address before the advisor responds.",
  },
  {
    q: "What strategies are available?",
    a: "Three bin movement modes: Conservative (Static — bins don't move, standard concentrated liquidity), Balanced (Both — follows price in both directions, maximum fee capture), and Aggressive (Right/Left — follows bullish or bearish trend). The agent selects the optimal mode based on market volatility.",
  },
  {
    q: "Which pools are supported?",
    a: "GlidePool supports Maverick V2 DLMM pools on Base Mainnet. The allowlisted pools are configured on the API server. Initially WETH/USDC, WETH/cbETH, and WETH/wstETH are included. Governance can propose adding new pools.",
  },
  {
    q: "Can I use the CLI instead of the web UI?",
    a: "Yes. GlidePool ships a full CLI for agent deployment, monitoring, and management. See the CLI Guide page for installation and usage. The CLI uses the same API and supports all features available in the web interface.",
  },
  {
    q: "Is the source code open?",
    a: "Yes. GlidePool is open-source on GitHub. The full monorepo — API server, frontend, chain readers, LLM integration, and x402 middleware — is available for review, self-hosting, and contribution.",
  },
];

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════
          01 · TICKER
      ══════════════════════════════════════════ */}
      <div className="pt-6">
        <Ticker />
      </div>

      {/* ══════════════════════════════════════════
          02 · HERO
      ══════════════════════════════════════════ */}
      <section className="relative pt-10 sm:pt-14 pb-6 sm:pb-10 overflow-hidden">
        {/* subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(0,245,100,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,100,1) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />

        {/* top row */}
        <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8 relative">
          <div className="flex items-center gap-1.5">
            <div className="w-9 h-9 rounded-full border-2 border-white/15 bg-white/[0.03] flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" strokeWidth={2.5} />
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-primary/50 bg-primary/10 flex items-center justify-center -ml-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
          <p className="hidden sm:block text-[11px] text-white/30 leading-relaxed max-w-[200px] text-right font-mono">
            GPT-4 · Maverick V2 · x402 on Base · non-custodial LP management.
          </p>
        </div>

        {/* Giant headline */}
        <h1 className="relative font-black uppercase tracking-tighter leading-[0.87] text-white select-none"
          style={{ fontSize: "clamp(48px, 10vw, 122px)" }}>
          <span className="block">AUTONOMOUS</span>
          <span className="block text-primary" style={{ textShadow: "0 0 60px rgba(0,245,100,0.35)" }}>DLMM</span>
          <span className="block">LIQUIDITY</span>
          <span className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span>AGENTS</span>
            <Link href="/dashboard">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary text-[#080808] font-bold font-sans uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-transform glow-green shrink-0"
                style={{ fontSize: "clamp(9px,1.1vw,13px)", padding: "clamp(10px,1.8vw,16px) clamp(14px,2.5vw,28px)" }}>
                LAUNCH APP
                <ArrowRight strokeWidth={2.5} style={{ width: "clamp(11px,1.3vw,16px)", height: "clamp(11px,1.3vw,16px)" }} />
              </div>
            </Link>
          </span>
        </h1>

        <p className="sm:hidden text-[11px] text-white/30 font-mono leading-relaxed mt-5 max-w-xs">
          GPT-4 agents managing Maverick V2 DLMM positions on Base · x402 micropayment gated · non-custodial.
        </p>
      </section>

      {/* ══════════════════════════════════════════
          03 · ABOUT
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-14 sm:py-20 border-t border-white/[0.05]"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,245,100,0.04) 0%, transparent 70%)" }}>
        <SectionLabel index="01" label="About" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-start">
          {/* Left: text */}
          <div>
            <h2 className="font-black uppercase tracking-tighter leading-none mb-6"
              style={{ fontSize: "clamp(32px, 5vw, 60px)" }}>
              THE AGENT-<br />
              <span className="text-primary">NATIVE</span><br />
              LP PLATFORM
            </h2>
            <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-md">
              GlidePool deploys LLM-driven agents that continuously monitor Maverick V2 DLMM pools on Base Mainnet.
              When market conditions shift, the agent proposes a rebalance — you approve in one click.
              No custody. No subscriptions. Just pure on-chain intelligence.
            </p>
            <div className="grid grid-cols-3 gap-5 sm:gap-8 pt-5 border-t border-white/[0.06]">
              {[
                { v: "V2",     l: "Maverick" },
                { v: "0.05",   l: "USDC/query" },
                { v: "100%",   l: "Non-custodial" },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">{v}</div>
                  <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: terminal card */}
          <div className="rounded-2xl border border-primary/20 bg-black/60 overflow-hidden font-mono text-xs">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/15 bg-primary/[0.04]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
              </div>
              <span className="text-primary/50 text-[10px] tracking-widest ml-1">glidepool — agent.log</span>
            </div>
            <div className="p-4 sm:p-5 space-y-1.5 text-[11px] leading-relaxed">
              {[
                { c: "text-white/20", t: "# GlidePool Agent v1.0.0" },
                { c: "text-primary/60", t: "> Connecting to Base Mainnet..." },
                { c: "text-white/40", t: "  ✓ RPC connected (latency 12ms)" },
                { c: "text-primary/60", t: "> Fetching pool state: WETH/USDC" },
                { c: "text-white/40", t: "  activeTick: 1842  price: 3241.18" },
                { c: "text-white/40", t: "  TVL: $1,204,550  feeRate: 0.05%" },
                { c: "text-primary/60", t: "> Calling LLM advisor (x402 gate)..." },
                { c: "text-amber-400/70", t: "  ⚡ Payment: 0.05 USDC on Base" },
                { c: "text-white/40", t: "  ✓ Payment confirmed (block 14209)" },
                { c: "text-primary/60", t: "> Analysis complete" },
                { c: "text-white/60", t: "  action:   REBALANCE" },
                { c: "text-white/60", t: "  risk:     MEDIUM" },
                { c: "text-white/60", t: "  bins:     [1838, 1855]" },
                { c: "text-primary/80", t: "> Awaiting wallet signature..." },
                { c: "text-white/25", t: "  _ " },
              ].map(({ c, t }, i) => (
                <div key={i} className={c}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          04 · ARCHITECTURE
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-14 sm:py-20 border-t border-white/[0.05]">
        <SectionLabel index="02" label="Architecture" />

        <h2 className="font-black uppercase tracking-tighter leading-none mb-10"
          style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}>
          HOW THE<br /><span className="text-primary">SYSTEM</span> WORKS
        </h2>

        {/* Diagram grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            {
              num: "01", title: "USER WALLET",
              sub: "RainbowKit · wagmi",
              color: "border-white/[0.10]",
              items: ["Connect via RainbowKit", "Sign transactions only", "Never expose keys"],
            },
            {
              num: "02", title: "AGENT LOOP",
              sub: "Express 5 · Node.js",
              color: "border-primary/25",
              items: ["Poll pool state every N blocks", "Trigger LLM on delta", "Gate via x402 payment"],
            },
            {
              num: "03", title: "LLM ENGINE",
              sub: "GPT-4 · OpenAI",
              color: "border-blue-400/25",
              items: ["Receive pool snapshot", "Return action + reasoning", "Suggest bin range + mode"],
            },
            {
              num: "04", title: "BASE MAINNET",
              sub: "viem · Maverick V2",
              color: "border-white/[0.10]",
              items: ["Read pool state on-chain", "Build tx calldata", "User submits transaction"],
            },
          ].map(({ num, title, sub, color, items }) => (
            <div key={num} className={`rounded-xl border ${color} bg-white/[0.02] p-5 flex flex-col gap-3`}>
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] text-primary/40 tracking-widest">{num}</span>
                <span className="font-mono text-[9px] text-white/20 border border-white/[0.06] rounded px-1.5 py-0.5">{sub}</span>
              </div>
              <div className="font-black text-sm tracking-tight">{title}</div>
              <div className="space-y-1.5 flex-1">
                {items.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[11px] text-white/35 font-mono">
                    <span className="text-primary/40 shrink-0 mt-px">›</span> {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Data flow diagram */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-5 sm:p-6 font-mono text-[11px] sm:text-xs overflow-x-auto">
          <div className="text-[10px] text-white/20 uppercase tracking-widest mb-4">Data flow</div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap text-white/50 whitespace-nowrap">
            {[
              { label: "WALLET", badge: "RainbowKit" },
              null,
              { label: "API SERVER", badge: "Express 5" },
              null,
              { label: "LLM", badge: "GPT-4" },
              null,
              { label: "BASE RPC", badge: "viem" },
              null,
              { label: "MAVERICK V2", badge: "on-chain" },
            ].map((item, i) =>
              item === null ? (
                <div key={i} className="text-primary/30 text-base font-bold shrink-0">──▶</div>
              ) : (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="px-3 py-1.5 rounded border border-white/[0.08] bg-white/[0.03] text-white/70 text-[10px] font-bold tracking-widest">
                    {item.label}
                  </div>
                  <div className="text-[9px] text-white/20">{item.badge}</div>
                </div>
              )
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-1">
            {[
              "> User signs: all on-chain writes require explicit wallet approval",
              "> x402 gate:  ~0.05 USDC USDC paid before each LLM analysis call",
              "> Non-custodial: API server reads only — never signs or holds funds",
            ].map((line) => (
              <div key={line} className="text-white/25">{line}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          05 · GUIDE
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-14 sm:py-20 border-t border-white/[0.05]"
        style={{ background: "radial-gradient(ellipse 70% 50% at 0% 50%, rgba(0,245,100,0.03) 0%, transparent 70%)" }}>
        <SectionLabel index="03" label="Guide" />

        <h2 className="font-black uppercase tracking-tighter leading-none mb-10"
          style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}>
          START IN<br /><span className="text-primary">5 STEPS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { n: "01", title: "Connect Wallet",  body: "Open GlidePool and connect a Base Mainnet wallet via RainbowKit. MetaMask, Coinbase Wallet, and WalletConnect supported." },
            { n: "02", title: "Pick a Pool",     body: "Browse Maverick V2 pools. Check TVL, fee rate, and active tick. Select the pool you want the agent to manage." },
            { n: "03", title: "Setup Agent",     body: "Choose a strategy: Conservative, Balanced, or Aggressive. Set your budget and confirm the agent deployment transaction." },
            { n: "04", title: "Agent Monitors",  body: "The agent polls pool state every block. When a rebalance opportunity arises, it calls the LLM and builds a proposal." },
            { n: "05", title: "You Sign",        body: "Review the agent's proposal in the Monitor page. Approve or reject every transaction before it hits the chain." },
          ].map(({ n, title, body }) => (
            <div key={n} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-4 hover:border-primary/15 hover:bg-white/[0.04] transition-all">
              <div className="font-mono text-2xl font-black text-white/[0.06] leading-none">{n}</div>
              <div>
                <div className="font-bold text-sm mb-2">{title}</div>
                <p className="text-[11px] text-white/35 leading-relaxed">{body}</p>
              </div>
              <div className="mt-auto">
                <div className="h-px bg-primary/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap items-center gap-3 mt-8">
          {[
            { label: "→ CLI Guide",    href: "/cli" },
            { label: "→ Setup Agent",  href: "/agent/setup" },
            { label: "→ Browse Pools", href: "/pools" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}>
              <span className="font-mono text-xs text-primary/60 hover:text-primary border border-primary/20 hover:border-primary/40 rounded-lg px-4 py-2 transition-all cursor-pointer">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          06 · FAQ
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-14 sm:py-20 border-t border-white/[0.05]">
        <SectionLabel index="04" label="FAQ" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-start">
          <div>
            <h2 className="font-black uppercase tracking-tighter leading-none"
              style={{ fontSize: "clamp(28px, 4.5vw, 52px)" }}>
              COMMON<br /><span className="text-primary">QUESTIONS</span>
            </h2>
            <p className="text-sm text-white/35 mt-5 leading-relaxed max-w-sm font-mono">
              Everything you need to know about autonomous DLMM management, x402 payments, and non-custodial architecture.
            </p>
            <a href="https://docs.glidepool.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-6 font-mono text-xs text-primary/60 hover:text-primary border border-primary/20 hover:border-primary/40 rounded-lg px-4 py-2 transition-all">
              Full Docs <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i}
                  className={`rounded-xl border transition-all duration-200 ${open ? "border-primary/20 bg-primary/[0.04]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.10]"}`}>
                  <button
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    <span className="text-sm font-bold leading-snug">{faq.q}</span>
                    {open
                      ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-white/25 shrink-0" />
                    }
                  </button>
                  {open && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-white/45 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          07 · ECOSYSTEM
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-10 border-t border-white/[0.05]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <span className="shrink-0 text-[10px] font-mono text-white/20 uppercase tracking-widest">Built with</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { label: "Base",        href: "https://base.org" },
              { label: "Maverick V2", href: "https://mav.xyz" },
              { label: "x402",        href: "https://x402.org" },
              { label: "RainbowKit",  href: "https://rainbowkit.com" },
              { label: "OpenAI",      href: "https://openai.com" },
              { label: "viem",        href: "https://viem.sh" },
              { label: "Drizzle ORM", href: "https://orm.drizzle.team" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[11px] text-white/25 hover:text-primary/70 transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          08 · CTA
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 border-t border-primary/20 overflow-hidden relative"
        style={{ background: "radial-gradient(ellipse 100% 200% at 50% 150%, rgba(0,245,100,0.12) 0%, rgba(0,245,100,0.04) 40%, transparent 70%)" }}>
        {/* grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(0,245,100,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,100,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative px-4 sm:px-6 py-20 sm:py-28 flex flex-col items-center text-center gap-8">
          {/* Ticker repeat inside CTA */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] text-primary/70 tracking-widest uppercase">Agent ready to deploy</span>
          </div>

          <h2 className="font-black uppercase tracking-tighter leading-[0.9] max-w-3xl"
            style={{ fontSize: "clamp(36px, 7vw, 88px)" }}>
            DEPLOY YOUR<br />
            <span className="text-primary">FIRST AGENT</span><br />
            TODAY
          </h2>

          <p className="text-sm text-white/40 max-w-md leading-relaxed">
            Connect your Base Mainnet wallet, pick a Maverick V2 pool, and set up an
            autonomous DLMM agent in under two minutes. Non-custodial. x402 powered.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ConnectButton />
            <Link href="/dashboard">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/30 text-sm font-semibold text-primary/80 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer font-mono">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/[0.05] w-full max-w-lg">
            {[
              { label: "GitHub",     href: "https://github.com/glidepool" },
              { label: "Docs",       href: "https://docs.glidepool.com" },
              { label: "Whitepaper", href: "https://docs.glidepool.com/whitepaper" },
              { label: "Roadmap",    href: "https://github.com/glidepool/roadmap" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-white/25 hover:text-white/60 transition-colors">
                {label} <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
