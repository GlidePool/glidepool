import { useGetUserPositions, getGetUserPositionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd, formatCrypto } from "@/lib/format";
import { Link } from "wouter";
import { PieChart, Wallet, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Positions() {
  const { address, isConnected } = useAccount();
  
  const { data: positions, isLoading, error } = useGetUserPositions(address || "", {
    query: { enabled: !!address, queryKey: getGetUserPositionsQueryKey(address || "") }
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Wallet className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Connect Wallet</h1>
        <p className="text-muted-foreground max-w-md">
          Connect your wallet to view your Maverick V2 liquidity positions and get AI-driven rebalancing advice.
        </p>
        <ConnectButton />
      </div>
    );
  }

  const totalValue = positions?.reduce((sum, pos) => sum + (pos.valueUsd || 0), 0) || 0;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PieChart className="w-8 h-8 text-primary" />
            My Positions
          </h1>
          <p className="text-muted-foreground mt-1">Manage and optimize your active liquidity.</p>
        </div>
        
        <div className="bg-card border border-card-border rounded-lg px-6 py-3 flex flex-col items-end">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Portfolio Value</span>
          <span className="text-2xl font-mono font-bold text-primary">{formatUsd(totalValue)}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      ) : error ? (
        <div className="p-6 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load positions. Please try again later.</p>
        </div>
      ) : !positions || positions.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/30">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No active positions</h3>
          <p className="text-muted-foreground mb-6">You don't have any Maverick V2 positions on this network.</p>
          <Link href="/pools">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-md font-medium text-sm">
              Explore Pools
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positions.map((pos, idx) => (
            <Link key={pos.nftId} href={`/positions/${pos.nftId}`}>
              <Card className="bg-card border-card-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] h-full animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms`, fillMode: 'both' }}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                      {pos.tokenASymbol}-{pos.tokenBSymbol}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground font-mono mt-1">NFT #{pos.nftId}</div>
                  </div>
                  <Badge variant="outline" className="bg-muted/50">{pos.binCount} Bins</Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-3xl font-mono tracking-tight">{formatUsd(pos.valueUsd)}</span>
                    </div>
                    
                    <div className="space-y-2 border-t border-border/50 pt-4 mt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{pos.tokenASymbol}</span>
                        <span className="font-mono">{formatCrypto(pos.amountA)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{pos.tokenBSymbol}</span>
                        <span className="font-mono">{formatCrypto(pos.amountB)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
