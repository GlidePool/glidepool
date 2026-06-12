import { useListPools, getListPoolsQueryKey } from "@workspace/api-client-react";
import { formatUsd, formatPercent, truncateAddress } from "@/lib/format";
import { Link } from "wouter";
import { ArrowRight, Bot, Shield, Zap } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const FEATURES = [
  {
    icon: Zap,
    label: "Convenience & Speed",
    desc: "Real-time on-chain data from Maverick V2 pools on Base, surfaced instantly without leaving your browser.",
    code: "01",
  },
  {
    icon: Bot,
    label: "AI Recommendations",
    desc: "GPT-powered analysis of pool conditions and your position to recommend optimal bin ranges and modes.",
    code: "02",
  },
  {
    icon: Shield,
    label: "Non-Custodial",
    desc: "GlidePool never holds funds or signs transactions. Every action requires your wallet signature.",
    code: "03",
  },
];

export default function Landing() {
  const { isConnected } = useAccount();
  const { data: pools, isLoading } = useListPools({
    query: { queryKey: getListPoolsQueryKey() },
  });

  return (
    <div className="flex flex-col gap-0 -mt-8 -mx-6 overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative aurora-bg mesh-grid min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center text-center px-6 pb-12">
        {/* Top floating token labels */}
        <div className="absolute top-10 left-8 hidden lg:flex items-center gap-2 text-white/20 font-mono text-xs border border-white/[0.06] rounded px-3 py-1.5 backdrop-blur-sm">
          <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">₿</div>
          Bitcoin
        </div>
        <div className="absolute top-10 right-8 hidden lg:flex items-center gap-2 text-white/20 font-mono text-xs border border-white/[0.06] rounded px-3 py-1.5 backdrop-blur-sm">
          <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">Ξ</div>
          Ethereum
        </div>
        <div className="absolute top-28 left-4 hidden xl:flex items-center gap-2 text-white/15 font-mono text-xs border border-white/[0.04] rounded px-3 py-1.5 backdrop-blur-sm">
          USDC ●
        </div>
        <div className="absolute top-28 right-4 hidden xl:flex items-center gap-2 text-white/15 font-mono text-xs border border-white/[0.04] rounded px-3 py-1.5 backdrop-blur-sm">
          ◎ cbETH
        </div>

        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none animate-pulse-glow"
          style={{ background: "radial-gradient(ellipse, rgba(0,245,100,0.10) 0%, rgba(0,200,80,0.03) 50%, transparent 70%)" }} />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary font-mono text-xs tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Maverick V2 · AI Advisor · Base Mainnet
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6 max-w-5xl">
          <span className="text-white">Precision LP</span>
          <br />
          <span className="text-gradient-green">Management.</span>
        </h1>

        <p className="relative z-10 text-lg text-white/40 max-w-xl leading-relaxed mb-10">
          GlidePool analyzes market conditions and your Maverick V2 positions to provide surgical,
          AI-driven rebalancing advice — directly in your browser.
        </p>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-3">
              <ConnectButton />
              <p className="text-xs text-white/25 font-mono">Connect your wallet to begin</p>
            </div>
          ) : (
            <>
              <Link href="/positions">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-primary text-primary-foreground glow-green hover:glow-green-lg transition-all">
                  Analyze My Positions
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/advisor">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border border-white/10 text-white/70 hover:border-primary/30 hover:text-white hover:bg-primary/5 transition-all">
                  <Bot className="w-4 h-4" />
                  Open AI Advisor
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Green divider line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 green-line opacity-30" />
      </section>

      {/* ── Feature cards ── */}
      <section className="px-6 py-16 border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] rounded-xl overflow-hidden">
          {FEATURES.map(({ icon: Icon, label, desc, code }) => (
            <div key={code}
              className="relative group p-7 bg-[#080808] hover:bg-white/[0.02] transition-colors cursor-default overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/30 transition-all duration-500" />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded border border-white/[0.08] group-hover:border-primary/30 bg-white/[0.03] flex items-center justify-center transition-all">
                  <Icon className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
                </div>
                <span className="bracket-label">[{code}]</span>
              </div>
              <h3 className="font-bold text-sm text-white/80 group-hover:text-white mb-2 transition-colors">
                {label}
              </h3>
              <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
              <button className="mt-5 flex items-center gap-1 text-white/20 group-hover:text-primary/70 font-mono text-[10px] tracking-wider transition-all">
                EXPLORE <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Supported Pools ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="bracket-label mb-1">[supported pools]</div>
            <h2 className="text-2xl font-bold tracking-tight">Maverick V2 Pool Explorer</h2>
          </div>
          <Link href="/pools">
            <span className="text-xs font-mono text-primary/70 hover:text-primary flex items-center gap-1 cursor-pointer transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
                <div className="h-8 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pools?.slice(0, 3).map((pool) => (
              <Link key={pool.poolAddress} href={`/pools/${pool.poolAddress}`}>
                <div className="glass-card rounded-xl p-6 cursor-pointer group hover:glass-card-hover transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-bold text-base group-hover:text-primary transition-colors">
                      {pool.tokenASymbol}
                      <span className="text-white/30 mx-1">/</span>
                      {pool.tokenBSymbol}
                    </span>
                    <span className="font-mono text-[10px] text-white/25 border border-white/[0.06] rounded px-2 py-0.5">
                      {formatPercent(pool.feeRate || 0)}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-2xl font-mono font-bold text-white/90">{formatUsd(pool.tvlUsd)}</span>
                  </div>
                  <span className="text-[10px] text-white/25 uppercase tracking-widest font-mono">TVL</span>
                  <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="font-mono text-[10px] text-white/20">{truncateAddress(pool.poolAddress)}</span>
                    <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
