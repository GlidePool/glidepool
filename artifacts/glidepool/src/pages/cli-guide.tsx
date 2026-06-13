import { useState } from "react";
import { Terminal, Copy, CheckCheck, ChevronRight, Package, Key, Cpu, Zap } from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-white/[0.07] bg-black/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
        <span className="text-[10px] text-white/20 font-mono">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[10px] text-white/25 hover:text-white/70 font-mono flex items-center gap-1 transition-colors"
        >
          {copied ? <><CheckCheck className="w-3 h-3 text-primary" /> copied</> : <><Copy className="w-3 h-3" /> copy</>}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-white/60 overflow-x-auto leading-relaxed whitespace-pre">{code}</pre>
    </div>
  );
}

const STEPS = [
  {
    num: "01", icon: <Package className="w-5 h-5 text-primary" />,
    title: "Install CLI",
    desc: "Install the GlidePool CLI globally. Requires Node.js 18+ and a Base Mainnet wallet.",
    blocks: [
      { lang: "bash", code: `npm install -g @glidepool/cli\n\n# or with pnpm\npnpm add -g @glidepool/cli\n\n# verify\nglidepool --version` },
    ],
  },
  {
    num: "02", icon: <Key className="w-5 h-5 text-primary" />,
    title: "Configure wallet",
    desc: "Initialize the CLI with your wallet and Base Mainnet RPC. Keys are stored locally — never transmitted.",
    blocks: [
      { lang: "bash", code: `glidepool init\n\n# Prompts:\n# Wallet private key (stored in ~/.glidepool/config.json)\n# Base RPC URL (default: https://mainnet.base.org)\n# API endpoint (default: https://glidepool.com/api)` },
      { lang: "json", code: `// ~/.glidepool/config.json (auto-generated)\n{\n  "rpc": "https://mainnet.base.org",\n  "apiEndpoint": "https://glidepool.com/api",\n  "chain": "base",\n  "x402PaymentEnabled": true\n}` },
    ],
  },
  {
    num: "03", icon: <Cpu className="w-5 h-5 text-primary" />,
    title: "Deploy agent",
    desc: "Launch an autonomous DLMM agent. The LLM queries are billed via x402 micropayments (~0.05 USDC each).",
    blocks: [
      { lang: "bash", code: `# Auto-select best pool (recommended)\nglidepool agent deploy --strategy balanced --budget 0.1eth\n\n# Target a specific pool\nglidepool agent deploy \\\n  --pool 0x8bB5...3CB4 \\\n  --strategy conservative \\\n  --budget 200usdc \\\n  --rebalance-threshold 5 \\\n  --max-slippage 0.5` },
      { lang: "bash", code: `# Available strategies:\n# conservative — Static mode, tight range, low risk\n# balanced     — Both mode, LLM auto-range, medium risk\n# aggressive   — Right/Left mode, wide range, high risk\nglidepool strategies list` },
    ],
  },
  {
    num: "04", icon: <Zap className="w-5 h-5 text-primary" />,
    title: "Monitor & manage",
    desc: "Stream live agent logs, pause/resume, or stop agents from the terminal.",
    blocks: [
      { lang: "bash", code: `# Stream all agents live\nglidepool agent logs --follow\n\n# Specific agent\nglidepool agent logs --agent agent-001 --follow\n\n# List agents\nglidepool agent list\n\n# Pause / resume / stop\nglidepool agent pause  agent-001\nglidepool agent resume agent-001\nglidepool agent stop   agent-001 --confirm` },
      { lang: "bash", code: `# Example output:\n[03:14:24] DECISION  agent-001  LLM: rebalance — shift right 3 ticks\n[03:14:25] TX        agent-001  Awaiting wallet signature…\n[03:14:30] TX        agent-001  Confirmed · 0xabcd…ef12\n[03:19:23] DECISION  agent-001  LLM: HOLD — price stable in range` },
    ],
  },
];

export default function CliGuide() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-in fade-in duration-400">

      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">CLI / SDK Guide</h1>
        <p className="text-xs text-white/35 font-mono mt-0.5">Deploy and manage DLMM agents from your terminal.</p>
      </div>

      {/* Prerequisites */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 sm:px-5 py-4 flex items-start gap-3">
        <Terminal className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 min-w-0">
          <div className="text-xs font-bold text-white/60">Prerequisites</div>
          <div className="text-xs text-white/30 leading-relaxed font-mono space-y-0.5">
            <div>· Node.js 18+ (<span className="text-primary/60">node --version</span>)</div>
            <div>· Base Mainnet ETH (gas) + USDC (~0.05 / LLM query)</div>
            <div>· Account at <span className="text-primary/60">glidepool.com</span></div>
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
              active === i
                ? "bg-primary/10 text-primary border border-primary/20"
                : "border border-white/[0.07] text-white/35 hover:text-white/70"
            }`}>
            <span className="text-white/20">[{s.num}]</span>
            <span className="hidden sm:inline">{s.title}</span>
            <span className="sm:hidden">{s.num}</span>
          </button>
        ))}
      </div>

      {/* Active step */}
      {STEPS.map((s, i) => active === i && (
        <div key={i} className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="shrink-0 mt-0.5 sm:mt-0">{s.icon}</div>
            <div>
              <h2 className="font-bold text-base tracking-tight">{s.title}</h2>
              <p className="text-xs text-white/35 leading-relaxed mt-0.5">{s.desc}</p>
            </div>
          </div>
          {s.blocks.map((b, j) => <CodeBlock key={j} code={b.code} lang={b.lang} />)}
          <div className="flex justify-between items-center pt-1">
            {i > 0
              ? <button onClick={() => setActive(i - 1)} className="text-xs text-white/30 hover:text-white/60 font-mono transition-colors">← Previous</button>
              : <span />
            }
            {i < STEPS.length - 1 && (
              <button onClick={() => setActive(i + 1)}
                className="inline-flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary font-mono transition-colors">
                Next <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}

      <p className="text-[10px] text-white/20 font-mono leading-relaxed border border-white/[0.05] rounded-lg p-4">
        GlidePool CLI is open-source (MIT). All wallet operations happen locally — no keys are sent to GlidePool servers.
        Each LLM call to <span className="text-white/40">/api/advisor</span> costs ~0.05 USDC via x402 on Base Mainnet.
        You sign every on-chain action.
      </p>
    </div>
  );
}
