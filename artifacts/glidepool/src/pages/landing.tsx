import { useListPools, getListPoolsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd, formatPercent } from "@/lib/format";
import { Link } from "wouter";
import { Layers, Activity, ArrowRight, Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Landing() {
  const { isConnected } = useAccount();
  const { data: pools, isLoading } = useListPools({
    query: { queryKey: getListPoolsQueryKey() }
  });

  return (
    <div className="flex flex-col gap-12 pb-12 animate-in fade-in duration-700">
      <section className="flex flex-col items-center justify-center text-center py-20 gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4">
          <Activity className="w-4 h-4" />
          <span>Maverick V2 AI Advisor</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
          Precision LP Management.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          GlidePool analyzes market conditions and your Maverick V2 positions to provide surgical, AI-driven rebalancing advice.
        </p>
        
        <div className="mt-8">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-4">
              <ConnectButton />
              <p className="text-sm text-muted-foreground">Connect your wallet to analyze your positions</p>
            </div>
          ) : (
            <Link href="/positions">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-md font-medium text-lg inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                <Wallet className="w-5 h-5" />
                Analyze My Positions
              </button>
            </Link>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Supported Pools
          </h2>
          <Link href="/pools">
            <span className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
              View All <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-card border-card-border overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-muted/50 rounded w-1/3 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-8 bg-muted/50 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-muted/50 rounded w-1/4 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pools?.slice(0, 3).map((pool, idx) => (
              <Link key={pool.poolAddress} href={`/pools/${pool.poolAddress}`}>
                <Card className="bg-card border-card-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] h-full">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {pool.tokenASymbol}-{pool.tokenBSymbol}
                    </CardTitle>
                    <Badge variant="outline" className="font-mono bg-muted/50">{formatPercent(pool.feeRate || 0)} Fee</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <span className="text-3xl font-mono tracking-tight">{formatUsd(pool.tvlUsd)}</span>
                      <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">TVL</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
