import { useGetUserPositions, getGetUserPositionsQueryKey } from "@workspace/api-client-react";
import { formatUsd, formatCrypto, truncateAddress } from "@/lib/format";
import { Link } from "wouter";
import { ArrowRight, Wallet, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Positions() {
  const { address, isConnected } = useAccount();

  const { data: positions, isLoading, error } = useGetUserPositions(address || "", {
    query: { enabled: !!address, queryKey: getGetUserPositionsQueryKey(address || "") },
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center gap-6">
        <div className="w-16 h-16 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
          <Wallet className="w-7 h-7 text-white/25" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Connect your wallet</h1>
        <p className="text-white/30 text-sm max-w-sm">
          Connect to view your Maverick V2 liquidity positions on Base.
        </p>
        <ConnectButton />
      </div>
    );
  }

  const totalValue = positions?.reduce((sum, p) => sum + (p.valueUsd || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="bracket-label mb-2">[03] Positions</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Positions</h1>
          <p className="text-white/30 text-sm mt-1.5">Manage and optimize your active Maverick V2 liquidity.</p>
        </div>

        <div className="glass-card rounded-xl px-6 py-4 text-right">
          <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-1">Total Portfolio Value</div>
          <div className="text-2xl font-mono font-bold text-primary">{formatUsd(totalValue)}</div>
        </div>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
              <div className="h-8 bg-white/5 rounded w-1/2 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Failed to load positions. Please try again later.</p>
        </div>
      ) : !positions || positions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01] text-center gap-4">
          <div className="w-14 h-14 rounded-full border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white/20" />
          </div>
          <h3 className="text-lg font-bold">No active positions</h3>
          <p className="text-white/30 text-sm max-w-xs">You don't have any Maverick V2 positions on Base mainnet.</p>
          <Link href="/pools">
            <button className="mt-2 inline-flex items-center gap-2 px-5 py-2 text-xs font-mono text-primary border border-primary/25 rounded-lg hover:bg-primary/5 transition-colors">
              Explore Pools <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positions.map((pos, idx) => (
            <Link key={pos.nftId} href={`/positions/${pos.nftId}`}>
              <div
                className="glass-card rounded-xl p-6 cursor-pointer group hover:glass-card-hover transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 h-full"
                style={{ animationDelay: `${idx * 40}ms`, fillMode: "both" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="font-bold text-sm group-hover:text-primary transition-colors">
                      {pos.tokenASymbol}/{pos.tokenBSymbol}
                    </div>
                    <div className="font-mono text-[10px] text-white/20 mt-0.5">NFT #{pos.nftId}</div>
                  </div>
                  <span className="font-mono text-[10px] text-white/25 border border-white/[0.06] rounded px-2 py-0.5">
                    {pos.binCount} bins
                  </span>
                </div>

                {/* Value */}
                <div className="mb-5">
                  <span className="text-2xl font-mono font-bold">{formatUsd(pos.valueUsd)}</span>
                </div>

                {/* Token breakdown */}
                <div className="space-y-2 pt-4 border-t border-white/[0.05]">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30">{pos.tokenASymbol}</span>
                    <span className="font-mono text-white/60">{formatCrypto(pos.amountA)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30">{pos.tokenBSymbol}</span>
                    <span className="font-mono text-white/60">{formatCrypto(pos.amountB)}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
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
