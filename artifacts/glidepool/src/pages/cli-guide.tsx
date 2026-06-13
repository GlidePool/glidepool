import { useState } from "react";
import { Terminal, Copy, CheckCheck, ChevronRight, Package, Key, Cpu, Zap } from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-lg border border-white/[0.07] bg-black/60 overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
        <span className="text-[10px] text-white/20 font-mono">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[10px] text-white/20 hover:text-white/60 font-mono flex items-center gap-1 transition-colors"
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
    num: "01",
    icon: <Package className="w-5 h-5 text-primary" />,
    title: "Install GlidePool CLI",
    desc: "Install the CLI globally via npm. Requires Node.js 18+ and a Base Mainnet wallet.",
    blocks: [
      { lang: "bash", code: `npm install -g @glidepool/cli\n\n# or with pnpm\npnpm add -g @glidepool/cli\n\n# verify installation\nglidepool --version` },
    ],
  },
  {
    num: "02",
    icon: <Key className="w-5 h-5 text-primary" />,
    title: "Configure wallet & network",
    desc: "Initialize the CLI with your wallet private key (stored locally, never transmitted) and Base Mainnet RPC.",
    blocks: [
      { lang: "bash", code: `glidepool init\n\n# You will be prompted:\n# > Wallet private key (stored in ~/.glidepool/config.json, never sent to server)\n# > Base RPC URL (default: https://mainnet.base.org)\n# > GlidePool API endpoint (default: https://glidepool.com/api)` },
      { lang: "json", code: `// ~/.glidepool/config.json (auto-generated)\n{\n  "wallet": "0xYOUR_PRIVATE_KEY",\n  "rpc": "https://mainnet.base.org",\n  "apiEndpoint": "https://glidepool.com/api",\n  "chain": "base",\n  "x402PaymentEnabled": true\n}` },
    ],
  },
  {
    num: "03",
    icon: <Cpu className="w-5 h-5 text-primary" />,
    title: "Deploy an agent",
    desc: "Launch an autonomous DLMM agent targeting a Maverick V2 pool. The agent LLM queries are billed via x402 micropayments.",
    blocks: [
      { lang: "bash", code: `# Auto-select best pool (recommended)\nglidepool agent deploy --strategy balanced --budget 0.1eth\n\n# Target a specific pool\nglidepool agent deploy \\\n  --pool 0x8bB5...3CB4 \\\n  --strategy conservative \\\n  --budget 200usdc \\\n  --rebalance-threshold 5 \\\n  --max-slippage 0.5` },
      { lang: "bash", code: `# List available strategies\nglidepool strategies list\n\n# conservative  — Static mode, tight range, low risk\n# balanced      — Both mode, LLM auto-range, medium risk  \n# aggressive    — Right/Left mode, wide range, high risk` },
    ],
  },
  {
    num: "04",
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: "Monitor & manage agents",
    desc: "Stream live agent logs, pause/resume, or shut down from the CLI.",
    blocks: [
      { lang: "bash", code: `# Stream live log for all agents\nglidepool agent logs --follow\n\n# Stream a specific agent\nglidepool agent logs --agent agent-001 --follow\n\n# Show all running agents\nglidepool agent list\n\n# Pause an agent\nglidepool agent pause agent-001\n\n# Resume\nglidepool agent resume agent-001\n\n# Shut down permanently\nglidepool agent stop agent-001 --confirm` },
      { lang: "bash", code: `# Example log output:\n[03:14:24] DECISION  agent-001  LLM: rebalance — shift right 3 ticks\n[03:14:25] TX        agent-001  Awaiting wallet signature…\n[03:14:30] TX        agent-001  Confirmed · hash: 0xabcd…ef12\n[03:19:23] DECISION  agent-001  LLM: HOLD — price stable in range` },
    ],
  },
];

export default function CliGuide() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto animate-in fade-in duration-500">

      <div>
        <h1 className="text-xl font-bold tracking-tight">CLI / SDK Guide</h1>
        <p className="text-xs text-white/35 font-mono mt-0.5">
          Set up the GlidePool CLI to deploy and manage DLMM agents from your terminal.
        </p>
      </div>

      {/* Prereq banner */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 flex items-start gap-3">
        <Terminal className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-bold text-white/60">Prerequisites</div>
          <div className="text-xs text-white/30 leading-relaxed font-mono space-y-0.5">
            <div>· Node.js 18+ (check: <span className="text-primary/60">node --version</span>)</div>
            <div>· A wallet with Base Mainnet ETH (gas) and USDC (x402 micropayments ~0.05 USDC / query)</div>
            <div>· GlidePool account at <span className="text-primary/60">glidepool.com</span></div>
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-2 flex-wrap">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setActiveStep(i)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
              activeStep === i ? "bg-primary/10 text-primary border border-primary/20" : "border border-white/[0.07] text-white/35 hover:text-white/70"
            }`}>
            <span className="text-white/20">[{s.num}]</span> {s.title}
          </button>
        ))}
      </div>

      {/* Active step */}
      {STEPS.map((s, i) => activeStep === i && (
        <div key={i} className="flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            {s.icon}
            <div>
              <h2 className="font-bold text-base tracking-tight">{s.title}</h2>
              <p className="text-xs text-white/35 leading-relaxed mt-0.5">{s.desc}</p>
            </div>
          </div>
          {s.blocks.map((b, j) => <CodeBlock key={j} code={b.code} lang={b.lang} />)}
          <div className="flex justify-between items-center pt-2">
            {i > 0 ? (
              <button onClick={() => setActiveStep(i - 1)}
                className="text-xs text-white/30 hover:text-white/60 font-mono transition-colors">← Previous</button>
            ) : <span />}
            {i < STEPS.length - 1 && (
              <button onClick={() => setActiveStep(i + 1)}
                className="inline-flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary font-mono transition-colors">
                Next step <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-white/[0.05] p-5 text-[10px] text-white/20 font-mono leading-relaxed">
        GlidePool CLI is open-source (MIT). All wallet operations happen locally — no keys are transmitted to GlidePool servers.
        The agent calls <span className="text-white/40">/api/advisor</span> on Base Mainnet, pays ~0.05 USDC per LLM query via x402, then requests your signature for every on-chain action.
      </div>
    </div>
  );
}
