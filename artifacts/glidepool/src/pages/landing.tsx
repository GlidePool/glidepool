import { useListPools, getListPoolsQueryKey } from "@workspace/api-client-react";
import { formatUsd, formatPercent, truncateAddress } from "@/lib/format";
import { Link } from "wouter";
import {
  ArrowRight, Bot, Zap, ChevronDown, ChevronUp,
  BarChart2, Lock, Cpu, Users, Globe,
} from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

/* ── Spark bars ──────────────────────────────────────────── */
function SparkBars({ seed = 0, positive = true }: { seed?: number; positive?: boolean }) {
  const bars = Array.from({ length: 8 }, (_, i) => 20 + ((seed * 37 + i * 13 + i * i * 7) % 60));
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((h, i) => (
        <div key={i}
          className={`w-1 rounded-sm ${positive ? "bg-primary" : "bg-red-500"} opacity-60`}
          style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

/* ── FAQ ─────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden cursor-pointer hover:border-white/[0.12] transition-colors"
      onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <span className="text-sm text-white/70">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/20 shrink-0" />}
      </div>
      {open && (
        <div className="px-6 pb-5 text-sm text-white/35 leading-relaxed border-t border-white/[0.04]">{a}</div>
      )}
    </div>
  );
}

const STATS = [
  { label: "Active Users", value: "12K+" },
  { label: "Pools Supported", value: "24" },
  { label: "Max Fee Saved", value: "<0.05%" },
  { label: "TVL Analyzed", value: "$2.4M" },
];

const BENEFITS = [
  { icon: Cpu,      title: "AI-Powered Analysis",     desc: "GPT reads on-chain pool state, tick depth, and your position bins to generate surgical recommendations tailored to your risk profile." },
  { icon: Lock,     title: "Fully Non-Custodial",     desc: "GlidePool never holds funds or signs transactions. Every action is previewed before it reaches your wallet — you stay in control." },
  { icon: Zap,      title: "Real-Time On-Chain Data", desc: "Pulls live state directly from Maverick V2 contracts on Base mainnet via viem — no stale oracles, no middleware lag." },
  { icon: BarChart2,title: "Bin-Level Precision",     desc: "See exactly which bin IDs hold your liquidity, their value, and the recommended bin range for your next rebalance." },
  { icon: Globe,    title: "Base Mainnet Native",     desc: "Built exclusively on Base — fast finality, low gas, and native USDC for x402 micropayment gating on premium advisor calls." },
  { icon: Users,    title: "For Serious LPs",          desc: "Designed for DeFi power users who want more than a dashboard — actionable recommendations backed by transparent reasoning." },
];

const STEPS = [
  { n: "01", title: "Connect Your Wallet",  desc: "Connect any EVM wallet. GlidePool reads your on-chain Maverick V2 NFT positions automatically — no setup required." },
  { n: "02", title: "Select a Pool",        desc: "Browse supported Maverick V2 pools on Base. See live TVL, fee rate, and current price from the chain." },
  { n: "03", title: "Get AI Advice",        desc: "Describe your goal. GlidePool returns a risk-rated recommendation with the optimal bin range and action." },
];

const FAQS = [
  { q: "What is Maverick V2 and why does it need an advisor?",
    a: "Maverick V2 is a next-gen DLMM on Base that lets LPs place liquidity in directional bins. Choosing the wrong bin mode or range leads to severe impermanent loss. GlidePool's AI reads the on-chain state and tells you exactly what to do." },
  { q: "Does GlidePool ever have access to my funds?",
    a: "Never. GlidePool is a read-and-advise layer. All transactions are constructed locally and must be signed by your own wallet. We cannot move your funds under any circumstances." },
  { q: "What is the x402 micropayment?",
    a: "Premium advisor calls are gated by a small USDC payment (typically $0.05) on Base via the x402 protocol. You approve each payment from your wallet before the analysis runs." },
  { q: "Which wallets are supported?",
    a: "Any EVM wallet via WalletConnect, plus MetaMask, Coinbase Wallet, and Rainbow out of the box." },
  { q: "How often should I rebalance?",
    a: "Depends on your bin mode and volatility. Static bins may need weekly rebalancing; directional bins often auto-follow price. GlidePool flags when your position is out of range." },
  { q: "Is the AI advice guaranteed to be profitable?",
    a: "No. Recommendations are advisory only. DeFi LP management carries inherent risk including impermanent loss. Always review critically and do your own research." },
];

/* ═══════════════════════════════════════════════════════════ */
export default function Landing() {
  const { isConnected } = useAccount();
  const { data: pools, isLoading } = useListPools({ query: { queryKey: getListPoolsQueryKey() } });
  const sparkSeeds = [14, 38, 77, 22, 91, 56, 43, 8];

  return (
    <div className="flex flex-col">

      {/* ══ HERO — editorial glass layout ═══════════════════════ */}
      <section className="relative min-h-screen overflow-hidden bg-black">

        {/* Background image */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "url('/hero-bg.png')", backgroundSize: "cover", backgroundPosition: "center 25%" }} />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/92 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-black/65 pointer-events-none" />

        {/* SVG architectural grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100"
          fill="none" preserveAspectRatio="none">
          <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="rgba(255,255,255,0.05)" vectorEffect="non-scaling-stroke" strokeWidth="1" />
          <line x1="0" y1="66.7" x2="100" y2="66.7" stroke="rgba(255,255,255,0.04)" vectorEffect="non-scaling-stroke" strokeWidth="1" />
          <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="rgba(255,255,255,0.04)" vectorEffect="non-scaling-stroke" strokeWidth="1" />
          <line x1="66.7" y1="0" x2="66.7" y2="100" stroke="rgba(255,255,255,0.04)" vectorEffect="non-scaling-stroke" strokeWidth="1" />
          <circle cx="50" cy="50" r="22" stroke="rgba(255,255,255,0.05)" vectorEffect="non-scaling-stroke" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="15" stroke="rgba(255,255,255,0.035)" vectorEffect="non-scaling-stroke" strokeWidth="1" fill="none" />
        </svg>

        {/* ── Corner stars ── */}
        {[["top-5 left-5","top-5 right-5"],["bottom-5 left-5","bottom-5 right-5"]].flat().map((pos) => (
          <span key={pos} className={`absolute ${pos} text-white/20 text-base select-none`}>✦</span>
        ))}

        {/* ── Top metadata row ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-10 pt-20 pointer-events-none">
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-0.5">Network:</div>
            <div className="text-[11px] font-bold text-white/70 tracking-wide uppercase">Base Mainnet</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-0.5">Protocol:</div>
            <div className="text-[11px] font-bold text-white/70 tracking-wide uppercase">Maverick V2</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-0.5">Advisor:</div>
            <div className="text-[11px] font-bold text-white/70 tracking-wide uppercase">AI-Powered</div>
          </div>
        </div>

        {/* ── Left glass panel (pool analytics) ── */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
          <div className="w-52 rounded-2xl border border-white/[0.10] bg-white/[0.06] backdrop-blur-md p-4 space-y-3">
            <div>
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">Pool Analytics</div>
              <div className="space-y-2">
                {[
                  { k: "TVL Analyzed", v: "$2.4M", green: true },
                  { k: "Supported Pools", v: "24", green: false },
                  { k: "Active Users", v: "12K+", green: false },
                ].map(({ k, v, green }) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[10px] text-white/35">{k}</span>
                    <span className={`text-[10px] font-mono font-bold ${green ? "text-primary" : "text-white/60"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="text-[9px] font-mono text-white/20 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                Live · Base Mainnet
              </div>
              <div className="flex items-end gap-0.5 h-6">
                {sparkSeeds.map((s, i) => (
                  <div key={i} className="w-full bg-primary/60 rounded-sm" style={{ height: `${30 + (s % 70)}%` }} />
                ))}
              </div>
            </div>
            {pools && pools.length > 0 && (
              <div className="pt-1 border-t border-white/[0.06] space-y-1.5">
                {pools.slice(0, 2).map((p) => (
                  <div key={p.poolAddress} className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40">{p.tokenASymbol}/{p.tokenBSymbol}</span>
                    <span className="text-[10px] font-mono text-white/25">{formatUsd(p.tvlUsd)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Center light layers (behind content) ── */}

        {/* Breathing radial glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full animate-hero-breathe"
            style={{ background: "radial-gradient(circle, rgba(0,245,100,0.13) 0%, rgba(0,200,80,0.05) 40%, transparent 70%)" }} />
        </div>

        {/* Vertical light beam shaft – logo → ground */}
        <div className="absolute pointer-events-none animate-beam"
          style={{
            top: "38%", left: "50%",
            transform: "translateX(-50%)",
            width: "2px",
            height: "28%",
            background: "linear-gradient(to bottom, rgba(0,245,100,0.55) 0%, rgba(0,245,100,0.10) 70%, transparent 100%)",
            filter: "blur(3px)"
          }} />

        {/* Wide light cone from logo downwards */}
        <div className="absolute pointer-events-none animate-beam"
          style={{
            top: "39%", left: "50%",
            transform: "translateX(-50%)",
            width: "140px",
            height: "30%",
            background: "linear-gradient(to bottom, rgba(0,245,100,0.10) 0%, rgba(0,245,100,0.04) 60%, transparent 100%)",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            animationDelay: "0.3s"
          }} />

        {/* Ground shadow ellipse – stage spotlight effect */}
        <div className="absolute bottom-[14%] pointer-events-none animate-ground-pulse"
          style={{
            left: "50%",
            width: "340px",
            height: "48px",
            background: "radial-gradient(ellipse at 50% 50%, rgba(0,245,100,0.22) 0%, rgba(0,245,100,0.06) 55%, transparent 100%)",
            filter: "blur(10px)",
          }} />

        {/* Floating light particles */}
        {[
          { x: "44%", bot: "22%", sz: 5, delay: "0s",   dur: "3.6s" },
          { x: "50%", bot: "20%", sz: 6, delay: "0.8s", dur: "4.2s" },
          { x: "53%", bot: "25%", sz: 4, delay: "1.5s", dur: "3.1s" },
          { x: "48%", bot: "18%", sz: 5, delay: "2.2s", dur: "4.8s" },
          { x: "51%", bot: "23%", sz: 7, delay: "0.4s", dur: "3.9s" },
          { x: "46%", bot: "26%", sz: 4, delay: "1.9s", dur: "4.0s" },
          { x: "55%", bot: "21%", sz: 6, delay: "1.1s", dur: "3.4s" },
          { x: "47%", bot: "19%", sz: 5, delay: "2.8s", dur: "4.5s" },
          { x: "52%", bot: "24%", sz: 4, delay: "3.3s", dur: "3.7s" },
          { x: "43%", bot: "27%", sz: 6, delay: "0.6s", dur: "4.3s" },
        ].map(({ x, bot, sz, delay, dur }, i) => (
          <div key={i} className="absolute pointer-events-none rounded-full z-10"
            style={{
              left: x,
              bottom: bot,
              width: `${sz}px`,
              height: `${sz}px`,
              background: "rgba(0,245,100,1)",
              boxShadow: `0 0 ${sz * 3}px ${sz}px rgba(0,245,100,0.7), 0 0 ${sz * 6}px ${sz * 2}px rgba(0,245,100,0.3)`,
              animation: `particle-rise ${dur} ease-out infinite`,
              animationDelay: delay,
            }} />
        ))}

        {/* ── Center content ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-6">
          {/* Logo mark with rotating arc + breathing glow */}
          <div className="relative mb-5">
            {/* Outer breathing glow ring */}
            <div className="absolute -inset-6 rounded-full animate-logo-breathe pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(0,245,100,0.20) 0%, transparent 70%)" }} />
            {/* Spinning arc */}
            <div className="absolute -inset-3 rounded-full animate-logo-spin pointer-events-none"
              style={{
                background: "conic-gradient(transparent 0deg, transparent 200deg, rgba(0,245,100,0.55) 290deg, rgba(0,245,100,0.9) 350deg, transparent 360deg)",
              }} />
            {/* Second slower arc (opposite direction) */}
            <div className="absolute -inset-2 rounded-full pointer-events-none"
              style={{
                background: "conic-gradient(transparent 0deg, rgba(0,245,100,0.3) 60deg, transparent 120deg, transparent 360deg)",
                animation: "logo-ring-spin 9s linear infinite reverse",
              }} />
            {/* Logo circle */}
            <div className="relative w-16 h-16 rounded-full border border-primary/40 bg-black/40 backdrop-blur-sm flex items-center justify-center glow-green-sm">
              <img src="/logo.png" alt="GlidePool" className="w-11 h-11 object-contain" />
            </div>
          </div>

          {/* Brand name */}
          <h1 className="font-black uppercase text-white mb-2"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)", letterSpacing: "0.16em",
              textShadow: "0 0 60px rgba(0,245,100,0.25), 0 2px 30px rgba(0,0,0,0.8)" }}>
            GlidePool
          </h1>

          {/* Tagline */}
          <p className="font-mono text-[11px] text-white/40 tracking-[0.25em] uppercase mb-8">
            AI Advisor for Maverick V2 Liquidity
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!isConnected ? (
              <>
                <ConnectButton />
                <Link href="/pools">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-white/15 text-white/55 hover:border-primary/35 hover:text-white/90 backdrop-blur-sm transition-all">
                    Explore Pools <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/advisor">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-primary text-primary-foreground glow-green hover:glow-green-lg transition-all">
                    <Bot className="w-4 h-4" /> Open AI Advisor
                  </button>
                </Link>
                <Link href="/positions">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-white/15 text-white/55 hover:border-primary/35 hover:text-white/90 backdrop-blur-sm transition-all">
                    My Positions <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </>
            )}
          </div>

          <p className="mt-5 text-[10px] font-mono text-white/20 tracking-widest">
            Non-custodial · No sign-up · Base Mainnet
          </p>
        </div>

        {/* ── Right glass panels ── */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3">
          {/* AI Status */}
          <div className="w-48 rounded-xl border border-white/[0.10] bg-white/[0.06] backdrop-blur-md p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">AI Advisor</div>
              <div className="text-xs font-bold text-primary flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Ready
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="w-48 rounded-xl border border-white/[0.10] bg-white/[0.06] backdrop-blur-md p-3.5">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1.5">Network</div>
            <div className="text-xs font-semibold text-white/80">Base Mainnet</div>
            <div className="text-[10px] font-mono text-white/30 mt-0.5">Maverick V2 · USDC</div>
          </div>

          {/* Micropayment */}
          <div className="w-48 rounded-xl border border-white/[0.10] bg-white/[0.06] backdrop-blur-md p-3.5">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1.5">Access Model</div>
            <div className="text-xs font-semibold text-white/80">x402 Micropayment</div>
            <div className="text-[10px] font-mono text-white/30 mt-0.5">~$0.05 USDC / query</div>
          </div>
        </div>

        {/* ── Bottom labels ── */}
        <div className="absolute bottom-8 left-10 z-20">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.10] bg-white/[0.05] backdrop-blur-sm text-[10px] font-mono text-white/40">
            glidepool.xyz
          </span>
        </div>
        <div className="absolute bottom-8 right-10 z-20 text-right hidden md:block">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed">
            Smarter Liquidity.<br />Better Returns.
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.05]">
          {STATS.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center justify-center py-8 px-4 text-center gap-1.5">
              <span className="text-3xl font-bold text-primary font-mono">{value}</span>
              <span className="text-[10px] text-white/25 uppercase tracking-widest font-mono">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ ABOUT / PROTOCOL LOG ═══════════════════════════════ */}
      <section className="relative border-y border-primary/20 bg-black overflow-hidden">

        {/* CRT scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.18]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, transparent 1px, transparent 3px)" }} />

        {/* Top header bar */}
        <div className="relative z-20 border-b border-primary/20 px-5 py-2.5 flex items-center justify-between bg-primary/[0.04]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-primary font-bold text-sm shrink-0">+</span>
            <span className="font-mono text-[10px] text-primary/50 tracking-widest shrink-0 hidden sm:block">BASE_EPOCH_2025</span>
            {/* Hazard stripes */}
            <div className="flex gap-px shrink-0">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="w-1.5 h-3.5" style={{ background: i % 2 === 0 ? "rgba(0,245,100,0.75)" : "rgba(0,0,0,0.9)" }} />
              ))}
            </div>
            <span className="font-mono text-[11px] font-bold text-primary tracking-[0.14em] truncate">GLIDEPOOL PROTOCOL LOG</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-3 h-3 rounded-full border border-primary flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          </div>
        </div>

        {/* Main body — 2 columns */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">

          {/* ── LEFT: Pool network SVG ── */}
          <div className="relative border-r border-primary/15 flex flex-col">
            {/* Dithered dot overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle, rgba(0,245,100,0.07) 1px, transparent 1px)", backgroundSize: "7px 7px" }} />

            <div className="relative flex-1 flex items-center justify-center p-6">
              <svg viewBox="0 0 420 300" className="w-full max-w-[440px]"
                style={{ filter: "drop-shadow(0 0 10px rgba(0,245,100,0.25))" }}>
                <defs>
                  <pattern id="aboutGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(0,245,100,0.055)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="420" height="300" fill="url(#aboutGrid)" />

                {/* Connection lines */}
                {[
                  [210,150, 85,72],  [210,150, 340,72],
                  [210,150, 62,188], [210,150, 355,195],
                  [210,150, 148,258],[210,150, 278,258],
                ].map(([x1,y1,x2,y2],i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(0,245,100,0.22)" strokeWidth="1" strokeDasharray="4 3"/>
                ))}

                {/* Hub ring */}
                <circle cx="210" cy="150" r="36" fill="rgba(0,245,100,0.07)" stroke="rgba(0,245,100,0.75)" strokeWidth="1.5"/>
                <circle cx="210" cy="150" r="27" fill="none" stroke="rgba(0,245,100,0.25)" strokeWidth="0.75" strokeDasharray="3 3">
                  <animateTransform attributeName="transform" type="rotate" from="0 210 150" to="360 210 150" dur="18s" repeatCount="indefinite"/>
                </circle>
                <image href="/logo.png" x="178" y="118" width="64" height="64"
                  style={{ filter: "drop-shadow(0 0 6px rgba(0,245,100,0.7))" }} />

                {/* Pool nodes */}
                {[
                  [85,  72, "WETH", "USDC"],
                  [340, 72, "WETH", "cbETH"],
                  [62, 188, "USDC", "cbBTC"],
                  [355,195, "WETH", "DAI"],
                  [148,258, "BASE", "USDC"],
                  [278,258, "cbBTC","USDC"],
                ].map(([cx,cy,a,b],i) => (
                  <g key={i}>
                    <circle cx={cx as number} cy={cy as number} r="22" fill="rgba(0,245,100,0.04)" stroke="rgba(0,245,100,0.38)" strokeWidth="1"/>
                    <text x={cx as number} y={(cy as number)-3} textAnchor="middle" fill="rgba(0,245,100,0.82)" fontFamily="monospace" fontSize="7.5" fontWeight="bold">{a as string}</text>
                    <text x={cx as number} y={(cy as number)+8} textAnchor="middle" fill="rgba(0,245,100,0.45)" fontFamily="monospace" fontSize="7">{b as string}</text>
                  </g>
                ))}

                {/* Animated data packets */}
                {([
                  { path:"M210,150 L85,72",   dur:"2.8s", begin:"0s",   r:3   },
                  { path:"M340,72 L210,150",   dur:"3.5s", begin:"1.1s", r:2.5 },
                  { path:"M210,150 L62,188",   dur:"4.1s", begin:"0.4s", r:2   },
                  { path:"M355,195 L210,150",  dur:"2.6s", begin:"1.8s", r:2.5 },
                  { path:"M210,150 L148,258",  dur:"3.8s", begin:"0.9s", r:2   },
                  { path:"M278,258 L210,150",  dur:"3.2s", begin:"2.3s", r:2   },
                ] as { path:string; dur:string; begin:string; r:number }[]).map(({ path, dur, begin, r }, i) => (
                  <circle key={i} r={r} fill="rgba(0,245,100,0.95)"
                    style={{ filter: `drop-shadow(0 0 ${r+1}px rgba(0,245,100,0.9))` }}>
                    <animateMotion dur={dur} repeatCount="indefinite" path={path} begin={begin}/>
                  </circle>
                ))}
              </svg>
            </div>

            {/* Bottom stats bar */}
            <div className="border-t border-primary/15 grid grid-cols-3 divide-x divide-primary/10">
              {[
                ["TVL ANALYZED", "$2.4M"],
                ["ACTIVE POOLS", "24"],
                ["USERS SERVED", "12K+"],
              ].map(([label, value]) => (
                <div key={label} className="py-3 px-4 text-center">
                  <div className="font-mono text-[9px] text-primary/40 tracking-widest mb-0.5">{label}</div>
                  <div className="font-mono text-sm font-bold text-primary">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Terminal log ── */}
          <div className="flex flex-col">

            {/* Terminal entries */}
            <div className="flex-1 p-6 font-mono space-y-2 border-b border-primary/10">
              {([
                ["PROTOCOL_ID",    "GLIDEPOOL_V1",              false],
                ["NETWORK",        "BASE_MAINNET  [ID:8453]",   false],
                ["DEX_LAYER",      "MAVERICK_V2_DLMM",          false],
                ["AI_ENGINE",      "GPT-4O — OPENAI",           false],
                ["ACCESS_GATE",    "X402_MICROPAYMENT_USDC",    false],
                ["CUSTODY_MODEL",  "NON_CUSTODIAL",             false],
                ["TX_SIGNING",     "USER_WALLET_ONLY",          true ],
                ["DATA_SOURCE",    "BASE_RPC — LIVE_ONCHAIN",   true ],
              ] as [string,string,boolean][]).map(([key, val, dim]) => (
                <div key={key} className="flex items-start gap-2 text-[11px]">
                  <span className="text-primary/50 shrink-0 mt-px">›</span>
                  <span>
                    <span className="text-primary/40">{key}:</span>{" "}
                    <span className={dim ? "text-primary/55" : "text-primary"}>{val}</span>
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[11px] mt-1 pt-1">
                <span className="text-primary/50">›</span>
                <span className="text-primary animate-cursor font-bold">█</span>
              </div>
            </div>

            {/* Health / integrity bars */}
            <div className="p-5 space-y-3.5 border-b border-primary/10">
              {([
                ["AI RESPONSE QUALITY",    94,  14],
                ["CHAIN DATA FRESHNESS",   99,  14],
                ["PROTOCOL UPTIME",        100, 14],
              ] as [string,number,number][]).map(([label, pct, chars]) => {
                const filled = Math.round(pct / 100 * chars);
                return (
                  <div key={label} className="font-mono text-[10px]">
                    <div className="flex justify-between mb-1">
                      <span className="text-primary/45 tracking-wider">{label}</span>
                      <span className="text-primary font-bold">{pct}%</span>
                    </div>
                    <span className="text-primary/80">{"▓".repeat(filled)}</span>
                    <span className="text-primary/20">{"░".repeat(chars - filled)}</span>
                    <span className="text-primary/20"> · · ·</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom: crosshair + status */}
            <div className="p-5 flex items-center gap-5">
              {/* Rotating crosshair */}
              <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
                <g>
                  <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(0,245,100,0.45)" strokeWidth="1"/>
                  <circle cx="26" cy="26" r="7"  fill="none" stroke="rgba(0,245,100,0.75)" strokeWidth="1.5"/>
                  <circle cx="26" cy="26" r="2"  fill="rgba(0,245,100,1)"/>
                  <line x1="26" y1="2"  x2="26" y2="16" stroke="rgba(0,245,100,0.6)" strokeWidth="1"/>
                  <line x1="26" y1="36" x2="26" y2="50" stroke="rgba(0,245,100,0.6)" strokeWidth="1"/>
                  <line x1="2"  y1="26" x2="16" y2="26" stroke="rgba(0,245,100,0.6)" strokeWidth="1"/>
                  <line x1="36" y1="26" x2="50" y2="26" stroke="rgba(0,245,100,0.6)" strokeWidth="1"/>
                  <line x1="6"  y1="6"  x2="12" y2="6"  stroke="rgba(0,245,100,0.3)" strokeWidth="1"/>
                  <line x1="6"  y1="6"  x2="6"  y2="12" stroke="rgba(0,245,100,0.3)" strokeWidth="1"/>
                  <line x1="46" y1="6"  x2="40" y2="6"  stroke="rgba(0,245,100,0.3)" strokeWidth="1"/>
                  <line x1="46" y1="6"  x2="46" y2="12" stroke="rgba(0,245,100,0.3)" strokeWidth="1"/>
                  <line x1="6"  y1="46" x2="12" y2="46" stroke="rgba(0,245,100,0.3)" strokeWidth="1"/>
                  <line x1="6"  y1="46" x2="6"  y2="40" stroke="rgba(0,245,100,0.3)" strokeWidth="1"/>
                  <line x1="46" y1="46" x2="40" y2="46" stroke="rgba(0,245,100,0.3)" strokeWidth="1"/>
                  <line x1="46" y1="46" x2="46" y2="40" stroke="rgba(0,245,100,0.3)" strokeWidth="1"/>
                  <animateTransform attributeName="transform" type="rotate"
                    from="0 26 26" to="360 26 26" dur="14s" repeatCount="indefinite"/>
                </g>
              </svg>

              <div>
                <div className="font-mono text-[9px] text-primary/38 tracking-widest mb-0.5">TARGETING ENGINE</div>
                <div className="font-mono text-sm font-bold text-primary tracking-wider">ACTIVE</div>
                <div className="font-mono text-[9px] text-primary/32 mt-0.5">MISSION: SMARTER LIQUIDITY</div>
              </div>

              <div className="ml-auto text-right">
                <div className="font-mono text-[8px] text-primary/30 tracking-widest mb-1">SYSTEM STATUS</div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-xs font-bold text-primary">OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom ticker */}
        <div className="relative z-20 border-t border-primary/15 py-2 overflow-hidden bg-primary/[0.03]">
          <div className="animate-marquee font-mono text-[10px] text-primary/45 tracking-widest whitespace-nowrap">
            {(
              "  ›  GLIDEPOOL — AI ADVISOR FOR MAVERICK V2 LIQUIDITY  ·  NON-CUSTODIAL · NO SIGNUP  ·  BASE MAINNET [ID:8453]  ·  X402 MICROPAYMENT ~$0.05 USDC/QUERY  ·  GPT-4O POWERED ANALYSIS  ·  REAL-TIME ONCHAIN DATA  ·  YOUR KEYS · YOUR POSITIONS · YOUR DECISIONS  ›  WHOSE LIQUIDITY IS EVAPORATING BEFORE YOU?  "
            ).repeat(2)}
          </div>
        </div>

      </section>

      {/* ══ POOL TABLE ═══════════════════════════════════════ */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="bracket-label mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Popular Pools
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Explore Active Pools
              </h2>
              <p className="text-white/30 text-sm mt-1.5">Live data from Maverick V2 on Base mainnet.</p>
            </div>
            <Link href="/pools">
              <button className="text-[10px] font-mono text-primary/60 hover:text-primary border border-primary/15 rounded-lg px-3 py-1.5 hover:border-primary/30 transition-all">
                View all →
              </button>
            </Link>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-white/[0.05]">
              {["Assets", "TVL", "Fee Rate", "Volume", ""].map((h) => (
                <div key={h} className="text-[9px] text-white/20 uppercase tracking-widest font-mono">{h}</div>
              ))}
            </div>

            {isLoading ? (
              <div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-white/[0.03] animate-pulse last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                      <div className="h-4 bg-white/5 rounded w-24" />
                    </div>
                    <div className="h-4 bg-white/5 rounded w-16 self-center" />
                    <div className="h-4 bg-white/5 rounded w-12 self-center" />
                    <div className="h-8 bg-white/5 rounded w-20 self-center" />
                    <div className="h-7 bg-white/5 rounded w-16 self-center" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {pools?.map((pool, idx) => {
                  const positive = idx % 3 !== 1;
                  return (
                    <Link key={pool.poolAddress} href={`/pools/${pool.poolAddress}`}>
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors cursor-pointer group items-center last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 shrink-0">
                            <div className="absolute inset-0 rounded-full bg-primary/12 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                              {pool.tokenASymbol[0]}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/[0.07] border border-white/[0.10] flex items-center justify-center font-bold text-[9px] text-white/50">
                              {pool.tokenBSymbol[0]}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white/85 group-hover:text-primary transition-colors">
                              {pool.tokenASymbol} / {pool.tokenBSymbol}
                            </div>
                            <div className="font-mono text-[10px] text-white/20">{truncateAddress(pool.poolAddress)}</div>
                          </div>
                        </div>
                        <div className="font-mono text-sm text-white/60">{formatUsd(pool.tvlUsd)}</div>
                        <div className={`font-mono text-sm font-semibold ${positive ? "text-primary" : "text-red-400"}`}>
                          {formatPercent(pool.feeRate || 0)}
                        </div>
                        <div><SparkBars seed={idx * 31 + 7} positive={positive} /></div>
                        <div>
                          <button className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-primary/8 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all">
                            Analyze
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════ */}
      <section className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="bracket-label mb-3">How it works</div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Three steps to smarter<br />
              <span className="text-gradient-green">liquidity management.</span>
            </h2>
            <p className="text-white/30 text-sm leading-relaxed mb-5">
              GlidePool combines live on-chain Maverick V2 data with GPT-powered reasoning
              to give you actionable, risk-rated recommendations — not just charts.
            </p>
            <p className="text-white/20 text-sm leading-relaxed">
              Fully non-custodial. Every recommendation includes the full reasoning chain
              so you understand the "why", not just the "what".
            </p>
          </div>

          <div className="space-y-3">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="flex gap-5 p-5 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:border-primary/15 transition-colors group">
                <div className="shrink-0 w-9 h-9 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center font-mono font-bold text-primary text-xs group-hover:bg-primary/10 transition-colors">
                  {n}
                </div>
                <div>
                  <div className="font-semibold text-sm text-white/80 mb-1">{title}</div>
                  <div className="text-xs text-white/30 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/advisor">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground glow-green hover:glow-green-lg transition-all">
                  Start Analyzing <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ═════════════════════════════════════════ */}
      <section className="px-6 py-24 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <div className="bracket-label mb-3">Why GlidePool</div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Built for precision.<br />Designed for control.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="group p-6 rounded-xl border border-white/[0.06] bg-white/[0.015] hover:border-primary/15 hover:bg-white/[0.03] transition-all">
                <div className="w-8 h-8 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-sm text-white/80 mb-2">{title}</h3>
                <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════ */}
      <section className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <div className="bracket-label mb-3">FAQ</div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Common questions.
            </h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((item) => <FaqItem key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════ */}
      <section className="relative px-6 py-28 border-t border-white/[0.05] text-center overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: "url('/hero-bg.png')", backgroundSize: "cover", backgroundPosition: "center 55%" }} />
        <div className="absolute inset-0 bg-black/78 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(0,245,100,0.07) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="bracket-label mb-4 justify-center flex">Ready to start</div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Become a smarter LP<br />
            <span className="text-gradient-green">starting today.</span>
          </h2>
          <p className="text-white/30 text-sm mb-8 leading-relaxed">
            No subscription. No custody. Connect your wallet and get your first AI analysis in seconds.
          </p>
          {!isConnected ? (
            <ConnectButton />
          ) : (
            <Link href="/advisor">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground glow-green hover:glow-green-lg transition-all">
                <Bot className="w-5 h-5" /> Open AI Advisor
              </button>
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
