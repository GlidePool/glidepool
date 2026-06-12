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

const RISK_STYLES: Record<string, string> = {
  low: "bg-primary/10 text-primary border-primary/25",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  high: "bg-red-500/10 text-red-400 border-red-500/25",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  hold: <Minus className="w-3.5 h-3.5" />,
  rebalance: <TrendingUp className="w-3.5 h-3.5" />,
  withdraw: <TrendingDown className="w-3.5 h-3.5" />,
  add_liquidity: <TrendingUp className="w-3.5 h-3.5" />,
  switch_mode: <ChevronRight className="w-3.5 h-3.5" />,
};

export default function PositionDetail() {
  const [, params] = useRoute("/positions/:nftId");
  const nftId = params?.nftId ?? "";
  const { address, isConnected } = useAccount();
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [removePercent, setRemovePercent] = useState(50);
  const [txPreview, setTxPreview] = useState<{ binIds: string[]; amounts: string[]; estimatedTokenA: string; estimatedTokenB: string } | null>(null);

  const { data: position, isLoading } = useGetPositionDetail(address ?? "", nftId, {
    query: {
      enabled: !!address && !!nftId,
      queryKey: getGetPositionDetailQueryKey(address ?? "", nftId),
    },
  });

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
      <div className="flex flex-col items-center justify-center py-40 text-center gap-6">
        <Wallet className="w-10 h-10 text-white/20" />
        <h1 className="text-2xl font-bold">Connect Wallet</h1>
        <ConnectButton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-24" />
        <div className="h-10 bg-white/5 rounded w-48 mt-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h2 className="text-xl font-bold">Position not found</h2>
        <p className="text-white/30 text-sm">NFT #{nftId} was not found for your address.</p>
        <Link href="/positions">
          <button className="mt-2 text-xs font-mono text-primary/70 hover:text-primary border border-primary/20 rounded px-4 py-2 transition-colors">
            ← Back to Positions
          </button>
        </Link>
      </div>
    );
  }

  const handleGetAdvice = async () => { setAdvisorOpen(true); await fetchAdvice(); };

  const handlePreviewRemove = () => {
    if (!position || !address) return;
    removeParamsMutation.mutate(
      { data: { nftId: position.nftId, userAddress: address, poolAddress: position.poolAddress, withdrawPercent: removePercent } },
      { onSuccess: (data) => setTxPreview(data) }
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <div>
        <Link href="/positions">
          <button className="flex items-center gap-1.5 text-xs font-mono text-white/30 hover:text-white/70 transition-colors mb-5">
            <ArrowLeft className="w-3 h-3" /> [03] Positions
          </button>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              {position.tokenASymbol}
              <span className="text-white/20 mx-2">/</span>
              {position.tokenBSymbol}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-mono text-[10px] text-white/20">NFT #{position.nftId}</span>
              <span className="font-mono text-[10px] text-white/15">·</span>
              <span className="font-mono text-[10px] text-white/20">{truncateAddress(position.poolAddress)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-card rounded-xl px-5 py-3 text-right">
              <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-1">Position Value</div>
              <div className="text-2xl font-mono font-bold text-primary">{formatUsd(position.valueUsd)}</div>
            </div>
            <button
              onClick={handleGetAdvice}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-green hover:glow-green-lg transition-all"
            >
              <Bot className="w-4 h-4" />
              Get AI Advice
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Amount " + position.tokenASymbol, value: formatCrypto(position.amountA, 6) },
          { label: "Amount " + position.tokenBSymbol, value: formatCrypto(position.amountB, 6) },
          { label: "Active Bins", value: position.binIds.length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card rounded-xl p-5">
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-2">{label}</div>
            <div className="text-2xl font-mono font-bold">{value}</div>
          </div>
        ))}
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Pool State</div>
          <div className="space-y-3">
            {[
              ["Active Tick", position.poolState.activeTick],
              ["Current Price", position.poolState.currentPrice?.toFixed(6) ?? "—"],
              ["Tick Spacing", position.poolState.tickSpacing],
              ["Bin Counter", position.poolState.binCounter],
              ["Fee A→B", `${(Number(position.poolState.feeAIn) / 1e18 * 100).toFixed(4)}%`],
              ["Fee B→A", `${(Number(position.poolState.feeBIn) / 1e18 * 100).toFixed(4)}%`],
            ].map(([label, value]) => (
              <div key={label as string}
                className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04] last:border-0">
                <span className="text-white/30">{label}</span>
                <span className="font-mono text-white/70">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
            Active Bin IDs
            <span className="text-white/20 ml-2 font-mono normal-case">({position.binIds.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto">
            {position.binIds.map((id) => (
              <span key={id}
                className="font-mono text-[10px] text-white/40 border border-white/[0.06] rounded px-2 py-0.5 bg-white/[0.02]">
                {id}
              </span>
            ))}
            {position.binIds.length === 0 && (
              <p className="text-white/20 text-xs font-mono">No active bins</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Advisor panel */}
      {advisorOpen && (
        <div className="glass-card rounded-xl overflow-hidden border border-primary/10 glow-green-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
            <div className="w-7 h-7 rounded border border-primary/30 bg-primary/5 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm">AI Recommendation</span>
            {adviceLoading && <Loader2 className="w-4 h-4 animate-spin text-white/30 ml-auto" />}
          </div>

          <div className="p-6 space-y-5">
            {adviceLoading ? (
              <div className="space-y-3 animate-pulse">
                {[3/4, 1/2, 2/3].map((w, i) => (
                  <div key={i} className="h-3 bg-white/5 rounded" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            ) : advice && "summary" in advice ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-mono font-bold ${RISK_STYLES[advice.riskLevel]}`}>
                    {advice.riskLevel.toUpperCase()} RISK
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-white/[0.08] text-xs font-mono text-white/50">
                    {ACTION_ICONS[advice.recommendation.action]}
                    {advice.recommendation.action.replace(/_/g, " ").toUpperCase()}
                  </span>
                  {advice.recommendation.suggestedMode && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded border border-primary/20 text-xs font-mono text-primary/70">
                      {advice.recommendation.suggestedMode} mode
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-2">Summary</div>
                  <p className="text-sm text-white/70 leading-relaxed">{advice.summary}</p>
                </div>

                <div>
                  <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-2">Reasoning</div>
                  <p className="text-sm text-white/40 leading-relaxed">{advice.recommendation.reasoning}</p>
                </div>

                {advice.recommendation.suggestedBinRange && (
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-white/20 font-mono mb-1">Lower Tick</div>
                      <div className="font-mono font-bold">{advice.recommendation.suggestedBinRange.lowerTick}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/20 font-mono mb-1">Upper Tick</div>
                      <div className="font-mono font-bold">{advice.recommendation.suggestedBinRange.upperTick}</div>
                    </div>
                  </div>
                )}

                {advice.recommendation.suggestedWithdrawPercent > 0 && (
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono">
                        Suggested Withdraw
                      </div>
                      <span className="font-mono text-xs text-primary/70 border border-primary/20 rounded px-2 py-0.5">
                        {advice.recommendation.suggestedWithdrawPercent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="range" min={1} max={100} value={removePercent}
                        onChange={(e) => setRemovePercent(Number(e.target.value))}
                        className="flex-1 accent-primary" />
                      <span className="font-mono text-xs text-white/50 w-9 text-right">{removePercent}%</span>
                    </div>
                    <button
                      onClick={handlePreviewRemove}
                      disabled={removeParamsMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono border border-white/[0.08] rounded-lg text-white/50 hover:border-primary/30 hover:text-primary/70 transition-all disabled:opacity-50"
                    >
                      {removeParamsMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Preview Transaction
                    </button>

                    {txPreview && (
                      <div className="font-mono text-xs space-y-1.5 p-3 rounded border border-white/[0.06] bg-black/30">
                        <div className="text-[10px] text-white/20 mb-2 uppercase tracking-widest">TX Parameters</div>
                        <div className="flex justify-between"><span className="text-white/30">Est. {position.tokenASymbol}</span><span>{formatCrypto(txPreview.estimatedTokenA, 6)}</span></div>
                        <div className="flex justify-between"><span className="text-white/30">Est. {position.tokenBSymbol}</span><span>{formatCrypto(txPreview.estimatedTokenB, 6)}</span></div>
                        <div className="flex justify-between"><span className="text-white/30">Bins</span><span>{txPreview.binIds.length}</span></div>
                      </div>
                    )}

                    <p className="text-[10px] text-white/20 font-mono">
                      GlidePool never holds funds. All writes require your wallet signature.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Failed to load recommendation. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
