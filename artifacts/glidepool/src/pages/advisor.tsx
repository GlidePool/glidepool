import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useListPools, getListPoolsQueryKey,
  useGetUserPositions, getGetUserPositionsQueryKey,
  useGetAdvice, getGetAdviceQueryKey,
  useComputeRemoveParams,
} from "@workspace/api-client-react";
import { formatUsd, formatCrypto, truncateAddress } from "@/lib/format";
import {
  Bot, AlertCircle, Loader2,
  TrendingUp, TrendingDown, Minus, ChevronRight,
  ShieldAlert, ShieldCheck, Shield, CreditCard,
} from "lucide-react";

const RISK_STYLES: Record<string, string> = {
  low:    "bg-primary/[0.08] text-primary border-primary/25",
  medium: "bg-amber-500/[0.08] text-amber-400 border-amber-500/25",
  high:   "bg-red-500/[0.08] text-red-400 border-red-500/25",
};
const RISK_ICONS: Record<string, React.ReactNode> = {
  low:    <ShieldCheck className="w-4 h-4" />,
  medium: <Shield className="w-4 h-4" />,
  high:   <ShieldAlert className="w-4 h-4" />,
};
const ACTION_LABELS: Record<string, string> = {
  hold: "Hold Position", rebalance: "Rebalance", withdraw: "Withdraw",
  add_liquidity: "Add Liquidity", switch_mode: "Switch Mode",
};
const ACTION_ICONS: Record<string, React.ReactNode> = {
  hold:          <Minus className="w-3.5 h-3.5" />,
  rebalance:     <TrendingUp className="w-3.5 h-3.5" />,
  withdraw:      <TrendingDown className="w-3.5 h-3.5" />,
  add_liquidity: <TrendingUp className="w-3.5 h-3.5" />,
  switch_mode:   <ChevronRight className="w-3.5 h-3.5" />,
};

const selectCls = "w-full bg-black/40 border border-white/[0.10] px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono appearance-none cursor-pointer";
const inputCls  = "w-full bg-black/40 border border-white/[0.10] px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono placeholder:text-white/20";

export default function Advisor() {
  const { address, isConnected } = useAccount();
  const [selectedPool, setSelectedPool] = useState("");
  const [selectedNft,  setSelectedNft]  = useState("");
  const [userGoal,     setUserGoal]     = useState("maximize fee income while minimizing impermanent loss");
  const [hasRequested, setHasRequested] = useState(false);

  const { data: pools }     = useListPools({ query: { queryKey: getListPoolsQueryKey() } });
  const { data: positions } = useGetUserPositions(address ?? "", {
    query: { enabled: !!address, queryKey: getGetUserPositionsQueryKey(address ?? "") },
  });

  const pool = pools?.find((p) => p.poolAddress === selectedPool);

  const { data: advice, isLoading: adviceLoading, refetch: fetchAdvice, error: adviceError } = useGetAdvice(
    { poolAddress: selectedPool, nftId: selectedNft || undefined, userGoal },
    { query: { enabled: false, queryKey: getGetAdviceQueryKey({ poolAddress: selectedPool, nftId: selectedNft }) } }
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
    const pos = positions?.find((p) => p.nftId === selectedNft);
    if (pos && address && advice.recommendation.action === "withdraw") {
      removeParamsMutation.mutate(
        { data: { nftId: pos.nftId, userAddress: address, poolAddress: selectedPool, withdrawPercent: advice.recommendation.suggestedWithdrawPercent ?? 50 } },
        { onSuccess: (d) => setTxPreview({ type: "remove", estimatedTokenA: d.estimatedTokenA, estimatedTokenB: d.estimatedTokenB, binCount: d.binIds.length.toString() }) }
      );
    }
  };

  const isPaymentRequired = adviceError && (adviceError as { status?: number }).status === 402;
  const paymentData = isPaymentRequired ? (adviceError as { data?: { amount?: string; currency?: string; network?: string; recipient?: string } }).data : null;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center px-4">
        <div className="w-14 h-14 border border-primary/20 flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed font-mono">
            Connect to access the GlidePool AI Advisor — analyze pools and get on-chain recommendations.
          </p>
        </div>
        <w3m-button />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto animate-in fade-in duration-400">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-5 flex items-center gap-3">
        <div className="w-9 h-9 border border-primary/25 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-0.5">AI Layer</div>
          <h1 className="text-lg font-bold tracking-tight">AI Advisor</h1>
          <p className="font-mono text-[10px] text-white/35 mt-0.5">On-chain LP analysis · x402 micropayment gated</p>
        </div>
      </div>

      {/* Config panel */}
      <div className="border border-white/[0.10] space-y-0">
        <div className="px-5 py-3 border-b border-white/[0.10]">
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Configure Analysis</span>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Pool</label>
            <select value={selectedPool} onChange={(e) => { setSelectedPool(e.target.value); setHasRequested(false); }} className={selectCls}>
              <option value="">Select a pool…</option>
              {pools?.map((p) => (
                <option key={p.poolAddress} value={p.poolAddress}>
                  {p.tokenASymbol}/{p.tokenBSymbol} · {truncateAddress(p.poolAddress)}
                </option>
              ))}
            </select>
          </div>

          {positions && positions.length > 0 && (
            <div>
              <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">My Position (optional)</label>
              <select value={selectedNft} onChange={(e) => { setSelectedNft(e.target.value); setHasRequested(false); }} className={selectCls}>
                <option value="">None — analyzing for new entry</option>
                {positions.filter((p) => !selectedPool || p.poolAddress === selectedPool).map((p) => (
                  <option key={p.nftId} value={p.nftId}>
                    NFT #{p.nftId} — {p.tokenASymbol}/{p.tokenBSymbol} ({formatUsd(p.valueUsd)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Your Goal</label>
            <input type="text" value={userGoal} onChange={(e) => setUserGoal(e.target.value)}
              className={inputCls}
              placeholder="e.g. maximize fee income while limiting impermanent loss" />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedPool || adviceLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-mono"
          >
            {adviceLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
              : <><Bot className="w-4 h-4" /> Analyze Position</>
            }
          </button>

          <p className="font-mono text-[9px] text-white/20 text-center">
            ~0.05 USDC per query via x402 on Base · GlidePool never holds your funds
          </p>
        </div>
      </div>

      {/* Payment required */}
      {isPaymentRequired && (
        <div className="border border-amber-500/20 bg-amber-500/[0.04] p-5 animate-in fade-in duration-300">
          <div className="flex gap-3 items-start">
            <CreditCard className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-400 text-sm mb-1">Payment Required</div>
              <p className="font-mono text-[10px] text-white/40 leading-relaxed mb-2">
                Access costs{" "}
                <span className="text-white/70">{paymentData?.amount ?? "0.05"} {paymentData?.currency ?? "USDC"}</span>{" "}
                on {paymentData?.network ?? "Base"} via x402 micropayment.
              </p>
              {paymentData?.recipient && (
                <span className="font-mono text-[9px] text-white/20">Treasury: {truncateAddress(paymentData.recipient)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {hasRequested && !adviceLoading && advice && "summary" in advice && (
        <div className="border border-primary/15 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-primary/[0.03]">
            <Bot className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Recommendation</span>
          </div>

          <div className="p-5 space-y-5">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border font-mono text-xs font-bold ${RISK_STYLES[advice.riskLevel]}`}>
                {RISK_ICONS[advice.riskLevel]}
                {advice.riskLevel.toUpperCase()} RISK
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.08] font-mono text-xs text-white/50">
                {ACTION_ICONS[advice.recommendation.action]}
                {ACTION_LABELS[advice.recommendation.action]}
              </span>
              {advice.recommendation.suggestedMode && (
                <span className="inline-flex items-center px-3 py-1.5 border border-primary/20 font-mono text-xs text-primary/70">
                  Mode: {advice.recommendation.suggestedMode}
                </span>
              )}
            </div>

            {/* Summary */}
            <div className="border border-white/[0.05] bg-black/20 p-4">
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
                {[
                  ["Lower Tick", advice.recommendation.suggestedBinRange.lowerTick],
                  ["Upper Tick", advice.recommendation.suggestedBinRange.upperTick],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div className="font-mono text-[9px] text-white/20 mb-1">{label}</div>
                    <div className="font-mono font-bold text-lg">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Withdraw */}
            {(advice.recommendation.suggestedWithdrawPercent ?? 0) > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/30">Suggested withdraw</span>
                  <span className="font-mono text-xs text-primary/70 border border-primary/20 px-2 py-0.5">
                    {advice.recommendation.suggestedWithdrawPercent}%
                  </span>
                </div>
                <button
                  onClick={handlePreviewTx}
                  disabled={removeParamsMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[10px] border border-white/[0.08] text-white/40 hover:border-primary/30 hover:text-primary/70 transition-all disabled:opacity-50"
                >
                  {removeParamsMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  Preview Remove Liquidity
                </button>
                {txPreview && (
                  <div className="font-mono text-[10px] space-y-1.5 p-4 border border-white/[0.06] bg-black/30">
                    <div className="font-mono text-[9px] text-white/20 mb-2 uppercase tracking-widest">TX Parameters</div>
                    <div className="flex justify-between"><span className="text-white/30">Est. {pool?.tokenASymbol}</span><span>{formatCrypto(txPreview.estimatedTokenA, 6)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">Est. {pool?.tokenBSymbol}</span><span>{formatCrypto(txPreview.estimatedTokenB, 6)}</span></div>
                    <div className="flex justify-between"><span className="text-white/30">Bins affected</span><span>{txPreview.binCount}</span></div>
                    <p className="font-mono text-[9px] text-white/20 mt-3 pt-3 border-t border-white/[0.05]">Sign in your wallet. Gas paid in ETH on Base.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-start gap-2 font-mono text-[10px] text-white/20 border border-white/[0.04] p-3">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Advisory only. GlidePool never signs transactions on your behalf. Always review before approving.
            </div>
          </div>
        </div>
      )}

      {hasRequested && !adviceLoading && !advice && !isPaymentRequired && (
        <div className="border border-red-500/20 bg-red-500/[0.04] p-4">
          <div className="flex gap-3 items-center text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Failed to load recommendation. Please try again.
          </div>
        </div>
      )}
    </div>
  );
}
