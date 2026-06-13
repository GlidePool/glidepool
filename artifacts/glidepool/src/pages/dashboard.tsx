import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "wouter";
import { useListPools, useGetUserPositions } from "@workspace/api-client-react";
import { formatUsd, truncateAddress } from "@/lib/format";
import {
  Bot, Activity, Plus, Layers, Wallet2,
  AlertTriangle, CheckCircle2, Clock, TrendingUp,
  ArrowRight, Cpu,
} from "lucide-react";

type AgentStatus = "running" | "paused" | "idle";

interface MockAgent {
  id: string;
  pool: string;
  strategy: string;
  status: AgentStatus;
  pnl: number;
  actions: number;
  lastAction: string;
  budget: string;
}

const STATUS_STYLES: Record<AgentStatus, string> = {
  running: "text-primary border-primary/30 bg-primary/8",
  paused:  "text-amber-400 border-amber-400/30 bg-amber-400/8",
  idle:    "text-white/30 border-white/[0.08] bg-white/[0.03]",
};
const STATUS_ICONS: Record<AgentStatus, React.ReactNode> = {
  running: <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />,
  paused:  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />,
  idle:    <span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" />,
};

const MOCK_AGENTS: MockAgent[] = [
  { id: "agent-001", pool: "WETH/USDC", strategy: "Balanced (Both)", status: "running", pnl: 2.34, actions: 17, lastAction: "Rebalanced bin range 2m ago", budget: "0.5 ETH" },
  { id: "agent-002", pool: "WETH/cbETH", strategy: "Conservative (Static)", status: "paused", pnl: 0.81, actions: 5, lastAction: "Paused — low volatility", budget: "200 USDC" },
];

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: pools } = useListPools();
  const { data: positions } = useGetUserPositions(address ?? "");

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
          <Cpu className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-sm">
            Connect a Base Mainnet wallet to deploy and monitor your DLMM agents.
          </p>
        </div>
        <ConnectButton />
      </div>
    );
  }

  const runningCount = MOCK_AGENTS.filter((a) => a.status === "running").length;
  const totalPnl = MOCK_AGENTS.reduce((s, a) => s + a.pnl, 0);
  const totalActions = MOCK_AGENTS.reduce((s, a) => s + a.actions, 0);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-xs text-white/35 font-mono mt-0.5">{truncateAddress(address ?? "")} · Base Mainnet</p>
        </div>
        <Link href="/agent/setup">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-[#080808] hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Deploy New Agent
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Agents",    value: `${runningCount}`,              icon: <Bot className="w-4 h-4" />,          color: "text-primary" },
          { label: "Total P&L (est.)", value: `+${totalPnl.toFixed(2)} USDC`, icon: <TrendingUp className="w-4 h-4" />,   color: "text-primary" },
          { label: "LLM Actions",      value: `${totalActions}`,              icon: <Activity className="w-4 h-4" />,     color: "text-white/70" },
          { label: "Positions",        value: `${positions?.length ?? 0}`,    icon: <Wallet2 className="w-4 h-4" />,      color: "text-white/70" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">{s.label}</span>
              <span className="text-white/20">{s.icon}</span>
            </div>
            <span className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Agents table */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono">Your Agents</span>
          <Link href="/monitor">
            <span className="text-[10px] text-primary/70 font-mono hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
              Full monitor <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {MOCK_AGENTS.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-white/25 font-mono">
            No agents deployed yet.{" "}
            <Link href="/agent/setup"><span className="text-primary/70 hover:text-primary cursor-pointer">Deploy one →</span></Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {MOCK_AGENTS.map((agent) => (
              <div key={agent.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary/60" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-mono font-bold truncate">{agent.pool}</div>
                    <div className="text-[10px] text-white/30 font-mono">{agent.strategy}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono font-bold ${STATUS_STYLES[agent.status]}`}>
                    {STATUS_ICONS[agent.status]}
                    {agent.status.toUpperCase()}
                  </span>
                  <div className="text-right">
                    <div className="text-xs font-mono text-primary">+{agent.pnl} USDC</div>
                    <div className="text-[10px] text-white/25 font-mono">{agent.actions} actions</div>
                  </div>
                  <div className="text-[10px] text-white/20 font-mono hidden md:block max-w-[180px] truncate">{agent.lastAction}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
          <p className="text-[10px] text-white/15 font-mono">
            Agents operate autonomously. All transactions require your wallet signature via Base Mainnet.
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: "/agent/setup", icon: <Bot className="w-5 h-5 text-primary" />,      title: "Setup Agent",    desc: "Configure strategy, risk level, and budget for a new autonomous agent." },
          { href: "/monitor",     icon: <Activity className="w-5 h-5 text-primary" />, title: "Monitor",        desc: "Live feed of agent decisions, LLM reasoning, and on-chain actions." },
          { href: "/pools",       icon: <Layers className="w-5 h-5 text-primary" />,   title: "Explore Pools",  desc: "Browse Maverick V2 DLMM pools on Base Mainnet with live TVL and price data." },
        ].map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-primary/20 hover:bg-white/[0.04] transition-all cursor-pointer group">
              <div className="mb-3">{card.icon}</div>
              <div className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{card.title}</div>
              <p className="text-xs text-white/35 leading-relaxed">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
