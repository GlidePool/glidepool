import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity, Bot, CheckCircle2, AlertTriangle, Info,
  RefreshCw, Pause, Play, Loader2, ExternalLink,
} from "lucide-react";

interface Agent {
  id: string;
  poolAddress: string;
  strategy: string;
  status: string;
  lastAnalysisAt: string | null;
  budgetUsdc: string;
}

interface AgentAction {
  id: string;
  agentId: string;
  actionType: string;
  llmReasoning: string | null;
  llmRecommendation: { summary?: string; riskLevel?: string; recommendation?: { action: string; reasoning: string; suggestedBinRange?: { lowerTick: number; upperTick: number } | null } } | null;
  poolSnapshot: Record<string, string | number> | null;
  status: string;
  txHash: string | null;
  createdAt: string;
}

type LogLevel = "info" | "decision" | "warning" | "tx" | "error";

interface LogEntry {
  id: string;
  ts: string;
  level: LogLevel;
  agentId: string;
  actionType: string;
  message: string;
  detail?: string;
  txHash?: string;
  status: string;
}

const LEVEL_STYLE: Record<LogLevel, string> = {
  info:     "text-white/40",
  decision: "text-primary/80",
  warning:  "text-amber-400/80",
  tx:       "text-blue-400/80",
  error:    "text-red-400/80",
};

const LEVEL_ICON: Record<LogLevel, React.ReactNode> = {
  info:     <Info className="w-3 h-3" />,
  decision: <Bot className="w-3 h-3" />,
  warning:  <AlertTriangle className="w-3 h-3" />,
  tx:       <CheckCircle2 className="w-3 h-3" />,
  error:    <AlertTriangle className="w-3 h-3" />,
};

function actionToLog(action: AgentAction): LogEntry {
  const ts = new Date(action.createdAt).toLocaleTimeString("en-US", { hour12: false });
  let level: LogLevel = "info";
  let message = action.actionType.toUpperCase();
  let detail: string | undefined;

  const rec = action.llmRecommendation?.recommendation;
  const summary = action.llmRecommendation?.summary;

  if (action.actionType === "hold") {
    level = "info";
    message = "HOLD — price within optimal range, no action needed";
    detail = rec?.reasoning ?? undefined;
  } else if (action.actionType === "rebalance" || action.actionType === "add_liquidity" || action.actionType === "remove_liquidity") {
    level = action.status === "pending_signature" ? "decision" : "tx";
    message = `${action.actionType.toUpperCase().replace("_", " ")} — ${summary ?? rec?.reasoning?.slice(0, 80) ?? ""}`;
    if (rec?.suggestedBinRange) {
      detail = `suggestedBinRange: [${rec.suggestedBinRange.lowerTick}, ${rec.suggestedBinRange.upperTick}] · risk: ${action.llmRecommendation?.riskLevel ?? "?"} · status: ${action.status}`;
    } else {
      detail = `risk: ${action.llmRecommendation?.riskLevel ?? "?"} · status: ${action.status}`;
    }
  } else if (action.actionType === "withdraw") {
    level = "decision";
    message = `WITHDRAW — ${summary ?? ""}`;
    detail = rec?.reasoning ?? undefined;
  } else if (action.actionType === "switch_mode") {
    level = "decision";
    message = `SWITCH MODE — ${summary ?? ""}`;
    detail = rec?.reasoning ?? undefined;
  }

  if (action.txHash) {
    level = "tx";
    message += ` · signed`;
  }

  return {
    id: action.id,
    ts,
    level,
    agentId: action.agentId.slice(0, 8),
    actionType: action.actionType,
    message,
    detail,
    txHash: action.txHash ?? undefined,
    status: action.status,
  };
}

function WalletGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 text-center px-4">
      <div className="w-14 h-14 border border-white/[0.10] flex items-center justify-center">
        <Activity className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Connect your wallet</h1>
        <p className="text-sm text-white/40 max-w-xs leading-relaxed font-mono">Connect to monitor your live agent activity.</p>
      </div>
      <w3m-button />
    </div>
  );
}

export default function Monitor() {
  const { isConnected, address } = useAccount();
  const queryClient = useQueryClient();
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [selectedAgent, setSelectedAgent] = useState<string | "all">("all");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["agents", address],
    queryFn: () => fetch(`/api/agents?userAddress=${address}`).then((r) => r.json()),
    enabled: !!address && isConnected,
    refetchInterval: paused ? false : 15_000,
  });

  const { data: actions = [], isLoading: actionsLoading } = useQuery<AgentAction[]>({
    queryKey: ["agent-actions", selectedAgent, address],
    queryFn: async () => {
      if (selectedAgent !== "all") {
        const r = await fetch(`/api/agents/${selectedAgent}/actions?limit=100`);
        return r.json();
      }
      const results = await Promise.all(
        agents.map((a) => fetch(`/api/agents/${a.id}/actions?limit=30`).then((r) => r.json() as Promise<AgentAction[]>))
      );
      return results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100);
    },
    enabled: !!address && isConnected && agents.length > 0,
    refetchInterval: paused ? false : 10_000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ agentId, status }: { agentId: string; status: string }) => {
      const res = await fetch(`/api/agents/${agentId}/status?userAddress=${address}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents", address] }),
  });

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [actions, paused]);

  if (!isConnected) return <WalletGate />;

  const logs: LogEntry[] = actions.map(actionToLog);
  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-400">

      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-5">
        <div>
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Monitor</div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Agent Monitor</h1>
          <p className="font-mono text-[10px] text-white/35 mt-0.5">Live LLM decision feed · Base Mainnet · real data</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(!paused)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.10] font-mono text-[10px] text-white/40 hover:text-white/80 hover:border-white/20 transition-colors">
            {paused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
          </button>
          <button onClick={() => { void queryClient.invalidateQueries({ queryKey: ["agent-actions"] }); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.10] font-mono text-[10px] text-white/40 hover:text-white/80 hover:border-white/20 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="border border-white/[0.10] px-5 py-10 text-center">
          <Bot className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="font-mono text-sm text-white/25 mb-2">No agents deployed yet.</p>
          <a href="/agent/setup" className="text-primary/70 hover:text-primary font-mono text-sm transition-colors">Deploy one →</a>
        </div>
      ) : (
        <>
          <div className="border border-white/[0.10] flex flex-col sm:flex-row flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-white/[0.10]">
            <button
              onClick={() => setSelectedAgent("all")}
              className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${selectedAgent === "all" ? "bg-primary/[0.03]" : "hover:bg-white/[0.02]"}`}>
              <div className={`w-1.5 h-1.5 shrink-0 ${agents.some((a) => a.status === "active") ? "bg-primary animate-pulse" : "bg-white/20"}`} />
              <div className="text-left">
                <div className="font-mono text-xs font-bold">All Agents</div>
                <div className="font-mono text-[9px] text-white/25">{agents.length} total</div>
              </div>
              {selectedAgent === "all" && <div className="ml-auto font-mono text-[9px] border px-2 py-0.5 border-primary/30 text-primary/60">SELECTED</div>}
            </button>
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${selectedAgent === agent.id ? "bg-primary/[0.03]" : "hover:bg-white/[0.02]"}`}>
                <div className={`w-1.5 h-1.5 shrink-0 ${agent.status === "active" ? "bg-primary animate-pulse" : "bg-white/20"}`} />
                <div className="text-left">
                  <div className="font-mono text-xs font-bold">{agent.strategy.toUpperCase()}</div>
                  <div className="font-mono text-[9px] text-white/25">{agent.poolAddress.slice(0, 8)}… · {agent.budgetUsdc} USDC</div>
                </div>
                <div className="flex gap-1 ml-auto">
                  {agent.status === "active" ? (
                    <button onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ agentId: agent.id, status: "paused" }); }}
                      className="p-1 border border-white/[0.10] text-white/25 hover:text-amber-400 transition-colors" title="Pause">
                      <Pause className="w-2.5 h-2.5" />
                    </button>
                  ) : agent.status === "paused" ? (
                    <button onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ agentId: agent.id, status: "active" }); }}
                      className="p-1 border border-white/[0.10] text-white/25 hover:text-primary transition-colors" title="Resume">
                      <Play className="w-2.5 h-2.5" />
                    </button>
                  ) : null}
                </div>
              </button>
            ))}
          </div>

          <div className="border border-white/[0.10] overflow-hidden">
            <div className="grid grid-cols-5">
              {(["all", "decision", "tx", "warning", "info"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors border-r border-white/[0.10] last:border-r-0 text-center ${
                    filter === f ? "bg-primary/[0.08] text-primary" : "text-white/25 hover:text-white/60 hover:bg-white/[0.02]"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="border-t border-white/[0.06] px-4 py-1.5 flex items-center gap-2">
              <span className="font-mono text-[9px] text-white/15">{filtered.length} entries</span>
              {!paused && (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] text-primary/50">
                  <span className="w-1.5 h-1.5 bg-primary animate-pulse" /> live
                </span>
              )}
            </div>
          </div>

          <div className="border border-white/[0.10] bg-black/55">
            <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-red-500/40" />
                <span className="w-2 h-2 bg-amber-500/40" />
                <span className="w-2 h-2 bg-primary/40" />
              </div>
              <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">glidepool-agent-log · real data</span>
              <div className="ml-auto font-mono text-[9px] text-white/15">Base Mainnet · chain 8453</div>
            </div>

            <div className="h-[280px] sm:h-[460px] overflow-y-auto p-3 sm:p-4 space-y-0 font-mono text-[11px]">
              {actionsLoading ? (
                <div className="flex items-center gap-2 text-white/20 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[10px]">Loading agent actions from database…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-white/15 text-[10px] py-4">
                  No actions yet. Agent will analyze pools every {agents[0]?.analysisIntervalSec ?? 60}s.
                  {agents.every((a) => a.status !== "active") && (
                    <span className="text-amber-400/60"> All agents paused — resume to start analysis.</span>
                  )}
                </div>
              ) : (
                filtered.map((log) => (
                  <div key={log.id} className="group">
                    <div className={`flex items-start gap-2 py-0.5 hover:bg-white/[0.02] px-1 transition-colors ${LEVEL_STYLE[log.level]}`}>
                      <span className="text-white/12 shrink-0 w-14 hidden sm:block text-[10px]">{log.ts}</span>
                      <span className={`shrink-0 mt-0.5 ${LEVEL_STYLE[log.level]}`}>{LEVEL_ICON[log.level]}</span>
                      <span className="text-[9px] text-white/15 shrink-0 w-14 hidden sm:block">{log.agentId}</span>
                      <span className="flex-1 leading-relaxed break-words min-w-0">{log.message}</span>
                      {log.txHash && (
                        <a href={`https://basescan.org/tx/${log.txHash}`} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 text-blue-400/60 hover:text-blue-400 transition-colors" title={log.txHash}>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {log.detail && (
                      <div className="mt-0.5 mb-1.5 ml-4 sm:ml-[6.5rem] px-3 py-2 border border-primary/10 bg-primary/[0.04] text-[10px] text-primary/50 leading-relaxed">
                        {log.detail}
                      </div>
                    )}
                    {log.status === "pending_signature" && !log.txHash && (
                      <div className="mt-0.5 mb-1.5 ml-4 sm:ml-[6.5rem] px-3 py-2 border border-amber-500/20 bg-amber-500/[0.04] text-[10px] text-amber-400/70 leading-relaxed flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Awaiting your wallet signature to execute this action.
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </>
      )}

      <p className="font-mono text-[10px] text-white/15 leading-relaxed border border-white/[0.06] px-4 py-3">
        All on-chain actions require your wallet signature. LLM queries billed via x402 (~0.05 USDC each) on Base Mainnet.
      </p>
    </div>
  );
}
