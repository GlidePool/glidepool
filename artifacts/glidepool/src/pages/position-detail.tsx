import { useRoute, Link } from "wouter";
import { useAccount } from "wagmi";
import {
  useGetPositionDetail, getGetPositionDetailQueryKey,
  useGetAdvice, getGetAdviceQueryKey,
  useComputeRemoveParams,
} from "@workspace/api-client-react";
import { formatUsd, formatCrypto, truncateAddress } from "@/lib/format";
import {
  ArrowLeft, Bot, TrendingDown, TrendingUp, Minus,
  AlertCircle, Wallet2, Loader2, ChevronRight,
} from "lucide-react";
import { useState } from "react";

const RISK_STYLES: Record<string, string> = {
  low:    "bg-primary/[0.08] text-primary border-primary/25",
  medium: "bg-amber-500/[0.08] text-amber-400 border-amber-500/25",
  high:   "bg-red-500/[0.08] text-red-400 border-red-500/25",
};
const ACTION_ICONS: Record<string, React.ReactNode> = {
  hold:          <Minus className="w-3.5 h-3.5" />,
  rebalance:     <TrendingUp className="w-3.5 h-3.5" />,
  withdraw:      <TrendingDown className="w-3.5 h-3.5" />,
  add_liquidity: <TrendingUp className="w-3.5 h-3.5" />,
  switch_mode:   <ChevronRight className="w-3.5 h-3.5" />,
};

export default function PositionDetail() {
  const [, params] = useRoute("/positions/:nftId");
  const nftId = params?.nftId ?? "";
  const { address, isConnected } = useAccount();
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [removePercent, setRemovePercent] = useState(50);
  const [txPreview, setTxPreview] = useState<{ binIds: string[]; estimatedTokenA: string; estimatedTokenB: string } | null>(null);

  const { data: position, isLoading } = useGetPositionDetail(address ?? "", nftId, {
    query: { enabled: !!address && !!nftId, queryKey: getGetPositionDetailQueryKey(address ?? "", nftId) },
  });

  const { data: advice, isLoading: adviceLoading, refetch: fetchAdvice } = useGetAdvice(
    { poolAddress: position?.poolAddress ?? "", nftId },
    { query: { enabled: false, queryKey: getGetAdviceQueryKey({ poolAddress: position?.poolAddress ?? "", nftId }) } }
  );

  const removeParamsMutation = useComputeRemoveParams();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center px-4">
        <div className="w-14 h-14 border border-white/[0.10] flex items-center justify-center">
          <Wallet2 className="w-6 h-6 text-white/25" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed font-mono">Connect to view your position details.</p>
        </div>
        <w3m-button />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-3 bg-white/[0.05] w-20" />
        <div className="h-7 bg-white/[0.05] w-48" />
        <div className="border border-white/[0.07] grid grid-cols-3 divide-x divide-white/[0.07]">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white/[0.02]" />)}
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center gap-4">
        <div className="w-12 h-12 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-xl font-bold">Position not found</h2>
        <p className="font-mono text-[10px] text-white/30">NFT #{nftId} not found for your address.</p>
        <Link href="/positions">
          <button className="font-mono text-[10px] text-primary/70 hover:text-primary border border-primary/20 px-4 py-2 transition-colors">
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-400">

      {/* Breadcrumb */}
      <Link href="/positions">
        <button className="flex items-center gap-1.5 font-mono text-[10px] text-white/30 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Positions
        </button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-stretch justify-between gap-0 border border-white/[0.10]">
        <div className="p-5 flex flex-col justify-center flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="font-mono text-[9px] text-white/20">NFT #{position.nftId}</span>
            <span className="text-white/10">·</span>
            <span className="font-mono text-[9px] text-white/20">{truncateAddress(position.poolAddress)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {position.tokenASymbol}
            <span className="text-white/20 mx-2">/</span>
            {position.tokenBSymbol}
          </h1>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-white/[0.10] px-6 py-5 flex flex-col justify-center sm:min-w-[200px]">
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Position Value</div>
          <div className="text-2xl font-mono font-bold text-primary">{formatUsd(position.valueUsd)}</div>
        </div>
      </div>

      {/* Get AI Advice button */}
      <div>
        <button
          onClick={handleGetAdvice}
          className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity font-mono glow-green"
        >
          <Bot className="w-4 h-4" /> Get AI Advice
        </button>
      </div>

      {/* Stats - flat bordered grid */}
      <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.10]">
        {[
          { label: `Amount ${position.tokenASymbol}`, value: formatCrypto(position.amountA, 6) },
          { label: `Amount ${position.tokenBSymbol}`, value: formatCrypto(position.amountB, 6) },
          { label: "Active Bins",                     value: position.binIds.length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="p-5">
            <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">{label}</div>
            <div className="text-xl font-mono font-bold">{value}</div>
          </div>
        ))}
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pool state */}
        <div className="border border-white/[0.10]">
          <div className="px-5 py-3.5 border-b border-white/[0.10]">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Pool State</span>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {[
              ["Active Tick",   position.poolState.activeTick],
              ["Current Price", position.poolState.currentPrice?.toFixed(6) ?? "-"],
              ["Tick Spacing",  position.poolState.tickSpacing],
              ["Bin Counter",   position.poolState.binCounter],
              ["Fee A→B",       `${(Number(position.poolState.feeAIn) / 1e18 * 100).toFixed(4)}%`],
              ["Fee B→A",       `${(Number(position.poolState.feeBIn) / 1e18 * 100).toFixed(4)}%`],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between items-center px-5 py-2.5">
                <span className="font-mono text-[10px] text-white/30">{label}</span>
                <span className="font-mono text-[10px] text-white/70">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bin IDs */}
        <div className="border border-white/[0.10]">
          <div className="px-5 py-3.5 border-b border-white/[0.10] flex items-center gap-2">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Active Bin IDs</span>
            <span className="font-mono text-[9px] text-white/15">({position.binIds.length})</span>
          </div>
          <div className="p-5 flex flex-wrap gap-1.5 max-h-52 overflow-y-auto">
            {position.binIds.map((id) => (
              <span key={id} className="font-mono text-[9px] text-white/40 border border-white/[0.06] px-2 py-0.5 bg-white/[0.02]">
                {id}
              </span>
            ))}
            {position.binIds.length === 0 && (
              <p className="font-mono text-[10px] text-white/20">No active bins.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Advisor panel */}
      {advisorOpen && (
        <div className="border border-primary/15 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-primary/[0.03]">
            <div className="w-7 h-7 border border-primary/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm">AI Recommendation</span>
            {adviceLoading && <Loader2 className="w-4 h-4 animate-spin text-white/30 ml-auto" />}
          </div>

          <div className="p-5 space-y-5">
            {adviceLoading ? (
              <div className="space-y-3 animate-pulse">
                {[0.75, 0.5, 0.65].map((w, i) => (
                  <div key={i} className="h-3 bg-white/[0.05]" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            ) : advice && "summary" in advice ? (
              <>
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 border font-mono text-xs font-bold ${RISK_STYLES[advice.riskLevel]}`}>
                    {advice.riskLevel.toUpperCase()} RISK
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-white/[0.08] font-mono text-xs text-white/50">
                    {ACTION_ICONS[advice.recommendation.action]}
                    {advice.recommendation.action.replace(/_/g, " ").toUpperCase()}
                  </span>
                  {advice.recommendation.suggestedMode && (
                    <span className="inline-flex items-center px-3 py-1 border border-primary/20 font-mono text-xs text-primary/70">
                      {advice.recommendation.suggestedMode} mode
                    </span>
                  )}
                </div>

                {/* Summary */}
                <div>
                  <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">Summary</div>
                  <p className="text-sm text-white/70 leading-relaxed">{advice.summary}</p>
                </div>

                {/* Reasoning */}
                <div>
                  <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">Reasoning</div>
                  <p className="font-mono text-[10px] text-white/40 leading-relaxed">{advice.recommendation.reasoning}</p>
                </div>

                {/* Bin range */}
                {advice.recommendation.suggestedBinRange && (
                  <div className="border border-primary/15 bg-primary/[0.04] p-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono text-[9px] text-white/20 mb-1">Lower Tick</div>
                      <div className="font-mono font-bold text-lg">{advice.recommendation.suggestedBinRange.lowerTick}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] text-white/20 mb-1">Upper Tick</div>
                      <div className="font-mono font-bold text-lg">{advice.recommendation.suggestedBinRange.upperTick}</div>
                    </div>
                  </div>
                )}

                {/* Withdraw */}
                {(advice.recommendation.suggestedWithdrawPercent ?? 0) > 0 && (
                  <div className="border border-white/[0.06] bg-black/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Suggested Withdraw</div>
                      <span className="font-mono text-xs text-primary/70 border border-primary/20 px-2 py-0.5">
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
                      className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[10px] border border-white/[0.08] text-white/50 hover:border-primary/30 hover:text-primary/70 transition-all disabled:opacity-50"
                    >
                      {removeParamsMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Preview Transaction
                    </button>
                    {txPreview && (
                      <div className="font-mono text-[10px] space-y-1.5 p-4 border border-white/[0.06] bg-black/30">
                        <div className="font-mono text-[9px] text-white/20 mb-2 uppercase tracking-widest">TX Parameters</div>
                        <div className="flex justify-between"><span className="text-white/30">Est. {position.tokenASymbol}</span><span>{formatCrypto(txPreview.estimatedTokenA, 6)}</span></div>
                        <div className="flex justify-between"><span className="text-white/30">Est. {position.tokenBSymbol}</span><span>{formatCrypto(txPreview.estimatedTokenB, 6)}</span></div>
                        <div className="flex justify-between"><span className="text-white/30">Bins</span><span>{txPreview.binIds.length}</span></div>
                      </div>
                    )}
                    <p className="font-mono text-[9px] text-white/20">GlidePool never holds funds. All writes require your wallet signature.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Failed to load recommendation. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
