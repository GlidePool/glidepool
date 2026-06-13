import { useAccount } from "wagmi";
import { Link } from "wouter";
import { useListPools, useGetUserPositions } from "@workspace/api-client-react";
import { truncateAddress } from "@/lib/format";
import {
  Bot, Activity, Plus, Layers, Wallet2,
  TrendingUp, ArrowRight, Cpu,
} from "lucide-react";

type AgentStatus = "running" | "paused" | "idle";
interface MockAgent {
  id: string; pool: string; strategy: string;
  status: AgentStatus; pnl: number; actions: number; lastAction: string;
}

const STATUS_COLOR: Record<AgentStatus, { text: string; dot: string; border: string; bg: string }> = {
  running: { text: "text-primary",   dot: "bg-primary animate-pulse", border: "border-primary/30",      bg: "bg-primary/[0.05]" },
  paused:  { text: "text-amber-400", dot: "bg-amber-400",             border: "border-amber-400/30",    bg: "bg-amber-400/[0.05]" },
  idle:    { text: "text-white/30",  dot: "bg-white/20",              border: "border-white/[0.08]",    bg: "" },
};

const MOCK_AGENTS: MockAgent[] = [
  { id: "agent-001", pool: "WETH/USDC",  strategy: "Balanced (Both)",       status: "running", pnl: 2.34, actions: 17, lastAction: "Rebalanced bin range 2m ago" },
  { id: "agent-002", pool: "WETH/cbETH", strategy: "Conservative (Static)", status: "paused",  pnl: 0.81, actions:  5, lastAction: "Paused - low volatility" },
];

function EmptyWallet() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center px-4">
      <div className="w-14 h-14 border border-white/[0.10] flex items-center justify-center">
        <Cpu className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Connect your wallet</h1>
        <p className="text-sm text-white/40 max-w-xs leading-relaxed font-mono">
          Connect a Base Mainnet wallet to deploy and monitor your DLMM agents.
        </p>
      </div>
      <w3m-button />
    </div>
  );
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: positions } = useGetUserPositions(address ?? "");

  if (!isConnected) return <EmptyWallet />;

  const runningCount = MOCK_AGENTS.filter((a) => a.status === "running").length;
  const totalPnl     = MOCK_AGENTS.reduce((s, a) => s + a.pnl, 0);
  const totalActions = MOCK_AGENTS.reduce((s, a) => s + a.actions, 0);

  const stats = [
    { label: "Active Agents", value: String(runningCount),            icon: <Bot className="w-4 h-4" />,        color: "text-primary" },
    { label: "Est. P&L",      value: `+${totalPnl.toFixed(2)} USDC`, icon: <TrendingUp className="w-4 h-4" />, color: "text-primary" },
    { label: "LLM Actions",   value: String(totalActions),            icon: <Activity className="w-4 h-4" />,   color: "text-white/70" },
    { label: "Positions",     value: String(positions?.length ?? 0),  icon: <Wallet2 className="w-4 h-4" />,    color: "text-white/70" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-400">

      {/* Page header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-5">
        <div>
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Dashboard</div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-[10px] text-white/35 font-mono mt-0.5">{truncateAddress(address ?? "")} · Base Mainnet</p>
        </div>
        <Link href="/agent/setup">
          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-primary text-[#080808] hover:opacity-90 transition-opacity whitespace-nowrap font-mono">
            <Plus className="w-3.5 h-3.5" /> Deploy Agent
          </button>
        </Link>
      </div>

      {/* Stats - overflow-hidden grid: each cell carries its own right+bottom border */}
      <div className="border border-white/[0.10] grid grid-cols-2 sm:grid-cols-4 overflow-hidden">
        {stats.map((s, i) => (
          <div key={s.label} className={[
            "p-4 sm:p-5 flex flex-col gap-2",
            /* right border on all items */
            "border-r border-white/[0.10]",
            /* bottom border on first row of 2-col mobile (items 0 & 1) */
            i < 2 ? "border-b border-white/[0.10]" : "",
            /* on sm+ remove bottom border, last item has no right border */
            "sm:border-b-0",
            i === 3 ? "sm:border-r-0" : "",
          ].join(" ")}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{s.label}</span>
              <span className="text-white/20">{s.icon}</span>
            </div>
            <span className={`text-xl sm:text-2xl font-bold font-mono truncate ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Agents table */}
      <div className="border border-white/[0.10]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.10]">
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Your Agents</span>
          <Link href="/monitor">
            <span className="text-[10px] text-primary/60 font-mono hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
              Full monitor <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {MOCK_AGENTS.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-white/25 font-mono">
            No agents yet.{" "}
            <Link href="/agent/setup">
              <span className="text-primary/70 hover:text-primary cursor-pointer">Deploy one →</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {MOCK_AGENTS.map((agent) => {
              const sc = STATUS_COLOR[agent.status];
              return (
                <div key={agent.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 border border-white/[0.10] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary/60" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-mono font-bold">{agent.pool}</div>
                      <div className="text-[10px] text-white/30 font-mono">{agent.strategy}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap pl-11 sm:pl-0">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-mono font-bold ${sc.text} ${sc.border} ${sc.bg}`}>
                      <span className={`w-1.5 h-1.5 ${sc.dot}`} />
                      {agent.status.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-primary">+{agent.pnl} USDC</span>
                    <span className="text-[10px] text-white/25 font-mono">{agent.actions} actions</span>
                    <span className="text-[10px] text-white/20 font-mono hidden md:block truncate max-w-[160px]">{agent.lastAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="px-5 py-2.5 border-t border-white/[0.06]">
          <p className="text-[10px] text-white/15 font-mono">All transactions require your wallet signature on Base Mainnet.</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-3 overflow-hidden">
        {[
          { href: "/agent/setup", icon: <Bot className="w-5 h-5 text-primary" />,      label: "SERVER LAYER", title: "Setup Agent",   desc: "Configure strategy, risk level, and budget for a new autonomous agent." },
          { href: "/monitor",     icon: <Activity className="w-5 h-5 text-primary" />, label: "LIVE FEED",    title: "Monitor",       desc: "Live feed of agent decisions, LLM reasoning, and on-chain actions." },
          { href: "/pools",       icon: <Layers className="w-5 h-5 text-primary" />,   label: "CHAIN LAYER",  title: "Explore Pools", desc: "Browse Maverick V2 DLMM pools on Base Mainnet with live data." },
        ].map((card, i) => (
          <Link key={card.href} href={card.href}>
            <div className={[
              "p-5 sm:p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group h-full flex flex-col gap-4",
              "border-b border-r border-white/[0.10]",
              i === 2 ? "sm:border-r-0" : "",
            ].join(" ")}>
              <div className="font-mono text-[9px] text-white/15 uppercase tracking-widest">{card.label}</div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border border-white/[0.10] group-hover:border-primary/30 flex items-center justify-center transition-colors">
                  {card.icon}
                </div>
                <span className="font-bold text-sm group-hover:text-primary transition-colors">{card.title}</span>
              </div>
              <p className="font-mono text-[10px] text-white/30 leading-relaxed">{card.desc}</p>
              <div className="mt-auto">
                <ArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
