import { useRoute, Link } from "wouter";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  useGetPositionDetail, getGetPositionDetailQueryKey,
  useGetAdvice, getGetAdviceQueryKey,
  useComputeRemoveParams,
} from "@workspace/api-client-react";
import { formatUsd, formatCrypto, truncateAddress } from "@/lib/format";
import {
  ArrowLeft, Bot, TrendingDown, TrendingUp, Minus,
  AlertCircle, Wallet2, Loader2, ChevronRight,
  CheckCircle2, ExternalLink, ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import {
  MAVERICK_V2_ROUTER, MAVERICK_V2_POSITION,
  ROUTER_ABI, POSITION_NFT_ABI,
} from "@/lib/maverick-abi";

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

interface TxPreview {
  poolAddress: string;
  subaccount: number;
  binIds: string[];
  amounts: string[];
  estimatedTokenA: string;
  estimatedTokenB: string;
}

export default function PositionDetail() {
  const [, params] = useRoute("/positions/:nftId");
  const nftId = params?.nftId ?? "";
  const { address, isConnected } = useAccount();
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [removePercent, setRemovePercent] = useState(50);
  const [txPreview, setTxPreview] = useState<TxPreview | null>(null);

  const { data: position, isLoading } = useGetPositionDetail(address ?? "", nftId, {
    query: { enabled: !!address && !!nftId, queryKey: getGetPositionDetailQueryKey(address ?? "", nftId) },
  });

  const { data: advice, isLoading: adviceLoading, refetch: fetchAdvice } = useGetAdvice(
    { poolAddress: position?.poolAddress ?? "", nftId },
    { query: { enabled: false, queryKey: getGetAdviceQueryKey({ poolAddress: position?.poolAddress ?? "", nftId }) } }
  );

  const removeParamsMutation = useComputeRemoveParams();

  // ── Check if router is approved to manage this NFT ───────────────────────
  const { data: isRouterApproved, refetch: refetchApproval } = useReadContract({
    address: MAVERICK_V2_POSITION,
    abi: POSITION_NFT_ABI,
    functionName: "isApprovedForAll",
    args: [address!, MAVERICK_V2_ROUTER],
    query: { enabled: !!address },
  });

  // ── Approve router ────────────────────────────────────────────────────────
  const approveWrite = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveWrite.data });

  const handleApprove = () => {
    approveWrite.writeContract({
      address: MAVERICK_V2_POSITION,
      abi: POSITION_NFT_ABI,
      functionName: "setApprovalForAll",
      args: [MAVERICK_V2_ROUTER, true],
    });
  };

  // Refetch approval after confirmed
  if (approveReceipt.isSuccess && !isRouterApproved) {
    refetchApproval();
  }

  // ── Remove liquidity ──────────────────────────────────────────────────────
  const removeWrite = useWriteContract();
  const removeReceipt = useWaitForTransactionReceipt({ hash: removeWrite.data });

  const handleRemoveLiquidity = () => {
    if (!txPreview || !address) return;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 min
    removeWrite.writeContract({
      address: MAVERICK_V2_ROUTER,
      abi: ROUTER_ABI,
      functionName: "removeLiquidity",
      args: [
        txPreview.poolAddress as `0x${string}`,
        address,
        BigInt(txPreview.subaccount),
        txPreview.binIds.map((binId, i) => ({
          binId: Number(binId),
          amount: BigInt(txPreview.amounts[i] ?? "0"),
        })),
        0n,
        0n,
        deadline,
      ],
    });
  };

  const routerApproved = isRouterApproved || approveReceipt.isSuccess;
  const canSign = !!txPreview && routerApproved;

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
      {
        onSuccess: (data) => setTxPreview({
          poolAddress: data.poolAddress ?? position.poolAddress,
          subaccount: (data as TxPreview).subaccount ?? Number(nftId),
          binIds: data.binIds ?? [],
          amounts: (data as TxPreview).amounts ?? [],
          estimatedTokenA: data.estimatedTokenA ?? "0",
          estimatedTokenB: data.estimatedTokenB ?? "0",
        }),
      }
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

      {/* Stats */}
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

      {/* ── Manage Position (Remove Liquidity) ── */}
      <div className="border border-white/[0.10]">
        <div className="px-5 py-3.5 border-b border-white/[0.10] flex items-center gap-2">
          <TrendingDown className="w-3.5 h-3.5 text-white/30" />
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Remove Liquidity</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Percent slider */}
          <div className="flex items-center justify-between gap-4">
            <input
              type="range" min={1} max={100} value={removePercent}
              onChange={(e) => { setRemovePercent(Number(e.target.value)); setTxPreview(null); }}
              className="flex-1 accent-primary"
            />
            <span className="font-mono text-sm text-primary/80 font-bold w-12 text-right">{removePercent}%</span>
          </div>
          <div className="flex gap-1.5">
            {[25, 50, 75, 100].map((p) => (
              <button key={p} onClick={() => { setRemovePercent(p); setTxPreview(null); }}
                className={`font-mono text-[9px] px-2.5 py-1 border transition-all ${
                  removePercent === p ? "border-primary/40 text-primary/70 bg-primary/[0.05]" : "border-white/[0.07] text-white/25 hover:border-white/15 hover:text-white/50"
                }`}>{p}%</button>
            ))}
          </div>

          {/* Preview button */}
          {!txPreview && (
            <button
              onClick={handlePreviewRemove}
              disabled={removeParamsMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] border border-white/[0.08] text-white/50 hover:border-primary/30 hover:text-primary/70 transition-all disabled:opacity-50"
            >
              {removeParamsMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              {removeParamsMutation.isPending ? "Computing params…" : "Preview Removal"}
            </button>
          )}

          {/* TX Preview */}
          {txPreview && !removeReceipt.isSuccess && (
            <div className="border border-white/[0.08] bg-black/30 p-4 space-y-4">
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Transaction Preview</div>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-white/30">Remove %</span>
                  <span>{removePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Est. {position.tokenASymbol}</span>
                  <span>{formatCrypto(txPreview.estimatedTokenA, 6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Est. {position.tokenBSymbol}</span>
                  <span>{formatCrypto(txPreview.estimatedTokenB, 6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Bins affected</span>
                  <span>{txPreview.binIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">NFT subaccount</span>
                  <span>#{txPreview.subaccount}</span>
                </div>
              </div>

              {/* Step 1: Approve */}
              {!routerApproved && (
                <div className="border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-2">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-amber-400/80">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Step 1 — Approve router to manage your position NFT
                  </div>
                  <p className="font-mono text-[9px] text-white/25 leading-relaxed">
                    One-time approval per wallet. Required before the router can remove liquidity on your behalf.
                  </p>
                  <button
                    onClick={handleApprove}
                    disabled={approveWrite.isPending || approveReceipt.isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[10px] border border-amber-500/30 text-amber-400/80 hover:bg-amber-500/[0.06] transition-all disabled:opacity-50"
                  >
                    {approveWrite.isPending ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Waiting for wallet…</>
                    ) : approveReceipt.isLoading ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Confirming…</>
                    ) : (
                      <><ShieldCheck className="w-3 h-3" /> Approve Position Manager</>
                    )}
                  </button>
                  {approveWrite.data && !approveReceipt.isSuccess && (
                    <a href={`https://basescan.org/tx/${approveWrite.data}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[9px] text-amber-400/50 hover:text-amber-400/80 transition-colors">
                      View TX <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {approveWrite.error && (
                    <p className="font-mono text-[9px] text-red-400/70">{approveWrite.error.message?.slice(0, 100)}</p>
                  )}
                </div>
              )}

              {routerApproved && !approveReceipt.isSuccess && (
                <div className="flex items-center gap-2 font-mono text-[9px] text-primary/50">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Router approved
                </div>
              )}
              {approveReceipt.isSuccess && (
                <div className="flex items-center gap-2 font-mono text-[9px] text-primary/70">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Approval confirmed!
                </div>
              )}

              {/* Step 2: Sign & Remove */}
              <div className={`space-y-2 ${!routerApproved ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="font-mono text-[9px] text-white/25 uppercase tracking-widest">
                  {!approveReceipt.isSuccess && routerApproved ? "Ready to sign" : "Step 2 — Sign transaction"}
                </div>
                <button
                  onClick={handleRemoveLiquidity}
                  disabled={!canSign || removeWrite.isPending || removeReceipt.isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm font-mono bg-primary text-[#080808] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed glow-green w-full justify-center"
                >
                  {removeWrite.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Waiting for wallet…</>
                  ) : removeReceipt.isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Confirming on-chain…</>
                  ) : (
                    <><TrendingDown className="w-4 h-4" /> Sign & Remove {removePercent}% Liquidity</>
                  )}
                </button>
                {removeWrite.error && (
                  <p className="font-mono text-[9px] text-red-400/70">{removeWrite.error.message?.slice(0, 150)}</p>
                )}
                {removeWrite.data && !removeReceipt.isSuccess && (
                  <a href={`https://basescan.org/tx/${removeWrite.data}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[9px] text-primary/50 hover:text-primary/80 transition-colors">
                    View TX on BaseScan <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <button onClick={() => setTxPreview(null)}
                className="font-mono text-[9px] text-white/20 hover:text-white/45 transition-colors">
                ↺ Re-compute
              </button>

              <p className="font-mono text-[9px] text-white/15 leading-relaxed">
                GlidePool is non-custodial. All transactions require your wallet signature and are executed on Base Mainnet.
              </p>
            </div>
          )}

          {/* Success state */}
          {removeReceipt.isSuccess && (
            <div className="border border-primary/30 bg-primary/[0.04] p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Liquidity removed successfully!
              </div>
              <p className="font-mono text-[10px] text-white/40">
                {removePercent}% of your {position.tokenASymbol}/{position.tokenBSymbol} position was removed.
              </p>
              {removeWrite.data && (
                <a href={`https://basescan.org/tx/${removeWrite.data}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-primary/70 hover:text-primary transition-colors">
                  View on BaseScan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
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

                {advice.recommendation.suggestedWithdrawPercent && (
                  <p className="font-mono text-[10px] text-primary/50 border border-primary/15 px-3 py-2">
                    AI suggests withdrawing {advice.recommendation.suggestedWithdrawPercent}% — use the Remove Liquidity panel above.
                  </p>
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
