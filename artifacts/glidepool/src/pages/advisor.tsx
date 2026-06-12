import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useListPools,
  getListPoolsQueryKey,
  useGetUserPositions,
  getGetUserPositionsQueryKey,
  useGetAdvice,
  getGetAdviceQueryKey,
  useComputeRemoveParams,
  useComputeAddParams,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatUsd, formatCrypto, truncateAddress } from "@/lib/format";
import {
  Bot,
  AlertCircle,
  Wallet,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Shield,
  CreditCard,
} from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-red-500/15 text-red-400 border-red-500/30",
};

const RISK_ICONS: Record<string, React.ReactNode> = {
  low: <ShieldCheck className="w-5 h-5" />,
  medium: <Shield className="w-5 h-5" />,
  high: <ShieldAlert className="w-5 h-5" />,
};

const ACTION_LABELS: Record<string, string> = {
  hold: "Hold Position",
  rebalance: "Rebalance",
  withdraw: "Withdraw",
  add_liquidity: "Add Liquidity",
  switch_mode: "Switch Mode",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  hold: <Minus className="w-4 h-4" />,
  rebalance: <TrendingUp className="w-4 h-4" />,
  withdraw: <TrendingDown className="w-4 h-4" />,
  add_liquidity: <TrendingUp className="w-4 h-4" />,
  switch_mode: <ChevronRight className="w-4 h-4" />,
};

export default function Advisor() {
  const { address, isConnected } = useAccount();
  const [selectedPool, setSelectedPool] = useState<string>("");
  const [selectedNft, setSelectedNft] = useState<string>("");
  const [userGoal, setUserGoal] = useState("maximize fee income while minimizing impermanent loss");
  const [hasRequested, setHasRequested] = useState(false);

  const { data: pools } = useListPools({ query: { queryKey: getListPoolsQueryKey() } });
  const { data: positions } = useGetUserPositions(address ?? "", {
    query: { enabled: !!address, queryKey: getGetUserPositionsQueryKey(address ?? "") },
  });

  const pool = pools?.find((p) => p.poolAddress === selectedPool);
  const position = positions?.find((p) => p.nftId === selectedNft);

  const {
    data: advice,
    isLoading: adviceLoading,
    refetch: fetchAdvice,
    error: adviceError,
  } = useGetAdvice(
    { poolAddress: selectedPool, nftId: selectedNft || undefined, userGoal },
    {
      query: {
        enabled: false,
        queryKey: getGetAdviceQueryKey({ poolAddress: selectedPool, nftId: selectedNft }),
      },
    }
  );

  const removeParamsMutation = useComputeRemoveParams();
  const [txPreview, setTxPreview] = useState<Record<string, string> | null>(null);

  const handleAnalyze = async () => {
    if (!selectedPool) return;
    setHasRequested(true);
    setTxPreview(null);
    await fetchAdvice();
  };

  const handlePreviewTx = () => {
    if (!advice || !("recommendation" in advice)) return;
    if (advice.recommendation.action === "withdraw" && position && address) {
      removeParamsMutation.mutate(
        {
          data: {
            nftId: position.nftId,
            userAddress: address,
            poolAddress: selectedPool,
            withdrawPercent: advice.recommendation.suggestedWithdrawPercent || 50,
          },
        },
        {
          onSuccess: (data) => {
            setTxPreview({
              type: "remove",
              estimatedTokenA: data.estimatedTokenA,
              estimatedTokenB: data.estimatedTokenB,
              binCount: data.binIds.length.toString(),
            });
          },
        }
      );
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.15)]">
          <Bot className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">AI Advisor</h1>
        <p className="text-muted-foreground max-w-md">
          Connect your wallet to access the GlidePool AI advisor — analyze your positions and get on-chain recommendations.
        </p>
        <ConnectButton />
      </div>
    );
  }

  const isPaymentRequired = adviceError && (adviceError as { status?: number }).status === 402;
  const paymentData = isPaymentRequired ? (adviceError as { data?: { amount?: string; currency?: string; network?: string; recipient?: string } }).data : null;

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Advisor</h1>
          <p className="text-muted-foreground text-sm">Powered by GPT-5 — your on-chain liquidity co-pilot</p>
        </div>
      </div>

      <Card className="bg-card border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configure Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">
              Select Pool
            </label>
            <select
              value={selectedPool}
              onChange={(e) => { setSelectedPool(e.target.value); setHasRequested(false); }}
              className="w-full bg-muted/30 border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose a pool...</option>
              {pools?.map((p) => (
                <option key={p.poolAddress} value={p.poolAddress}>
                  {p.tokenASymbol}-{p.tokenBSymbol} ({truncateAddress(p.poolAddress)})
                </option>
              ))}
            </select>
          </div>

          {positions && positions.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">
                My Position (optional)
              </label>
              <select
                value={selectedNft}
                onChange={(e) => { setSelectedNft(e.target.value); setHasRequested(false); }}
                className="w-full bg-muted/30 border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">No existing position (analyzing for new entry)</option>
                {positions
                  .filter((p) => !selectedPool || p.poolAddress === selectedPool)
                  .map((p) => (
                    <option key={p.nftId} value={p.nftId}>
                      NFT #{p.nftId} — {p.tokenASymbol}-{p.tokenBSymbol} ({formatUsd(p.valueUsd)})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1.5">
              Your Goal
            </label>
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              placeholder="e.g. maximize fee income while limiting impermanent loss"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!selectedPool || adviceLoading}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.35)] transition-all"
          >
            {adviceLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Analyze Position
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            GlidePool never holds your funds. All transactions require your wallet signature.
          </p>
        </CardContent>
      </Card>

      {isPaymentRequired && (
        <Card className="bg-card border-amber-500/30 border animate-in fade-in duration-300">
          <CardContent className="p-5 flex gap-4 items-start">
            <CreditCard className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-400 mb-1">Payment Required</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Access to the AI Advisor costs{" "}
                <span className="font-mono text-foreground">{paymentData?.amount ?? "0.05"} {paymentData?.currency ?? "USDC"}</span>{" "}
                per analysis on {paymentData?.network ?? "Base"} — a micropayment via x402.
              </p>
              {paymentData?.recipient && (
                <p className="text-xs text-muted-foreground font-mono">
                  Treasury: {truncateAddress(paymentData.recipient)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasRequested && !adviceLoading && advice && "summary" in advice && (
        <Card className="bg-card border-card-border border-primary/10 shadow-[0_0_30px_rgba(0,255,255,0.05)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle>Recommendation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`${RISK_COLORS[advice.riskLevel]} border font-semibold px-3 py-1.5 gap-1.5 text-sm`}>
                {RISK_ICONS[advice.riskLevel]}
                {advice.riskLevel.toUpperCase()} RISK
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-border/50 px-3 py-1.5 text-sm">
                {ACTION_ICONS[advice.recommendation.action]}
                {ACTION_LABELS[advice.recommendation.action]}
              </Badge>
              {advice.recommendation.suggestedMode && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Mode: {advice.recommendation.suggestedMode}
                </Badge>
              )}
            </div>

            <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Summary</p>
              <p className="text-sm leading-relaxed">{advice.summary}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Reasoning</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{advice.recommendation.reasoning}</p>
            </div>

            {advice.recommendation.suggestedBinRange && (
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Suggested Bin Range</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground">Lower Tick</p>
                    <p className="font-mono font-bold text-lg">{advice.recommendation.suggestedBinRange.lowerTick}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Upper Tick</p>
                    <p className="font-mono font-bold text-lg">{advice.recommendation.suggestedBinRange.upperTick}</p>
                  </div>
                </div>
              </div>
            )}

            {advice.recommendation.suggestedWithdrawPercent > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Suggested withdraw</p>
                  <Badge variant="outline" className="font-mono">
                    {advice.recommendation.suggestedWithdrawPercent}%
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  onClick={handlePreviewTx}
                  disabled={removeParamsMutation.isPending || !position}
                  className="w-full gap-2"
                >
                  {removeParamsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  Preview Remove Liquidity
                </Button>

                {txPreview && (
                  <div className="bg-background/50 rounded-lg p-4 border border-border/40 font-mono text-sm space-y-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3">Transaction Parameters</p>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. {pool?.tokenASymbol}</span>
                      <span>{formatCrypto(txPreview.estimatedTokenA, 6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. {pool?.tokenBSymbol}</span>
                      <span>{formatCrypto(txPreview.estimatedTokenB, 6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bins affected</span>
                      <span>{txPreview.binCount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
                      Sign this transaction in your wallet to execute. Gas fees paid in ETH on Base.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/10 rounded p-3 border border-border/20">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                This recommendation is advisory only. GlidePool never signs transactions on your behalf.
                Always review transaction parameters before approving with your wallet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasRequested && !adviceLoading && !advice && !isPaymentRequired && (
        <Card className="bg-card border-destructive/30 border">
          <CardContent className="p-5 flex gap-3 items-center text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">Failed to load recommendation. Please try again.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
