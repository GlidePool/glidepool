import { useRoute, Link } from "wouter";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useGetPositionDetail,
  getGetPositionDetailQueryKey,
  useGetAdvice,
  getGetAdviceQueryKey,
  useComputeRemoveParams,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatUsd, formatCrypto, truncateAddress } from "@/lib/format";
import {
  ArrowLeft,
  Bot,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  Wallet,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const RISK_COLORS: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-red-500/15 text-red-400 border-red-500/30",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  hold: <Minus className="w-4 h-4" />,
  rebalance: <TrendingUp className="w-4 h-4" />,
  withdraw: <TrendingDown className="w-4 h-4" />,
  add_liquidity: <TrendingUp className="w-4 h-4" />,
  switch_mode: <ChevronRight className="w-4 h-4" />,
};

const BIN_MODE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Static", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  2: { label: "Right", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  4: { label: "Left", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  8: { label: "Both", color: "bg-primary/20 text-primary border-primary/30" },
};

export default function PositionDetail() {
  const [, params] = useRoute("/positions/:nftId");
  const nftId = params?.nftId ?? "";
  const { address, isConnected } = useAccount();
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [removePercent, setRemovePercent] = useState(50);
  const [txPreview, setTxPreview] = useState<{ binIds: string[]; amounts: string[]; estimatedTokenA: string; estimatedTokenB: string } | null>(null);

  const { data: position, isLoading } = useGetPositionDetail(
    address ?? "",
    nftId,
    {
      query: {
        enabled: !!address && !!nftId,
        queryKey: getGetPositionDetailQueryKey(address ?? "", nftId),
      },
    }
  );

  const { data: advice, isLoading: adviceLoading, refetch: fetchAdvice } = useGetAdvice(
    { poolAddress: position?.poolAddress ?? "", nftId, userAddress: address },
    {
      query: {
        enabled: false,
        queryKey: getGetAdviceQueryKey({ poolAddress: position?.poolAddress ?? "", nftId }),
      },
    }
  );

  const removeParamsMutation = useComputeRemoveParams();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
        <Wallet className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Connect Wallet</h1>
        <p className="text-muted-foreground">Connect your wallet to view position details.</p>
        <ConnectButton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="h-8 w-48 bg-muted/40 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-card-border">
              <CardContent className="p-6 space-y-3">
                <div className="h-5 bg-muted/40 rounded w-1/3 animate-pulse" />
                <div className="h-8 bg-muted/40 rounded w-2/3 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-bold">Position not found</h2>
        <p className="text-muted-foreground">NFT #{nftId} was not found for your address.</p>
        <Link href="/positions">
          <Button variant="outline">Back to Positions</Button>
        </Link>
      </div>
    );
  }

  const handleGetAdvice = async () => {
    setAdvisorOpen(true);
    await fetchAdvice();
  };

  const handlePreviewRemove = () => {
    if (!position || !address) return;
    removeParamsMutation.mutate(
      {
        data: {
          nftId: position.nftId,
          userAddress: address,
          poolAddress: position.poolAddress,
          withdrawPercent: removePercent,
        },
      },
      {
        onSuccess: (data) => {
          setTxPreview(data);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Link href="/positions">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Positions
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-sm">NFT #{position.nftId}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {position.tokenASymbol}-{position.tokenBSymbol}
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            {truncateAddress(position.poolAddress)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card border border-card-border rounded-lg px-5 py-2.5 text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Position Value</div>
            <div className="text-2xl font-mono font-bold text-primary">{formatUsd(position.valueUsd)}</div>
          </div>
          <Button
            onClick={handleGetAdvice}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.35)] transition-all"
          >
            <Bot className="w-4 h-4" />
            Get AI Advice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: position.tokenASymbol, value: formatCrypto(position.amountA, 6), sub: "Amount A" },
          { label: position.tokenBSymbol, value: formatCrypto(position.amountB, 6), sub: "Amount B" },
          { label: "Active Bins", value: position.binIds.length.toString(), sub: "Liquidity bins" },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="bg-card border-card-border">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{sub}</p>
              <p className="text-2xl font-mono font-bold">{value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pool State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Active Tick", value: position.poolState.activeTick },
              { label: "Current Price", value: position.poolState.currentPrice?.toFixed(6) ?? "—" },
              { label: "Tick Spacing", value: position.poolState.tickSpacing },
              { label: "Bin Counter", value: position.poolState.binCounter },
              { label: "Fee A→B", value: `${(Number(position.poolState.feeAIn) / 1e18 * 100).toFixed(4)}%` },
              { label: "Fee B→A", value: `${(Number(position.poolState.feeBIn) / 1e18 * 100).toFixed(4)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active Bin IDs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {position.binIds.map((id) => (
                <Badge key={id} variant="outline" className="font-mono text-xs bg-muted/30 border-border/50">
                  {id}
                </Badge>
              ))}
              {position.binIds.length === 0 && (
                <p className="text-muted-foreground text-sm">No active bins</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {advisorOpen && (
        <Card className="bg-card border-card-border border-primary/20 shadow-[0_0_30px_rgba(0,255,255,0.08)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle>AI Recommendation</CardTitle>
              {adviceLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            {adviceLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-muted/40 rounded w-3/4" />
                <div className="h-4 bg-muted/40 rounded w-1/2" />
                <div className="h-4 bg-muted/40 rounded w-2/3" />
              </div>
            ) : advice && "summary" in advice ? (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`${RISK_COLORS[advice.riskLevel]} border font-semibold px-3 py-1`}>
                    {advice.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 border-border/50">
                    {ACTION_ICONS[advice.recommendation.action]}
                    {advice.recommendation.action.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                  {advice.recommendation.suggestedMode && (
                    <Badge
                      className={`${BIN_MODE_LABELS[[1, 2, 4, 8].find(k => ["static","right","left","both"][Math.log2(k)] === advice.recommendation.suggestedMode) ?? 8]?.color ?? ""} border`}
                    >
                      {advice.recommendation.suggestedMode} mode
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Summary</p>
                  <p className="text-sm leading-relaxed">{advice.summary}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Reasoning</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{advice.recommendation.reasoning}</p>
                </div>

                {advice.recommendation.suggestedBinRange && (
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/40">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Suggested Bin Range</p>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground">Lower Tick</p>
                        <p className="font-mono font-bold">{advice.recommendation.suggestedBinRange.lowerTick}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Upper Tick</p>
                        <p className="font-mono font-bold">{advice.recommendation.suggestedBinRange.upperTick}</p>
                      </div>
                    </div>
                  </div>
                )}

                {advice.recommendation.suggestedWithdrawPercent > 0 && (
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/40 space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Suggested Withdraw: {advice.recommendation.suggestedWithdrawPercent}%
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={removePercent}
                        onChange={(e) => setRemovePercent(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="font-mono text-sm w-10 text-right">{removePercent}%</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviewRemove}
                      disabled={removeParamsMutation.isPending}
                      className="gap-2"
                    >
                      {removeParamsMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Preview Transaction
                    </Button>

                    {txPreview && (
                      <div className="bg-background/50 rounded p-3 border border-border/30 text-xs font-mono space-y-1">
                        <p className="text-muted-foreground">Transaction Preview</p>
                        <p>Est. {position.tokenASymbol}: {formatCrypto(txPreview.estimatedTokenA, 6)}</p>
                        <p>Est. {position.tokenBSymbol}: {formatCrypto(txPreview.estimatedTokenB, 6)}</p>
                        <p className="text-muted-foreground mt-2">Bins: {txPreview.binIds.length}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Review parameters above, then sign with your wallet. GlidePool never holds your funds.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">Failed to load recommendation. Please try again.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bin Movement Modes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(BIN_MODE_LABELS).map(([kind, { label, color }]) => (
              <div key={kind} className={`rounded-lg p-3 border text-center ${color}`}>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs opacity-70 mt-0.5">Kind {kind}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
