import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useListPools } from "@workspace/api-client-react";
import { truncateAddress } from "@/lib/format";
import {
  Bot, ChevronRight, ChevronLeft, AlertTriangle,
  Zap, Shield, TrendingUp, Cpu, CheckCircle2,
} from "lucide-react";

type Strategy   = "conservative" | "balanced" | "aggressive";
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

const STRATEGIES = [
  { id: "conservative" as Strategy, label: "Conservative", icon: <Shield className="w-5 h-5 text-blue-400" />,   risk: "Low",    mode: "Static",     desc: "Tight bin range, minimal rebalancing. Prioritizes capital preservation over fee yield." },
  { id: "balanced"     as Strategy, label: "Balanced",     icon: <TrendingUp className="w-5 h-5 text-primary" />, risk: "Medium", mode: "Both/Right", desc: "LLM auto-selects bin range based on volatility. Balances fee yield and impermanent loss." },
  { id: "aggressive"   as Strategy, label: "Aggressive",   icon: <Zap className="w-5 h-5 text-amber-400" />,     risk: "High",   mode: "Right/Left", desc: "Wide range, frequent rebalancing to capture max fees. Higher IL risk." },
];

const DEFAULT: AgentConfig = {
  poolAddress: "", strategy: "balanced",
  budgetAmount: "0.1", budgetToken: "ETH",
  rebalanceThreshold: 5, maxSlippage: 0.5,
  autoCompound: true, alertsEnabled: true,
};

const inputCls = "w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono";
const selectCls = inputCls + " appearance-none cursor-pointer";

function WalletGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-5 text-center px-4">
      <div className="w-14 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
        <Bot className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1.5">Connect your wallet</h1>
        <p className="text-sm text-white/40 max-w-xs leading-relaxed">A connected Base Mainnet wallet is required to deploy an agent.</p>
      </div>
      <ConnectButton />
    </div>
  );
}

export default function AgentSetup() {
  const { isConnected, address } = useAccount();
  const { data: pools } = useListPools();
  const [step, setStep]     = useState(1);
  const [cfg,  setCfg]      = useState<AgentConfig>(DEFAULT);
  const [launched, setLaunched] = useState(false);

  if (!isConnected) return <WalletGate />;

  const selectedPool = pools?.find(p => p.poolAddress === cfg.poolAddress);
  const strategyMeta = STRATEGIES.find(s => s.id === cfg.strategy)!;

  if (launched) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-5 text-center max-w-md mx-auto animate-in fade-in duration-400">
        <div className="w-14 h-14 rounded-2xl border border-primary/30 bg-primary/8 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-1.5">Agent Deployed</h1>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs">
            Your agent is initializing. It will scan Maverick V2 pools, run LLM analysis, and prompt you to sign transactions.
          </p>
        </div>
        <div className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-left space-y-2 font-mono text-xs">
          {[
            ["Pool",     selectedPool ? `${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol}` : "Auto-select (LLM)"],
            ["Strategy", strategyMeta.label],
            ["Budget",   `${cfg.budgetAmount} ${cfg.budgetToken}`],
            ["Wallet",   truncateAddress(address ?? "")],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between gap-4">
              <span className="text-white/30">{l}</span>
              <span className="text-white/70 text-right">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <a href="/monitor" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-[#080808] hover:opacity-90 transition-opacity">
            Go to Monitor <ChevronRight className="w-4 h-4" />
          </a>
          <button onClick={() => { setLaunched(false); setStep(1); setCfg(DEFAULT); }}
            className="px-4 py-2.5 rounded-lg text-sm border border-white/[0.08] text-white/50 hover:text-white/80 transition-colors">
            Deploy Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto animate-in fade-in duration-400">

      {/* Title */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Setup Agent</h1>
        <p className="text-xs text-white/35 font-mono mt-0.5">Configure an autonomous DLMM agent — LLM selects actions. You sign all transactions.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
              s < step ? "bg-primary text-[#080808]" : s === step ? "border border-primary text-primary" : "border border-white/[0.12] text-white/25"
            }`}>{s < step ? "✓" : s}</div>
            {s < 3 && <div className={`h-px w-6 sm:w-10 transition-colors ${s < step ? "bg-primary/40" : "bg-white/[0.08]"}`} />}
          </div>
        ))}
        <span className="text-[10px] text-white/25 font-mono ml-2 hidden sm:block">
          {["Choose Pool", "Strategy & Budget", "Review & Deploy"][step - 1]}
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Step 1 — Choose Pool</div>
          <p className="text-xs text-white/30 leading-relaxed">
            Select a Maverick V2 DLMM pool on Base, or leave on <span className="text-primary/70">Auto-select</span> — the LLM picks the best pool based on current market conditions.
          </p>
          <div>
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block mb-1.5">Pool Target</label>
            <select value={cfg.poolAddress} onChange={(e) => setCfg({ ...cfg, poolAddress: e.target.value })} className={selectCls}>
              <option value="">Auto-select (recommended — LLM picks best pool)</option>
              {pools?.map((p) => (
                <option key={p.poolAddress} value={p.poolAddress}>
                  {p.tokenASymbol}/{p.tokenBSymbol} · {truncateAddress(p.poolAddress)}
                </option>
              ))}
            </select>
          </div>
          {cfg.poolAddress === "" && (
            <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 p-3">
              <Cpu className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
              <p className="text-xs text-primary/60 leading-relaxed">
                The agent LLM evaluates all supported pools, ranks by risk-adjusted fee opportunity, and targets the best match for your strategy.
              </p>
            </div>
          )}
          <button onClick={() => setStep(2)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-5">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Step 2 — Strategy & Budget</div>

          {/* Strategy cards */}
          <div>
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block mb-2">Strategy Mode</label>
            <div className="flex flex-col gap-2">
              {STRATEGIES.map((s) => (
                <button key={s.id} onClick={() => setCfg({ ...cfg, strategy: s.id })}
                  className={`w-full text-left rounded-lg border p-3.5 sm:p-4 transition-all ${
                    cfg.strategy === s.id ? "border-primary/30 bg-primary/5" : "border-white/[0.07] hover:border-white/[0.14]"
                  }`}>
                  <div className="flex items-start sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {s.icon}
                      <span className="font-bold text-sm">{s.label}</span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-white/30 border border-white/[0.08] rounded px-1.5 py-0.5">Risk: {s.risk}</span>
                      <span className="text-[10px] font-mono text-white/30 border border-white/[0.08] rounded px-1.5 py-0.5 hidden sm:inline">{s.mode}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block mb-1.5">Budget</label>
            <div className="flex gap-2">
              <input type="number" min="0" step="0.01" value={cfg.budgetAmount} placeholder="0.1"
                onChange={(e) => setCfg({ ...cfg, budgetAmount: e.target.value })}
                className={inputCls + " flex-1"} />
              <select value={cfg.budgetToken} onChange={(e) => setCfg({ ...cfg, budgetToken: e.target.value as BudgetToken })}
                className="bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 font-mono appearance-none cursor-pointer w-24">
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
            <p className="text-[10px] text-white/20 font-mono mt-1">Budget stays in your wallet — agent only requests signatures for trades.</p>
          </div>

          {/* Advanced */}
          <div className="pt-2 border-t border-white/[0.06] space-y-3">
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono">Advanced — defaults are safe</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/20 font-mono block mb-1">Rebalance Threshold (%)</label>
                <input type="number" min={1} max={20} value={cfg.rebalanceThreshold}
                  onChange={(e) => setCfg({ ...cfg, rebalanceThreshold: Number(e.target.value) })}
                  className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-white/20 font-mono block mb-1">Max Slippage (%)</label>
                <input type="number" min={0.1} max={5} step={0.1} value={cfg.maxSlippage}
                  onChange={(e) => setCfg({ ...cfg, maxSlippage: Number(e.target.value) })}
                  className={inputCls} />
              </div>
            </div>
            <div className="flex flex-wrap gap-5">
              {[
                { key: "autoCompound",   label: "Auto-compound fees" },
                { key: "alertsEnabled",  label: "Enable alerts" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cfg[key as keyof AgentConfig] as boolean}
                    onChange={(e) => setCfg({ ...cfg, [key]: e.target.checked })}
                    className="accent-primary w-3.5 h-3.5" />
                  <span className="text-xs text-white/40 font-mono">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-lg text-sm border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1.5 shrink-0">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(3)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity">
              Review <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Step 3 — Review & Deploy</div>

          <div className="rounded-lg border border-white/[0.06] bg-black/30 p-4 space-y-2.5 font-mono text-xs">
            {[
              ["Pool",       selectedPool ? `${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol}` : "Auto-select (LLM)"],
              ["Strategy",   strategyMeta.label],
              ["Mode",       strategyMeta.mode],
              ["Budget",     `${cfg.budgetAmount} ${cfg.budgetToken}`],
              ["Rebalance",  `±${cfg.rebalanceThreshold}%`],
              ["Slippage",   `${cfg.maxSlippage}%`],
              ["Compound",   cfg.autoCompound  ? "Yes" : "No"],
              ["Alerts",     cfg.alertsEnabled ? "Enabled" : "Disabled"],
              ["Wallet",     truncateAddress(address ?? "")],
              ["Network",    "Base Mainnet"],
              ["Payment",    "~0.05 USDC / LLM query (x402)"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4 flex-wrap">
                <span className="text-white/30">{l}</span>
                <span className="text-white/75 text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/15 bg-amber-500/5 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/60 leading-relaxed">
              The agent requests your wallet signature before every on-chain action. GlidePool never holds your funds or private keys.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-lg text-sm border border-white/[0.08] text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1.5 shrink-0">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setLaunched(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity glow-green">
              <Bot className="w-4 h-4" /> Deploy Agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
