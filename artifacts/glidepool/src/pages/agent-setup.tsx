import { useState } from "react";
import { useAccount } from "wagmi";
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

const inputCls = "w-full bg-black/40 border border-white/[0.10] px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono";
const selectCls = inputCls + " appearance-none cursor-pointer";

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
  const { data: pools } = useListPools();
  const [step, setStep]     = useState(1);
  const [cfg,  setCfg]      = useState<AgentConfig>(DEFAULT);
  const [launched, setLaunched] = useState(false);

  if (!isConnected) return <WalletGate />;

  const selectedPool = pools?.find(p => p.poolAddress === cfg.poolAddress);
  const strategyMeta = STRATEGIES.find(s => s.id === cfg.strategy)!;

  if (launched) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center max-w-md mx-auto animate-in fade-in duration-400">
        <div className="w-14 h-14 border border-primary/40 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <div className="font-mono text-[9px] text-primary/40 uppercase tracking-widest mb-2">Deployed</div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Agent Deployed</h1>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs font-mono">
            Initializing — scanning Maverick V2 pools, running LLM analysis, prompting wallet signatures.
          </p>
        </div>
        <div className="w-full border border-white/[0.10] divide-y divide-white/[0.08]">
          {[
            ["Pool",     selectedPool ? `${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol}` : "Auto-select (LLM)"],
            ["Strategy", strategyMeta.label],
            ["Budget",   `${cfg.budgetAmount} ${cfg.budgetToken}`],
            ["Wallet",   truncateAddress(address ?? "")],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between gap-4 px-4 py-3">
              <span className="font-mono text-[10px] text-white/30">{l}</span>
              <span className="font-mono text-[10px] text-white/70 text-right">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <a href="/monitor" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-primary text-[#080808] hover:opacity-90 transition-opacity font-mono">
            Go to Monitor <ChevronRight className="w-4 h-4" />
          </a>
          <button onClick={() => { setLaunched(false); setStep(1); setCfg(DEFAULT); }}
            className="flex-1 px-4 py-3 text-sm border border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors font-mono">
            Deploy Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto animate-in fade-in duration-400">

      {/* Page header */}
      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Setup</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Setup Agent</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">Configure an autonomous DLMM agent — LLM selects actions. You sign all transactions.</p>
      </div>

      {/* Step indicator — flat squares */}
      <div className="flex items-center gap-0 border border-white/[0.10]">
        {[
          { n: 1, label: "Pool" },
          { n: 2, label: "Strategy" },
          { n: 3, label: "Deploy" },
        ].map((s, i) => (
          <div key={s.n} className={`flex-1 flex items-center gap-2.5 px-4 py-3 border-r last:border-r-0 border-white/[0.10] transition-colors ${
            s.n === step ? "bg-primary/[0.05] border-b-2 border-b-primary/60" : ""
          }`}>
            <div className={`w-5 h-5 flex items-center justify-center text-[9px] font-mono font-bold shrink-0 border transition-all ${
              s.n < step
                ? "bg-primary text-[#080808] border-primary"
                : s.n === step
                ? "border-primary text-primary"
                : "border-white/[0.12] text-white/25"
            }`}>
              {s.n < step ? "✓" : s.n}
            </div>
            <span className={`font-mono text-[10px] hidden sm:block ${s.n === step ? "text-white/60" : "text-white/25"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="border border-white/[0.10] animate-in fade-in duration-200">
          <div className="px-5 py-3 border-b border-white/[0.10]">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Step 1 — Choose Pool</span>
          </div>
          <div className="p-5 space-y-4">
            <p className="font-mono text-[10px] text-white/30 leading-relaxed">
              Select a Maverick V2 DLMM pool on Base, or leave on <span className="text-primary/70">Auto-select</span> — the LLM picks the best pool based on current conditions.
            </p>
            <div>
              <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Pool Target</label>
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
              <div className="flex items-start gap-2.5 border border-primary/15 bg-primary/[0.04] p-3">
                <Cpu className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                <p className="font-mono text-[10px] text-primary/60 leading-relaxed">
                  Agent LLM evaluates all supported pools, ranks by risk-adjusted fee opportunity, and targets the best match.
                </p>
              </div>
            )}
            <button onClick={() => setStep(2)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity font-mono">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="border border-white/[0.10] animate-in fade-in duration-200">
          <div className="px-5 py-3 border-b border-white/[0.10]">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Step 2 — Strategy & Budget</span>
          </div>
          <div className="p-5 space-y-5">
            {/* Strategy cards */}
            <div>
              <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-2.5">Strategy Mode</label>
              <div className="flex flex-col gap-0 border border-white/[0.10] divide-y divide-white/[0.10]">
                {STRATEGIES.map((s) => (
                  <button key={s.id} onClick={() => setCfg({ ...cfg, strategy: s.id })}
                    className={`w-full text-left p-4 transition-colors ${
                      cfg.strategy === s.id ? "bg-primary/[0.05]" : "hover:bg-white/[0.02]"
                    }`}>
                    <div className="flex items-start sm:items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ${cfg.strategy === s.id ? "border-primary bg-primary" : "border-white/[0.15]"}`}>
                          {cfg.strategy === s.id && <div className="w-1.5 h-1.5 bg-[#080808]" />}
                        </div>
                        <span className="font-bold text-sm">{s.label}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <span className="font-mono text-[9px] text-white/30 border border-white/[0.08] px-1.5 py-0.5">Risk: {s.risk}</span>
                        <span className="font-mono text-[9px] text-white/30 border border-white/[0.08] px-1.5 py-0.5 hidden sm:inline">{s.mode}</span>
                      </div>
                    </div>
                    <p className="font-mono text-[10px] text-white/35 leading-relaxed ml-6">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Budget</label>
              <div className="flex gap-0 border border-white/[0.10]">
                <input type="number" min="0" step="0.01" value={cfg.budgetAmount} placeholder="0.1"
                  onChange={(e) => setCfg({ ...cfg, budgetAmount: e.target.value })}
                  className="flex-1 bg-black/40 border-0 border-r border-white/[0.10] px-3 py-2.5 text-sm text-white/80 focus:outline-none font-mono" />
                <select value={cfg.budgetToken} onChange={(e) => setCfg({ ...cfg, budgetToken: e.target.value as BudgetToken })}
                  className="bg-black/40 px-3 py-2.5 text-sm text-white/80 focus:outline-none font-mono appearance-none cursor-pointer w-20 border-0">
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
              <p className="font-mono text-[9px] text-white/20 mt-1">Budget stays in your wallet — agent only requests signatures.</p>
            </div>

            {/* Advanced */}
            <div className="border-t border-white/[0.08] pt-4 space-y-3">
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Advanced — defaults are safe</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[9px] text-white/20 block mb-1.5">Rebalance Threshold (%)</label>
                  <input type="number" min={1} max={20} value={cfg.rebalanceThreshold}
                    onChange={(e) => setCfg({ ...cfg, rebalanceThreshold: Number(e.target.value) })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="font-mono text-[9px] text-white/20 block mb-1.5">Max Slippage (%)</label>
                  <input type="number" min={0.1} max={5} step={0.1} value={cfg.maxSlippage}
                    onChange={(e) => setCfg({ ...cfg, maxSlippage: Number(e.target.value) })}
                    className={inputCls} />
                </div>
              </div>
              <div className="flex flex-wrap gap-5">
                {[
                  { key: "autoCompound",  label: "Auto-compound fees" },
                  { key: "alertsEnabled", label: "Enable alerts" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${cfg[key as keyof AgentConfig] ? "border-primary bg-primary" : "border-white/[0.15]"}`}
                      onClick={() => setCfg({ ...cfg, [key]: !cfg[key as keyof AgentConfig] })}>
                      {cfg[key as keyof AgentConfig] && <div className="w-1.5 h-1.5 bg-[#080808]" />}
                    </div>
                    <span className="font-mono text-[10px] text-white/40">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-4 py-2.5 text-sm border border-white/[0.10] text-white/40 hover:text-white/70 hover:border-white/20 transition-colors inline-flex items-center gap-1.5 shrink-0 font-mono">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity font-mono">
                Review <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="border border-white/[0.10] animate-in fade-in duration-200">
          <div className="px-5 py-3 border-b border-white/[0.10]">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Step 3 — Review & Deploy</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="border border-white/[0.08] divide-y divide-white/[0.06]">
              {[
                ["Pool",      selectedPool ? `${selectedPool.tokenASymbol}/${selectedPool.tokenBSymbol}` : "Auto-select (LLM)"],
                ["Strategy",  strategyMeta.label],
                ["Mode",      strategyMeta.mode],
                ["Budget",    `${cfg.budgetAmount} ${cfg.budgetToken}`],
                ["Rebalance", `±${cfg.rebalanceThreshold}%`],
                ["Slippage",  `${cfg.maxSlippage}%`],
                ["Compound",  cfg.autoCompound  ? "Yes" : "No"],
                ["Alerts",    cfg.alertsEnabled ? "Enabled" : "Disabled"],
                ["Wallet",    truncateAddress(address ?? "")],
                ["Network",   "Base Mainnet"],
                ["Payment",   "~0.05 USDC / LLM query (x402)"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-4 px-4 py-2.5 flex-wrap">
                  <span className="font-mono text-[10px] text-white/30">{l}</span>
                  <span className="font-mono text-[10px] text-white/70 text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2.5 border border-amber-500/15 bg-amber-500/[0.04] p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="font-mono text-[10px] text-amber-300/60 leading-relaxed">
                The agent requests your wallet signature before every on-chain action. GlidePool never holds your funds or private keys.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="px-4 py-2.5 text-sm border border-white/[0.10] text-white/40 hover:text-white/70 hover:border-white/20 transition-colors inline-flex items-center gap-1.5 shrink-0 font-mono">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setLaunched(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity font-mono">
                <Bot className="w-4 h-4" /> Deploy Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
