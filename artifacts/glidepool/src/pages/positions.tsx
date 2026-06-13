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
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center px-4">
        <div className="w-14 h-14 border border-white/[0.10] flex items-center justify-center">
          <Wallet2 className="w-6 h-6 text-white/25" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed font-mono">
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
      <div className="flex flex-col sm:flex-row sm:items-stretch justify-between gap-0 border border-white/[0.10]">
        <div className="p-5 flex flex-col justify-center">
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Positions</div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">My Positions</h1>
          <p className="font-mono text-[10px] text-white/35 mt-0.5">Active Maverick V2 liquidity positions on Base.</p>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-white/[0.10] px-6 py-5 flex flex-col justify-center sm:min-w-[200px]">
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">Portfolio Value</div>
          <div className="text-2xl font-mono font-bold text-primary">{formatUsd(totalValue)}</div>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 space-y-3 animate-pulse border-b border-r border-white/[0.10]">
              <div className="h-2.5 bg-white/[0.05] w-1/3" />
              <div className="h-6 bg-white/[0.05] w-1/2" />
              <div className="h-2 bg-white/[0.05] w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/[0.04] text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="font-mono text-sm">Failed to load positions. Please try again.</p>
        </div>
      ) : !positions || positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-white/[0.08] text-center gap-5 px-4">
          <div className="w-12 h-12 border border-white/[0.10] flex items-center justify-center">
            <Wallet2 className="w-5 h-5 text-white/20" />
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1.5">No active positions</h3>
            <p className="font-mono text-[10px] text-white/30 max-w-xs leading-relaxed">You don't have any Maverick V2 positions on Base Mainnet.</p>
          </div>
          <Link href="/pools">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-[10px] text-primary border border-primary/25 hover:bg-primary/[0.04] transition-colors">
              Explore Pools <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      ) : (
        /* overflow-hidden + border-r + border-b per card = clean grid separators */
        <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          {positions.map((pos, idx) => (
            <Link key={pos.nftId} href={`/positions/${pos.nftId}`}>
              <div
                className="p-5 cursor-pointer group hover:bg-white/[0.02] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col gap-4 border-b border-r border-white/[0.10]"
                style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">NFT #{pos.nftId}</div>
                    <div className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                      {pos.tokenASymbol}/{pos.tokenBSymbol}
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-white/25 border border-white/[0.08] px-2 py-0.5 shrink-0">
                    {pos.binCount} bins
                  </span>
                </div>

                {/* Value */}
                <div className="flex-1">
                  <span className="text-xl font-mono font-bold">{formatUsd(pos.valueUsd)}</span>
                </div>

                {/* Token breakdown */}
                <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-white/30">{pos.tokenASymbol}</span>
                    <span className="font-mono text-[10px] text-white/60">{formatCrypto(pos.amountA)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-white/30">{pos.tokenBSymbol}</span>
                    <span className="font-mono text-[10px] text-white/60">{formatCrypto(pos.amountB)}</span>
                  </div>
                </div>

                <div className="flex justify-end">
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
