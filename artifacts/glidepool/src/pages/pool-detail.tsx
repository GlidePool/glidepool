import { useGetPool, getGetPoolQueryKey } from "@workspace/api-client-react";
import { formatCrypto, formatUsd, truncateAddress } from "@/lib/format";
import { useParams, Link } from "wouter";
import { ArrowLeft, BarChart3, Settings2, Bot, Zap, AlertTriangle, ExternalLink } from "lucide-react";

const BIN_MODES = [
  { code: "01", label: "Static", icon: "-", badge: "border-white/[0.10] text-white/40",     desc: "Concentrated liquidity that does not move with price." },
  { code: "02", label: "Right",  icon: "→", badge: "border-primary/20 text-primary",         desc: "Follows price moving up. Best for bullish bias." },
  { code: "04", label: "Left",   icon: "←", badge: "border-amber-500/20 text-amber-400",     desc: "Follows price moving down. Best for bearish bias." },
  { code: "08", label: "Both",   icon: "↔", badge: "border-blue-500/20 text-blue-400",       desc: "Follows price both directions. Maximum fees, highest IL." },
];

export default function PoolDetail() {
  const params = useParams();
  const poolAddress = params.poolAddress || "";

  const { data: pool, isLoading } = useGetPool(poolAddress, {
    query: { enabled: !!poolAddress, queryKey: getGetPoolQueryKey(poolAddress) },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-3 bg-white/[0.05] w-20" />
        <div className="h-7 bg-white/[0.05] w-48" />
        {/* Stat cards skeleton - responsive: 1 col mobile, 3 col sm+ */}
        <div className="border border-white/[0.07] grid grid-cols-1 sm:grid-cols-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/[0.02] border-b sm:border-b-0 sm:border-r border-white/[0.07] last:border-b-0 last:border-r-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-56 border border-white/[0.07] bg-white/[0.02]" />)}
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center gap-4">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">404</div>
        <h2 className="text-xl font-bold">Pool not found</h2>
        <Link href="/pools">
          <button className="font-mono text-[10px] text-primary/70 hover:text-primary border border-primary/20 px-4 py-2 transition-colors">
            ← Back to Pools
          </button>
        </Link>
      </div>
    );
  }

  const feeRatePct = ((Number(pool.feeAIn || 0) / 1e18) * 100).toFixed(4);
  const currentPriceNum = Number(pool.currentPrice ?? 0);
  const tvlNum = currentPriceNum > 0
    ? Number(pool.reserveA || 0) / 1e18 * currentPriceNum + Number(pool.reserveB || 0) / 1e6
    : 0;
  const isEmpty = tvlNum === 0 && Number(pool.binCounter ?? "0") === 0;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-400">

      {/* Breadcrumb */}
      <Link href="/pools">
        <button className="flex items-center gap-1.5 font-mono text-[10px] text-white/30 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Pools
        </button>
      </Link>

      {/* Empty pool warning */}
      {isEmpty && (
        <div className="flex items-start gap-3 border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-400/70 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-amber-400/80 mb-0.5">Pool has no liquidity yet</div>
            <p className="font-mono text-[10px] text-white/35 leading-relaxed">
              TVL $0 and bin count 0 — this pool is empty on-chain. An agent can still be deployed, but no rebalance actions will trigger until reserves and a valid TWA price exist.
              You can still run the AI Advisor to analyze current pool conditions.
            </p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-stretch justify-between gap-0 border border-white/[0.10]">
        <div className="p-5 flex flex-col justify-center flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono text-[9px] text-primary/60 border border-primary/20 px-2 py-0.5 bg-primary/[0.04] shrink-0">
              Maverick V2
            </span>
            <span className="font-mono text-[10px] text-white/20 truncate">{truncateAddress(poolAddress)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {pool.tokenASymbol}
            <span className="text-white/20 mx-2">/</span>
            {pool.tokenBSymbol}
          </h1>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-white/[0.10] px-6 py-5 flex flex-col justify-center sm:min-w-[200px]">
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Current Price</div>
          <div className="text-2xl font-mono font-bold text-primary">
            {pool.currentPrice?.toFixed(6) ?? "-"}
            <span className="text-sm text-white/25 ml-1.5 font-normal">{pool.tokenBSymbol}</span>
          </div>
        </div>
      </div>

      {/* Stat cards - overflow-hidden trick: each cell has border-r + border-b, container clips outer edges */}
      <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-3 overflow-hidden">
        {[
          { label: "TVL",         value: tvlNum > 0.01 ? formatUsd(tvlNum) : "$0.00", note: "Reserves from chain" },
          { label: "Fee Rate",    value: `${feeRatePct}%`,                             note: `Tick spacing: ${pool.tickSpacing ?? "-"}` },
          { label: "Active Tick", value: pool.activeTick?.toString() ?? "-",           note: `Bin counter: ${pool.binCounter ?? 0}` },
        ].map(({ label, value, note }, i) => (
          <div key={label} className={[
            "p-5",
            /* right border on all but last; bottom border on all but last on mobile */
            i < 2 ? "border-b sm:border-b-0 sm:border-r border-white/[0.10]" : "",
          ].join(" ")}>
            <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">{label}</div>
            <div className="text-xl font-mono font-bold">{value}</div>
            {note && <div className="font-mono text-[9px] text-white/20 mt-1">{note}</div>}
          </div>
        ))}
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Reserves */}
        <div className="border border-white/[0.10]">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.10]">
            <BarChart3 className="w-4 h-4 text-primary/60" />
            <span className="font-bold text-sm">Pool Reserves</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              { sym: pool.tokenASymbol, amt: pool.reserveA },
              { sym: pool.tokenBSymbol, amt: pool.reserveB },
            ].map(({ sym, amt }) => (
              <div key={sym}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-mono text-white/40">{sym}</span>
                  <span className="font-mono text-white/70">{formatCrypto(amt)}</span>
                </div>
                <div className="h-1 bg-white/[0.05] overflow-hidden">
                  <div className="h-full bg-primary/50" style={{ width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mx-5 mb-5 pt-4 border-t border-white/[0.06]">
            {[
              { label: "Bin Count", value: pool.binCounter },
              { label: "Last TWA",  value: pool.lastTwaD8 },
              { label: "Fee A→B",   value: `${(Number(pool.feeAIn || 0) / 1e18 * 100).toFixed(4)}%` },
              { label: "Fee B→A",   value: `${(Number(pool.feeBIn || 0) / 1e18 * 100).toFixed(4)}%` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-0.5">{label}</div>
                <div className="font-mono text-xs text-white/60">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bin modes */}
        <div className="border border-white/[0.10]">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.10]">
            <Settings2 className="w-4 h-4 text-primary/60" />
            <span className="font-bold text-sm">Bin Movement Modes</span>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {BIN_MODES.map((m) => (
              <div key={m.code} className="flex items-start gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                <div className={`shrink-0 px-2.5 py-1 border font-mono text-xs flex items-center gap-1 ${m.badge}`}>
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[9px] text-white/20 mb-0.5">Mode {m.code}</div>
                  <div className="font-mono text-[10px] text-white/40 leading-relaxed">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Bar ── */}
      <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-3 overflow-hidden">
        {/* AI Advisor */}
        <Link href={`/advisor?pool=${poolAddress}`} className="sm:col-span-2">
          <div className="group flex items-center gap-4 p-5 border-b sm:border-b-0 sm:border-r border-white/[0.10] bg-primary/[0.03] hover:bg-primary/[0.07] transition-all cursor-pointer h-full">
            <div className="w-10 h-10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:border-primary/60 transition-colors">
              <Bot className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white/85 group-hover:text-white transition-colors mb-0.5">
                Ask AI Advisor
              </div>
              <p className="font-mono text-[10px] text-white/30 leading-relaxed">
                Analyze this pool with Claude Opus 4 — get an action recommendation, risk level, and optimal bin range.
              </p>
            </div>
            <div className="text-primary/40 group-hover:text-primary/80 transition-colors shrink-0">
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Deploy Agent */}
        <Link href={`/agent/setup`}>
          <div className="group flex items-center gap-4 p-5 hover:bg-white/[0.03] transition-all cursor-pointer h-full">
            <div className="w-10 h-10 border border-white/[0.12] flex items-center justify-center shrink-0 group-hover:border-amber-500/30 transition-colors">
              <Zap className="w-5 h-5 text-white/30 group-hover:text-amber-400/70 transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white/60 group-hover:text-white/85 transition-colors mb-0.5">
                Deploy Agent
              </div>
              <p className="font-mono text-[10px] text-white/20 leading-relaxed">
                Deploy an automated agent to monitor and rebalance this pool on a schedule.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Pool address footer */}
      <div className="flex items-center gap-2 pb-2">
        <span className="font-mono text-[9px] text-white/15">Pool contract:</span>
        <a
          href={`https://basescan.org/address/${poolAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[9px] text-white/25 hover:text-primary/60 transition-colors flex items-center gap-1"
        >
          {poolAddress}
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
