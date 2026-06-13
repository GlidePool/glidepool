import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Bot, Activity, Zap, Shield, TrendingUp, Layers,
  ChevronRight, Terminal, ArrowRight, Cpu,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Cpu className="w-5 h-5 text-primary" />,
    title: "Autonomous LLM Agents",
    desc: "Deploy AI agents that continuously analyze Maverick V2 DLMM pools, decide when to rebalance, and request your approval before every on-chain action.",
  },
  {
    icon: <Shield className="w-5 h-5 text-blue-400" />,
    title: "Non-Custodial by Design",
    desc: "Your keys, your assets. The agent never signs transactions — it proposes, you sign via RainbowKit. GlidePool holds no funds and no private keys.",
  },
  {
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    title: "x402 Micropayments",
    desc: "Each LLM analysis query costs ~0.05 USDC, paid on-chain via the x402 protocol on Base. No subscriptions, no API keys — pay per insight.",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-primary" />,
    title: "Smart Rebalancing",
    desc: "Choose Conservative (Static), Balanced (Both), or Aggressive (Right/Left) mode. The agent adapts bin ranges to market volatility in real time.",
  },
  {
    icon: <Layers className="w-5 h-5 text-primary" />,
    title: "Maverick V2 Native",
    desc: "Built specifically for Maverick V2 DLMM pools on Base Mainnet. Reads live pool state, active tick, TVL, and fee data directly from the chain.",
  },
  {
    icon: <Activity className="w-5 h-5 text-primary" />,
    title: "Live Monitor & CLI",
    desc: "Stream every agent decision, LLM reasoning, and on-chain action in a live terminal. Or manage everything from the GlidePool CLI.",
  },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Connect wallet",  desc: "Connect a Base Mainnet wallet via RainbowKit. No sign-up required." },
  { num: "02", title: "Deploy agent",    desc: "Choose a strategy and budget. The agent targets the best Maverick V2 pool automatically." },
  { num: "03", title: "Agent analyzes",  desc: "The LLM reads on-chain pool state and decides when to add, remove, or rebalance liquidity." },
  { num: "04", title: "You sign",        desc: "Before every tx, the agent surfaces a proposal. You approve or reject in your wallet." },
];

export default function Landing() {
  return (
    <div className="flex flex-col gap-16 sm:gap-20 py-4">

      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6 pt-8 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono text-primary/70 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Maverick V2 · Base Mainnet · x402 Powered
        </div>

        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Autonomous DLMM<br />
            <span className="text-primary">Liquidity Agents</span>
          </h1>
          <p className="text-sm sm:text-base text-white/45 leading-relaxed max-w-lg mx-auto">
            Deploy AI-driven agents that manage your Maverick V2 positions on Base —
            rebalancing bins, optimizing fees, and requesting your signature before every action.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
          <Link href="/dashboard">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-primary text-[#080808] hover:opacity-90 transition-opacity">
              <Bot className="w-4 h-4" /> Launch App <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/cli">
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border border-white/[0.10] text-white/60 hover:text-white/90 hover:border-white/20 transition-all">
              <Terminal className="w-4 h-4" /> CLI Guide
            </button>
          </Link>
        </div>
        <p className="text-[10px] text-white/20 font-mono">Base Mainnet wallet required · non-custodial</p>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight">How it works</h2>
          <p className="text-xs text-white/35 mt-1 font-mono">Four steps from wallet connect to autonomous LP management</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.num} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white/[0.07]">{s.num}</span>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-white/10 hidden lg:block" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-white/80 mb-1">{s.title}</div>
                <p className="text-xs text-white/35 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight">Platform features</h2>
          <p className="text-xs text-white/35 mt-1 font-mono">Built for serious liquidity providers on Base</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-3 hover:border-primary/15 hover:bg-white/[0.04] transition-all">
              <div className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <div className="font-bold text-sm mb-1">{f.title}</div>
                <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 sm:gap-0 sm:divide-x divide-white/[0.05]">
          {[
            { label: "Protocol",  value: "Maverick V2" },
            { label: "Network",   value: "Base Mainnet" },
            { label: "Payment",   value: "~0.05 USDC / query" },
            { label: "Custody",   value: "Non-custodial" },
          ].map((s, i) => (
            <div key={s.label} className={`flex flex-col gap-1 ${i > 0 ? "sm:pl-6" : ""}`}>
              <span className="text-[10px] text-white/25 uppercase tracking-widest font-mono">{s.label}</span>
              <span className="text-sm font-bold font-mono text-white/80">{s.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="flex flex-col items-center text-center gap-5 pb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight mb-2">Ready to deploy your first agent?</h2>
          <p className="text-xs text-white/35 max-w-sm mx-auto leading-relaxed">
            Connect your Base Mainnet wallet and set up an autonomous DLMM agent in under two minutes.
          </p>
        </div>
        <ConnectButton />
        <Link href="/dashboard">
          <button className="inline-flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary font-mono transition-colors">
            Go to Dashboard <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </section>
    </div>
  );
}
