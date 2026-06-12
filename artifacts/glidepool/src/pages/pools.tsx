import { useListPools, getListPoolsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatUsd, formatPercent, truncateAddress } from "@/lib/format";
import { Link } from "wouter";
import { Layers, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Pools() {
  const { data: pools, isLoading } = useListPools({
    query: { queryKey: getListPoolsQueryKey() }
  });
  const [search, setSearch] = useState("");

  const filteredPools = pools?.filter(p => 
    p.tokenASymbol.toLowerCase().includes(search.toLowerCase()) || 
    p.tokenBSymbol.toLowerCase().includes(search.toLowerCase()) ||
    p.poolAddress.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="w-8 h-8 text-primary" />
            Pool Explorer
          </h1>
          <p className="text-muted-foreground mt-1">Discover and analyze supported Maverick V2 pools.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search pools..." 
            className="pl-9 bg-card/50 border-card-border focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPools?.map((pool, idx) => (
            <Link key={pool.poolAddress} href={`/pools/${pool.poolAddress}`}>
              <Card className="bg-card border-card-border hover:border-primary/50 transition-all cursor-pointer group hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] h-full animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms`, fillMode: 'both' }}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {pool.tokenASymbol}-{pool.tokenBSymbol}
                  </CardTitle>
                  <Badge variant="outline" className="font-mono bg-muted/50">{formatPercent(pool.feeRate || 0)}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-3xl font-mono tracking-tight">{formatUsd(pool.tvlUsd)}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mt-1">Total Value Locked</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-4 mt-2">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Current Price</span>
                        <span className="font-mono text-sm">{pool.currentPrice ? pool.currentPrice.toFixed(6) : "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Active Tick</span>
                        <span className="font-mono text-sm">{pool.activeTick || "—"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filteredPools?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No pools found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
