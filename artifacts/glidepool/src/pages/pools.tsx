import { useListPools, getListPoolsQueryKey } from "@workspace/api-client-react";
import { formatUsd, formatPercent, truncateAddress } from "@/lib/format";
import { Link } from "wouter";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

export default function Pools() {
  const { data: pools, isLoading } = useListPools({
    query: { queryKey: getListPoolsQueryKey() },
  });
  const [search, setSearch] = useState("");

  const filtered = pools?.filter(
    (p) =>
      p.tokenASymbol.toLowerCase().includes(search.toLowerCase()) ||
      p.tokenBSymbol.toLowerCase().includes(search.toLowerCase()) ||
      p.poolAddress.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="bracket-label mb-1">[02] Pool Explorer</div>
          <h1 className="text-3xl font-black tracking-tight">Maverick V2 Pools</h1>
          <p className="text-white/30 text-sm mt-1">Discover and analyze supported liquidity pools on Base.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input
            placeholder="Search pools..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Pool grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
              <div className="h-8 bg-white/5 rounded w-1/2 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((pool, idx) => (
            <Link key={pool.poolAddress} href={`/pools/${pool.poolAddress}`}>
              <div
                className="glass-card rounded-xl p-6 cursor-pointer group hover:glass-card-hover transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 h-full"
                style={{ animationDelay: `${idx * 40}ms`, fillMode: "both" }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white/60">
                      {pool.tokenASymbol[0]}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white/60 -ml-2">
                      {pool.tokenBSymbol[0]}
                    </div>
                    <span className="font-bold text-sm group-hover:text-primary transition-colors ml-1">
                      {pool.tokenASymbol}/{pool.tokenBSymbol}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-white/30 border border-white/[0.06] rounded px-2 py-0.5 group-hover:border-primary/20 group-hover:text-primary/60 transition-all">
                    {formatPercent(pool.feeRate || 0)}
                  </span>
                </div>

                {/* TVL */}
                <div className="mb-5">
                  <span className="text-2xl font-mono font-bold text-white/90">{formatUsd(pool.tvlUsd)}</span>
                  <span className="block text-[10px] text-white/20 uppercase tracking-widest font-mono mt-0.5">Total Value Locked</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.05]">
                  <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider font-mono block mb-1">Price</span>
                    <span className="font-mono text-xs text-white/60">
                      {pool.currentPrice ? pool.currentPrice.toFixed(4) : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-wider font-mono block mb-1">Active Tick</span>
                    <span className="font-mono text-xs text-white/60">{pool.activeTick ?? "—"}</span>
                  </div>
                </div>

                {/* Address + arrow */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/15">{truncateAddress(pool.poolAddress)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
          {filtered?.length === 0 && (
            <div className="col-span-full py-16 text-center text-white/25 font-mono text-sm">
              No pools found matching "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
