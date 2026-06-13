import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Activity, Bot, CheckCircle2, AlertTriangle, Info, RefreshCw, Pause, Play } from "lucide-react";

type LogLevel = "info" | "decision" | "warning" | "tx";
interface LogEntry {
  id: number; ts: string; level: LogLevel; agent: string; message: string; detail?: string;
}

const LEVEL_STYLE: Record<LogLevel, string> = {
  info:     "text-white/35",
  decision: "text-primary/80",
  warning:  "text-amber-400/80",
  tx:       "text-blue-400/80",
};
const LEVEL_ICON: Record<LogLevel, React.ReactNode> = {
  info:     <Info className="w-3 h-3" />,
  decision: <Bot className="w-3 h-3" />,
  warning:  <AlertTriangle className="w-3 h-3" />,
  tx:       <CheckCircle2 className="w-3 h-3" />,
};
const LEVEL_PREFIX: Record<LogLevel, string> = {
  info: "INFO", decision: "DECISION", warning: "WARN", tx: "TX",
};

const SEED: LogEntry[] = [
  { id: 1,  ts: "03:14:22", level: "info",     agent: "agent-001", message: "Scanning WETH/USDC pool state on Base Mainnet…" },
  { id: 2,  ts: "03:14:23", level: "info",     agent: "agent-001", message: "Pool fetched: activeTick=2047, currentPrice=2,481.33 USDC/WETH" },
  { id: 3,  ts: "03:14:24", level: "decision", agent: "agent-001", message: "LLM: price moved +2.1% from center, approaching upper bin boundary", detail: "Recommendation: REBALANCE — shift right 3 ticks. Risk: LOW. Confidence: 0.87" },
  { id: 4,  ts: "03:14:25", level: "tx",       agent: "agent-001", message: "Requesting wallet signature for RemoveLiquidity (binIds: [2044–2047])" },
  { id: 5,  ts: "03:14:30", level: "tx",       agent: "agent-001", message: "Signed by user · AddLiquidity submitted · hash: 0xabcd…ef12" },
  { id: 6,  ts: "03:14:31", level: "info",     agent: "agent-001", message: "Rebalanced. New center tick: 2050. Next cycle in 5m." },
  { id: 7,  ts: "03:19:22", level: "info",     agent: "agent-001", message: "Cycle #2 — fetching pool state…" },
  { id: 8,  ts: "03:19:23", level: "decision", agent: "agent-001", message: "LLM: price stable within range. No action needed.", detail: "Action: HOLD. Tick 2050 centered in range [2047, 2053]. IL minimal." },
  { id: 9,  ts: "03:19:24", level: "info",     agent: "agent-002", message: "WETH/cbETH paused by user — idle mode." },
  { id: 10, ts: "03:24:22", level: "warning",  agent: "agent-001", message: "Volatility spike — ATR 1h +34%. Strategy: Balanced." },
  { id: 11, ts: "03:24:23", level: "decision", agent: "agent-001", message: "LLM: widen range to absorb volatility. Action: REBALANCE", detail: "suggestedBinRange: lowerTick=2040, upperTick=2060. withdrawPercent=100." },
];

const LIVE: Omit<LogEntry, "id" | "ts">[] = [
  { level: "info",     agent: "agent-001", message: "Cycle check — fetching pool state from Maverick V2…" },
  { level: "decision", agent: "agent-001", message: "LLM: HOLD. Price within optimal range.", detail: "Confidence: 0.91. No rebalance needed." },
  { level: "info",     agent: "agent-001", message: "Fee accrued: +0.0031 USDC since last cycle." },
  { level: "warning",  agent: "agent-001", message: "Gas elevated (42 gwei). Deferring non-urgent rebalance." },
  { level: "decision", agent: "agent-001", message: "LLM: price approaching lower tick. Recommend ADD left.", detail: "Action: ADD_LIQUIDITY leftward. Risk: LOW." },
];

let idCtr = SEED.length + 1;

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
      <ConnectButton />
    </div>
  );
}

export default function Monitor() {
  const { isConnected } = useAccount();
  const [logs, setLogs]     = useState<LogEntry[]>(SEED);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [liveIdx, setLiveIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      const entry = LIVE[liveIdx % LIVE.length];
      const now = new Date();
      const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,"0")).join(":");
      setLogs((prev) => [...prev.slice(-80), { ...entry, id: idCtr++, ts }]);
      setLiveIdx((i) => i + 1);
    }, 4000);
    return () => clearInterval(t);
  }, [paused, liveIdx]);

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, paused]);

  if (!isConnected) return <WalletGate />;

  const filtered = filter === "all" ? logs : logs.filter(l => l.level === filter);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-400">

      {/* Page header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-5">
        <div>
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Monitor</div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Agent Monitor</h1>
          <p className="font-mono text-[10px] text-white/35 mt-0.5">Live LLM decision feed · Base Mainnet</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(!paused)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.10] font-mono text-[10px] text-white/40 hover:text-white/80 hover:border-white/20 transition-colors">
            {paused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
          </button>
          <button onClick={() => setLogs(SEED)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.10] font-mono text-[10px] text-white/40 hover:text-white/80 hover:border-white/20 transition-colors">
            <RefreshCw className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Agent status — flat bordered cells */}
      <div className="border border-white/[0.10] flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/[0.10]">
        {[
          { pool: "WETH/USDC",  status: "running", cycles: 12, pnl: "+2.34 USDC" },
          { pool: "WETH/cbETH", status: "paused",  cycles: 5,  pnl: "+0.81 USDC" },
        ].map((a) => (
          <div key={a.pool} className={`flex items-center gap-3 px-5 py-3.5 ${a.status === "running" ? "bg-primary/[0.03]" : ""}`}>
            <div className={`w-1.5 h-1.5 shrink-0 ${a.status === "running" ? "bg-primary animate-pulse" : "bg-white/20"}`} />
            <div>
              <div className="font-mono text-xs font-bold">{a.pool}</div>
              <div className="font-mono text-[9px] text-white/25">{a.cycles} cycles · {a.pnl}</div>
            </div>
            <div className={`ml-auto font-mono text-[9px] border px-2 py-0.5 ${
              a.status === "running" ? "border-primary/30 text-primary/60" : "border-white/[0.08] text-white/25"
            }`}>
              {a.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-0 border border-white/[0.10] overflow-x-auto">
        {(["all", "decision", "tx", "warning", "info"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors border-r border-white/[0.10] last:border-r-0 whitespace-nowrap ${
              filter === f ? "bg-primary/[0.08] text-primary" : "text-white/25 hover:text-white/60 hover:bg-white/[0.02]"
            }`}>
            {f}
          </button>
        ))}
        <div className="ml-auto px-4 font-mono text-[9px] text-white/15 shrink-0 flex items-center gap-2">
          <span>{filtered.length} entries</span>
          {!paused && (
            <span className="inline-flex items-center gap-1 text-primary/50">
              <span className="w-1.5 h-1.5 bg-primary animate-pulse" /> live
            </span>
          )}
        </div>
      </div>

      {/* Terminal — flat bordered */}
      <div className="border border-white/[0.10] bg-black/55">
        {/* Titlebar */}
        <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-red-500/40" />
            <span className="w-2 h-2 bg-amber-500/40" />
            <span className="w-2 h-2 bg-primary/40" />
          </div>
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">glidepool-agent-log</span>
          <div className="ml-auto font-mono text-[9px] text-white/15">Base Mainnet · chain 8453</div>
        </div>

        {/* Log entries */}
        <div className="h-[280px] sm:h-[420px] overflow-y-auto p-3 sm:p-4 space-y-0 font-mono text-[11px]">
          {filtered.map((log) => (
            <div key={log.id} className="group">
              <div className={`flex items-start gap-2 py-0.5 hover:bg-white/[0.02] px-1 transition-colors ${LEVEL_STYLE[log.level]}`}>
                <span className="text-white/12 shrink-0 w-14 hidden sm:block text-[10px]">{log.ts}</span>
                <span className={`shrink-0 mt-0.5 ${LEVEL_STYLE[log.level]}`}>{LEVEL_ICON[log.level]}</span>
                <span className="text-[9px] text-white/15 shrink-0 w-16 hidden md:block">{LEVEL_PREFIX[log.level]}</span>
                <span className="text-[9px] text-white/15 shrink-0 w-20 truncate hidden sm:block">{log.agent}</span>
                <span className="flex-1 leading-relaxed break-words min-w-0">{log.message}</span>
              </div>
              {log.detail && (
                <div className="mt-0.5 mb-1.5 ml-4 sm:ml-[10.5rem] px-3 py-2 border border-primary/10 bg-primary/[0.04] text-[10px] text-primary/50 leading-relaxed">
                  {log.detail}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <p className="font-mono text-[10px] text-white/15 leading-relaxed border border-white/[0.06] px-4 py-3">
        All on-chain actions require your wallet signature. LLM queries billed via x402 (~0.05 USDC each) on Base Mainnet.
      </p>
    </div>
  );
}
