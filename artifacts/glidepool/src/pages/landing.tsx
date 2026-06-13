import { useState } from "react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ArrowRight, ArrowUpRight, ChevronDown, ChevronUp,
  Zap, ShieldCheck, Eye, RefreshCw, Bot, BarChart2,
  Wallet, GitBranch, Cpu, Layers, Plus,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   FLOATING ORBS BACKGROUND
───────────────────────────────────────────────────────────── */
function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <div className="absolute" style={{ width: 800, height: 600, top: "-15%", left: "-8%", background: "radial-gradient(ellipse at center, rgba(0,245,100,0.09) 0%, rgba(0,245,100,0.03) 45%, transparent 70%)", animation: "orb-drift-a 24s ease-in-out infinite", filter: "blur(50px)" }} />
      <div className="absolute" style={{ width: 500, height: 400, bottom: "0%", right: "-5%", background: "radial-gradient(ellipse at center, rgba(0,245,100,0.07) 0%, transparent 70%)", animation: "orb-drift-b 30s ease-in-out infinite", filter: "blur(50px)" }} />
      <div className="absolute" style={{ width: 350, height: 280, top: "45%", left: "40%", background: "radial-gradient(ellipse at center, rgba(0,245,100,0.04) 0%, transparent 70%)", animation: "orb-drift-c 38s ease-in-out infinite", filter: "blur(60px)" }} />
      <div className="absolute inset-0 opacity-[0.016]" style={{ backgroundImage: "radial-gradient(rgba(0,245,100,1) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      {/* Radar ping — top left */}
      <div style={{ position: "absolute", top: "18%", left: "10%", width: 420, height: 420 }}>
        <div className="radar-ring" style={{ width: 420, height: 420, left: "50%", top: "50%" }} />
        <div className="radar-ring" style={{ width: 420, height: 420, left: "50%", top: "50%" }} />
        <div className="radar-ring" style={{ width: 420, height: 420, left: "50%", top: "50%" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 6, height: 6, borderRadius: "50%", background: "rgba(0,245,100,0.5)", boxShadow: "0 0 10px rgba(0,245,100,0.6)" }} />
      </div>
      {/* Radar ping — bottom right */}
      <div style={{ position: "absolute", bottom: "12%", right: "8%", width: 320, height: 320 }}>
        <div className="radar-ring" style={{ width: 320, height: 320, left: "50%", top: "50%", animationDelay: "2s" }} />
        <div className="radar-ring" style={{ width: 320, height: 320, left: "50%", top: "50%", animationDelay: "3.33s" }} />
        <div className="radar-ring" style={{ width: 320, height: 320, left: "50%", top: "50%", animationDelay: "4.66s" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 5, height: 5, borderRadius: "50%", background: "rgba(0,245,100,0.4)", boxShadow: "0 0 8px rgba(0,245,100,0.5)" }} />
      </div>
    </div>
  );
}

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
      <PageBackground />

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
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(0,245,100,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,100,1) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
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
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-24 border-t border-white/[0.05] relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(0,245,100,0.06) 0%, transparent 70%)" }}>
        <div className="text-center mb-12">
          <SectionChip label="About" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            WHAT IS<br /><span className="text-primary">GLIDEPOOL?</span>
          </h2>
          <p className="text-sm text-white/40 mt-5 max-w-lg mx-auto leading-relaxed">
            An autonomous agent platform that manages your Maverick V2 DLMM liquidity positions on Base Mainnet —
            powered by Claude Opus 4, gated by x402 micropayments, and fully non-custodial.
          </p>
        </div>

        {/* 4 feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            {
              icon: <Bot className="w-7 h-7" />, title: "AI Agent Loop",
              body: "Claude Opus 4–driven agent monitors every block. When pool state drifts from optimal bins, it auto-builds a rebalance proposal and surfaces it for your approval.",
              tag: "Claude Opus 4", border: "border-primary/25", glow: "rgba(0,245,100,0.06)",
            },
            {
              icon: <BarChart2 className="w-7 h-7" />, title: "DLMM Pool Reader",
              body: "Reads Maverick V2 pool state — activeTick, TWA price, TVL, fee rate — directly from Base Mainnet via viem. No third-party data providers.",
              tag: "on-chain", border: "border-white/[0.09]", glow: "transparent",
            },
            {
              icon: <Zap className="w-7 h-7 text-amber-400" />, title: "x402 Payments",
              body: "Access gated by HTTP 402 micropayments. 0.05 USDC per LLM call, paid on Base. No subscriptions, no API keys, no monthly invoices.",
              tag: "0.05 USDC", border: "border-amber-400/20", glow: "rgba(251,191,36,0.04)",
            },
            {
              icon: <ShieldCheck className="w-7 h-7" />, title: "Non-Custodial",
              body: "The server never holds keys or funds. Every on-chain action — rebalance, add, remove — requires your explicit RainbowKit wallet signature.",
              tag: "your keys", border: "border-white/[0.09]", glow: "transparent",
            },
          ].map(({ icon, title, body, tag, border, glow }) => (
            <div key={title} className={`rounded-2xl border ${border} bg-white/[0.02] p-6 flex flex-col gap-4 hover:bg-white/[0.04] transition-all`}
              style={{ boxShadow: glow !== "transparent" ? `0 0 40px ${glow}` : undefined }}>
              <div className="text-primary/70">{icon}</div>
              <div>
                <div className="font-bold text-sm mb-2">{title}</div>
                <p className="text-[11px] text-white/35 leading-relaxed">{body}</p>
              </div>
              <div className="mt-auto flex">
                <span className="font-mono text-[10px] border border-white/[0.08] text-white/30 rounded px-2 py-0.5">{tag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mini diagram — what agents do */}
        <div className="rounded-2xl border border-white/[0.07] bg-black/40 p-6 sm:p-8">
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-6">Agent lifecycle — per position</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { icon: <Eye className="w-4 h-4" />,         label: "Observe",     sub: "pool state / block" },
              { icon: <Cpu className="w-4 h-4" />,         label: "Analyze",     sub: "detect bin drift" },
              { icon: <Zap className="w-4 h-4 text-amber-400" />, label: "Pay x402", sub: "0.05 USDC on Base" },
              { icon: <Bot className="w-4 h-4" />,         label: "Claude Opus 4",      sub: "get recommendation" },
              { icon: <GitBranch className="w-4 h-4" />,   label: "Propose TX",  sub: "build calldata" },
              { icon: <ShieldCheck className="w-4 h-4" />, label: "You Sign",    sub: "approve or reject" },
            ].map(({ icon, label, sub }, i, arr) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-primary/60 mb-2">
                    {icon}
                  </div>
                  <div className="text-[11px] font-bold text-center text-white/70">{label}</div>
                  <div className="text-[10px] text-white/25 font-mono text-center leading-tight mt-0.5">{sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="text-white/10 font-bold text-lg shrink-0 pb-6">›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ARCHITECTURE — visual node graph
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-24 border-t border-white/[0.05] relative">
        <div className="text-center mb-12">
          <SectionChip label="Architecture" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            HOW THE<br /><span className="text-primary">SYSTEM</span> CONNECTS
          </h2>
        </div>

        {/* Node graph — visual diagram */}
        <div className="rounded-2xl border border-white/[0.07] bg-black/50 p-6 sm:p-10 overflow-x-auto mb-6"
          style={{ boxShadow: "inset 0 0 80px rgba(0,245,100,0.02)" }}>
          <div className="min-w-[600px]">
            {/* Top row: 3 nodes */}
            <div className="flex items-stretch justify-between gap-4 mb-4">
              {/* Node: Wallet */}
              <div className="flex-1 rounded-xl border border-white/[0.10] bg-white/[0.03] p-4 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0"><Wallet className="w-4 h-4 text-white/60" /></div>
                  <span className="font-bold text-xs tracking-wide">USER WALLET</span>
                </div>
                <div className="font-mono text-[10px] text-white/25 space-y-0.5">
                  <div>› RainbowKit connect</div>
                  <div>› Signs all txs</div>
                  <div>› Base Mainnet</div>
                </div>
                <div className="mt-auto font-mono text-[10px] text-white/15 border-t border-white/[0.05] pt-2">wagmi v2</div>
              </div>

              {/* Arrow down */}
              <div className="flex flex-col items-center justify-center gap-1 px-1 shrink-0">
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              </div>

              {/* Node: API Server */}
              <div className="flex-1 rounded-xl border border-primary/30 bg-primary/[0.04] p-4 flex flex-col gap-2 min-w-0" style={{ boxShadow: "0 0 30px rgba(0,245,100,0.07)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>
                  <span className="font-bold text-xs tracking-wide">AGENT SERVER</span>
                </div>
                <div className="font-mono text-[10px] text-white/25 space-y-0.5">
                  <div>› Poll pool / block</div>
                  <div>› Detect bin drift</div>
                  <div>› Trigger x402 flow</div>
                </div>
                <div className="mt-auto font-mono text-[10px] text-primary/30 border-t border-primary/[0.10] pt-2">Express 5 · Node.js</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center shrink-0 px-1">
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              </div>

              {/* Node: x402 + Claude Opus 4 */}
              <div className="flex-1 rounded-xl border border-amber-400/20 bg-amber-400/[0.03] p-4 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0"><Zap className="w-4 h-4 text-amber-400" /></div>
                  <span className="font-bold text-xs tracking-wide">x402 GATE</span>
                </div>
                <div className="font-mono text-[10px] text-white/25 space-y-0.5">
                  <div>› HTTP 402 response</div>
                  <div>› Pay 0.05 USDC</div>
                  <div>› Verify on-chain</div>
                </div>
                <div className="mt-auto font-mono text-[10px] text-amber-400/30 border-t border-amber-400/[0.08] pt-2">Base Mainnet</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center shrink-0 px-1">
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              </div>

              {/* Node: Claude Opus 4 */}
              <div className="flex-1 rounded-xl border border-blue-400/25 bg-blue-400/[0.03] p-4 flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0"><Cpu className="w-4 h-4 text-blue-400" /></div>
                  <span className="font-bold text-xs tracking-wide">Claude Opus 4 ENGINE</span>
                </div>
                <div className="font-mono text-[10px] text-white/25 space-y-0.5">
                  <div>› Receive pool snapshot</div>
                  <div>› Action + reasoning</div>
                  <div>› Bin range + mode</div>
                </div>
                <div className="mt-auto font-mono text-[10px] text-blue-400/30 border-t border-blue-400/[0.08] pt-2">OpenAI API</div>
              </div>
            </div>

            {/* Horizontal connector line */}
            <div className="relative flex items-center justify-between px-8 mb-4">
              <div className="absolute left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-white/10 via-primary/30 to-white/10" />
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/80 px-3 py-1 rounded-full border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[10px] text-primary/60 tracking-wider">real-time · ~2s block time</span>
              </div>
            </div>

            {/* Bottom row: 2 nodes */}
            <div className="flex justify-center gap-6">
              {/* Maverick V2 Pool */}
              <div className="w-64 rounded-xl border border-white/[0.09] bg-white/[0.02] p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0"><Layers className="w-4 h-4 text-white/50" /></div>
                  <span className="font-bold text-xs tracking-wide">MAVERICK V2 POOL</span>
                </div>
                <div className="font-mono text-[10px] text-white/25 space-y-0.5">
                  <div>› Read: activeTick, TVL, price</div>
                  <div>› Write: add/remove via user wallet</div>
                </div>
                <div className="mt-auto font-mono text-[10px] text-white/15 border-t border-white/[0.05] pt-2">Base Mainnet · viem</div>
              </div>

              {/* TX Proposal */}
              <div className="w-64 rounded-xl border border-primary/20 bg-primary/[0.025] p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0"><GitBranch className="w-4 h-4 text-primary/70" /></div>
                  <span className="font-bold text-xs tracking-wide">TX PROPOSAL</span>
                </div>
                <div className="font-mono text-[10px] text-white/25 space-y-0.5">
                  <div>› Built by agent server</div>
                  <div>› Reviewed in Monitor page</div>
                  <div>› Signed by your wallet</div>
                </div>
                <div className="mt-auto font-mono text-[10px] text-primary/30 border-t border-primary/[0.08] pt-2">RainbowKit sign</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key facts strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: <ShieldCheck className="w-4 h-4 text-primary/60" />, title: "Read-only server", body: "API server never signs transactions. Only your connected wallet submits on-chain actions." },
            { icon: <Zap className="w-4 h-4 text-amber-400/60" />,       title: "Pay as you go",  body: "0.05 USDC per LLM call via x402. Zero subscriptions. If the agent doesn't run, you don't pay." },
            { icon: <RefreshCw className="w-4 h-4 text-blue-400/60" />,  title: "Continuous loop", body: "Agent polls pool state every Base block (~2s). Proposals surface in Monitor when action is needed." },
          ].map(({ icon, title, body }) => (
            <div key={title} className="rounded-xl border border-white/[0.07] bg-white/[0.015] p-4 flex gap-3">
              <div className="shrink-0 mt-0.5">{icon}</div>
              <div>
                <div className="font-bold text-xs mb-1">{title}</div>
                <p className="text-[11px] text-white/30 leading-relaxed font-mono">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          x402 FLOW — visual timeline
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-24 border-t border-white/[0.05] relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(251,191,36,0.04) 0%, transparent 65%)" }}>
        <div className="text-center mb-12">
          <SectionChip label="x402 Protocol" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            PAY PER<br /><span className="text-primary">INTELLIGENCE</span>
          </h2>
          <p className="text-sm text-white/35 mt-4 max-w-md mx-auto leading-relaxed">
            x402 turns HTTP 402 into a machine-readable payment rail. The agent pays on-chain in ~2s, the AI unlocks automatically. No wallets on the server side ever.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Left: visual timeline */}
          <div className="space-y-0">
            {[
              {
                n: "01", color: "border-white/20 bg-white/[0.03]", dot: "bg-white/30", tc: "text-white/60",
                icon: <Eye className="w-4 h-4" />, label: "Agent calls /api/advisor",
                body: "Sends pool snapshot (TVL, tick, price, mode) + user goal to the advisor endpoint.",
                code: "POST /api/advisor\n{ pool, goal, position }",
              },
              {
                n: "02", color: "border-amber-400/30 bg-amber-400/[0.04]", dot: "bg-amber-400", tc: "text-amber-400",
                icon: <Zap className="w-4 h-4 text-amber-400" />, label: "Server responds HTTP 402",
                body: "Returns payment instruction: treasury address, 0.05 USDC, chain ID 8453, expiry nonce.",
                code: "HTTP 402\n{ payTo, amount: '50000', chainId: 8453 }",
              },
              {
                n: "03", color: "border-primary/25 bg-primary/[0.04]", dot: "bg-primary", tc: "text-primary",
                icon: <ArrowRight className="w-4 h-4" />, label: "Agent pays 0.05 USDC on Base",
                body: "USDC transfer auto-executed on Base Mainnet. ~2 second confirmation. No user action.",
                code: "USDC.transfer(treasury, 50000)\n→ confirmed block 14209877",
              },
              {
                n: "04", color: "border-white/20 bg-white/[0.03]", dot: "bg-white/30", tc: "text-white/60",
                icon: <ShieldCheck className="w-4 h-4" />, label: "Server verifies on-chain",
                body: "API reads Base RPC, confirms USDC tx + nonce validity. Tamper-proof — no trust needed.",
                code: "verifyPayment(txHash, nonce)\n→ valid ✓",
              },
              {
                n: "05", color: "border-blue-400/25 bg-blue-400/[0.03]", dot: "bg-blue-400", tc: "text-blue-400",
                icon: <Cpu className="w-4 h-4 text-blue-400" />, label: "Claude Opus 4 analysis unlocked",
                body: "Full LLM run with pool context. Returns action, risk level, bin range, and reasoning.",
                code: '{ action: "REBALANCE",\n  bins: [1838,1855], risk: "medium" }',
              },
            ].map(({ n, color, dot, tc, icon, label, body, code }, i, arr) => (
              <div key={n} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-9 h-9 rounded-xl border ${color} flex items-center justify-center ${tc}`}>{icon}</div>
                  {i < arr.length - 1 && <div className={`w-px flex-1 my-1 ${dot === "bg-primary" ? "bg-primary/20" : dot === "bg-amber-400" ? "bg-amber-400/20" : "bg-white/[0.06]"}`} style={{ minHeight: 32 }} />}
                </div>
                <div className="pb-5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-white/20">{n}</span>
                    <span className={`text-sm font-bold ${tc}`}>{label}</span>
                  </div>
                  <p className="text-[11px] text-white/35 leading-relaxed mb-2 font-mono">{body}</p>
                  <div className="rounded-lg bg-black/60 border border-white/[0.06] px-3 py-2 font-mono text-[10px] text-white/30 whitespace-pre">{code}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: live 402 response card + why x402 */}
          <div className="space-y-4 lg:sticky lg:top-20">
            {/* HTTP 402 mock response */}
            <div className="rounded-2xl border border-amber-400/20 bg-black/60 overflow-hidden font-mono text-[11px]" style={{ boxShadow: "0 0 40px rgba(251,191,36,0.05)" }}>
              <div className="px-4 py-3 border-b border-amber-400/15 bg-amber-400/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400/80 text-[10px] tracking-widest font-bold">HTTP/1.1 402 Payment Required</span>
                </div>
                <span className="text-white/20 text-[9px]">server → agent</span>
              </div>
              <div className="p-4 space-y-1.5 leading-relaxed">
                {[
                  { k: "Content-Type", v: "application/json",   c: "text-white/30" },
                  { k: "X-Payment-Version", v: '"1.0"',         c: "text-white/30" },
                  { k: "",              v: "",                   c: "" },
                  { k: "scheme",        v: '"exact"',            c: "text-amber-400/70" },
                  { k: "network",       v: '"base-mainnet"',     c: "text-primary/60" },
                  { k: "asset",         v: '"USDC (0x833589…)"', c: "text-primary/60" },
                  { k: "payTo",         v: '"0xTreasury…"',      c: "text-white/50" },
                  { k: "amount",        v: '"50000"',            c: "text-white/70" },
                  { k: "maxDecimals",   v: "6",                  c: "text-white/40" },
                  { k: "nonce",         v: '"0xabc1…"',          c: "text-white/25" },
                  { k: "expires",       v: '"2026-06-13T12:01Z"',c: "text-white/25" },
                ].map(({ k, v, c }, i) =>
                  k === "" ? <div key={i} className="h-1" /> : (
                    <div key={k} className="flex gap-2">
                      <span className="text-white/20 shrink-0 min-w-[120px]">{k}:</span>
                      <span className={c}>{v}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Why x402 */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 space-y-3">
              <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Why x402 vs API keys?</div>
              {[
                { icon: "✓", text: "No API keys to rotate or leak", c: "text-primary/60" },
                { icon: "✓", text: "No monthly invoice — pay per inference", c: "text-primary/60" },
                { icon: "✓", text: "Payments on-chain — verifiable by anyone", c: "text-primary/60" },
                { icon: "✓", text: "Agents pay autonomously, humans can too", c: "text-primary/60" },
                { icon: "✓", text: "Standard HTTP — any client can implement", c: "text-primary/60" },
              ].map(({ icon, text, c }) => (
                <div key={text} className="flex items-start gap-2 font-mono text-[11px] text-white/40">
                  <span className={`${c} shrink-0`}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GUIDE — 5 steps visual
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-24 border-t border-white/[0.05] relative"
        style={{ background: "radial-gradient(ellipse 70% 50% at 0% 50%, rgba(0,245,100,0.03) 0%, transparent 70%)" }}>
        <div className="text-center mb-12">
          <SectionChip label="Guide" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            START IN<br /><span className="text-primary">5 STEPS</span>
          </h2>
        </div>

        {/* Progress bar + steps */}
        <div className="relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { n: "01", icon: <Wallet className="w-5 h-5" />,     title: "Connect Wallet",  body: "Connect a Base Mainnet wallet via RainbowKit. MetaMask, Coinbase Wallet, WalletConnect." },
              { n: "02", icon: <Layers className="w-5 h-5" />,      title: "Pick a Pool",     body: "Browse Maverick V2 pools. Check TVL, tick, fee rate. Select your target." },
              { n: "03", icon: <Bot className="w-5 h-5" />,         title: "Setup Agent",     body: "Choose strategy + budget. Agent deployment requires one wallet signature." },
              { n: "04", icon: <RefreshCw className="w-5 h-5" />,   title: "Agent Monitors",  body: "Polls pool every block. Pays 0.05 USDC via x402 when Claude Opus 4 analysis is needed." },
              { n: "05", icon: <ShieldCheck className="w-5 h-5" />, title: "You Sign",        body: "Review proposal in Monitor. Approve or reject. Your signature, your control." },
            ].map(({ n, icon, title, body }, i) => (
              <div key={n} className="flex flex-col items-center text-center gap-3">
                {/* Step circle */}
                <div className="relative">
                  <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center
                    ${i === 4 ? "border-primary/40 bg-primary/10 text-primary glow-green-sm" : "border-white/[0.10] bg-white/[0.03] text-white/50"}`}>
                    {icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#080808] border border-white/[0.10] flex items-center justify-center">
                    <span className="font-mono text-[9px] text-white/30">{n}</span>
                  </div>
                </div>
                <div className="font-bold text-sm">{title}</div>
                <p className="text-[11px] text-white/30 leading-relaxed font-mono max-w-[160px]">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {[
            { label: "→ CLI Guide",    href: "/cli" },
            { label: "→ Setup Agent",  href: "/agent/setup" },
            { label: "→ Browse Pools", href: "/pools" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}>
              <span className="font-mono text-xs text-primary/60 hover:text-primary border border-primary/20 hover:border-primary/40 rounded-lg px-4 py-2 transition-all cursor-pointer">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-24 border-t border-white/[0.05]">
        <div className="text-center mb-12">
          <SectionChip label="FAQ" />
          <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: "clamp(36px,6vw,72px)" }}>
            COMMON<br /><span className="text-primary">QUESTIONS</span>
          </h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-2">
          {FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className={`rounded-xl border transition-all duration-200 ${open ? "border-primary/20 bg-primary/[0.04]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"}`}>
                <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpenFaq(open ? null : i)}>
                  <span className="text-sm font-bold leading-snug">{faq.q}</span>
                  {open ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/25 shrink-0" />}
                </button>
                {open && <div className="px-5 pb-5"><p className="text-sm text-white/45 leading-relaxed">{faq.a}</p></div>}
              </div>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <a href="https://docs.glidepool.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-primary/60 hover:text-primary border border-primary/20 hover:border-primary/40 rounded-lg px-4 py-2 transition-all">
            Full Docs <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ECOSYSTEM
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 px-4 sm:px-6 py-10 border-t border-white/[0.05]">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <span className="shrink-0 text-[10px] font-mono text-white/20 uppercase tracking-widest">Built with</span>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2">
            {["Base", "Maverick V2", "x402", "RainbowKit", "OpenAI", "viem", "Drizzle ORM"].map((l) => (
              <span key={l} className="font-mono text-[11px] text-white/20">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="-mx-4 sm:-mx-6 border-t border-primary/20 overflow-hidden relative"
        style={{ background: "radial-gradient(ellipse 100% 200% at 50% 150%, rgba(0,245,100,0.13) 0%, rgba(0,245,100,0.05) 40%, transparent 70%)" }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(0,245,100,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,100,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-[600px] h-[300px] opacity-30" style={{ background: "radial-gradient(ellipse at center, rgba(0,245,100,0.25) 0%, transparent 70%)", filter: "blur(40px)", animation: "orb-drift-c 18s ease-in-out infinite" }} />
        <div className="relative px-4 sm:px-6 py-20 sm:py-28 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] text-primary/70 tracking-widest uppercase">Agent ready to deploy</span>
          </div>
          <h2 className="font-black uppercase tracking-tighter leading-[0.9] max-w-3xl" style={{ fontSize: "clamp(36px,7vw,88px)", textShadow: "0 0 80px rgba(0,245,100,0.2)" }}>
            DEPLOY YOUR<br /><span className="text-primary">FIRST AGENT</span><br />TODAY
          </h2>
          <p className="text-sm text-white/40 max-w-md leading-relaxed">
            Connect your Base wallet, pick a Maverick V2 pool, and deploy an autonomous DLMM agent in under 2 minutes.
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
            {[["GitHub","https://github.com/glidepool"],["Docs","https://docs.glidepool.com"],["Whitepaper","https://docs.glidepool.com/whitepaper"],["Roadmap","https://github.com/glidepool/roadmap"]].map(([l,h]) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-[11px] text-white/25 hover:text-white/60 transition-colors">
                {l} <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
