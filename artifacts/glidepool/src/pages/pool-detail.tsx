import { useGetPool, getGetPoolQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd, formatPercent, truncateAddress, formatCrypto } from "@/lib/format";
import { useParams, Link } from "wouter";
import { Layers, ArrowLeft, ArrowRight, ArrowDown, Activity, Settings2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoolDetail() {
  const params = useParams();
  const poolAddress = params.poolAddress || "";
  
  const { data: pool, isLoading } = useGetPool(poolAddress, {
    query: { enabled: !!poolAddress, queryKey: getGetPoolQueryKey(poolAddress) }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted/50 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted/50 rounded"></div>
          <div className="h-32 bg-muted/50 rounded"></div>
          <div className="h-32 bg-muted/50 rounded"></div>
        </div>
        <div className="h-64 bg-muted/50 rounded"></div>
      </div>
    );
  }

  if (!pool) return <div className="text-center py-12">Pool not found</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <Link href="/pools">
          <span className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer mb-4 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Pools
          </span>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20">Maverick V2</Badge>
              <span className="font-mono text-xs text-muted-foreground">{poolAddress}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              {pool.tokenASymbol}-{pool.tokenBSymbol}
            </h1>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Current Price</div>
            <div className="text-3xl font-mono tracking-tight text-primary">
              {pool.currentPrice?.toFixed(6)} <span className="text-lg text-muted-foreground">{pool.tokenBSymbol}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Total Value Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono">{formatUsd(pool.tvlUsd || 0)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Fee Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono">{formatPercent(pool.feeRate || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
              <span>Token A: {formatPercent((parseFloat(pool.feeAIn || "0") / 1e18))}</span>
              <span>Token B: {formatPercent((parseFloat(pool.feeBIn || "0") / 1e18))}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Active Tick</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono">{pool.activeTick}</div>
            <div className="text-xs text-muted-foreground mt-1">Spacing: {pool.tickSpacing}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Pool Reserves
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{pool.tokenASymbol} Reserve</span>
                <span className="font-mono">{formatCrypto(pool.reserveA)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '50%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{pool.tokenBSymbol} Reserve</span>
                <span className="font-mono">{formatCrypto(pool.reserveB)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: '50%' }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Bin Count</span>
                <span className="font-mono">{pool.binCounter}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Last TWA</span>
                <span className="font-mono">{pool.lastTwaD8}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Supported Bin Modes
            </CardTitle>
            <CardDescription>Maverick V2 directional liquidity modes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg border border-border/50 bg-muted/20">
                <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-500/50 w-20 justify-center">Static</Badge>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Mode 1</div>
                  <div className="text-muted-foreground">Standard concentrated liquidity that does not move with price.</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg border border-border/50 bg-muted/20">
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 w-20 justify-center gap-1">
                  Right <ArrowRight className="w-3 h-3" />
                </Badge>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Mode 2</div>
                  <div className="text-muted-foreground">Liquidity follows price moving up (right). Good for bullish bias.</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg border border-border/50 bg-muted/20">
                <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50 w-20 justify-center gap-1">
                  Left <ArrowLeft className="w-3 h-3" />
                </Badge>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Mode 4</div>
                  <div className="text-muted-foreground">Liquidity follows price moving down (left). Good for bearish bias.</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg border border-border/50 bg-muted/20">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50 w-20 justify-center gap-1">
                  Both <Activity className="w-3 h-3" />
                </Badge>
                <div className="text-sm">
                  <div className="font-semibold mb-1">Mode 8</div>
                  <div className="text-muted-foreground">Liquidity follows price in both directions. Highest fee potential, highest IL risk.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
