import { useListPools, getListPoolsQueryKey } from "@workspace/api-client-react";
import { formatUsd, formatPercent, truncateAddress } from "@/lib/format";
import { Link } from "wouter";
import {
  ArrowRight, Bot, Shield, Zap, ChevronDown, ChevronUp,
  TrendingUp, BarChart2, Lock, Cpu, Users, Globe,
  ArrowUpRight,
} from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

/* ── tiny mock spark bars ───────────────────────────────────── */
function SparkBars({ seed = 0, positive = true }: { seed?: number; positive?: boolean }) {
  const bars = Array.from({ length: 8 }, (_, i) => {
    const h = 20 + ((seed * 37 + i * 13 + i * i * 7) % 60);
    return h;
  });
  const color = positive ? "bg-primary" : "bg-red-500";
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((h, i) => (
        <div key={i} className={`w-1 rounded-sm ${color} opacity-70`} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

/* ── FAQ item ──────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-white/[0.06] rounded-xl overflow-hidden cursor-pointer hover:border-primary/20 transition-colors"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <span className="text-sm font-semibold text-white/80">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />}
      </div>
      {open && (
        <div className="px-6 pb-5 text-sm text-white/40 leading-relaxed border-t border-white/[0.04]">
          {a}
        </div>
      )}
    </div>
  );
}

/* ── Stats ─────────────────────────────────────────────────── */
const STATS = [
  { label: "Active Users", value: "12K+" },
  { label: "Pools Supported", value: "24" },
  { label: "Max Fee Saved", value: "<0.05%" },
  { label: "TVL Analyzed", value: "$2.4M" },
];

/* ── Benefits ──────────────────────────────────────────────── */
const BENEFITS = [
  { icon: Cpu,      title: "AI-Powered Analysis",    desc: "GPT reads on-chain pool state, tick depth, and your position bins to generate surgical recommendations tailored to your risk profile." },
  { icon: Lock,     title: "Fully Non-Custodial",    desc: "GlidePool never holds funds or signs transactions. Every action is previewed before it reaches your wallet — you stay in control." },
  { icon: Zap,      title: "Real-Time On-Chain Data", desc: "Pulls live state directly from Maverick V2 contracts on Base mainnet via viem — no stale oracles, no middleware lag." },
  { icon: BarChart2,title: "Bin-Level Precision",    desc: "See exactly which bin IDs hold your liquidity, their value, and the recommended bin range for your next rebalance." },
  { icon: Globe,    title: "Base Mainnet Native",    desc: "Built exclusively on Base — fast finality, low gas, and native USDC for x402 micropayment gating on premium advisor calls." },
  { icon: Users,    title: "For Serious LPs",         desc: "Designed for DeFi power users who want more than a dashboard — actionable recommendations backed by transparent reasoning." },
];

/* ── Guide steps ────────────────────────────────────────────── */
const STEPS = [
  { n: "01", title: "Verify Your Wallet",   desc: "Connect any EVM wallet (MetaMask, Coinbase, WalletConnect). GlidePool reads your on-chain NFT positions automatically." },
  { n: "02", title: "Select a Pool",         desc: "Browse supported Maverick V2 pools on Base. Filter by TVL, fee rate, or search by token symbol." },
  { n: "03", title: "Get Your AI Advice",   desc: "Describe your goal — GlidePool returns a risk-rated recommendation with the optimal bin range, mode, and action." },
];

/* ── FAQ data ─────────────────────────────────────────────── */
const FAQS = [
  {
    q: "What is Maverick V2 and why does it need an advisor?",
    a: "Maverick V2 is a next-gen DLMM (Dynamic Liquidity Market Maker) on Base that lets LPs place liquidity in directional bins. Unlike Uniswap V3, positions can automatically follow price — but choosing the wrong bin mode or range leads to severe impermanent loss. GlidePool's AI reads the on-chain state and tells you exactly what to do.",
  },
  {
    q: "Does GlidePool ever have access to my funds?",
    a: "Never. GlidePool is a read-and-advise layer. It reads on-chain data and generates recommendations, but all transactions are constructed locally and must be signed by your own wallet. We cannot move your funds under any circumstances.",
  },
  {
    q: "What is the x402 micropayment for the AI Advisor?",
    a: "Premium advisor calls are gated by a small USDC payment (typically $0.05) on Base using the x402 protocol — a machine-readable HTTP payment standard. This keeps the service sustainable without subscriptions. You approve each payment from your wallet before the analysis runs.",
  },
  {
    q: "Which wallets are supported?",
    a: "Any EVM wallet via WalletConnect, plus MetaMask, Coinbase Wallet, and Rainbow out of the box. More connectors are available through the wallet modal.",
  },
  {
    q: "How often should I rebalance?",
    a: "It depends on your bin mode and market volatility. Static bins may need rebalancing weekly; directional (Right/Left/Both) bins often auto-follow price. GlidePool will flag when your position is out of range or significantly imbalanced.",
  },
  {
    q: "Is the AI advice guaranteed to be profitable?",
    a: "No. GlidePool's recommendations are based on on-chain data and LLM reasoning — they are advisory only. DeFi LP management carries inherent risk including impermanent loss. Always review recommendations critically and do your own research.",
  },
];

/* ═══════════════════════════════════════════════════════════ */
export default function Landing() {
  const { isConnected } = useAccount();
  const { data: pools, isLoading } = useListPools({ query: { queryKey: getListPoolsQueryKey() } });

  return (
    <div className="flex flex-col">

      {/* ══ HERO — full-bleed cinematic ═══════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Multi-layer overlay for depth and text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        {/* Subtle vignette on sides */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-6 max-w-5xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/8 backdrop-blur-sm text-primary font-mono text-[11px] tracking-widest mb-8 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Maverick V2 · AI Advisor · Base Mainnet
          </div>

          {/* Headline — editorial scale */}
          <h1 className="font-black tracking-tighter leading-[0.9] mb-6"
            style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)" }}>
            <span className="text-white drop-shadow-[0_2px_32px_rgba(0,0,0,0.8)]">The Smartest Way</span>
            <br />
            <span className="text-white drop-shadow-[0_2px_32px_rgba(0,0,0,0.8)]">to Manage </span>
            <span className="text-gradient-green drop-shadow-[0_0_40px_rgba(0,245,100,0.4)]">Liquidity.</span>
          </h1>

          <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed mb-10 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            AI-driven rebalancing advice for Maverick V2 concentrated liquidity —
            non-custodial, on-chain, and ready in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!isConnected ? (
              <>
                <ConnectButton />
                <Link href="/pools">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-white/20 text-white/70 hover:border-primary/35 hover:text-white backdrop-blur-sm transition-all">
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
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border border-white/20 text-white/70 hover:border-primary/35 hover:text-white backdrop-blur-sm transition-all">
                    My Positions <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </>
            )}
          </div>

          <p className="mt-5 text-[11px] text-white/30 font-mono tracking-wider">
            Non-custodial · No sign-up · Base Mainnet
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ══ STATS TICKER ══════════════════════════════════════ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
          {STATS.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center justify-center py-8 px-4 text-center gap-1">
              <span className="text-3xl md:text-4xl font-black text-primary font-mono">{value}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ POOL TABLE ════════════════════════════════════════ */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="bracket-label mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                Popular Pools
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Buy Your Own<br />
                <span className="text-gradient-green">Liquidity Position</span>
              </h2>
            </div>
            <Link href="/pools">
              <button className="text-[10px] font-mono text-primary/60 hover:text-primary border border-primary/15 rounded px-3 py-1.5 hover:border-primary/30 transition-all">
                Show all →
              </button>
            </Link>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3.5 border-b border-white/[0.06]">
              {["Assets", "TVL", "Fee Rate", "Active Tick", ""].map((h) => (
                <div key={h} className="text-[10px] text-white/25 uppercase tracking-widest font-mono">{h}</div>
              ))}
            </div>

            {isLoading ? (
              <div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-white/[0.04] animate-pulse">
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
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer group items-center last:border-0">
                        {/* Asset */}
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 shrink-0">
                            <div className="absolute inset-0 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                              {pool.tokenASymbol[0]}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center font-bold text-[9px] text-white/60">
                              {pool.tokenBSymbol[0]}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-sm group-hover:text-primary transition-colors">
                              {pool.tokenASymbol} · {pool.tokenBSymbol}
                            </div>
                            <div className="font-mono text-[10px] text-white/20">{truncateAddress(pool.poolAddress)}</div>
                          </div>
                        </div>

                        {/* TVL */}
                        <div className="font-mono text-sm text-white/70">{formatUsd(pool.tvlUsd)}</div>

                        {/* Fee Rate */}
                        <div className={`font-mono text-sm font-semibold ${positive ? "text-primary" : "text-red-400"}`}>
                          {formatPercent(pool.feeRate || 0)}
                        </div>

                        {/* Spark chart */}
                        <div>
                          <SparkBars seed={idx * 31 + 7} positive={positive} />
                        </div>

                        {/* Action */}
                        <div>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:glow-green-sm transition-all">
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

      {/* ══ ABOUT / GUIDE ════════════════════════════════════ */}
      <section className="px-6 py-24 border-t border-white/[0.05] bg-white/[0.012]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: About */}
            <div>
              <div className="bracket-label mb-3">About GlidePool</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-6">
                Explore{" "}
                <span className="text-gradient-green">Endless Possibilities</span>{" "}
                With These Easy Steps
              </h2>
              <p className="text-white/35 text-sm leading-relaxed mb-5">
                GlidePool is the first non-custodial AI advisor purpose-built for Maverick V2 DLMM
                concentrated liquidity positions on Base mainnet. We combine live on-chain data with
                GPT-powered reasoning to give you actionable, risk-rated recommendations — not just
                charts.
              </p>
              <p className="text-white/25 text-sm leading-relaxed">
                All analysis is transparent. Every recommendation includes the full reasoning chain
                so you can understand the "why" — not just the "what". And because GlidePool is
                fully non-custodial, you stay in complete control of your assets at all times.
              </p>
            </div>

            {/* Right: Steps */}
            <div className="space-y-4">
              {STEPS.map(({ n, title, desc }) => (
                <div key={n} className="flex gap-5 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/15 transition-colors group">
                  <div className="shrink-0 w-10 h-10 rounded-xl border border-primary/25 bg-primary/5 flex items-center justify-center font-mono font-black text-primary text-xs group-hover:bg-primary/10 transition-colors">
                    {n}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white/85 mb-1.5">{title}</div>
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
        </div>
      </section>

      {/* ══ BENEFITS ════════════════════════════════════════ */}
      <section className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="bracket-label mb-3 justify-center flex">Advantages</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
              Reliable LP Management
            </h2>
            <p className="text-white/30 text-sm max-w-md mx-auto leading-relaxed">
              GlidePool has a variety of features that make it the best place to start managing your Maverick V2 positions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title}
                className="relative group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/20 hover:bg-white/[0.04] transition-all overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-primary/[0.04] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/[0.09] transition-colors" />
                <div className="w-9 h-9 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                  <Icon className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-bold text-sm text-white/85 mb-2">{title}</h3>
                <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════ */}
      <section className="px-6 py-24 border-t border-white/[0.05] bg-white/[0.012]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="bracket-label mb-3 justify-center flex">FAQ</div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-white/25 text-sm">
              Everything you need to know about GlidePool and Maverick V2 LP management.
            </p>
          </div>
          <div className="space-y-2">
            {FAQS.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FOOTER ═════════════════════════════════════ */}
      <section
        className="relative px-6 py-28 border-t border-white/[0.05] text-center overflow-hidden"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 60%",
        }}
      >
        <div className="absolute inset-0 bg-black/75 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,245,100,0.08) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="bracket-label mb-4 justify-center flex">Ready to start?</div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-5">
            Ready to become<br />
            <span className="text-gradient-green">a smarter LP?</span>
          </h2>
          <p className="text-white/35 text-sm mb-9 leading-relaxed">
            Connect your wallet and let GlidePool analyze your Maverick V2 positions.
            No subscription. No custody. Just better decisions.
          </p>
          {!isConnected ? (
            <ConnectButton />
          ) : (
            <Link href="/advisor">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground glow-green hover:glow-green-lg transition-all">
                <Bot className="w-5 h-5" /> Open AI Advisor
              </button>
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
