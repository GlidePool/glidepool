import { useState } from "react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
  { q: "Does GlidePool hold my funds?", a: "Never. The API server only reads on-chain data and produces transaction calldata. Every write requires your explicit signature via RainbowKit. No private keys, no custody." },
  { q: "How does x402 micropayment work?", a: "The advisor endpoint returns HTTP 402 with a treasury address + 0.05 USDC amount. The agent pays on Base, the server verifies the tx on-chain, then unlocks Claude Opus 4. ~2s end-to-end. No API keys, no subscriptions." },
  { q: "What strategies are available?", a: "Conservative (Static bins), Balanced (Both — follows price both ways), Aggressive (Right/Left — follows trend). Claude Opus 4 picks the mode based on volatility and your stated risk tolerance." },
  { q: "Which pools are supported?", a: "Maverick V2 DLMM pools on Base Mainnet — WETH/USDC, WETH/cbETH, WETH/wstETH initially. The allowlist can be extended." },
  { q: "Can I use the CLI?", a: "Yes — the CLI covers agent deploy, monitoring, and management. All features in the web UI are available via CLI. See the CLI Guide page." },
  { q: "Is the code open-source?", a: "Yes. Full monorepo on GitHub: API server, frontend, chain readers, LLM integration, x402 middleware, Drizzle schema — all MIT-licensed." },
];

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative flex flex-col" style={{ zIndex: 2 }}>

      {/* ─── TICKER ─────────────────────────────── */}
      <div className="pt-6 relative">
        <div className="-mx-4 sm:-mx-6 overflow-hidden border-y border-primary/25 bg-primary/[0.05] py-2 select-none">
          <div className="animate-marquee whitespace-nowrap font-mono text-[11px] text-primary/80 tracking-[0.14em] uppercase">
            {TICKER.repeat(6)}
          </div>
        </div>
      </div>

      {/* ─── HERO ───────────────────────────────── */}
      <section className="relative pt-10 sm:pt-14 pb-4 overflow-hidden">
        {/* ── Vertical light beams (reference image, green) ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Stripe field — glow applied to the whole layer */}
          <div className="absolute inset-0" style={{
            filter: "blur(0.5px) drop-shadow(0 0 6px rgba(0,245,100,0.8))",
            backgroundImage: [
              "linear-gradient(180deg, rgba(0,245,100,0.90) 0%, rgba(0,245,100,1.00) 45%, rgba(0,245,100,0.90) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.55) 0%, rgba(0,245,100,0.80) 45%, rgba(0,245,100,0.55) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.30) 0%, rgba(0,245,100,0.50) 45%, rgba(0,245,100,0.30) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.18) 0%, rgba(0,245,100,0.32) 45%, rgba(0,245,100,0.18) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.45) 0%, rgba(0,245,100,0.70) 45%, rgba(0,245,100,0.45) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.14) 0%, rgba(0,245,100,0.24) 45%, rgba(0,245,100,0.14) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.22) 0%, rgba(0,245,100,0.38) 45%, rgba(0,245,100,0.22) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.60) 0%, rgba(0,245,100,0.85) 45%, rgba(0,245,100,0.60) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.10) 0%, rgba(0,245,100,0.18) 45%, rgba(0,245,100,0.10) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.18) 0%, rgba(0,245,100,0.30) 45%, rgba(0,245,100,0.18) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.25) 0%, rgba(0,245,100,0.42) 45%, rgba(0,245,100,0.25) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.07) 0%, rgba(0,245,100,0.12) 45%, rgba(0,245,100,0.07) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.12) 0%, rgba(0,245,100,0.20) 45%, rgba(0,245,100,0.12) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.05) 0%, rgba(0,245,100,0.08) 45%, rgba(0,245,100,0.05) 100%)",
              "linear-gradient(180deg, rgba(0,245,100,0.08) 0%, rgba(0,245,100,0.14) 45%, rgba(0,245,100,0.08) 100%)",
            ].join(","),
            backgroundRepeat: "no-repeat",
            backgroundSize: [
              "4px 100%","2.5px 100%","1.5px 100%","2px 100%","2px 100%",
              "1px 100%","2.5px 100%","3px 100%","1px 100%","2px 100%",
              "1.5px 100%","2px 100%","1px 100%","2px 100%","1px 100%",
            ].join(","),
            backgroundPosition: [
              "14% 0","10% 0","7% 0","5% 0","18% 0",
              "22% 0","26% 0","30% 0","34% 0","38% 0",
              "43% 0","49% 0","56% 0","65% 0","76% 0",
            ].join(","),
            maskImage: "radial-gradient(ellipse 60% 100% at 28% 50%, black 0%, rgba(0,0,0,0.6) 45%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 100% at 28% 50%, black 0%, rgba(0,0,0,0.6) 45%, transparent 75%)",
          }} />
          {/* Wide ambient bloom — soft green light from left-center */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 50% 90% at 20% 50%, rgba(0,245,100,0.20) 0%, rgba(0,245,100,0.06) 50%, transparent 72%)",
            filter: "blur(24px)",
          }} />
          {/* Vignette — keeps text readable */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 25%, rgba(8,8,8,0.65) 100%)",
          }} />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(0,245,100,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,100,1) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
        <div className="flex items-start justify-between gap-4 mb-8 relative">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full border-2 border-white/15 bg-white/[0.03] flex items-center justify-center"><Plus className="w-4 h-4 text-primary" strokeWidth={2.5} /></div>
            <div className="w-9 h-9 rounded-full border-2 border-primary/50 bg-primary/10 flex items-center justify-center -ml-3"><div className="w-3 h-3 rounded-full bg-primary animate-pulse" /></div>
          </div>
          <p className="hidden sm:block text-[11px] text-white/25 leading-relaxed max-w-[180px] text-right font-mono">Claude Opus 4 · Maverick V2 · x402 on Base · non-custodial LP</p>
        </div>
        <h1 className="relative font-black uppercase tracking-tighter leading-[0.87] text-white select-none" style={{ fontSize: "clamp(48px,10vw,122px)" }}>
          <span className="block">AUTONOMOUS</span>
          <span className="block text-primary" style={{ textShadow: "0 0 80px rgba(0,245,100,0.45),0 0 160px rgba(0,245,100,0.2)" }}>DLMM</span>
          <span className="block">LIQUIDITY</span>
          <span className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span>AGENTS</span>
            <Link href="/dashboard">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary text-[#080808] font-bold font-sans uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-transform glow-green shrink-0" style={{ fontSize: "clamp(9px,1.1vw,13px)", padding: "clamp(10px,1.8vw,16px) clamp(14px,2.5vw,28px)" }}>
                LAUNCH APP <ArrowRight strokeWidth={2.5} style={{ width: "clamp(11px,1.3vw,16px)", height: "clamp(11px,1.3vw,16px)" }} />
              </div>
            </Link>
          </span>
        </h1>
      </section>

      {/* ─── STATS BAR ──────────────────────────── */}
      <div className="-mx-4 sm:-mx-6 border-y border-white/[0.05] grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.05] my-10">
        {[
          { v: "Maverick V2",   l: "Protocol" },
          { v: "0.05 USDC",     l: "per AI query" },
          { v: "~2s",           l: "payment confirm" },
          { v: "100%",          l: "non-custodial" },
        ].map(({ v, l }) => (
          <div key={l} className="flex flex-col items-center py-5 px-4 gap-1">
            <span className="font-black font-mono text-white text-lg sm:text-xl tracking-tight">{v}</span>
            <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">{l}</span>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-24 border-t border-white/[0.05] relative">
        <div className="mb-10">
          <SectionChip label="About" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            WHAT IS<br /><span className="text-primary">GLIDEPOOL?</span>
          </h2>
          <p className="text-sm text-white/40 mt-4 max-w-lg leading-relaxed">
            An autonomous agent platform that manages your Maverick V2 DLMM liquidity positions on Base Mainnet —
            powered by Claude Opus 4, gated by x402 micropayments, and fully non-custodial.
          </p>
        </div>

        {/* Why GlidePool — Promise-style bordered table */}
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
                  body: "Reads Maverick V2 pool state — activeTick, TWA price, TVL, fee rate — directly from Base Mainnet via viem. No third-party data providers.",
                },
                {
                  icon: <Zap className="w-4 h-4 text-amber-400" />,
                  title: "x402 Payments",
                  body: "Access gated by HTTP 402 micropayments. 0.05 USDC per LLM call, paid on Base. No subscriptions, no API keys, no monthly invoices.",
                },
                {
                  icon: <ShieldCheck className="w-4 h-4" />,
                  title: "Non-Custodial",
                  body: "The server never holds keys or funds. Every on-chain action — rebalance, add, remove — requires your explicit RainbowKit wallet signature.",
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
                  {/* Icon — small outlined square */}
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

        {/* Agent lifecycle — horizontal dotted flow */}
        <div className="border border-white/[0.10]">
          <div className="px-6 py-4 border-b border-white/[0.10]">
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">Agent lifecycle — per position</span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex items-stretch min-w-[640px]">
              {[
                { icon: <Eye className="w-4 h-4" />,                          label: "Observe",      sub: "pool state / block" },
                { icon: <Cpu className="w-4 h-4" />,                          label: "Analyze",      sub: "detect bin drift" },
                { icon: <Zap className="w-4 h-4 text-amber-400" />,           label: "Pay x402",     sub: "0.05 USDC on Base" },
                { icon: <Bot className="w-4 h-4" />,                          label: "Claude Opus 4",sub: "get recommendation" },
                { icon: <GitBranch className="w-4 h-4" />,                    label: "Propose TX",   sub: "build calldata" },
                { icon: <ShieldCheck className="w-4 h-4 text-primary/70" />,  label: "You Sign",     sub: "approve or reject" },
              ].map(({ icon, label, sub }, i, arr) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2 py-6 px-4 flex-1">
                    <div className="w-9 h-9 border border-primary/30 flex items-center justify-center text-primary/60">
                      {icon}
                    </div>
                    <div className="font-mono text-[10px] font-bold text-white/60 text-center leading-tight">{label}</div>
                    <div className="font-mono text-[9px] text-white/25 text-center leading-tight">{sub}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="shrink-0 text-white/15 font-mono text-xs select-none">›</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ARCHITECTURE
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-20 border-t border-white/[0.05]">
        <div className="mb-10">
          <SectionChip label="Architecture" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            HOW THE<br /><span className="text-primary">SYSTEM</span> CONNECTS
          </h2>
        </div>

        {/* 3×2 component grid */}
        <div className="border border-white/[0.10] overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Row 1 */}
            <div className="grid grid-cols-3 divide-x divide-white/[0.10]">
              {[
                { label: "CLIENT LAYER", icon: <Wallet className="w-5 h-5 text-white/50" />, title: "User Wallet", lines: ["RainbowKit connect", "Signs all transactions", "Base Mainnet"], foot: "wagmi v2" },
                { label: "SERVER LAYER", icon: <Bot className="w-5 h-5 text-primary/80" />, title: "Agent Server", lines: ["Poll pool / block", "Detect bin drift", "Trigger x402 flow"], foot: "Express 5 · Node.js", accent: true },
                { label: "PAYMENT LAYER", icon: <Zap className="w-5 h-5 text-amber-400/80" />, title: "x402 Gate", lines: ["HTTP 402 response", "Pay 0.05 USDC on Base", "Verify on-chain"], foot: "Base Mainnet" },
              ].map(({ label, icon, title, lines, foot, accent }) => (
                <div key={title} className={`p-6 flex flex-col gap-4 ${accent ? "bg-primary/[0.03]" : ""}`}>
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
            {/* Divider row */}
            <div className="border-t border-white/[0.10] grid grid-cols-3 divide-x divide-white/[0.10]">
              <div className="px-6 py-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                <span className="font-mono text-[9px] text-primary/40 tracking-widest">~2s block time</span>
              </div>
              <div className="px-6 py-2 font-mono text-[9px] text-white/15 flex items-center">real-time data flow</div>
              <div className="px-6 py-2 font-mono text-[9px] text-white/15 flex items-center">chain id 8453</div>
            </div>
            {/* Row 2 */}
            <div className="border-t border-white/[0.10] grid grid-cols-3 divide-x divide-white/[0.10]">
              {[
                { label: "AI LAYER", icon: <Cpu className="w-5 h-5 text-blue-400/80" />, title: "Claude Opus 4", lines: ["Receives pool snapshot", "Action + reasoning", "Bin range + mode"], foot: "Anthropic API" },
                { label: "CHAIN LAYER", icon: <Layers className="w-5 h-5 text-white/50" />, title: "Maverick V2 Pool", lines: ["Read: activeTick, TVL, price", "Write: add/remove liquidity", "DLMM bin management"], foot: "Base Mainnet · viem" },
                { label: "OUTPUT LAYER", icon: <GitBranch className="w-5 h-5 text-primary/60" />, title: "TX Proposal", lines: ["Built by agent server", "Reviewed in Monitor", "Signed by your wallet"], foot: "RainbowKit sign" },
              ].map(({ label, icon, title, lines, foot }) => (
                <div key={title} className="p-6 flex flex-col gap-4">
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
        </div>
      </section>

      {/* ══════════════════════════════════════════
          x402 PROTOCOL
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-20 border-t border-white/[0.05]">
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
                "No monthly invoice — pay per inference",
                "Payments on-chain, verifiable by anyone",
                "Agents pay autonomously, no human needed",
                "Standard HTTP — any client can implement",
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
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-20 border-t border-white/[0.05]">
        <div className="mb-10">
          <SectionChip label="Guide" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            START IN<br /><span className="text-primary">5 STEPS</span>
          </h2>
        </div>

        {/* 5-step bordered grid */}
        <div className="border border-white/[0.10] overflow-x-auto">
          <div className="grid grid-cols-5 divide-x divide-white/[0.10] min-w-[560px]">
            {[
              { n: "01", icon: <Wallet className="w-5 h-5" />,     title: "Connect Wallet",  body: "Base Mainnet via RainbowKit. MetaMask, Coinbase, WalletConnect." },
              { n: "02", icon: <Layers className="w-5 h-5" />,     title: "Pick a Pool",     body: "Browse Maverick V2 pools. Check TVL, tick, fee rate." },
              { n: "03", icon: <Bot className="w-5 h-5" />,        title: "Setup Agent",     body: "Choose strategy + budget. One wallet signature to deploy." },
              { n: "04", icon: <RefreshCw className="w-5 h-5" />,  title: "Agent Monitors",  body: "Polls every block. Pays 0.05 USDC via x402 for each AI call." },
              { n: "05", icon: <ShieldCheck className="w-5 h-5" />,title: "You Sign",        body: "Review in Monitor. Approve or reject. Your keys, your control." },
            ].map(({ n, icon, title, body }, i) => (
              <div key={n} className={`p-6 flex flex-col gap-4 ${i === 4 ? "bg-primary/[0.03]" : ""}`}>
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
        <div className="flex items-center gap-4 mt-5">
          {[
            { label: "CLI Guide",    href: "/cli" },
            { label: "Setup Agent",  href: "/agent/setup" },
            { label: "Browse Pools", href: "/pools" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}>
              <span className="font-mono text-[11px] text-white/35 hover:text-white/70 border border-white/[0.08] hover:border-white/20 px-4 py-2 transition-all cursor-pointer">→ {label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-20 border-t border-white/[0.05]">
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
          <a href="https://docs.glidepool.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/35 hover:text-white/70 border border-white/[0.08] hover:border-white/20 px-4 py-2 transition-all">
            Full Docs <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ECOSYSTEM STRIP
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 border-t border-white/[0.05]">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
          <div className="px-6 py-4 flex items-center shrink-0">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Built with</span>
          </div>
          {["Base", "Maverick V2", "x402", "RainbowKit", "Anthropic", "viem", "Drizzle ORM"].map(l => (
            <div key={l} className="px-6 py-4 flex items-center">
              <span className="font-mono text-[11px] text-white/20">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 border-t border-white/[0.10]">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.10]">
          {/* Left: headline */}
          <div className="p-10 sm:p-16 flex flex-col justify-between gap-10">
            <div>
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-6">Deploy</div>
              <h2 className="font-black uppercase tracking-tighter leading-[0.88]" style={{ fontSize: "clamp(40px,6vw,80px)" }}>
                DEPLOY YOUR<br /><span className="text-primary">FIRST AGENT</span><br />TODAY
              </h2>
            </div>
            <p className="text-sm text-white/35 max-w-sm leading-relaxed font-mono">
              Connect your Base wallet, pick a Maverick V2 pool, and deploy an autonomous DLMM agent in under 2 minutes.
            </p>
          </div>
          {/* Right: actions + links */}
          <div className="p-10 sm:p-16 flex flex-col justify-between gap-10">
            <div className="space-y-3">
              <ConnectButton />
              <Link href="/dashboard">
                <div className="inline-flex items-center gap-2 border border-primary/30 px-6 py-3 font-mono text-sm text-primary/70 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer w-full sm:w-auto justify-center sm:justify-start">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
            <div className="border-t border-white/[0.08] pt-6">
              <div className="font-mono text-[9px] text-white/15 uppercase tracking-widest mb-4">Resources</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[["GitHub","https://github.com/glidepool"],["Docs","https://docs.glidepool.com"],["Whitepaper","https://docs.glidepool.com/whitepaper"],["Roadmap","https://github.com/glidepool/roadmap"]].map(([l,h]) => (
                  <a key={l} href={h} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-white/25 hover:text-white/60 transition-colors py-1">
                    {l} <ArrowUpRight className="w-2.5 h-2.5" />
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
