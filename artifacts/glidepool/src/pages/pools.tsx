import { useListPools, getListPoolsQueryKey } from "@workspace/api-client-react";
import { formatUsd, formatPercent, truncateAddress } from "@/lib/format";
import { Link } from "wouter";
import { ArrowRight, Search, Layers } from "lucide-react";
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-400">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Chain Layer</div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Maverick V2 Pools</h1>
          <p className="font-mono text-[10px] text-white/35 mt-0.5">DLMM liquidity pools on Base Mainnet.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input
            placeholder="Search pools…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-black/40 border border-white/[0.10] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Pool grid */}
      {isLoading ? (
        <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 animate-pulse space-y-3 border-b sm:border-b-0 sm:border-r border-white/[0.10] last:border-r-0">
              <div className="h-2.5 bg-white/[0.05] w-1/3" />
              <div className="h-6 bg-white/[0.05] w-1/2" />
              <div className="h-2 bg-white/[0.05] w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {filtered && filtered.length > 0 ? (
            <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0">
              {filtered.map((pool, idx) => (
                <Link key={pool.poolAddress} href={`/pools/${pool.poolAddress}`}>
                  <div
                    className={[
                      "p-5 cursor-pointer group hover:bg-white/[0.02] transition-all duration-200 h-full flex flex-col gap-4",
                      "animate-in fade-in slide-in-from-bottom-2",
                      /* right border on non-last in each row */
                      "border-b lg:border-b-0 border-white/[0.10]",
                      "sm:border-r border-white/[0.10]",
                      idx % 2 === 1 ? "sm:border-r-0" : "",
                      idx % 3 === 2 ? "lg:border-r-0" : "",
                    ].join(" ")}
                    style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                  >
                    {/* Token pair + fee */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          <div className="w-6 h-6 border border-white/[0.12] bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white/60 z-10">
                            {pool.tokenASymbol[0]}
                          </div>
                          <div className="w-6 h-6 border border-white/[0.12] bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white/60">
                            {pool.tokenBSymbol[0]}
                          </div>
                        </div>
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">
                          {pool.tokenASymbol}/{pool.tokenBSymbol}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-white/30 border border-white/[0.08] px-2 py-0.5 group-hover:border-primary/20 group-hover:text-primary/60 transition-all">
                        {formatPercent(pool.feeRate || 0)}
                      </span>
                    </div>

                    {/* TVL */}
                    <div className="flex-1">
                      <span className="text-xl font-mono font-bold text-white/90">{formatUsd(pool.tvlUsd)}</span>
                      <span className="block font-mono text-[9px] text-white/20 uppercase tracking-widest mt-0.5">TVL</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.06]">
                      <div>
                        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-0.5">Price</span>
                        <span className="font-mono text-xs text-white/60">
                          {pool.currentPrice ? pool.currentPrice.toFixed(4) : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-0.5">Active Tick</span>
                        <span className="font-mono text-xs text-white/60">{pool.activeTick ?? "—"}</span>
                      </div>
                    </div>

                    {/* Address + arrow */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-white/15">{truncateAddress(pool.poolAddress)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-5 text-center border border-dashed border-white/[0.08]">
              <div className="w-12 h-12 border border-white/[0.10] flex items-center justify-center">
                <Layers className="w-5 h-5 text-white/20" />
              </div>
              <p className="font-mono text-sm text-white/25">No pools matching "{search}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
