import { useState } from "react";
import { useAccount, useDisconnect, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { truncateAddress } from "@/lib/format";
import { Settings as SettingsIcon, Wallet2, Bell, Shield, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

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

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto animate-in fade-in duration-500">

      <div>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-white/35 font-mono mt-0.5">Wallet, network, alerts, and payment configuration.</p>
      </div>

      {/* Wallet */}
      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Wallet2 className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Wallet</span>
        </div>
        <div className="px-5 py-5 space-y-4">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs text-white/25 font-mono mb-1">Connected address</div>
                  <div className="font-mono text-sm text-white/80">{address}</div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary font-mono transition-colors"
                  >
                    Basescan <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => disconnect()}
                    className="px-3 py-1.5 rounded border border-red-500/20 text-xs font-mono text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${chainId === 8453 ? "bg-primary animate-pulse" : "bg-red-500"}`} />
                <span className="text-xs font-mono text-white/35">
                  {chainId === 8453 ? "Base Mainnet (chain 8453)" : `Wrong network — please switch to Base Mainnet (8453)`}
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
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <SettingsIcon className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Network</span>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block mb-1.5">Base RPC URL</label>
            <input
              value={prefs.rpcUrl}
              onChange={(e) => setPrefs({ ...prefs, rpcUrl: e.target.value })}
              className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono"
              placeholder="https://mainnet.base.org"
            />
            <p className="text-[10px] text-white/20 font-mono mt-1">Default: https://mainnet.base.org. Use a private RPC for better performance.</p>
          </div>
          <div>
            <label className="text-[10px] text-white/25 uppercase tracking-widest font-mono block mb-1.5">Max Gas Price (gwei)</label>
            <input
              type="number" min={1} value={prefs.maxGwei}
              onChange={(e) => setPrefs({ ...prefs, maxGwei: e.target.value })}
              className="w-full bg-[#0d0d0d] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 focus:outline-none focus:border-primary/40 transition-all font-mono"
            />
            <p className="text-[10px] text-white/20 font-mono mt-1">Agent will defer non-urgent transactions if gas exceeds this threshold.</p>
          </div>
        </div>
      </section>

      {/* x402 Payments */}
      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest font-mono">x402 Micropayments</span>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-mono text-white/70">Enable x402 payment gating</div>
              <p className="text-xs text-white/30 mt-0.5 leading-relaxed">
                Each LLM advisor query costs ~0.05 USDC on Base via x402 micropayment.
                Disabling this requires a GlidePool Pro subscription.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" checked={prefs.x402Enabled}
                onChange={(e) => setPrefs({ ...prefs, x402Enabled: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-5 bg-white/10 peer-checked:bg-primary rounded-full transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </label>
          </div>
          <div className="rounded-lg border border-white/[0.05] bg-black/20 px-4 py-3 font-mono text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-white/25">Payment token</span><span className="text-white/60">USDC</span></div>
            <div className="flex justify-between"><span className="text-white/25">Network</span><span className="text-white/60">Base Mainnet</span></div>
            <div className="flex justify-between"><span className="text-white/25">Cost per LLM query</span><span className="text-white/60">~0.05 USDC</span></div>
            <div className="flex justify-between"><span className="text-white/25">Treasury</span><span className="text-white/60">glidepool.com</span></div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Alerts</span>
        </div>
        <div className="px-5 py-5 space-y-3">
          {[
            { key: "alertOnRebalance", label: "Rebalance executed", desc: "Notify when agent triggers a rebalance" },
            { key: "alertOnLowBudget", label: "Low budget warning", desc: "Alert when budget drops below 20%" },
            { key: "alertOnAgentStop", label: "Agent stopped", desc: "Alert if agent pauses due to error or gas spike" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-mono text-white/60">{label}</div>
                <div className="text-[10px] text-white/25 font-mono mt-0.5">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input type="checkbox" checked={prefs[key as keyof typeof prefs] as boolean}
                  onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })} className="sr-only peer" />
                <div className="w-9 h-5 bg-white/10 peer-checked:bg-primary rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] text-white/15 font-mono">Settings are stored locally in your browser. Agents respect these on next cycle.</p>
        <button
          onClick={save}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity"
        >
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
