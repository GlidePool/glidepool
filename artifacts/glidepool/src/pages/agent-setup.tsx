import { useState } from "react";
import { useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { truncateAddress } from "@/lib/format";
import {
  Bot, ChevronRight, ChevronLeft, AlertTriangle,
  Zap, Shield, TrendingUp, Cpu, CheckCircle2, Loader2,
} from "lucide-react";

type Strategy = "static" | "balanced" | "aggressive";

interface AgentConfig {
  poolAddress: string;
  strategy: Strategy;
  budgetUsdc: number;
  analysisIntervalSec: number;
}

interface Pool {
  poolAddress: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  tvlUsd: number;
  currentPrice: number;
  feeRate: number;
}

interface Agent {
  id: string;
  poolAddress: string;
  strategy: string;
  status: string;
}

const STRATEGIES = [
  { id: "static" as Strategy,     label: "Static (Conservative)", icon: <Shield className="w-5 h-5 text-blue-400" />,   risk: "Low",    desc: "Tight bin range, minimal rebalancing. Prioritizes capital preservation over fee yield." },
  { id: "balanced" as Strategy,   label: "Balanced",              icon: <TrendingUp className="w-5 h-5 text-primary" />, risk: "Medium", desc: "LLM auto-selects bin range based on volatility. Balances fee yield and impermanent loss." },
  { id: "aggressive" as Strategy, label: "Aggressive",            icon: <Zap className="w-5 h-5 text-amber-400" />,     risk: "High",   desc: "Wide range, frequent rebalancing to capture max fees. Higher IL risk." },
];

const DEFAULT: AgentConfig = {
  poolAddress: "", strategy: "balanced", budgetUsdc: 100, analysisIntervalSec: 60,
};

const inputCls = "w-full bg-black/40 border border-white/[0.10] px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono";

function WalletGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center px-4">
      <div className="w-14 h-14 border border-white/[0.10] flex items-center justify-center">
        <Bot className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Connect your wallet</h1>
        <p className="text-sm text-white/40 max-w-xs leading-relaxed font-mono">A connected Base Mainnet wallet is required to deploy an agent.</p>
      </div>
      <w3m-button />
    </div>
  );
}

export default function AgentSetup() {
  const { isConnected, address } = useAccount();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [cfg, setCfg] = useState<AgentConfig>(DEFAULT);
  const [deployedAgent, setDeployedAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: pools } = useQuery<Pool[]>({
    queryKey: ["pools"],
    queryFn: () => fetch("/api/pools").then((r) => r.json()),
  });

  const createAgent = useMutation({
    mutationFn: async (config: AgentConfig) => {
      const body = {
        userAddress: address,
        poolAddress: config.poolAddress || (pools?.[0]?.poolAddress ?? ""),
        strategy: config.strategy,
        budgetUsdc: config.budgetUsdc,
        analysisIntervalSec: config.analysisIntervalSec,
      };
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to create agent");
      }
      return res.json() as Promise<Agent>;
    },
    onSuccess: (agent) => {
      setDeployedAgent(agent);
      void queryClient.invalidateQueries({ queryKey: ["agents", address] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  if (!isConnected) return <WalletGate />;

  const selectedPool = pools?.find((p) => p.poolAddress === cfg.poolAddress);
  const strategyMeta = STRATEGIES.find((s) => s.id === cfg.strategy)!;

  if (deployedAgent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center max-w-md mx-auto animate-in fade-in duration-400">
        <div className="w-14 h-14 border border-primary/40 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <div className="font-mono text-[9px] text-primary/40 uppercase tracking-widest mb-2">Deployed</div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Agent Running</h1>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs font-mono">
            Agent is live on the server. LLM analysis runs every {cfg.analysisIntervalSec}s. Pending transactions will appear in your dashboard.
          </p>
        </div>
        <div className="w-full border border-white/[0.10] divide-y divide-white/[0.08]">
          {[
            ["Agent ID", deployedAgent.id.slice(0, 12) + "…"],
            ["Pool",     selectedPool ? `${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol}` : "Auto-selected"],
            ["Strategy", strategyMeta.label],
            ["Budget",   `${cfg.budgetUsdc} USDC`],
            ["Interval", `${cfg.analysisIntervalSec}s`],
            ["Wallet",   truncateAddress(address ?? "")],
            ["Network",  "Base Mainnet"],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between gap-4 px-4 py-3">
              <span className="font-mono text-[10px] text-white/30">{l}</span>
              <span className="font-mono text-[10px] text-white/70 text-right">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button onClick={() => setLocation("/dashboard")}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-primary text-[#080808] hover:opacity-90 transition-opacity font-mono">
            Go to Dashboard <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => { setDeployedAgent(null); setStep(1); setCfg(DEFAULT); setError(null); }}
            className="flex-1 px-4 py-3 text-sm border border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors font-mono">
            Deploy Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto animate-in fade-in duration-400">

      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Setup</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Deploy Agent</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">Autonomous LLM agent for Maverick V2 DLMM on Base. You sign all transactions.</p>
      </div>

      <div className="flex items-center gap-0 border border-white/[0.10]">
        {[{ n: 1, label: "Pool" }, { n: 2, label: "Strategy" }, { n: 3, label: "Deploy" }].map((s) => (
          <div key={s.n} className={`flex-1 flex items-center gap-2.5 px-4 py-3 border-r last:border-r-0 border-white/[0.10] transition-colors ${s.n === step ? "bg-primary/[0.05] border-b-2 border-b-primary/60" : ""}`}>
            <div className={`w-5 h-5 flex items-center justify-center text-[9px] font-mono font-bold shrink-0 border transition-all ${s.n < step ? "bg-primary text-[#080808] border-primary" : s.n === step ? "border-primary text-primary" : "border-white/[0.12] text-white/25"}`}>
              {s.n < step ? "✓" : s.n}
            </div>
            <span className={`font-mono text-[10px] hidden sm:block ${s.n === step ? "text-white/60" : "text-white/25"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="border border-white/[0.10] animate-in fade-in duration-200">
          <div className="px-5 py-3 border-b border-white/[0.10]">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Step 1 — Choose Pool</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Pool Target</label>
              <select value={cfg.poolAddress} onChange={(e) => setCfg({ ...cfg, poolAddress: e.target.value })} className={inputCls + " appearance-none cursor-pointer"}>
                <option value="">Auto-select (LLM picks best pool)</option>
                {pools?.map((p) => (
                  <option key={p.poolAddress} value={p.poolAddress}>
                    {p.tokenASymbol}/{p.tokenBSymbol} · TVL ${p.tvlUsd.toFixed(0)} · Fee {(p.feeRate * 100).toFixed(3)}%
                  </option>
                ))}
              </select>
            </div>
            {cfg.poolAddress === "" && (
              <div className="flex items-start gap-2.5 border border-primary/15 bg-primary/[0.04] p-3">
                <Cpu className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                <p className="font-mono text-[10px] text-primary/60 leading-relaxed">
                  LLM evaluates all supported Maverick V2 pools and targets the best risk-adjusted opportunity.
                </p>
              </div>
            )}
            <button onClick={() => setStep(2)} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity font-mono">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="border border-white/[0.10] animate-in fade-in duration-200">
          <div className="px-5 py-3 border-b border-white/[0.10]">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Step 2 — Strategy & Budget</span>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-2.5">Strategy Mode</label>
              <div className="flex flex-col gap-0 border border-white/[0.10] divide-y divide-white/[0.10]">
                {STRATEGIES.map((s) => (
                  <button key={s.id} onClick={() => setCfg({ ...cfg, strategy: s.id })}
                    className={`w-full text-left p-4 transition-colors ${cfg.strategy === s.id ? "bg-primary/[0.05]" : "hover:bg-white/[0.02]"}`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${cfg.strategy === s.id ? "border-primary bg-primary" : "border-white/[0.15]"}`}>
                          {cfg.strategy === s.id && <div className="w-1.5 h-1.5 bg-[#080808]" />}
                        </div>
                        <span className="font-bold text-sm">{s.label}</span>
                      </div>
                      <span className="font-mono text-[9px] text-white/30 border border-white/[0.08] px-1.5 py-0.5">Risk: {s.risk}</span>
                    </div>
                    <p className="font-mono text-[10px] text-white/35 leading-relaxed ml-6">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Budget (USDC reference)</label>
              <input type="number" min="1" step="1" value={cfg.budgetUsdc}
                onChange={(e) => setCfg({ ...cfg, budgetUsdc: Number(e.target.value) })}
                className={inputCls} />
              <p className="font-mono text-[9px] text-white/20 mt-1">Budget stays in your wallet. Agent only requests signatures for actions.</p>
            </div>
            <div>
              <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Analysis Interval (seconds)</label>
              <input type="number" min="30" max="3600" step="10" value={cfg.analysisIntervalSec}
                onChange={(e) => setCfg({ ...cfg, analysisIntervalSec: Number(e.target.value) })}
                className={inputCls} />
              <p className="font-mono text-[9px] text-white/20 mt-1">How often the LLM analyzes the pool and proposes actions.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2.5 text-sm border border-white/[0.10] text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1.5 shrink-0 font-mono">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity font-mono">
                Review <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="border border-white/[0.10] animate-in fade-in duration-200">
          <div className="px-5 py-3 border-b border-white/[0.10]">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Step 3 — Review & Deploy</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="border border-white/[0.08] divide-y divide-white/[0.06]">
              {[
                ["Pool",     selectedPool ? `${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol}` : "Auto-select"],
                ["Strategy", strategyMeta.label],
                ["Budget",   `${cfg.budgetUsdc} USDC`],
                ["Interval", `${cfg.analysisIntervalSec}s`],
                ["Wallet",   truncateAddress(address ?? "")],
                ["Network",  "Base Mainnet"],
                ["x402",     "~0.05 USDC/analysis (if enabled)"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="font-mono text-[10px] text-white/30">{l}</span>
                  <span className="font-mono text-[10px] text-white/70 text-right">{v}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2.5 border border-red-500/20 bg-red-500/[0.05] p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="font-mono text-[10px] text-red-400/80">{error}</p>
              </div>
            )}

            <div className="flex items-start gap-2.5 border border-amber-500/15 bg-amber-500/[0.04] p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="font-mono text-[10px] text-amber-300/60 leading-relaxed">
                Agent runs on the GlidePool server. Every on-chain action requires your wallet signature. GlidePool never holds your funds or private keys.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-2.5 text-sm border border-white/[0.10] text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1.5 shrink-0 font-mono">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => createAgent.mutate(cfg)}
                disabled={createAgent.isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 disabled:opacity-50 transition-opacity font-mono">
                {createAgent.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deploying…</>
                ) : (
                  <><Bot className="w-4 h-4" /> Deploy Agent</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
