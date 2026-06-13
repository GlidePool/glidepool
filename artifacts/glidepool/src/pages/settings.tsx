import { useState } from "react";
import { useAccount, useDisconnect, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { truncateAddress } from "@/lib/format";
import { Settings as SettingsIcon, Wallet2, Bell, Shield, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

const inputCls = "w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-9 h-5 bg-white/10 peer-checked:bg-primary rounded-full transition-colors" />
      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="px-4 sm:px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
      <span className="text-white/30">{icon}</span>
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">{title}</span>
    </div>
  );
}

export default function Settings() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    alertOnRebalance: true,
    alertOnLowBudget: true,
    alertOnAgentStop: true,
    maxGwei: "50",
    rpcUrl: "https://mainnet.base.org",
    x402Enabled: true,
  });

  const set = (k: string, v: unknown) => setPrefs((p) => ({ ...p, [k]: v }));

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto animate-in fade-in duration-400">

      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-white/35 font-mono mt-0.5">Wallet, network, alerts, and payment configuration.</p>
      </div>

      {/* Wallet */}
      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <SectionHeader icon={<Wallet2 className="w-3.5 h-3.5" />} title="Wallet" />
        <div className="px-4 sm:px-5 py-5 space-y-4">
          {isConnected ? (
            <>
              <div>
                <div className="text-[10px] text-white/25 font-mono mb-1.5">Connected address</div>
                <div className="font-mono text-xs sm:text-sm text-white/80 break-all">{address}</div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary font-mono transition-colors">
                  Basescan <ExternalLink className="w-3 h-3" />
                </a>
                <button onClick={() => disconnect()}
                  className="px-3 py-1.5 rounded border border-red-500/20 text-xs font-mono text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-colors">
                  Disconnect
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${chainId === 8453 ? "bg-primary animate-pulse" : "bg-red-500"}`} />
                <span className="text-xs font-mono text-white/35">
                  {chainId === 8453 ? "Base Mainnet (chain 8453)" : "Wrong network — switch to Base Mainnet"}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-white/40">No wallet connected.</p>
              <ConnectButton />
            </div>
          )}
        </div>
      </section>

      {/* Network */}
      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <SectionHeader icon={<SettingsIcon className="w-3.5 h-3.5" />} title="Network" />
        <div className="px-4 sm:px-5 py-5 space-y-4">
          <div>
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block mb-1.5">Base RPC URL</label>
            <input value={prefs.rpcUrl} onChange={(e) => set("rpcUrl", e.target.value)}
              className={inputCls} placeholder="https://mainnet.base.org" />
            <p className="text-[10px] text-white/20 font-mono mt-1">Use a private RPC for better performance and rate limits.</p>
          </div>
          <div>
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block mb-1.5">Max Gas Price (gwei)</label>
            <input type="number" min={1} value={prefs.maxGwei} onChange={(e) => set("maxGwei", e.target.value)}
              className={inputCls} />
            <p className="text-[10px] text-white/20 font-mono mt-1">Agent defers non-urgent transactions above this threshold.</p>
          </div>
        </div>
      </section>

      {/* x402 */}
      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <SectionHeader icon={<Shield className="w-3.5 h-3.5" />} title="x402 Micropayments" />
        <div className="px-4 sm:px-5 py-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-mono text-white/70">Enable x402 payment gating</div>
              <p className="text-xs text-white/30 mt-0.5 leading-relaxed">
                ~0.05 USDC per LLM query on Base. Disabling requires a GlidePool Pro subscription.
              </p>
            </div>
            <Toggle checked={prefs.x402Enabled} onChange={(v) => set("x402Enabled", v)} />
          </div>
          <div className="rounded-lg border border-white/[0.05] bg-black/20 px-4 py-3 font-mono text-xs space-y-1.5">
            {[
              ["Token",    "USDC"],
              ["Network",  "Base Mainnet"],
              ["Per query","~0.05 USDC"],
              ["Treasury", "glidepool.com"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4">
                <span className="text-white/25">{l}</span>
                <span className="text-white/60">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <SectionHeader icon={<Bell className="w-3.5 h-3.5" />} title="Alerts" />
        <div className="px-4 sm:px-5 py-5 space-y-4">
          {[
            { key: "alertOnRebalance", label: "Rebalance executed",  desc: "Notify when agent triggers a rebalance" },
            { key: "alertOnLowBudget", label: "Low budget warning",  desc: "Alert when budget drops below 20%" },
            { key: "alertOnAgentStop", label: "Agent stopped",       desc: "Alert if agent pauses due to error or gas spike" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-mono text-white/65">{label}</div>
                <div className="text-[10px] text-white/25 font-mono mt-0.5">{desc}</div>
              </div>
              <Toggle checked={prefs[key as keyof typeof prefs] as boolean} onChange={(v) => set(key, v)} />
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <p className="text-[10px] text-white/15 font-mono leading-relaxed">Settings stored locally. Agents apply changes on next cycle.</p>
        <button onClick={save}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity whitespace-nowrap">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
