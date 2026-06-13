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
            <div className="relative w-16 h-16 rounded-full border border-primary/50 bg-primary/10 backdrop-blur-sm flex items-center justify-center glow-green-sm">
              <span className="font-mono font-black text-2xl text-primary">G</span>
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
