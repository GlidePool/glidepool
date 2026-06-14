import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight, ArrowUpRight, ChevronDown, ChevronUp,
  Zap, ShieldCheck, Eye, RefreshCw, Bot, BarChart2,
  Wallet, GitBranch, Cpu, Layers, Plus,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const TICKER = "AUTONOMOUS DLMM AGENTS  ·  BASE MAINNET  ·  x402 MICROPAYMENTS  ·  MAVERICK V2  ·  NON-CUSTODIAL  ·  Claude Opus 4 POWERED  ·  REBALANCE ON-CHAIN  ·  OPEN SOURCE  ·  ";

function SectionChip({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 mb-6">
      <div className="h-px w-6 bg-primary/40" />
      <span className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.18em]">{label}</span>
      <div className="h-px w-6 bg-primary/40" />
    </div>
  );
}

const FAQS = [
  { q: "What is GlidePool?", a: "GlidePool deploys Claude Opus 4–driven agents that monitor Maverick V2 DLMM pools on Base Mainnet, propose rebalances, and wait for your wallet signature before doing anything on-chain. Fully non-custodial." },
  { q: "Does GlidePool hold my funds?", a: "Never. The API server only reads on-chain data and produces transaction calldata. Every write requires your explicit wallet signature. No private keys, no custody." },
  { q: "How does x402 micropayment work?", a: "When X402_ENABLED=true on the server, the advisor endpoint returns HTTP 402 with a treasury address + 0.05 USDC amount. The server verifies the USDC transfer on-chain via Base RPC, then unlocks Claude Opus 4. x402 is disabled by default — LLM queries run freely without it." },
  { q: "What strategies are available?", a: "Conservative (Static bins, tight range), Balanced (Both mode - follows price both ways), Aggressive (Right/Left mode - follows trend). Claude Opus 4 analyzes pool state and your goal each cycle, then recommends the action (hold, rebalance, withdraw, add liquidity)." },
  { q: "Which pools are supported?", a: "Maverick V2 DLMM pools on Base Mainnet: WETH/USDC, WETH/USDbC, DAI/USDC, cbETH/WETH, and others. The pool allowlist is configured in the API server and can be extended." },
  { q: "How often does the agent analyze?", a: "The agent loop runs every 30 seconds on the server. Each active agent checks if it's due for analysis based on its analysisIntervalSec setting (default: 60s). LLM decisions are stored in the database and visible in the Monitor page." },
  { q: "Is a CLI available?", a: "Yes. Install @glide-pool/cli from npm (npm install -g @glide-pool/cli) to manage agents, browse pools, inspect positions, and get AI advice from your terminal. A JavaScript SDK (@glide-pool/sdk) is also available for programmatic access." },
];

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
const LIFECYCLE_STEPS = [
  { icon: Eye,        label: "Observe",      sub: "pool state / ~30s",     desc: "Agent checks Maverick V2 pool state every ~30 seconds - activeTick, TVL, price, fee rate, reserves - via viem on Base Mainnet.", color: "primary" },
  { icon: Cpu,        label: "Analyze",      sub: "detect bin drift",      desc: "Compares current tick to optimal bin range. If drift exceeds threshold or conditions change, triggers the LLM analysis pipeline.", color: "primary" },
  { icon: Zap,        label: "x402 (opt.)",  sub: "0.05 USDC on Base",    desc: "If X402_ENABLED is set server-side, agent pays 0.05 USDC via HTTP 402 before the LLM call. Verified on-chain via Base RPC. Disabled by default.", color: "amber" },
  { icon: Bot,        label: "Claude Opus 4",sub: "get recommendation",    desc: "Sends pool snapshot + user goal to Claude Opus 4. Returns action, risk level, bin range, withdraw %, and full reasoning chain.", color: "primary" },
  { icon: GitBranch,  label: "Propose TX",   sub: "build calldata",        desc: "For rebalance/withdraw actions, the agent server assembles transaction calldata and stores it as pending_signature in the database.", color: "primary" },
  { icon: ShieldCheck,label: "You Sign",     sub: "approve or reject",     desc: "You review the full proposal in the Monitor page. One wallet signature executes on-chain. You can reject or ignore any proposal.", color: "green" },
] as const;

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % LIFECYCLE_STEPS.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex flex-col" style={{ zIndex: 2 }}>

      {/* ─── TICKER — hidden ────────────────────── */}

      {/* ─── HERO ───────────────────────────────── */}
      <section className="relative pt-10 sm:pt-14 pb-10 overflow-hidden -mx-4 sm:-mx-6 px-8 sm:px-14 lg:px-20 min-h-[500px] sm:min-h-[600px] flex flex-col justify-between">
        {/* ── Background ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Hero image */}
          <img
            src="/hero-bg3.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.75 }}
          />

          {/* Breathing green orb - amplifies the glow */}
          <div className="absolute animate-hero-breathe" style={{
            top: "-10%", left: "-5%",
            width: "70%", height: "120%",
            background: "radial-gradient(ellipse at 40% 45%, rgba(0,245,100,0.12) 0%, rgba(0,245,100,0.04) 50%, transparent 75%)",
            filter: "blur(60px)",
          }} />

          {/* Left shadow — keeps text dark & readable */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, rgba(8,8,8,1) 0%, rgba(8,8,8,0.96) 18%, rgba(8,8,8,0.80) 35%, rgba(8,8,8,0.45) 55%, rgba(8,8,8,0.15) 75%, transparent 100%)",
          }} />

          {/* Top shadow */}
          <div className="absolute top-0 left-0 right-0 h-36" style={{
            background: "linear-gradient(to bottom, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.5) 50%, transparent 100%)",
          }} />

          {/* Bottom fade — deep, into page bg */}
          <div className="absolute bottom-0 left-0 right-0 h-56" style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(8,8,8,0.7) 50%, rgba(8,8,8,1) 100%)",
          }} />

          {/* Right edge fade */}
          <div className="absolute inset-y-0 right-0 w-24" style={{
            background: "linear-gradient(to right, transparent 0%, rgba(8,8,8,0.6) 100%)",
          }} />
        </div>

        {/* Top row - status badge */}
        <div className="flex items-start justify-between gap-4 relative">
          <div className="flex items-center gap-1.5 border border-primary/25 bg-primary/[0.06] px-3 py-1.5">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <span className="font-mono text-[10px] text-primary/70 uppercase tracking-widest">Live on Base Mainnet</span>
          </div>
          <p className="hidden sm:block text-[11px] text-white/30 leading-relaxed max-w-[200px] text-right font-mono">
            Claude Opus 4 · Maverick V2<br />x402 on Base · non-custodial
          </p>
        </div>

        {/* H1 - clean stacked lines, no inline button */}
        <div className="relative mt-8">
          <h1 className="font-black uppercase tracking-tighter leading-[0.88] text-white select-none" style={{ fontSize: "clamp(30px,9.5vw,118px)" }}>
            <span className="block">AUTONOMOUS</span>
            <span className="block text-primary" style={{ textShadow: "0 0 60px rgba(0,245,100,0.5), 0 0 120px rgba(0,245,100,0.25)" }}>DLMM</span>
            <span className="block">LIQUIDITY</span>
            <span className="block">AGENTS</span>
          </h1>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="block">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary text-[#080808] font-bold font-mono text-sm tracking-wider px-7 py-3.5 hover:brightness-110 active:brightness-90 transition-all glow-green">
                Launch App
                <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              </button>
            </Link>
            <Link href="/pools" className="block">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/[0.18] text-white/60 hover:text-white hover:border-white/40 hover:bg-white/[0.03] font-mono text-sm tracking-wide px-7 py-3.5 transition-all">
                Browse Pools
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STACK TICKER ───────────────────────── */}
      {(() => {
        const STACK = [
          { name: "Maverick V2",    desc: "DLMM Protocol" },
          { name: "x402",           desc: "HTTP 402 Payments" },
          { name: "Base Mainnet",   desc: "Chain ID 8453" },
          { name: "Claude Opus 4",  desc: "Anthropic AI" },
          { name: "Reown AppKit",   desc: "Wallet Connect" },
          { name: "wagmi v2",       desc: "React Hooks" },
          { name: "viem",           desc: "Ethereum Client" },
          { name: "Express 5",      desc: "API Server" },
          { name: "Drizzle ORM",    desc: "PostgreSQL" },
          { name: "Node.js 24",     desc: "Runtime" },
          { name: "TypeScript 5.9", desc: "Type Safety" },
          { name: "Tailwind v4",    desc: "CSS Framework" },
          { name: "OpenAI compat",  desc: "Anthropic Claude API" },
          { name: "Orval",          desc: "OpenAPI Codegen" },
          { name: "esbuild",        desc: "Build Tool" },
        ];
        const METRICS = [
          { val: "0.05 USDC", label: "per AI query",     amber: true  },
          { val: "~2s",       label: "payment confirm",  green: true  },
          { val: "100%",      label: "non-custodial",    green: true  },
          { val: "HTTP 402",  label: "payment protocol", amber: true  },
          { val: "0x833589",  label: "USDC on Base",     amber: false },
          { val: "8453",      label: "chain ID",         amber: false },
          { val: "MIT",       label: "open source",      green: true  },
          { val: "no keys",   label: "x402 gated",       amber: true  },
          { val: "~30s",      label: "agent scan interval", amber: false },
          { val: "claude-opus-4-8", label: "model",      green: true  },
        ];
        const stackStr = [...STACK, ...STACK].map(s => `  ${s.name}  ·  ${s.desc}  ·`).join("");
        return (
          <div className="-mx-4 sm:-mx-6 border-y border-white/[0.07] my-10 select-none overflow-hidden">
            {/* Metrics, scrolling right */}
            <div className="flex items-stretch">
              <div className="shrink-0 border-r border-white/[0.07] px-4 flex items-center justify-center bg-white/[0.015] min-w-[64px]">
                <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest whitespace-nowrap">Metrics</span>
              </div>
              <div className="flex-1 overflow-hidden py-2.5">
                <div className="animate-marquee-rev whitespace-nowrap font-mono text-[11px] tracking-wider">
                  {[...METRICS, ...METRICS].map((m, i) => (
                    <span key={i}>
                      <span className={m.amber ? "text-amber-400/55" : m.green ? "text-primary/55" : "text-white/35"}>
                        {m.val}
                      </span>
                      <span className="text-white/18">{"  "}{m.label}{"  ·  "}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════
          INTEGRATIONS — logos strip
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-8 sm:px-14 lg:px-20 py-14 sm:py-16 border-t border-white/[0.05]">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div>
            <SectionChip label="Integrations" />
            <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(28px,4.5vw,56px)" }}>
              BUILT ON<br /><span className="text-primary">OPEN RAILS</span>
            </h2>
          </div>
          <p className="text-[11px] text-white/25 font-mono max-w-xs leading-relaxed">
            GlidePool is assembled from best-in-class primitives — no closed systems, no vendor lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border border-white/[0.12] overflow-hidden">

          {/* ── Maverick Protocol ── */}
          <div className="group relative flex flex-col p-8 border-b sm:border-b-0 sm:border-r border-white/[0.12] bg-gradient-to-b from-[#6600ff05] to-transparent hover:from-[#6600ff0a] transition-all duration-500">
            <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-6">DLMM Protocol</div>
            <div className="flex-1 flex items-center justify-center py-6">
              <img
                src="/maverick-logo.png"
                alt="Maverick Protocol"
                className="h-16 sm:h-20 object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div className="mt-6 space-y-2.5 border-t border-white/[0.07] pt-5">
              <div className="font-bold text-sm text-white/80">Maverick Protocol V2</div>
              <p className="font-mono text-[10px] text-white/30 leading-relaxed">
                Dynamic liquidity market maker (DLMM) with on-chain bin management, custom fee modes,
                and the most capital-efficient AMM design on Base.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["DLMM", "Static", "Right", "Left", "Both"].map(t => (
                  <span key={t} className="font-mono text-[9px] text-purple-400/50 border border-purple-500/20 px-1.5 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Base Mainnet ── */}
          <div className="group relative flex flex-col p-8 border-b sm:border-b-0 sm:border-r border-white/[0.12] bg-gradient-to-b from-[#0052ff05] to-transparent hover:from-[#0052ff0a] transition-all duration-500">
            <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-6">L2 Blockchain</div>
            <div className="flex-1 flex items-center justify-center py-6">
              <img
                src="/base-logo.png"
                alt="Base"
                className="h-16 sm:h-20 object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <div className="mt-6 space-y-2.5 border-t border-white/[0.07] pt-5">
              <div className="font-bold text-sm text-white/80">Base Mainnet</div>
              <p className="font-mono text-[10px] text-white/30 leading-relaxed">
                Coinbase's OP Stack L2 — low fees, EVM-compatible, and the home of onchain.
                All agent actions, pool reads, and USDC payments run on Base (chain ID 8453).
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Chain ID 8453", "USDC Native", "OP Stack", "EVM"].map(t => (
                  <span key={t} className="font-mono text-[9px] text-blue-400/50 border border-blue-500/20 px-1.5 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── x402 Integration ── */}
          <div className="group relative flex flex-col p-8 bg-gradient-to-b from-primary/[0.04] to-transparent hover:from-primary/[0.07] transition-all duration-500">
            <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-6">Payment Protocol</div>
            <div className="flex-1 flex items-center justify-center py-6">
              {/* x402 logo — typographic since no official image */}
              <div className="flex flex-col items-center gap-2">
                <div className="font-black text-5xl sm:text-6xl tracking-tighter text-primary/80 group-hover:text-primary transition-colors duration-300"
                  style={{ textShadow: "0 0 40px rgba(0,245,100,0.35)" }}>
                  x402
                </div>
                <div className="font-mono text-[9px] text-white/20 uppercase tracking-[0.3em]">HTTP Payment Rail</div>
              </div>
            </div>
            <div className="mt-6 space-y-2.5 border-t border-primary/[0.10] pt-5">
              <div className="font-bold text-sm text-white/80">x402 Integration</div>
              <p className="font-mono text-[10px] text-white/30 leading-relaxed">
                HTTP 402 micropayment standard. Each AI advisor call costs <span className="text-primary/60">0.05 USDC</span> on Base,
                paid automatically by the agent and verified on-chain — no API keys, no subscriptions.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["0.05 USDC", "HTTP 402", "On-chain verify", "Auto-pay"].map(t => (
                  <span key={t} className="font-mono text-[9px] text-primary/50 border border-primary/20 px-1.5 py-0.5">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom integration stat bar */}
        <div className="border border-t-0 border-white/[0.12] grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.08]">
          {[
            { val: "Maverick V2", sub: "DLMM pools" },
            { val: "Base 8453",   sub: "chain ID" },
            { val: "0.05 USDC",   sub: "per AI call (x402)" },
            { val: "100% OSS",    sub: "open source stack" },
          ].map(({ val, sub }) => (
            <div key={sub} className="px-5 py-3 flex flex-col gap-0.5">
              <span className="font-mono text-[11px] font-bold text-white/60">{val}</span>
              <span className="font-mono text-[9px] text-white/20">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-8 sm:px-14 lg:px-20 py-16 sm:py-24 border-t border-white/[0.05] relative">
        <div className="mb-10">
          <SectionChip label="About" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            WHAT IS<br /><span className="text-primary">GLIDEPOOL?</span>
          </h2>
          <p className="text-sm text-white/40 mt-4 max-w-lg leading-relaxed">
            An autonomous agent platform that manages your Maverick V2 DLMM liquidity positions on Base Mainnet -
            powered by Claude Opus 4, gated by x402 micropayments, and fully non-custodial.
          </p>
        </div>

        {/* Why GlidePool - Promise-style bordered table */}
        <div className="border border-white/[0.12] mb-10">
          <div className="flex flex-col lg:flex-row">
            {/* Left title column */}
            <div className="lg:w-56 shrink-0 p-8 border-b lg:border-b-0 lg:border-r border-white/[0.12] flex items-start">
              <span className="font-mono text-base font-bold text-white/70">Why GlidePool</span>
            </div>
            {/* 2×2 feature grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2">
              {[
                {
                  icon: <Bot className="w-4 h-4" />,
                  title: "AI Agent Loop",
                  body: "Claude Opus 4–driven agent monitors every block. When pool state drifts from optimal bins, it auto-builds a rebalance proposal for your approval.",
                },
                {
                  icon: <BarChart2 className="w-4 h-4" />,
                  title: "DLMM Pool Reader",
                  body: "Reads Maverick V2 pool state - activeTick, TWA price, TVL, fee rate - directly from Base Mainnet via viem. No third-party data providers.",
                },
                {
                  icon: <Zap className="w-4 h-4 text-amber-400" />,
                  title: "x402 Payments",
                  body: "Access gated by HTTP 402 micropayments. 0.05 USDC per LLM call, paid on Base. No subscriptions, no API keys, no monthly invoices.",
                },
                {
                  icon: <ShieldCheck className="w-4 h-4" />,
                  title: "Non-Custodial",
                  body: "The server never holds keys or funds. Every on-chain action - rebalance, add, remove - requires your explicit wallet signature via Reown AppKit.",
                },
              ].map(({ icon, title, body }, i) => (
                <div key={title}
                  className={[
                    "p-6 flex flex-col gap-3",
                    /* right border on left column cells */
                    i % 2 === 0 ? "sm:border-r border-white/[0.12]" : "",
                    /* top border on bottom row cells */
                    i >= 2 ? "border-t border-white/[0.12]" : "",
                    /* top border on mobile (every cell except first) */
                    i > 0 ? "border-t sm:border-t-0" : "",
                    i >= 2 ? "sm:border-t" : "",
                  ].filter(Boolean).join(" ")}>
                  {/* Icon - small outlined square */}
                  <div className="w-8 h-8 border border-primary/35 flex items-center justify-center text-primary/70 shrink-0">
                    {icon}
                  </div>
                  <div className="font-bold text-sm text-white/85">{title}</div>
                  <p className="text-[11px] text-white/35 leading-relaxed font-mono">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent lifecycle - large animated visual table */}
        <div className="border border-white/[0.10]">
          {/* Header row */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.10]">
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">Agent lifecycle - per position</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
              <span className="font-mono text-[9px] text-primary/40 tracking-widest">running</span>
            </div>
          </div>

          {/* 6-cell step table - 2 col mobile, 3 col sm, 6 col lg */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 overflow-hidden">
            {LIFECYCLE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              const isPast   = i < activeStep;
              const isAmber  = step.color === "amber";
              return (
                <button
                  key={step.label}
                  onClick={() => setActiveStep(i)}
                  className="text-left flex flex-col transition-all duration-500 cursor-pointer border-b border-r border-white/[0.10]"
                  style={{
                    background: isActive
                      ? isAmber ? "rgba(251,191,36,0.06)" : "rgba(0,245,100,0.05)"
                      : "transparent",
                  }}
                >
                  {/* Step number + status dot */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-0">
                    <span
                      className="font-mono text-[9px] transition-colors duration-300"
                      style={{ color: isActive ? (isAmber ? "rgba(251,191,36,0.7)" : "rgba(0,245,100,0.7)") : "rgba(255,255,255,0.12)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div
                      className="w-1.5 h-1.5 transition-all duration-300"
                      style={{
                        background: isActive ? (isAmber ? "#fbbf24" : "rgb(0,245,100)") : isPast ? "rgba(0,245,100,0.25)" : "rgba(255,255,255,0.08)",
                        boxShadow: isActive ? (isAmber ? "0 0 6px #fbbf24" : "0 0 6px rgb(0,245,100)") : "none",
                      }}
                    />
                  </div>

                  {/* Icon */}
                  <div className="px-4 py-4">
                    <div
                      className="w-9 h-9 sm:w-11 sm:h-11 border flex items-center justify-center transition-all duration-300"
                      style={{
                        borderColor: isActive ? (isAmber ? "rgba(251,191,36,0.5)" : "rgba(0,245,100,0.5)") : "rgba(255,255,255,0.08)",
                        color: isActive ? (isAmber ? "#fbbf24" : "rgb(0,245,100)") : "rgba(255,255,255,0.25)",
                        boxShadow: isActive ? (isAmber ? "0 0 16px rgba(251,191,36,0.15)" : "0 0 16px rgba(0,245,100,0.12)") : "none",
                      }}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="px-4 pb-3">
                    <div
                      className="font-bold text-xs leading-tight mb-1 transition-colors duration-300"
                      style={{ color: isActive ? (isAmber ? "#fbbf24" : "rgb(0,245,100)") : "rgba(255,255,255,0.55)" }}
                    >
                      {step.label}
                    </div>
                    <div className="font-mono text-[9px] text-white/20 leading-tight hidden sm:block">{step.sub}</div>
                  </div>

                  {/* Active bottom bar */}
                  <div
                    className="mt-auto h-[2px] transition-all duration-500"
                    style={{
                      background: isActive ? (isAmber ? "#fbbf24" : "rgb(0,245,100)") : "transparent",
                      opacity: isActive ? 0.7 : 0,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Active step detail panel */}
          <div className="border-t border-white/[0.10] px-6 py-5 transition-all duration-300" style={{ minHeight: 72 }}>
            <div className="flex items-start gap-4">
              <div
                className="font-mono text-[9px] shrink-0 pt-0.5 transition-colors duration-300"
                style={{ color: LIFECYCLE_STEPS[activeStep].color === "amber" ? "rgba(251,191,36,0.5)" : "rgba(0,245,100,0.5)" }}
              >
                STEP {String(activeStep + 1).padStart(2, "0")}
              </div>
              <p className="font-mono text-[11px] text-white/40 leading-relaxed">
                {LIFECYCLE_STEPS[activeStep].desc}
              </p>
            </div>
          </div>

          {/* Progress track */}
          <div className="border-t border-white/[0.06] h-[3px] flex">
            {LIFECYCLE_STEPS.map((_, i) => (
              <div
                key={i}
                className="flex-1 transition-all duration-500"
                style={{
                  background: i < activeStep
                    ? "rgba(0,245,100,0.25)"
                    : i === activeStep
                    ? LIFECYCLE_STEPS[i].color === "amber" ? "#fbbf24" : "rgb(0,245,100)"
                    : "transparent",
                  opacity: i === activeStep ? 0.8 : 1,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ARCHITECTURE
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-8 sm:px-14 lg:px-20 py-16 sm:py-20 border-t border-white/[0.05]">
        <div className="mb-10">
          <SectionChip label="Architecture" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            HOW THE<br /><span className="text-primary">SYSTEM</span> CONNECTS
          </h2>
        </div>

        {/* 3×2 component grid - 1 col mobile, 3 col sm+ */}
        <div className="border border-white/[0.10] overflow-hidden">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 overflow-hidden">
            {[
              { label: "CLIENT LAYER",  icon: <Wallet className="w-5 h-5 text-white/50" />,       title: "User Wallet",   lines: ["Reown AppKit connect", "Signs all transactions", "Base Mainnet"], foot: "wagmi v2" },
              { label: "SERVER LAYER",  icon: <Bot className="w-5 h-5 text-primary/80" />,         title: "Agent Server",  lines: ["Analyze pool every ~30s", "Store LLM decisions in DB", "x402 verify (if enabled)"], foot: "Express 5 · Node.js", accent: true },
              { label: "PAYMENT LAYER", icon: <Zap className="w-5 h-5 text-amber-400/80" />,      title: "x402 Gate",     lines: ["HTTP 402 response", "Pay 0.05 USDC on Base", "Verify on-chain"], foot: "Base Mainnet" },
            ].map(({ label, icon, title, lines, foot, accent }, i) => (
              <div key={title} className={[
                "p-6 flex flex-col gap-4 border-b border-r border-white/[0.10]",
                accent ? "bg-primary/[0.03]" : "",
              ].join(" ")}>
                <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{label}</div>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 border flex items-center justify-center shrink-0 ${accent ? "border-primary/30" : "border-white/[0.12]"}`}>{icon}</div>
                  <span className="font-bold text-sm tracking-wide">{title}</span>
                </div>
                <ul className="space-y-1">
                  {lines.map(l => <li key={l} className="font-mono text-[10px] text-white/30">› {l}</li>)}
                </ul>
                <div className={`font-mono text-[9px] pt-3 border-t ${accent ? "border-primary/[0.10] text-primary/30" : "border-white/[0.06] text-white/15"}`}>{foot}</div>
              </div>
            ))}
          </div>
          {/* Divider row - hidden on mobile */}
          <div className="hidden sm:grid border-t border-white/[0.10] grid-cols-3 overflow-hidden">
            <div className="px-6 py-2 flex items-center gap-2 border-r border-white/[0.10]">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
              <span className="font-mono text-[9px] text-primary/40 tracking-widest">~2s block time</span>
            </div>
            <div className="px-6 py-2 font-mono text-[9px] text-white/15 flex items-center border-r border-white/[0.10]">real-time data flow</div>
            <div className="px-6 py-2 font-mono text-[9px] text-white/15 flex items-center">chain id 8453</div>
          </div>
          {/* Row 2 */}
          <div className="border-t border-white/[0.10] grid grid-cols-1 sm:grid-cols-3 overflow-hidden">
            {[
              { label: "AI LAYER",     icon: <Cpu className="w-5 h-5 text-blue-400/80" />,        title: "Claude Opus 4",    lines: ["Receives pool snapshot", "Action + reasoning", "Bin range + mode"], foot: "Anthropic API" },
              { label: "CHAIN LAYER",  icon: <Layers className="w-5 h-5 text-white/50" />,        title: "Maverick V2 Pool", lines: ["Read: activeTick, TVL, price", "Write: add/remove liquidity", "DLMM bin management"], foot: "Base Mainnet · viem" },
              { label: "OUTPUT LAYER", icon: <GitBranch className="w-5 h-5 text-primary/60" />,   title: "TX Proposal",      lines: ["Built by agent server", "Reviewed in Monitor", "Signed by your wallet"], foot: "wallet sign · wagmi" },
            ].map(({ label, icon, title, lines, foot }) => (
              <div key={title} className="p-6 flex flex-col gap-4 border-b border-r border-white/[0.10]">
                <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{label}</div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-white/[0.12] flex items-center justify-center shrink-0">{icon}</div>
                  <span className="font-bold text-sm tracking-wide">{title}</span>
                </div>
                <ul className="space-y-1">
                  {lines.map(l => <li key={l} className="font-mono text-[10px] text-white/30">› {l}</li>)}
                </ul>
                <div className="font-mono text-[9px] pt-3 border-t border-white/[0.06] text-white/15">{foot}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          x402 PROTOCOL
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-8 sm:px-14 lg:px-20 py-16 sm:py-20 border-t border-white/[0.05]">
        <div className="mb-10">
          <SectionChip label="x402 Protocol" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            PAY PER<br /><span className="text-primary">INTELLIGENCE</span>
          </h2>
          <p className="text-sm text-white/35 mt-4 max-w-md leading-relaxed">
            x402 turns HTTP 402 into a machine-readable payment rail. Agent pays on-chain in ~2s, AI unlocks automatically. No server-side wallets ever.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/[0.10]">
          {/* Left: numbered steps */}
          <div className="border-b lg:border-b-0 lg:border-r border-white/[0.10] divide-y divide-white/[0.10]">
            {[
              { n: "01", label: "Agent calls /api/advisor", body: "Sends pool snapshot + user goal.", code: "POST /api/advisor", tc: "text-white/60" },
              { n: "02", label: "Server responds HTTP 402", body: "Returns treasury address + 0.05 USDC amount.", code: "HTTP 402 · chainId: 8453", tc: "text-amber-400/80" },
              { n: "03", label: "Agent pays 0.05 USDC",    body: "USDC transfer on Base Mainnet. ~2s confirm.", code: "USDC.transfer(treasury, 50000)", tc: "text-primary/80" },
              { n: "04", label: "Server verifies on-chain", body: "Reads Base RPC, confirms tx + nonce.", code: "verifyPayment(txHash) → ✓", tc: "text-white/60" },
              { n: "05", label: "Claude Opus 4 unlocked",   body: "Full LLM run. Returns action, risk, bins.", code: '{ action:"REBALANCE", risk:"medium" }', tc: "text-primary/80" },
            ].map(({ n, label, body, code, tc }) => (
              <div key={n} className="flex gap-0">
                <div className="w-14 shrink-0 border-r border-white/[0.10] flex items-start justify-center pt-5">
                  <span className="font-mono text-[10px] text-white/20">{n}</span>
                </div>
                <div className="flex-1 p-5">
                  <div className={`font-bold text-sm mb-1 ${tc}`}>{label}</div>
                  <p className="font-mono text-[10px] text-white/30 mb-2">{body}</p>
                  <div className="bg-black/50 border border-white/[0.06] px-3 py-1.5 font-mono text-[10px] text-white/25">{code}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: HTTP 402 response + why */}
          <div className="divide-y divide-white/[0.10]">
            {/* HTTP 402 response */}
            <div>
              <div className="px-5 py-3 border-b border-white/[0.10] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 animate-pulse" />
                  <span className="font-mono text-[9px] text-amber-400/70 uppercase tracking-widest">HTTP/1.1 402 Payment Required</span>
                </div>
                <span className="font-mono text-[9px] text-white/15">server → agent</span>
              </div>
              <div className="p-5 space-y-1.5 font-mono text-[10px]">
                {[
                  { k: "scheme",      v: '"exact"',            c: "text-amber-400/60" },
                  { k: "network",     v: '"base-mainnet"',     c: "text-primary/60" },
                  { k: "asset",       v: '"USDC 0x833589…"',   c: "text-primary/60" },
                  { k: "payTo",       v: '"0xTreasury…"',      c: "text-white/40" },
                  { k: "amount",      v: '"50000"',            c: "text-white/65" },
                  { k: "maxDecimals", v: "6",                  c: "text-white/35" },
                  { k: "nonce",       v: '"0xabc1…"',          c: "text-white/20" },
                  { k: "expires",     v: '"2026-06-13T12:01Z"',c: "text-white/20" },
                ].map(({ k, v, c }) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-white/18 shrink-0 w-28">{k}:</span>
                    <span className={c}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Why x402 */}
            <div className="p-5">
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-4">Why x402 vs API keys</div>
              {[
                "No API keys to rotate or leak",
                "No monthly invoice - pay per inference",
                "Payments on-chain, verifiable by anyone",
                "Agents pay autonomously, no human needed",
                "Standard HTTP - any client can implement",
              ].map(t => (
                <div key={t} className="flex items-start gap-2 font-mono text-[10px] text-white/35 py-1.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-primary/60 shrink-0">✓</span>{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GUIDE
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-8 sm:px-14 lg:px-20 py-16 sm:py-20 border-t border-white/[0.05]">
        <div className="mb-10">
          <SectionChip label="Guide" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            START IN<br /><span className="text-primary">5 STEPS</span>
          </h2>
        </div>

        {/* 5-step bordered grid - 1 col mobile, 2 col sm, 5 col lg */}
        <div className="border border-white/[0.10] overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 overflow-hidden">
            {[
              { n: "01", icon: <Wallet className="w-5 h-5" />,      title: "Connect Wallet",  body: "Base Mainnet via Reown AppKit. MetaMask, Coinbase Wallet, or WalletConnect." },
              { n: "02", icon: <Layers className="w-5 h-5" />,      title: "Pick a Pool",     body: "Browse Maverick V2 pools. Check real TVL, active tick, and fee rate." },
              { n: "03", icon: <Bot className="w-5 h-5" />,         title: "Setup Agent",     body: "Choose strategy, budget, and analysis interval. Agent starts automatically." },
              { n: "04", icon: <RefreshCw className="w-5 h-5" />,   title: "Agent Monitors",  body: "Analyzes pool state every ~30–60s. Claude Opus 4 decides: hold, rebalance, or withdraw." },
              { n: "05", icon: <ShieldCheck className="w-5 h-5" />, title: "You Sign",        body: "Review in Monitor. Approve or reject any proposed on-chain action. Your keys, your control." },
            ].map(({ n, icon, title, body }, i) => (
              <div key={n} className={[
                "p-6 flex flex-col gap-4 border-b border-r border-white/[0.10]",
                i === 4 ? "bg-primary/[0.03]" : "",
              ].join(" ")}>
                <div className="flex items-start justify-between">
                  <div className={`w-9 h-9 border flex items-center justify-center ${i === 4 ? "border-primary/40 text-primary/80" : "border-white/[0.12] text-white/40"}`}>{icon}</div>
                  <span className="font-mono text-[10px] text-white/15">{n}</span>
                </div>
                <div>
                  <div className={`font-bold text-sm mb-2 ${i === 4 ? "text-primary/90" : ""}`}>{title}</div>
                  <p className="font-mono text-[10px] text-white/30 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          {[
            { label: "API Guide",    href: "/cli" },
            { label: "Setup Agent",  href: "/agent/setup" },
            { label: "Browse Pools", href: "/pools" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/40 hover:text-white/75 hover:border-white/20 border border-white/[0.10] px-4 py-2 transition-all cursor-pointer">
                <ArrowRight className="w-3 h-3" /> {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-8 sm:px-14 lg:px-20 py-16 sm:py-20 border-t border-white/[0.05]">
        <div className="mb-10">
          <SectionChip label="FAQ" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            COMMON<br /><span className="text-primary">QUESTIONS</span>
          </h2>
        </div>

        {/* Table-style FAQ */}
        <div className="border border-white/[0.10] divide-y divide-white/[0.10]">
          {FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <button key={i} className="w-full text-left" onClick={() => setOpenFaq(open ? null : i)}>
                <div className={`grid grid-cols-1 sm:grid-cols-[1fr_auto] transition-colors ${open ? "bg-primary/[0.03]" : "hover:bg-white/[0.015]"}`}>
                  <div className="flex gap-0">
                    <div className="w-12 sm:w-14 shrink-0 border-r border-white/[0.10] flex items-start justify-center pt-5 pb-5">
                      <span className="font-mono text-[9px] text-white/15">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex-1 p-5">
                      <div className={`font-bold text-sm mb-1 leading-snug ${open ? "text-primary/90" : ""}`}>{faq.q}</div>
                      {open && <p className="font-mono text-[11px] text-white/40 leading-relaxed mt-3">{faq.a}</p>}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-start pt-5 pr-5">
                    {open
                      ? <ChevronUp className="w-3.5 h-3.5 text-primary/60" />
                      : <ChevronDown className="w-3.5 h-3.5 text-white/20" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-5">
          <a href="/cli"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/35 hover:text-white/70 border border-white/[0.08] hover:border-white/20 px-4 py-2 transition-all">
            API Guide <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ECOSYSTEM STRIP
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 border-t border-white/[0.05]">
        <div className="overflow-hidden">
          <div className="flex flex-wrap border-b border-white/[0.05]">
            <div className="px-6 py-3 border-r border-white/[0.07] flex items-center shrink-0">
              <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Built with</span>
            </div>
            {["Base", "Maverick V2", "x402", "Reown AppKit", "Anthropic", "viem", "Drizzle ORM"].map(l => (
              <div key={l} className="px-5 py-3 border-r border-white/[0.05] flex items-center">
                <span className="font-mono text-[11px] text-white/20">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 border-t border-white/[0.10]">
        <div className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          {/* Left: headline */}
          <div className="p-8 sm:p-14 flex flex-col gap-8 border-b lg:border-b-0 lg:border-r border-white/[0.10]">
            <div>
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-5">Deploy</div>
              <h2 className="font-black uppercase tracking-tighter leading-[0.88]" style={{ fontSize: "clamp(32px,5.5vw,72px)" }}>
                DEPLOY YOUR<br /><span className="text-primary">FIRST AGENT</span><br />TODAY
              </h2>
            </div>
            <p className="text-sm text-white/35 max-w-sm leading-relaxed font-mono">
              Connect your Base wallet, pick a Maverick V2 pool, and deploy an autonomous DLMM agent in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-[#080808] font-bold font-mono text-sm tracking-wider px-7 py-3.5 hover:brightness-110 transition-all">
                  Launch App <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/agent/setup">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/[0.18] text-white/60 hover:text-white hover:border-white/40 font-mono text-sm tracking-wide px-7 py-3.5 transition-all">
                  Setup Agent
                </button>
              </Link>
            </div>
          </div>

          {/* Right: stats + resources */}
          <div className="p-8 sm:p-14 flex flex-col gap-8">
            {/* Mini stats */}
            <div className="grid grid-cols-2 overflow-hidden border border-white/[0.08]">
              {[
                { val: "0.05 USDC", label: "Per AI query" },
                { val: "~2s",       label: "Payment confirm" },
                { val: "100%",      label: "Non-custodial" },
                { val: "HTTP 402",  label: "Payment protocol" },
              ].map(({ val, label }, i) => (
                <div key={label} className="p-4 border-b border-r border-white/[0.08]">
                  <div className="font-mono text-base font-bold text-primary/80">{val}</div>
                  <div className="font-mono text-[10px] text-white/25 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Resources */}
            <div>
              <div className="font-mono text-[9px] text-white/15 uppercase tracking-widest mb-3">Quick Links</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {[
                  { label: "Browse Pools",  href: "/pools" },
                  { label: "Setup Agent",   href: "/agent/setup" },
                  { label: "Dashboard",     href: "/dashboard" },
                  { label: "API Guide",     href: "/cli" },
                ].map(({ label, href }) => (
                  <a key={label} href={href}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-white/30 hover:text-white/65 transition-colors py-1">
                    {label} <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
