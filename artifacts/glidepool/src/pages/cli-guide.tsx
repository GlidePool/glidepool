import { useState } from "react";
import { Terminal, Copy, CheckCheck, ChevronRight, ChevronLeft, Package, Key, Cpu, Zap } from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="border border-white/[0.08] bg-black/60">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="font-mono text-[9px] text-white/25 hover:text-white/70 flex items-center gap-1 transition-colors uppercase tracking-widest"
        >
          {copied ? <><CheckCheck className="w-3 h-3 text-primary" /> copied</> : <><Copy className="w-3 h-3" /> copy</>}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs text-white/60 overflow-x-auto leading-relaxed whitespace-pre">{code}</pre>
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

      {/* Page header */}
      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">CLI / SDK</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">CLI / SDK Guide</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">Deploy and manage DLMM agents from your terminal.</p>
      </div>

      {/* Prerequisites */}
      <div className="border border-white/[0.10] flex items-start gap-0">
        <div className="border-r border-white/[0.10] p-4 flex items-center justify-center shrink-0">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        <div className="p-4 space-y-1.5 min-w-0">
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2.5">Prerequisites</div>
          <div className="font-mono text-[10px] text-white/30 leading-relaxed space-y-1">
            <div>› Node.js 18+ (<span className="text-primary/60">node --version</span>)</div>
            <div>› Base Mainnet ETH (gas) + USDC (~0.05 / LLM query)</div>
            <div>› Account at <span className="text-primary/60">glidepool.com</span></div>
          </div>
        </div>
      </div>

      {/* Step tabs — 2 col mobile, 4 col sm+ */}
      <div className="border border-white/[0.10] grid grid-cols-2 sm:grid-cols-4 overflow-hidden">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={[
              "px-4 py-3 font-mono text-[10px] transition-colors text-left border-b border-r border-white/[0.10]",
              active === i
                ? "bg-primary/[0.06] text-primary border-b-primary/60"
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]",
            ].join(" ")}>
            <div className={`text-[9px] mb-0.5 ${active === i ? "text-primary/50" : "text-white/20"}`}>[{s.num}]</div>
            <div className="font-bold">{s.title}</div>
          </button>
        ))}
      </div>

      {/* Active step content */}
      {STEPS.map((s, i) => active === i && (
        <div key={i} className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Step header */}
          <div className="border border-white/[0.10] flex items-stretch gap-0">
            <div className="border-r border-white/[0.10] p-4 flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div className="p-4">
              <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Step {s.num}</div>
              <h2 className="font-bold text-base tracking-tight">{s.title}</h2>
              <p className="font-mono text-[10px] text-white/35 leading-relaxed mt-1">{s.desc}</p>
            </div>
          </div>

          {s.blocks.map((b, j) => <CodeBlock key={j} code={b.code} lang={b.lang} />)}

          <div className="flex justify-between items-center pt-1">
            {i > 0
              ? <button onClick={() => setActive(i - 1)} className="font-mono text-[10px] text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" /> Previous
                </button>
              : <span />
            }
            {i < STEPS.length - 1 && (
              <button onClick={() => setActive(i + 1)}
                className="inline-flex items-center gap-1 font-mono text-[10px] text-primary/70 hover:text-primary transition-colors">
                Next <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div className="border border-white/[0.06] px-5 py-4">
        <p className="font-mono text-[10px] text-white/20 leading-relaxed">
          GlidePool CLI is open-source (MIT). All wallet operations happen locally — no keys are sent to GlidePool servers.
          Each LLM call to <span className="text-white/35">/api/advisor</span> costs ~0.05 USDC via x402 on Base Mainnet.
          You sign every on-chain action.
        </p>
      </div>
    </div>
  );
}
