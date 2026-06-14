import { useState } from "react";
import { useAccount } from "wagmi";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useListPools, getListPoolsQueryKey } from "@workspace/api-client-react";
import { truncateAddress } from "@/lib/format";
import {
  Bot, Loader2, CheckCircle2, AlertTriangle,
  ArrowRight, Wallet2, Activity, Info, Key, Eye, EyeOff, ShieldAlert,
} from "lucide-react";

const STRATEGY_OPTIONS = [
  {
    value: "static",
    label: "Static",
    desc: "Tight bin range, concentrated liquidity. No movement with price — highest fees when in range, max IL risk if price drifts far.",
  },
  {
    value: "balanced",
    label: "Balanced",
    desc: "Both mode — follows price both directions. Rebalances automatically. Best default for most pools.",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    desc: "Right/Left mode, follows trend. Moves aggressively with momentum. Higher potential fees, higher IL risk.",
  },
] as const;

type Strategy = typeof STRATEGY_OPTIONS[number]["value"];

const INTERVAL_OPTIONS = [
  { value: 60,   label: "1 min"  },
  { value: 300,  label: "5 min"  },
  { value: 900,  label: "15 min" },
  { value: 1800, label: "30 min" },
  { value: 3600, label: "1 hour" },
];

const inputCls  = "w-full bg-black/40 border border-white/[0.10] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-colors";
const selectCls = inputCls + " appearance-none cursor-pointer";

interface CreateAgentResponse {
  id: string;
  userAddress: string;
  poolAddress: string;
  strategy: string;
  budgetUsdc: string;
  status: string;
  analysisIntervalSec: number;
}

export default function AgentSetup() {
  const { address, isConnected } = useAccount();
  const [, navigate]   = useLocation();

  const [pool,        setPool]      = useState("");
  const [strategy,    setStrat]     = useState<Strategy>("balanced");
  const [budget,      setBudget]    = useState("100");
  const [interval,    setInt]       = useState(300);
  const [privateKey,  setPrivKey]   = useState("");
  const [showKey,     setShowKey]   = useState(false);
  const [keyExpanded, setKeyExpand] = useState(false);
  const [created,     setCreated]   = useState<CreateAgentResponse | null>(null);

  const { data: pools, isLoading: poolsLoading } = useListPools({
    query: { queryKey: getListPoolsQueryKey() },
  });

  // Basic private key format check (0x + 64 hex chars)
  const keyValid  = privateKey === "" || /^0x[0-9a-fA-F]{64}$/.test(privateKey);
  const budgetNum = Number(budget);
  const budgetValid = !isNaN(budgetNum) && budgetNum >= 10;

  const createAgent = useMutation<CreateAgentResponse, Error, void>({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        userAddress: address,
        poolAddress: pool,
        strategy,
        budgetUsdc: Number(budget),
        analysisIntervalSec: interval,
      };
      if (privateKey) body.agentPrivateKey = privateKey;

      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to create agent");
      }
      return res.json() as Promise<CreateAgentResponse>;
    },
    onSuccess: (data) => setCreated(data),
  });

  const selectedPool = pools?.find((p) => p.poolAddress === pool);
  const isAutonomous = privateKey !== "" && keyValid;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center px-4">
        <div className="w-14 h-14 border border-white/[0.10] flex items-center justify-center">
          <Wallet2 className="w-6 h-6 text-white/25" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed font-mono">
            Connect a Base Mainnet wallet to deploy an autonomous DLMM agent.
          </p>
        </div>
        <w3m-button />
      </div>
    );
  }

  if (created) {
    return (
      <div className="flex flex-col gap-5 max-w-lg mx-auto animate-in fade-in duration-400">
        <div className="border border-primary/30 bg-primary/[0.04] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span className="font-bold text-sm">Agent deployed</span>
            {isAutonomous && (
              <span className="ml-auto font-mono text-[9px] px-2 py-0.5 border border-primary/30 text-primary/70">
                AUTONOMOUS
              </span>
            )}
          </div>
          <div className="space-y-1.5 font-mono text-[10px] text-white/50">
            <div className="flex justify-between">
              <span className="text-white/25">Agent ID</span>
              <span className="text-white/70">{created.id.slice(0, 8)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/25">Pool</span>
              <span className="text-white/70">{truncateAddress(created.poolAddress)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/25">Strategy</span>
              <span className="text-white/70">{created.strategy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/25">Budget</span>
              <span className="text-white/70">{created.budgetUsdc} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/25">Status</span>
              <span className="text-primary">{created.status.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/25">Wallet key</span>
              <span className={isAutonomous ? "text-primary/70" : "text-white/25"}>
                {isAutonomous ? "Stored — fully autonomous" : "None — manual signing required"}
              </span>
            </div>
          </div>
          <p className="font-mono text-[10px] text-white/30 leading-relaxed border-t border-white/[0.06] pt-3">
            {isAutonomous
              ? `The agent runs fully autonomous — it reads pool state, auto-pays 0.001 USDC x402 per cycle, calls Claude Opus 4, and queues on-chain actions every ${interval}s. The agent wallet key is stored server-side and never returned via API.`
              : `The agent loop runs server-side every ${interval}s. It reads live pool state, calls Claude Opus 4, and queues on-chain actions for your wallet signature. Open Monitor to see decisions as they happen.`
            }
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => navigate("/monitor")}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-mono font-bold bg-primary text-[#080808] hover:opacity-90 transition-opacity"
            >
              <Activity className="w-3.5 h-3.5" /> Open Monitor
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-mono border border-white/[0.10] text-white/50 hover:text-white/80 transition-colors"
            >
              Dashboard <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={() => setCreated(null)}
            className="text-[10px] text-white/20 hover:text-white/40 font-mono transition-colors text-center"
          >
            Deploy another agent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto animate-in fade-in duration-400">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Agent Layer</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Deploy Agent</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">
          Configure an autonomous LLM agent to monitor and manage a DLMM pool on Base.
        </p>
      </div>

      {/* How it works */}
      <div className="border border-white/[0.08] bg-white/[0.02] p-4 flex gap-3 items-start">
        <Info className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
        <div className="font-mono text-[10px] leading-relaxed space-y-1 text-white/40">
          <p>The agent runs <span className="text-white/70">server-side</span> on a loop — reads live pool state, calls Claude Opus 4, and queues action recommendations.</p>
          <p>Without a private key: every on-chain action requires <span className="text-white/70">your wallet signature</span>.</p>
          <p>With a private key: the agent auto-pays x402 micropayments and can sign actions <span className="text-white/70">fully autonomously</span>.</p>
        </div>
      </div>

      {/* Form */}
      <div className="border border-white/[0.10] space-y-0">
        <div className="px-5 py-3 border-b border-white/[0.10]">
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Configuration</span>
        </div>

        <div className="p-5 space-y-5">

          {/* Pool */}
          <div>
            <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">
              Pool <span className="text-red-400">*</span>
            </label>
            <select
              value={pool}
              onChange={(e) => setPool(e.target.value)}
              className={selectCls}
              disabled={poolsLoading}
            >
              <option value="">{poolsLoading ? "Loading pools…" : "Select a pool…"}</option>
              {pools?.map((p) => (
                <option key={p.poolAddress} value={p.poolAddress}>
                  {p.tokenASymbol}/{p.tokenBSymbol} · {truncateAddress(p.poolAddress)} · {((p.feeRate ?? 0) * 100).toFixed(4)}%
                </option>
              ))}
            </select>
            {selectedPool && (
              <p className="font-mono text-[9px] text-white/25 mt-1.5">
                {selectedPool.poolAddress}
              </p>
            )}
          </div>

          {/* Strategy */}
          <div>
            <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-2">
              Strategy <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {STRATEGY_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStrat(s.value)}
                  className={[
                    "w-full text-left p-3 border transition-colors",
                    strategy === s.value
                      ? "border-primary/40 bg-primary/[0.05]"
                      : "border-white/[0.08] hover:border-white/[0.16]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-mono text-xs font-bold ${strategy === s.value ? "text-primary" : "text-white/70"}`}>
                      {s.label}
                    </span>
                    {strategy === s.value && <span className="w-1.5 h-1.5 bg-primary" />}
                  </div>
                  <p className="font-mono text-[9px] text-white/30 leading-relaxed">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">
              USDC Budget <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                step={10}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="100"
                className={inputCls + " pr-14"}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-white/25 pointer-events-none">USDC</span>
            </div>
            <p className="font-mono text-[9px] text-white/20 mt-1.5">
              Minimum 10 USDC. Cap on how much the agent is authorized to move on-chain.
            </p>
            {budget && !budgetValid && (
              <p className="font-mono text-[9px] text-red-400/70 mt-1">Must be ≥ 10 USDC</p>
            )}
          </div>

          {/* Interval */}
          <div>
            <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">
              Analysis Interval
            </label>
            <select
              value={interval}
              onChange={(e) => setInt(Number(e.target.value))}
              className={selectCls}
            >
              {INTERVAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="font-mono text-[9px] text-white/20 mt-1.5">
              How often the agent reads pool state and calls Claude Opus 4.
            </p>
          </div>

          {/* ── Agent Wallet (private key) ─────────────────────────────────── */}
          <div className="border-t border-white/[0.06] pt-4">
            <button
              type="button"
              onClick={() => setKeyExpand(!keyExpanded)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Key className={`w-3.5 h-3.5 transition-colors ${isAutonomous ? "text-primary" : "text-white/30 group-hover:text-white/50"}`} />
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">
                  Agent Wallet (optional — enables full autonomy)
                </span>
              </div>
              {isAutonomous && (
                <span className="font-mono text-[9px] px-2 py-0.5 border border-primary/30 text-primary/70">AUTONOMOUS</span>
              )}
            </button>

            {keyExpanded && (
              <div className="mt-3 space-y-3 animate-in fade-in duration-200">

                {/* Security warning */}
                <div className="border border-amber-500/20 bg-amber-500/[0.04] p-3 flex gap-2 items-start">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="font-mono text-[9px] text-amber-400/80 leading-relaxed">
                    Use a <span className="font-bold">dedicated burner wallet</span> with only small amounts of ETH (for gas) and USDC (for x402 fees).
                    Never use your main wallet. The private key is stored server-side in plaintext — treat this deployment as a prototype.
                  </p>
                </div>

                <div>
                  <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">
                    Private Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={privateKey}
                      onChange={(e) => setPrivKey(e.target.value)}
                      placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
                      className={inputCls + " pr-10 font-mono text-[11px]"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {privateKey && !keyValid && (
                    <p className="font-mono text-[9px] text-red-400/70 mt-1">Must be 0x + 64 hex characters</p>
                  )}
                  <p className="font-mono text-[9px] text-white/20 mt-1.5 leading-relaxed">
                    When provided: the agent auto-pays 0.001 USDC x402 per analysis cycle from this wallet. Top it up with a small ETH balance for gas and USDC for fees.
                  </p>
                </div>

              </div>
            )}
          </div>

          {/* Wallet info */}
          <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-0.5">Owner Wallet</p>
              <p className="font-mono text-[10px] text-white/50">{truncateAddress(address ?? "")}</p>
            </div>
            <span className="font-mono text-[9px] text-primary/60 border border-primary/20 px-2 py-0.5">Base Mainnet</span>
          </div>

          {/* Error */}
          {createAgent.isError && (
            <div className="flex items-start gap-2 border border-red-500/20 bg-red-500/[0.04] p-3">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <p className="font-mono text-[10px] text-red-400/80">{createAgent.error.message}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            disabled={!pool || !budgetValid || !keyValid || createAgent.isPending}
            onClick={() => createAgent.mutate()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 font-mono text-sm font-bold bg-primary text-[#080808] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            {createAgent.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Deploying…</>
            ) : isAutonomous ? (
              <><Key className="w-4 h-4" /> Deploy Autonomous Agent</>
            ) : (
              <><Bot className="w-4 h-4" /> Deploy Agent</>
            )}
          </button>

          <p className="font-mono text-[9px] text-white/20 text-center">
            {isAutonomous
              ? "This agent will auto-pay x402 fees and run fully server-side."
              : "Without a wallet key, on-chain actions require your approval in Monitor."}
          </p>
        </div>
      </div>
    </div>
  );
}
