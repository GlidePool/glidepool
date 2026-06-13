import { useGetPool, getGetPoolQueryKey } from "@workspace/api-client-react";
import { formatCrypto, truncateAddress } from "@/lib/format";
import { useParams, Link } from "wouter";
import { ArrowLeft, BarChart3, Settings2 } from "lucide-react";

const BIN_MODES = [
  { code: "01", label: "Static", icon: "—", badge: "border-white/[0.10] text-white/40",       desc: "Concentrated liquidity that does not move with price." },
  { code: "02", label: "Right",  icon: "→", badge: "border-primary/20 text-primary",           desc: "Follows price moving up. Best for bullish bias." },
  { code: "04", label: "Left",   icon: "←", badge: "border-amber-500/20 text-amber-400",       desc: "Follows price moving down. Best for bearish bias." },
  { code: "08", label: "Both",   icon: "↔", badge: "border-blue-500/20 text-blue-400",         desc: "Follows price both directions. Maximum fees, highest IL." },
];

function SkeletonCard() {
  return <div className="h-24 rounded-xl border border-white/[0.07] bg-white/[0.02] animate-pulse" />;
}

export default function PoolDetail() {
  const params = useParams();
  const poolAddress = params.poolAddress || "";

  const { data: pool, isLoading } = useGetPool(poolAddress, {
    query: { enabled: !!poolAddress, queryKey: getGetPoolQueryKey(poolAddress) },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-4 bg-white/[0.05] rounded w-20" />
        <div className="h-8 bg-white/[0.05] rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 rounded-xl border border-white/[0.07] bg-white/[0.02] animate-pulse" />
          <div className="h-64 rounded-xl border border-white/[0.07] bg-white/[0.02] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center gap-4">
        <span className="font-mono text-white/20 text-sm">404</span>
        <h2 className="text-xl font-bold">Pool not found</h2>
        <Link href="/pools">
          <button className="text-xs font-mono text-primary/70 hover:text-primary border border-primary/20 rounded-lg px-4 py-2 transition-colors">
            ← Back to Pools
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-400">

      {/* Breadcrumb */}
      <Link href="/pools">
        <button className="flex items-center gap-1.5 text-xs font-mono text-white/30 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Pools
        </button>
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] text-primary/60 border border-primary/20 rounded px-2 py-0.5 bg-primary/5">
              Maverick V2
            </span>
            <span className="font-mono text-[10px] text-white/20">{truncateAddress(poolAddress)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {pool.tokenASymbol}
            <span className="text-white/20 mx-2">/</span>
            {pool.tokenBSymbol}
          </h1>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 sm:text-right shrink-0">
          <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-1">Current Price</div>
          <div className="text-xl font-mono font-bold text-primary">
            {pool.currentPrice?.toFixed(6) ?? "—"}
            <span className="text-sm text-white/25 ml-1.5">{pool.tokenBSymbol}</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "TVL",          value: "—",                                    note: "Live data requires allowlisted pool" },
          { label: "Fee Rate",     value: "—",                                    note: `Tick spacing: ${pool.tickSpacing}` },
          { label: "Active Tick",  value: pool.activeTick?.toString() ?? "—",     note: `Bin counter: ${pool.binCounter}` },
        ].map(({ label, value, note }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-2">{label}</div>
            <div className="text-xl font-mono font-bold">{value}</div>
            {note && <div className="text-[10px] text-white/20 font-mono mt-1">{note}</div>}
          </div>
        ))}
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Reserves */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary/60" />
            <span className="text-sm font-bold">Pool Reserves</span>
          </div>
          <div className="space-y-4">
            {[
              { sym: pool.tokenASymbol, amt: pool.reserveA },
              { sym: pool.tokenBSymbol, amt: pool.reserveB },
            ].map(({ sym, amt }) => (
              <div key={sym}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white/40 font-mono">{sym}</span>
                  <span className="font-mono text-white/70">{formatCrypto(amt)}</span>
                </div>
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50 rounded-full" style={{ width: "50%" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/[0.05]">
            {[
              { label: "Bin Count",  value: pool.binCounter },
              { label: "Last TWA",   value: pool.lastTwaD8 },
              { label: "Fee A→B",    value: `${(Number(pool.feeAIn || 0) / 1e18 * 100).toFixed(4)}%` },
              { label: "Fee B→A",    value: `${(Number(pool.feeBIn || 0) / 1e18 * 100).toFixed(4)}%` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[10px] text-white/20 uppercase tracking-widest font-mono mb-0.5">{label}</div>
                <div className="font-mono text-xs text-white/60">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bin modes */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-primary/60" />
            <span className="text-sm font-bold">Bin Movement Modes</span>
          </div>
          <div className="space-y-2.5">
            {BIN_MODES.map((m) => (
              <div key={m.code}
                className="flex items-start gap-3 p-3 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.09] transition-colors">
                <div className={`shrink-0 px-2.5 py-1 rounded border font-mono text-xs flex items-center gap-1 ${m.badge}`}>
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <div>
                  <div className="text-[10px] text-white/20 font-mono mb-0.5">Mode {m.code}</div>
                  <div className="text-xs text-white/40 leading-relaxed">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
