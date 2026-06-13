import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useListPools } from "@workspace/api-client-react";
import { truncateAddress } from "@/lib/format";
import {
  Bot, ChevronRight, ChevronLeft, Info, AlertTriangle,
  Zap, Shield, TrendingUp, Cpu, CheckCircle2,
} from "lucide-react";

type Strategy = "conservative" | "balanced" | "aggressive";
type BudgetToken = "ETH" | "USDC";

interface AgentConfig {
  poolAddress: string;
  strategy: Strategy;
  budgetAmount: string;
  budgetToken: BudgetToken;
  rebalanceThreshold: number;
  maxSlippage: number;
  autoCompound: boolean;
  alertsEnabled: boolean;
}

const STRATEGIES: { id: Strategy; label: string; icon: React.ReactNode; desc: string; risk: string; mode: string }[] = [
  {
    id: "conservative",
    label: "Conservative",
    icon: <Shield className="w-5 h-5 text-blue-400" />,
    desc: "Static mode — tight bin range, minimal rebalancing. Prioritizes capital preservation over fee yield.",
    risk: "Low",
    mode: "Static",
  },
  {
    id: "balanced",
    label: "Balanced",
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
    desc: "Both mode — LLM auto-selects bin range based on volatility. Balances fee yield and IL.",
    risk: "Medium",
    mode: "Both / Right",
  },
  {
    id: "aggressive",
    label: "Aggressive",
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    desc: "Right/Left mode — wide range, frequent rebalancing to capture max fees. Higher IL risk.",
    risk: "High",
    mode: "Right / Left",
  },
];

const DEFAULT_CONFIG: AgentConfig = {
  poolAddress: "",
  strategy: "balanced",
  budgetAmount: "0.1",
  budgetToken: "ETH",
  rebalanceThreshold: 5,
  maxSlippage: 0.5,
  autoCompound: true,
  alertsEnabled: true,
};

export default function AgentSetup() {
  const { isConnected, address } = useAccount();
  const { data: pools } = useListPools();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG);
  const [launched, setLaunched] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
          <Bot className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-sm">A connected Base Mainnet wallet is required to deploy an agent.</p>
        </div>
        <ConnectButton />
      </div>
    );
  }

  if (launched) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-md mx-auto animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl border border-primary/30 bg-primary/8 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Agent Deployed</h1>
          <p className="text-sm text-white/40 leading-relaxed">
            Your agent is initializing. It will scan Maverick V2 pools on Base, run LLM analysis,
            and prompt you to sign transactions when action is needed.
          </p>
        </div>
        <div className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-left space-y-2 font-mono text-xs">
          <div className="flex justify-between"><span className="text-white/30">Pool</span><span className="text-white/70">{pools?.find(p => p.poolAddress === config.poolAddress)?.tokenASymbol ?? "—"}/{pools?.find(p => p.poolAddress === config.poolAddress)?.tokenBSymbol ?? "—"}</span></div>
          <div className="flex justify-between"><span className="text-white/30">Strategy</span><span className="text-white/70 capitalize">{config.strategy}</span></div>
          <div className="flex justify-between"><span className="text-white/30">Budget</span><span className="text-white/70">{config.budgetAmount} {config.budgetToken}</span></div>
          <div className="flex justify-between"><span className="text-white/30">Wallet</span><span className="text-white/70">{truncateAddress(address ?? "")}</span></div>
        </div>
        <div className="flex gap-3">
          <a href="/monitor" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-[#080808] hover:opacity-90 transition-opacity">
            Go to Monitor <ChevronRight className="w-4 h-4" />
          </a>
          <button onClick={() => { setLaunched(false); setStep(1); setConfig(DEFAULT_CONFIG); }}
            className="px-4 py-2 rounded-lg text-sm border border-white/[0.08] text-white/50 hover:text-white/80 transition-colors">
            Deploy Another
          </button>
        </div>
      </div>
    );
  }

  const selectedPool = pools?.find(p => p.poolAddress === config.poolAddress);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Setup Agent</h1>
        <p className="text-xs text-white/35 font-mono mt-0.5">
          Configure an autonomous DLMM agent — the LLM selects pools and actions. You sign all transactions.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
              s < step ? "bg-primary text-[#080808]" : s === step ? "border border-primary text-primary" : "border border-white/[0.12] text-white/25"
            }`}>{s < step ? "✓" : s}</div>
            {s < 3 && <div className={`h-px w-8 transition-colors ${s < step ? "bg-primary/40" : "bg-white/[0.08]"}`} />}
          </div>
        ))}
        <span className="text-[10px] text-white/25 font-mono ml-2">
          {step === 1 ? "Choose Pool" : step === 2 ? "Set Strategy" : "Review & Deploy"}
        </span>
      </div>

      {/* Step 1: Pool */}
      {step === 1 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Step 1 — Choose Pool</div>
          <p className="text-xs text-white/30 leading-relaxed">
            Select a Maverick V2 DLMM pool on Base. The agent AI can also discover the best pool automatically based on current market conditions — leave it on <span className="text-primary/70">Auto-select</span>.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block">Pool Target</label>
            <select
              value={config.poolAddress}
              onChange={(e) => setConfig({ ...config, poolAddress: e.target.value })}
              className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono appearance-none cursor-pointer"
            >
              <option value="">Auto-select (recommended — LLM picks best pool)</option>
              {pools?.map((p) => (
                <option key={p.poolAddress} value={p.poolAddress}>
                  {p.tokenASymbol}/{p.tokenBSymbol} · {truncateAddress(p.poolAddress)}
                </option>
              ))}
            </select>
          </div>

          {config.poolAddress === "" && (
            <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 p-3">
              <Cpu className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
              <p className="text-xs text-primary/60 leading-relaxed">
                Auto-select mode: the agent LLM evaluates all supported pools, ranks by risk-adjusted fee opportunity, and targets the best match for your strategy.
              </p>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Strategy + Budget */}
      {step === 2 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Step 2 — Strategy & Budget</div>

          {/* Strategy */}
          <div className="space-y-2">
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block">Strategy Mode</label>
            <div className="grid grid-cols-1 gap-2">
              {STRATEGIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setConfig({ ...config, strategy: s.id })}
                  className={`w-full text-left rounded-lg border p-4 transition-all ${
                    config.strategy === s.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {s.icon}
                      <span className="font-bold text-sm">{s.label}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono text-white/30 border border-white/[0.08] rounded px-2 py-0.5">Risk: {s.risk}</span>
                      <span className="text-[10px] font-mono text-white/30 border border-white/[0.08] rounded px-2 py-0.5">{s.mode}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block">Budget</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.budgetAmount}
                onChange={(e) => setConfig({ ...config, budgetAmount: e.target.value })}
                className="flex-1 bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono"
                placeholder="0.1"
              />
              <select
                value={config.budgetToken}
                onChange={(e) => setConfig({ ...config, budgetToken: e.target.value as BudgetToken })}
                className="bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono appearance-none cursor-pointer"
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
            <p className="text-[10px] text-white/20 font-mono">
              Budget stays in your wallet — the agent only requests signatures when executing a trade.
            </p>
          </div>

          {/* Advanced */}
          <div className="space-y-3 pt-2 border-t border-white/[0.06]">
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono">Advanced (defaults are safe)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/20 font-mono block mb-1">Rebalance Threshold (%)</label>
                <input type="number" min={1} max={20} value={config.rebalanceThreshold}
                  onChange={(e) => setConfig({ ...config, rebalanceThreshold: Number(e.target.value) })}
                  className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-primary/40 font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-white/20 font-mono block mb-1">Max Slippage (%)</label>
                <input type="number" min={0.1} max={5} step={0.1} value={config.maxSlippage}
                  onChange={(e) => setConfig({ ...config, maxSlippage: Number(e.target.value) })}
                  className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-primary/40 font-mono" />
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { key: "autoCompound", label: "Auto-compound fees" },
                { key: "alertsEnabled", label: "Enable alerts" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={config[key as keyof AgentConfig] as boolean}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                    className="accent-primary w-3.5 h-3.5" />
                  <span className="text-xs text-white/40 font-mono">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-lg text-sm border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(3)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity">
              Review <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Step 3 — Review & Deploy</div>

          <div className="rounded-lg border border-white/[0.06] bg-black/30 p-4 space-y-3 font-mono text-sm">
            {[
              ["Pool", selectedPool ? `${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol}` : "Auto-select (LLM)"],
              ["Strategy", STRATEGIES.find(s => s.id === config.strategy)?.label ?? "—"],
              ["Mode", STRATEGIES.find(s => s.id === config.strategy)?.mode ?? "—"],
              ["Budget", `${config.budgetAmount} ${config.budgetToken}`],
              ["Rebalance threshold", `±${config.rebalanceThreshold}%`],
              ["Max slippage", `${config.maxSlippage}%`],
              ["Auto-compound", config.autoCompound ? "Yes" : "No"],
              ["Alerts", config.alertsEnabled ? "Enabled" : "Disabled"],
              ["Wallet", truncateAddress(address ?? "")],
              ["Network", "Base Mainnet"],
              ["Payment model", "x402 micropayment per LLM query (~0.05 USDC/USDC on Base)"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-white/25">{label}</span>
                <span className="text-white/75 text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/15 bg-amber-500/5 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/60 leading-relaxed">
              The agent will request your wallet signature before every on-chain action. GlidePool never holds your funds or private keys.
              Each LLM analysis query costs ~0.05 USDC via x402 on Base.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-lg text-sm border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setLaunched(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity glow-green"
            >
              <Bot className="w-4 h-4" /> Deploy Agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
