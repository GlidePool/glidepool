import { useAccount } from "wagmi";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { truncateAddress, formatUsd } from "@/lib/format";
import {
  Bot, Activity, Plus, Layers, Wallet2,
  TrendingUp, ArrowRight, Cpu, Pause, Play, Square,
  RefreshCw, AlertTriangle, Loader2,
} from "lucide-react";

interface Agent {
  id: string;
  userAddress: string;
  poolAddress: string;
  strategy: string;
  budgetUsdc: string;
  status: string;
  analysisIntervalSec: number;
  lastAnalysisAt: string | null;
  createdAt: string;
}

interface AgentAction {
  id: string;
  agentId: string;
  actionType: string;
  llmReasoning: string | null;
  status: string;
  txHash: string | null;
  createdAt: string;
}

type AgentStatus = "active" | "paused" | "stopped";

const STATUS_COLOR: Record<string, { text: string; dot: string; border: string; bg: string }> = {
  active:  { text: "text-primary",   dot: "bg-primary animate-pulse", border: "border-primary/30",   bg: "bg-primary/[0.05]" },
  paused:  { text: "text-amber-400", dot: "bg-amber-400",             border: "border-amber-400/30", bg: "bg-amber-400/[0.05]" },
  stopped: { text: "text-white/30",  dot: "bg-white/20",              border: "border-white/[0.08]", bg: "" },
};

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

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading, refetch } = useQuery<Agent[]>({
    queryKey: ["agents", address],
    queryFn: () => fetch(`/api/agents?userAddress=${address}`).then((r) => r.json()),
    enabled: !!address && isConnected,
    refetchInterval: 15_000,
  });

  const { data: positions = [] } = useQuery<unknown[]>({
    queryKey: ["positions", address],
    queryFn: () => fetch(`/api/positions/${address}`).then((r) => r.json()),
    enabled: !!address && isConnected,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ agentId, status }: { agentId: string; status: AgentStatus }) => {
      const res = await fetch(`/api/agents/${agentId}/status?userAddress=${address}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents", address] }),
  });

  if (!isConnected) return <EmptyWallet />;

  const activeCount  = agents.filter((a) => a.status === "active").length;
  const totalBudget  = agents.reduce((s, a) => s + Number(a.budgetUsdc), 0);
  const totalActions = 0;

  const stats = [
    { label: "Active Agents",  value: String(activeCount),              icon: <Bot className="w-4 h-4" />,        color: "text-primary" },
    { label: "Total Budget",   value: formatUsd(totalBudget),           icon: <TrendingUp className="w-4 h-4" />, color: "text-primary" },
    { label: "Total Agents",   value: String(agents.length),            icon: <Activity className="w-4 h-4" />,   color: "text-white/70" },
    { label: "Positions",      value: String((positions as unknown[]).length ?? 0), icon: <Wallet2 className="w-4 h-4" />,    color: "text-white/70" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-400">

      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-5">
        <div>
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Dashboard</div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-[10px] text-white/35 font-mono mt-0.5">{truncateAddress(address ?? "")} · Base Mainnet</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 border border-white/[0.10] text-white/30 hover:text-white/70 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/agent/setup">
            <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-primary text-[#080808] hover:opacity-90 transition-opacity whitespace-nowrap font-mono">
              <Plus className="w-3.5 h-3.5" /> Deploy Agent
            </button>
          </Link>
        </div>
      </div>

      <div className="border border-white/[0.10] grid grid-cols-2 sm:grid-cols-4 overflow-hidden">
        {stats.map((s, i) => (
          <div key={s.label} className={[
            "p-4 sm:p-5 flex flex-col gap-2",
            "border-r border-white/[0.10]",
            i < 2 ? "border-b border-white/[0.10]" : "",
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

      <div className="border border-white/[0.10]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.10]">
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Your Agents</span>
          <Link href="/monitor">
            <span className="text-[10px] text-primary/60 font-mono hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
              Full monitor <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="px-5 py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white/20" />
          </div>
        ) : agents.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-white/25 font-mono mb-2">No agents deployed yet.</p>
            <Link href="/agent/setup">
              <span className="text-primary/70 hover:text-primary cursor-pointer font-mono text-sm">Deploy one →</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {agents.map((agent) => {
              const sc = STATUS_COLOR[agent.status] ?? STATUS_COLOR.stopped;
              return (
                <div key={agent.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 border border-white/[0.10] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary/60" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-mono font-bold">{agent.poolAddress.slice(0, 6)}…{agent.poolAddress.slice(-4)}</div>
                      <div className="text-[10px] text-white/30 font-mono">{agent.strategy} · {agent.budgetUsdc} USDC · {agent.analysisIntervalSec}s</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pl-11 sm:pl-0">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-mono font-bold ${sc.text} ${sc.border} ${sc.bg}`}>
                      <span className={`w-1.5 h-1.5 ${sc.dot}`} />
                      {agent.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/25 font-mono">
                      analyzed {timeAgo(agent.lastAnalysisAt)}
                    </span>
                    <div className="flex gap-1 ml-auto">
                      {agent.status === "active" ? (
                        <button
                          onClick={() => updateStatus.mutate({ agentId: agent.id, status: "paused" })}
                          className="p-1.5 border border-white/[0.10] text-white/30 hover:text-amber-400 hover:border-amber-400/30 transition-colors"
                          title="Pause">
                          <Pause className="w-3 h-3" />
                        </button>
                      ) : agent.status === "paused" ? (
                        <button
                          onClick={() => updateStatus.mutate({ agentId: agent.id, status: "active" })}
                          className="p-1.5 border border-white/[0.10] text-white/30 hover:text-primary hover:border-primary/30 transition-colors"
                          title="Resume">
                          <Play className="w-3 h-3" />
                        </button>
                      ) : null}
                      {agent.status !== "stopped" && (
                        <button
                          onClick={() => updateStatus.mutate({ agentId: agent.id, status: "stopped" })}
                          className="p-1.5 border border-white/[0.10] text-white/30 hover:text-red-400 hover:border-red-400/30 transition-colors"
                          title="Stop">
                          <Square className="w-3 h-3" />
                        </button>
                      )}
                    </div>
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

      <div className="border border-white/[0.10] grid grid-cols-1 sm:grid-cols-3 overflow-hidden">
        {[
          { href: "/agent/setup", icon: <Bot className="w-5 h-5 text-primary" />,      label: "AGENT LAYER",  title: "Deploy Agent",  desc: "Configure an autonomous LLM agent with a pool target, strategy, and budget." },
          { href: "/monitor",     icon: <Activity className="w-5 h-5 text-primary" />, label: "LIVE FEED",    title: "Monitor",       desc: "Live feed of LLM decisions, pool analysis, and pending transactions." },
          { href: "/pools",       icon: <Layers className="w-5 h-5 text-primary" />,   label: "CHAIN LAYER",  title: "Explore Pools", desc: "Browse Maverick V2 DLMM pools on Base Mainnet with live TVL and price data." },
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
