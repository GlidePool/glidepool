import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Activity, Bot, CheckCircle2, AlertTriangle, Info, RefreshCw, Pause, Play, TrendingUp, TrendingDown } from "lucide-react";
import { truncateAddress } from "@/lib/format";

type LogLevel = "info" | "decision" | "warning" | "tx";
interface LogEntry {
  id: number;
  ts: string;
  level: LogLevel;
  agent: string;
  message: string;
  detail?: string;
}

const LEVEL_STYLES: Record<LogLevel, string> = {
  info:     "text-white/30",
  decision: "text-primary/80",
  warning:  "text-amber-400/80",
  tx:       "text-blue-400/80",
};
const LEVEL_ICONS: Record<LogLevel, React.ReactNode> = {
  info:     <Info className="w-3 h-3" />,
  decision: <Bot className="w-3 h-3" />,
  warning:  <AlertTriangle className="w-3 h-3" />,
  tx:       <CheckCircle2 className="w-3 h-3" />,
};

const SEED_LOGS: LogEntry[] = [
  { id: 1,  ts: "03:14:22", level: "info",     agent: "agent-001", message: "Scanning WETH/USDC pool state on Base Mainnet…" },
  { id: 2,  ts: "03:14:23", level: "info",     agent: "agent-001", message: "Pool fetched: activeTick=2047, currentPrice=2,481.33 USDC/WETH" },
  { id: 3,  ts: "03:14:24", level: "decision", agent: "agent-001", message: "LLM analysis: price moved +2.1% from center, approaching upper bin boundary", detail: "Recommendation: rebalance — shift bin range right by 3 ticks. Risk: LOW. Confidence: 0.87" },
  { id: 4,  ts: "03:14:25", level: "tx",       agent: "agent-001", message: "Requesting wallet signature for RemoveLiquidity (binIds: [2044, 2045, 2046, 2047])" },
  { id: 5,  ts: "03:14:30", level: "tx",       agent: "agent-001", message: "Tx signed by user · AddLiquidity submitted · hash: 0xabcd…ef12" },
  { id: 6,  ts: "03:14:31", level: "info",     agent: "agent-001", message: "Position rebalanced. New center tick: 2050. Waiting for next cycle (5m)." },
  { id: 7,  ts: "03:19:22", level: "info",     agent: "agent-001", message: "Cycle #2 — fetching pool state…" },
  { id: 8,  ts: "03:19:23", level: "decision", agent: "agent-001", message: "LLM analysis: price stable within range. No action needed.", detail: "Action: HOLD. Reasoning: current tick 2050 is centered in range [2047, 2053]. IL minimal." },
  { id: 9,  ts: "03:19:24", level: "info",     agent: "agent-002", message: "agent-002 (WETH/cbETH) paused by user — resuming monitoring in idle mode." },
  { id: 10, ts: "03:24:22", level: "warning",  agent: "agent-001", message: "Volatility spike detected — ATR 1h increased 34%. Strategy: Balanced." },
  { id: 11, ts: "03:24:23", level: "decision", agent: "agent-001", message: "LLM: widen bin range to absorb volatility. Action: REBALANCE", detail: "suggestedBinRange: lowerTick=2040, upperTick=2060. suggestedWithdrawPercent=100." },
];

let logIdCounter = SEED_LOGS.length + 1;

const LIVE_MESSAGES: Omit<LogEntry, "id" | "ts">[] = [
  { level: "info",     agent: "agent-001", message: "Cycle check — fetching pool state from Maverick V2 on Base…" },
  { level: "decision", agent: "agent-001", message: "LLM analysis complete: HOLD. Price within optimal range.", detail: "Confidence: 0.91. No rebalance needed this cycle." },
  { level: "info",     agent: "agent-001", message: "Fee accrued: +0.0031 USDC since last cycle." },
  { level: "warning",  agent: "agent-001", message: "Gas price elevated (42 gwei). Deferring non-urgent rebalance." },
  { level: "decision", agent: "agent-001", message: "LLM: price approaching lower tick boundary. Consider adding range left.", detail: "Recommendation: ADD_LIQUIDITY leftward. Risk: LOW." },
];

export default function Monitor() {
  const { isConnected } = useAccount();
  const [logs, setLogs] = useState<LogEntry[]>(SEED_LOGS);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [liveIdx, setLiveIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      const entry = LIVE_MESSAGES[liveIdx % LIVE_MESSAGES.length];
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
      setLogs((prev) => [...prev.slice(-80), { ...entry, id: logIdCounter++, ts }]);
      setLiveIdx((i) => i + 1);
    }, 4000);
    return () => clearInterval(t);
  }, [paused, liveIdx]);

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, paused]);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
          <Activity className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Connect your wallet</h1>
          <p className="text-sm text-white/40 max-w-sm">Connect to monitor your live agent activity.</p>
        </div>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Agent Monitor</h1>
          <p className="text-xs text-white/35 font-mono mt-0.5">Live LLM decision feed · Base Mainnet</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/[0.08] text-xs font-mono text-white/40 hover:text-white/80 transition-colors"
          >
            {paused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
          </button>
          <button
            onClick={() => setLogs(SEED_LOGS)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/[0.08] text-xs font-mono text-white/40 hover:text-white/80 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Agent status pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { id: "agent-001", pool: "WETH/USDC",  status: "running", cycles: 12, pnl: "+2.34 USDC" },
          { id: "agent-002", pool: "WETH/cbETH", status: "paused",  cycles: 5,  pnl: "+0.81 USDC" },
        ].map((a) => (
          <div key={a.id} className={`rounded-lg border px-4 py-2.5 flex items-center gap-3 ${
            a.status === "running" ? "border-primary/20 bg-primary/5" : "border-white/[0.07] bg-white/[0.02]"
          }`}>
            <span className={`w-2 h-2 rounded-full ${a.status === "running" ? "bg-primary animate-pulse" : "bg-white/20"}`} />
            <div>
              <div className="text-xs font-mono font-bold">{a.pool}</div>
              <div className="text-[10px] text-white/25 font-mono">{a.cycles} cycles · {a.pnl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {(["all", "decision", "tx", "warning", "info"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest transition-colors ${
              filter === f ? "bg-primary/10 text-primary border border-primary/20" : "text-white/25 hover:text-white/60 border border-transparent"
            }`}>
            {f}
          </button>
        ))}
        <span className="ml-2 text-[10px] text-white/15 font-mono">{filtered.length} entries</span>
        {!paused && <span className="ml-1 inline-flex items-center gap-1 text-[10px] text-primary/50 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />live</span>}
      </div>

      {/* Log terminal */}
      <div className="rounded-xl border border-white/[0.07] bg-black/50 overflow-hidden">
        <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary/40" />
          </div>
          <span className="text-[10px] text-white/20 font-mono ml-1">glidepool-agent-log</span>
        </div>

        <div className="h-[420px] overflow-y-auto p-4 space-y-0.5 font-mono text-xs scrollbar-thin">
          {filtered.map((log) => (
            <div key={log.id} className="group">
              <div className={`flex items-start gap-2.5 py-0.5 ${LEVEL_STYLES[log.level]}`}>
                <span className="text-white/15 shrink-0 w-16">{log.ts}</span>
                <span className={`shrink-0 mt-0.5 ${LEVEL_STYLES[log.level]}`}>{LEVEL_ICONS[log.level]}</span>
                <span className="text-[9px] text-white/20 shrink-0 w-20 truncate">{log.agent}</span>
                <span className="flex-1 leading-relaxed">{log.message}</span>
              </div>
              {log.detail && (
                <div className="ml-[7.5rem] mt-0.5 mb-1 px-3 py-2 rounded border border-primary/10 bg-primary/[0.04] text-[10px] text-primary/50 leading-relaxed">
                  {log.detail}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <p className="text-[10px] text-white/15 font-mono">
        All on-chain actions require your wallet signature. The agent never executes autonomously without approval.
        LLM queries are billed via x402 micropayment (~0.05 USDC each) on Base Mainnet.
      </p>
    </div>
  );
}
