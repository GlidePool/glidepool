import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useSearch } from "wouter";
import {
  useListPools, getListPoolsQueryKey,
  useGetUserPositions, getGetUserPositionsQueryKey,
  useComputeRemoveParams,
} from "@workspace/api-client-react";
import { formatUsd, formatCrypto, truncateAddress } from "@/lib/format";
import {
  Bot, AlertCircle, Loader2,
  TrendingUp, TrendingDown, Minus, ChevronRight,
  ShieldAlert, ShieldCheck, Shield, CreditCard, CheckCircle2,
} from "lucide-react";

// ── USDC ERC20 ABI (transfer only) ───────────────────────────────────────────
const USDC_ABI = [
  {
    name: "transfer",
    type: "function" as const,
    inputs: [
      { name: "to",     type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// ── Styles ────────────────────────────────────────────────────────────────────
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface PaymentData {
  amount: string;
  currency: string;
  network: string;
  recipient: string;
  token?: string;
}

interface AdviceResult {
  summary: string;
  riskLevel: string;
  recommendation: {
    action: string;
    reasoning: string;
    suggestedMode?: string;
    suggestedBinRange?: { lowerTick: number; upperTick: number };
    suggestedWithdrawPercent?: number;
  };
}

// ── Fetch advice (with optional payment proof) ────────────────────────────────
async function fetchAdvice(
  params: { poolAddress: string; nftId?: string; userGoal: string },
  paymentProof?: { txHash: string; from: string; amount: string },
): Promise<{ ok: true; data: AdviceResult } | { ok: false; status: number; data: PaymentData | null }> {
  const qs = new URLSearchParams({ poolAddress: params.poolAddress, userGoal: params.userGoal });
  if (params.nftId) qs.set("nftId", params.nftId);

  const headers: Record<string, string> = {};
  if (paymentProof) {
    headers["x-payment-proof"] = btoa(JSON.stringify(paymentProof));
  }

  const res = await fetch(`/api/advisor?${qs.toString()}`, { headers });

  if (res.ok) {
    return { ok: true, data: await res.json() as AdviceResult };
  }
  if (res.status === 402) {
    const body = await res.json().catch(() => null);
    return { ok: false, status: 402, data: body as PaymentData | null };
  }
  return { ok: false, status: res.status, data: null };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Advisor() {
  const { address, isConnected } = useAccount();
  const search = useSearch();
  const poolFromUrl = new URLSearchParams(search).get("pool") ?? "";

  const [selectedPool, setSelectedPool] = useState(poolFromUrl);
  const [selectedNft,  setSelectedNft]  = useState("");
  const [userGoal,     setUserGoal]     = useState("maximize fee income while minimizing impermanent loss");

  // Result / error state
  const [advice,       setAdvice]       = useState<AdviceResult | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [paymentData,  setPaymentData]  = useState<PaymentData | null>(null);
  const [fetchError,   setFetchError]   = useState("");

  // Payment flow
  const [payTxHash, setPayTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [payError,  setPayError]  = useState("");

  const { data: pools }     = useListPools({ query: { queryKey: getListPoolsQueryKey() } });
  const { data: positions } = useGetUserPositions(address ?? "", {
    query: { enabled: !!address, queryKey: getGetUserPositionsQueryKey(address ?? "") },
  });
  const pool = pools?.find((p) => p.poolAddress === selectedPool);

  const removeParamsMutation = useComputeRemoveParams();
  const [txPreview, setTxPreview] = useState<Record<string, string> | null>(null);

  useEffect(() => { if (poolFromUrl) setSelectedPool(poolFromUrl); }, [poolFromUrl]);

  // ── wagmi write (USDC transfer) ───────────────────────────────────────────
  const { writeContractAsync, isPending: walletPending } = useWriteContract();
  const { data: payReceipt, isLoading: chainPending, isSuccess: chainConfirmed } =
    useWaitForTransactionReceipt({ hash: payTxHash });

  // After chain confirmation → retry advisor with proof
  useEffect(() => {
    if (!chainConfirmed || !payReceipt || !paymentData || !address) return;
    setLoading(true);
    fetchAdvice(
      { poolAddress: selectedPool, nftId: selectedNft || undefined, userGoal },
      { txHash: payReceipt.transactionHash, from: address, amount: paymentData.amount },
    ).then((result) => {
      if (result.ok) {
        setAdvice(result.data);
        setPaymentData(null);
      } else {
        setPayError("Payment verified but advisor failed — try again.");
      }
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainConfirmed]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selectedPool) return;
    setLoading(true);
    setAdvice(null);
    setPaymentData(null);
    setFetchError("");
    setPayError("");
    setPayTxHash(undefined);

    const result = await fetchAdvice({ poolAddress: selectedPool, nftId: selectedNft || undefined, userGoal });
    setLoading(false);

    if (result.ok) {
      setAdvice(result.data);
    } else if (result.status === 402) {
      setPaymentData(result.data);
    } else {
      setFetchError("Failed to load recommendation. Please try again.");
    }
  };

  const handlePay = async () => {
    if (!paymentData?.recipient || !address) return;
    setPayError("");
    setPayTxHash(undefined);
    try {
      const amountMicro = BigInt(Math.round(Number(paymentData.amount ?? "0.001") * 1e6));
      const hash = await writeContractAsync({
        address: USDC_BASE,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [paymentData.recipient as `0x${string}`, amountMicro],
      });
      setPayTxHash(hash);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPayError(msg.slice(0, 150));
    }
  };

  const handlePreviewTx = () => {
    if (!advice) return;
    const pos = positions?.find((p) => p.nftId === selectedNft);
    if (pos && address && advice.recommendation.action === "withdraw") {
      removeParamsMutation.mutate(
        { data: { nftId: pos.nftId, userAddress: address, poolAddress: selectedPool, withdrawPercent: advice.recommendation.suggestedWithdrawPercent ?? 50 } },
        { onSuccess: (d) => setTxPreview({ type: "remove", estimatedTokenA: d.estimatedTokenA, estimatedTokenB: d.estimatedTokenB, binCount: d.binIds.length.toString() }) }
      );
    }
  };

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

  // Payment flow state label
  const payStep = walletPending ? "waiting_wallet" : chainPending ? "waiting_chain" : chainConfirmed && loading ? "verifying" : "idle";

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
            <select value={selectedPool} onChange={(e) => { setSelectedPool(e.target.value); setAdvice(null); setPaymentData(null); }} className={selectCls}>
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
              <select value={selectedNft} onChange={(e) => { setSelectedNft(e.target.value); setAdvice(null); }} className={selectCls}>
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
            disabled={!selectedPool || loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed font-mono"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
              : <><Bot className="w-4 h-4" /> Analyze Position</>
            }
          </button>

          <p className="font-mono text-[9px] text-white/20 text-center">
            x402 payment optional (server-side) · GlidePool never holds your funds
          </p>
        </div>
      </div>

      {/* ── Payment required — wallet-driven ── */}
      {paymentData && (
        <div className="border border-amber-500/20 bg-amber-500/[0.04] p-5 animate-in fade-in duration-300 flex flex-col gap-4">
          <div className="flex gap-3 items-start">
            <CreditCard className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <div className="font-bold text-amber-400 text-sm">Payment Required</div>
              <p className="font-mono text-[10px] text-white/40 leading-relaxed">
                This AI call costs{" "}
                <span className="text-white/75 font-bold">{paymentData.amount} {paymentData.currency}</span>{" "}
                on {paymentData.network ?? "Base"}. Your connected wallet pays directly — no middleman.
              </p>
              <div className="flex gap-4 font-mono text-[9px] text-white/25 mt-1">
                <span>From: <span className="text-white/45">{truncateAddress(address ?? "")}</span></span>
                <span>To: <span className="text-white/45">{truncateAddress(paymentData.recipient)}</span></span>
              </div>
            </div>
          </div>

          {/* Pay button */}
          {!payTxHash && (
            <button
              onClick={handlePay}
              disabled={walletPending}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-bold text-sm font-mono bg-amber-500/90 text-[#080808] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {walletPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Waiting for wallet…</>
                : <><CreditCard className="w-4 h-4" /> Pay {paymentData.amount} USDC &amp; Get Analysis</>
              }
            </button>
          )}

          {/* Chain confirmation progress */}
          {payTxHash && !chainConfirmed && (
            <div className="flex items-center gap-3 font-mono text-[10px] text-white/40 border border-white/[0.06] px-4 py-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400/70 shrink-0" />
              <span>Confirming on Base Mainnet… tx sent, waiting for block.</span>
            </div>
          )}

          {payStep === "verifying" && (
            <div className="flex items-center gap-3 font-mono text-[10px] text-white/40 border border-primary/15 px-4 py-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/60 shrink-0" />
              <span>Payment verified on-chain · fetching AI analysis…</span>
            </div>
          )}

          {payError && (
            <div className="flex items-start gap-2 font-mono text-[10px] text-red-400 border border-red-500/20 bg-red-500/[0.04] px-4 py-3">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{payError}</span>
            </div>
          )}
        </div>
      )}

      {/* General fetch error */}
      {fetchError && (
        <div className="border border-red-500/20 bg-red-500/[0.04] p-4">
          <div className="flex gap-3 items-center text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {fetchError}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {advice && (
        <div className="border border-primary/15 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-primary/[0.03]">
            <CheckCircle2 className="w-4 h-4 text-primary" />
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

            {/* Withdraw preview */}
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
    </div>
  );
}
