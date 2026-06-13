import { useGetUserPositions, getGetUserPositionsQueryKey } from "@workspace/api-client-react";
import { formatUsd, formatCrypto, truncateAddress } from "@/lib/format";
import { Link } from "wouter";
import { ArrowRight, Wallet2, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Positions() {
  const { address, isConnected } = useAccount();

  const { data: positions, isLoading, error } = useGetUserPositions(address || "", {
    query: { enabled: !!address, queryKey: getGetUserPositionsQueryKey(address || "") },
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-5 text-center px-4">
        <div className="w-14 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
          <Wallet2 className="w-6 h-6 text-white/25" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-1.5">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed">
            Connect to view your Maverick V2 liquidity positions on Base.
          </p>
        </div>
        <ConnectButton />
      </div>
    );
  }

  const totalValue = positions?.reduce((sum, p) => sum + (p.valueUsd || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-400">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">My Positions</h1>
          <p className="text-xs text-white/35 font-mono mt-0.5">Active Maverick V2 liquidity positions on Base.</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 sm:text-right">
          <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-1">Portfolio Value</div>
          <div className="text-xl font-mono font-bold text-primary">{formatUsd(totalValue)}</div>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 animate-pulse space-y-3">
              <div className="h-3 bg-white/[0.05] rounded w-1/3" />
              <div className="h-7 bg-white/[0.05] rounded w-1/2" />
              <div className="h-2.5 bg-white/[0.05] rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">Failed to load positions. Please try again.</p>
        </div>
      ) : !positions || positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-white/[0.06] rounded-xl text-center gap-4 px-4">
          <div className="w-12 h-12 rounded-xl border border-white/[0.07] bg-white/[0.02] flex items-center justify-center">
            <Wallet2 className="w-5 h-5 text-white/20" />
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1">No active positions</h3>
            <p className="text-xs text-white/30 max-w-xs leading-relaxed">You don't have any Maverick V2 positions on Base Mainnet.</p>
          </div>
          <Link href="/pools">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono text-primary border border-primary/25 rounded-lg hover:bg-primary/5 transition-colors">
              Explore Pools <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {positions.map((pos, idx) => (
            <Link key={pos.nftId} href={`/positions/${pos.nftId}`}>
              <div
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 cursor-pointer group hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col"
                style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold text-sm group-hover:text-primary transition-colors">
                      {pos.tokenASymbol}/{pos.tokenBSymbol}
                    </div>
                    <div className="font-mono text-[10px] text-white/20 mt-0.5">NFT #{pos.nftId}</div>
                  </div>
                  <span className="font-mono text-[10px] text-white/25 border border-white/[0.07] rounded px-2 py-0.5">
                    {pos.binCount} bins
                  </span>
                </div>

                {/* Value */}
                <div className="mb-4 flex-1">
                  <span className="text-xl font-mono font-bold">{formatUsd(pos.valueUsd)}</span>
                </div>

                {/* Token breakdown */}
                <div className="space-y-1.5 pt-3 border-t border-white/[0.05]">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30 font-mono">{pos.tokenASymbol}</span>
                    <span className="font-mono text-white/60">{formatCrypto(pos.amountA)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30 font-mono">{pos.tokenBSymbol}</span>
                    <span className="font-mono text-white/60">{formatCrypto(pos.amountB)}</span>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <ArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
