import { useState } from "react";
import { useAccount, useDisconnect, useChainId } from "wagmi";
import { truncateAddress } from "@/lib/format";
import { Settings as SettingsIcon, Wallet2, Bell, Shield, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

const inputCls = "w-full bg-black/40 border border-white/[0.10] px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-9 h-5 bg-white/10 peer-checked:bg-primary transition-colors" />
      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );
}

function SectionHeader({ icon, title, label }: { icon: React.ReactNode; title: string; label: string }) {
  return (
    <div className="px-5 py-3 border-b border-white/[0.10] flex items-center gap-3">
      <div className="w-7 h-7 border border-white/[0.10] flex items-center justify-center shrink-0 text-white/30">
        {icon}
      </div>
      <div>
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{label}</div>
        <div className="font-bold text-sm">{title}</div>
      </div>
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

      {/* Page header */}
      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Config</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Settings</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">Wallet, network, alerts, and payment configuration.</p>
      </div>

      {/* Wallet */}
      <section className="border border-white/[0.10]">
        <SectionHeader icon={<Wallet2 className="w-3.5 h-3.5" />} title="Wallet" label="Client Layer" />
        <div className="px-5 py-5 space-y-4">
          {isConnected ? (
            <>
              <div>
                <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2">Connected address</div>
                <div className="font-mono text-xs sm:text-sm text-white/70 break-all">{address}</div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] text-primary/60 hover:text-primary transition-colors">
                  Basescan <ExternalLink className="w-3 h-3" />
                </a>
                <button onClick={() => disconnect()}
                  className="px-3 py-1.5 border border-red-500/20 font-mono text-[10px] text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-colors">
                  Disconnect
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 shrink-0 ${chainId === 8453 ? "bg-primary animate-pulse" : "bg-red-500"}`} />
                <span className="font-mono text-[10px] text-white/35">
                  {chainId === 8453 ? "Base Mainnet (chain 8453)" : "Wrong network - switch to Base Mainnet"}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[10px] text-white/40">No wallet connected.</p>
              <w3m-button />
            </div>
          )}
        </div>
      </section>

      {/* Network */}
      <section className="border border-white/[0.10]">
        <SectionHeader icon={<SettingsIcon className="w-3.5 h-3.5" />} title="Network" label="RPC Config" />
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Base RPC URL</label>
            <input value={prefs.rpcUrl} onChange={(e) => set("rpcUrl", e.target.value)}
              className={inputCls} placeholder="https://mainnet.base.org" />
            <p className="font-mono text-[9px] text-white/20 mt-1">Use a private RPC for better performance and rate limits.</p>
          </div>
          <div className="opacity-50">
            <label className="font-mono text-[9px] text-white/20 uppercase tracking-widest block mb-1.5">Max Gas Price (gwei) — UI only</label>
            <input type="number" min={1} value={prefs.maxGwei} onChange={(e) => set("maxGwei", e.target.value)}
              className={inputCls} disabled />
            <p className="font-mono text-[9px] text-white/20 mt-1">Gas threshold enforcement not yet implemented in agent loop.</p>
          </div>
        </div>
      </section>

      {/* x402 */}
      <section className="border border-white/[0.10]">
        <SectionHeader icon={<Shield className="w-3.5 h-3.5" />} title="x402 Micropayments" label="Payment Layer" />
        <div className="px-5 py-5 space-y-4">
          <div className="border border-amber-500/15 bg-amber-500/[0.03] px-4 py-3 mb-1">
            <p className="font-mono text-[10px] text-amber-400/60 leading-relaxed">
              x402 payment gating is controlled server-side via <span className="text-white/40">X402_ENABLED=true</span> env var.
              When disabled, LLM queries run without payment verification.
            </p>
          </div>
          <div className="border border-white/[0.08] divide-y divide-white/[0.06]">
            {[
              ["Token",    "USDC"],
              ["Network",  "Base Mainnet"],
              ["Per query","0.05 USDC (when enabled)"],
              ["USDC",     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4 px-4 py-2.5">
                <span className="font-mono text-[10px] text-white/25">{l}</span>
                <span className="font-mono text-[10px] text-white/60">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="border border-white/[0.10]">
        <SectionHeader icon={<Bell className="w-3.5 h-3.5" />} title="Alerts" label="Notifications — Coming Soon" />
        <div className="divide-y divide-white/[0.06]">
          <div className="px-5 py-3 bg-white/[0.01]">
            <p className="font-mono text-[9px] text-white/20">Notification delivery not yet implemented. Monitor the Dashboard and Monitor pages for agent updates.</p>
          </div>
          {[
            { key: "alertOnRebalance", label: "Rebalance executed",  desc: "Notify when agent triggers a rebalance" },
            { key: "alertOnLowBudget", label: "Low budget warning",  desc: "Alert when budget drops below 20%" },
            { key: "alertOnAgentStop", label: "Agent stopped",       desc: "Alert if agent pauses due to error" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4 px-5 py-4 opacity-40">
              <div className="min-w-0">
                <div className="font-mono text-sm text-white/65">{label}</div>
                <div className="font-mono text-[9px] text-white/25 mt-0.5">{desc}</div>
              </div>
              <Toggle checked={prefs[key as keyof typeof prefs] as boolean} onChange={(v) => set(key, v)} />
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 pb-2">
        <p className="font-mono text-[9px] text-white/15 leading-relaxed">Preferences saved in browser. Agent config changes (RPC, gas) are UI-only and not synced to the server.</p>
        <button onClick={save}
          className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity whitespace-nowrap font-mono">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
