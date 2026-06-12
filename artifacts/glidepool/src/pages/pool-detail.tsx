import { useGetPool, getGetPoolQueryKey } from "@workspace/api-client-react";
import { formatUsd, formatPercent, truncateAddress, formatCrypto } from "@/lib/format";
import { useParams, Link } from "wouter";
import { ArrowLeft, ArrowRight, ArrowDown, Activity, BarChart3, Settings2 } from "lucide-react";

const BIN_MODES = [
  {
    code: "01", label: "Static", badge: "bg-white/5 text-white/40 border-white/10",
    icon: "—",
    desc: "Standard concentrated liquidity that does not move with price.",
  },
  {
    code: "02", label: "Right", badge: "bg-primary/10 text-primary border-primary/20",
    icon: "→",
    desc: "Liquidity follows price moving up. Best for bullish bias.",
  },
  {
    code: "04", label: "Left", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: "←",
    desc: "Liquidity follows price moving down. Best for bearish bias.",
  },
  {
    code: "08", label: "Both", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: "↔",
    desc: "Follows price in both directions. Maximum fee capture, highest IL.",
  },
];

export default function PoolDetail() {
  const params = useParams();
  const poolAddress = params.poolAddress || "";

  const { data: pool, isLoading } = useGetPool(poolAddress, {
    query: { enabled: !!poolAddress, queryKey: getGetPoolQueryKey(poolAddress) },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-24 mb-2" />
        <div className="h-10 bg-white/5 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white/5 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-xl" />
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <span className="font-mono text-white/20 text-sm">404</span>
        <h2 className="text-xl font-bold">Pool not found</h2>
        <Link href="/pools">
          <button className="mt-2 text-xs font-mono text-primary/70 hover:text-primary border border-primary/20 rounded px-4 py-2 transition-colors">
            ← Back to Pools
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <div>
        <Link href="/pools">
          <button className="flex items-center gap-1.5 text-xs font-mono text-white/30 hover:text-white/70 transition-colors mb-5">
            <ArrowLeft className="w-3 h-3" /> [02] Pools
          </button>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-primary/60 border border-primary/20 rounded px-2 py-0.5 bg-primary/5">
                Maverick V2
              </span>
              <span className="font-mono text-[10px] text-white/20">{truncateAddress(poolAddress)}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {pool.tokenASymbol}
              <span className="text-white/15 mx-2.5">/</span>
              {pool.tokenBSymbol}
            </h1>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-1">Current Price</div>
            <div className="text-3xl font-mono font-bold text-primary">
              {pool.currentPrice?.toFixed(6) ?? "—"}
              <span className="text-base text-white/25 ml-2">{pool.tokenBSymbol}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Value Locked", value: formatUsd(pool.tvlUsd || 0) },
          { label: "Fee Rate", value: formatPercent(pool.feeRate || 0) },
          { label: "Active Tick", value: pool.activeTick?.toString() ?? "—", sub: `Spacing: ${pool.tickSpacing}` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="glass-card rounded-xl p-6">
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-2">{label}</div>
            <div className="text-3xl font-mono font-bold">{value}</div>
            {sub && <div className="text-xs text-white/25 mt-1 font-mono">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reserves */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-primary/60" />
            <span className="text-sm font-bold">Pool Reserves</span>
          </div>
          <div className="space-y-5">
            {[
              { sym: pool.tokenASymbol, amt: pool.reserveA },
              { sym: pool.tokenBSymbol, amt: pool.reserveB },
            ].map(({ sym, amt }) => (
              <div key={sym}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/50">{sym}</span>
                  <span className="font-mono text-white/70">{formatCrypto(amt)}</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: "50%" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/[0.05]">
            {[
              { label: "Bin Count", value: pool.binCounter },
              { label: "Last TWA", value: pool.lastTwaD8 },
              { label: "Fee A→B", value: `${(Number(pool.feeAIn || 0) / 1e18 * 100).toFixed(4)}%` },
              { label: "Fee B→A", value: `${(Number(pool.feeBIn || 0) / 1e18 * 100).toFixed(4)}%` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[10px] text-white/20 uppercase tracking-wider font-mono mb-0.5">{label}</div>
                <div className="font-mono text-xs text-white/60">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bin modes */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings2 className="w-4 h-4 text-primary/60" />
            <span className="text-sm font-bold">Bin Movement Modes</span>
          </div>
          <div className="space-y-3">
            {BIN_MODES.map((m) => (
              <div key={m.code}
                className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.08] transition-colors">
                <div className={`shrink-0 px-2.5 py-1 rounded border font-mono text-xs ${m.badge} flex items-center gap-1`}>
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <div>
                  <div className="text-xs font-mono text-white/20 mb-1">Mode {m.code}</div>
                  <div className="text-xs text-white/40">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
