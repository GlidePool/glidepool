import { useState } from "react";
import { Terminal, Copy, CheckCheck, ChevronRight, ChevronLeft, Globe, Key, Cpu, Zap } from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="border border-white/[0.08] bg-black/60 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="font-mono text-[9px] text-white/25 hover:text-white/70 flex items-center gap-1 transition-colors uppercase tracking-widest"
        >
          {copied ? <><CheckCheck className="w-3 h-3 text-primary" /> copied</> : <><Copy className="w-3 h-3" /> copy</>}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs text-white/60 leading-relaxed whitespace-pre-wrap break-all">{code}</pre>
    </div>
  );
}

const STEPS = [
  {
    num: "01", icon: <Globe className="w-5 h-5 text-primary" />,
    title: "Connect Wallet",
    desc: "Open the GlidePool web app and connect your Base Mainnet wallet via Reown AppKit. No account needed — your wallet address is your identity.",
    blocks: [
      {
        lang: "info", code:
`Supported wallets:
  MetaMask, Coinbase Wallet, WalletConnect-compatible

Required:
  › Base Mainnet (chain ID 8453)
  › ETH for gas
  › USDC if x402 payment gating is enabled server-side

Steps:
  1. Click "Connect Wallet" in the top nav
  2. Select your wallet provider
  3. Switch to Base Mainnet if prompted`,
      },
    ],
  },
  {
    num: "02", icon: <Key className="w-5 h-5 text-primary" />,
    title: "Create Agent via API",
    desc: "Agents are created through the web UI (Setup Agent page) or directly via the REST API. Your wallet address links the agent to you — no private keys are sent.",
    blocks: [
      {
        lang: "bash", code:
`# Create an agent via API
curl -X POST https://<your-domain>/api/agents \\
  -H "Content-Type: application/json" \\
  -d '{
    "userAddress": "0xYourWalletAddress",
    "poolAddress": "0x3d70b2f31f75dc84acdd5e1588695221959b2d37",
    "strategy": "balanced",
    "budgetUsdc": 100,
    "analysisIntervalSec": 60
  }'`,
      },
      {
        lang: "json", code:
`// Response
{
  "id": "uuid-of-agent",
  "userAddress": "0xYour...",
  "poolAddress": "0x3d70...",
  "strategy": "balanced",
  "budgetUsdc": "100",
  "status": "active",
  "createdAt": "2026-06-13T..."
}`,
      },
    ],
  },
  {
    num: "03", icon: <Cpu className="w-5 h-5 text-primary" />,
    title: "Agent Loop (automatic)",
    desc: "Once created, the agent loop runs automatically on the server every ~30 seconds. Each analysis cycle calls Claude Opus 4 and stores the result in the database.",
    blocks: [
      {
        lang: "bash", code:
`# Check agent status
curl https://<your-domain>/api/agents?userAddress=0xYour...

# Get LLM decisions for an agent
curl https://<your-domain>/api/agents/<agentId>/actions`,
      },
      {
        lang: "json", code:
`// Example action response
{
  "id": "...",
  "actionType": "hold",
  "status": "completed",
  "llmReasoning": "Pool reserves are low, price is stable...",
  "llmRecommendation": {
    "action": "hold",
    "riskLevel": "low",
    "summary": "Hold current position..."
  },
  "createdAt": "2026-06-13T..."
}`,
      },
    ],
  },
  {
    num: "04", icon: <Zap className="w-5 h-5 text-primary" />,
    title: "Monitor & manage",
    desc: "Use the Dashboard and Monitor pages to review LLM decisions, pause/resume agents, and sign pending transactions. All on-chain actions require your wallet signature.",
    blocks: [
      {
        lang: "bash", code:
`# Pause an agent
curl -X PUT https://<your-domain>/api/agents/<agentId>/status \\
  -H "Content-Type: application/json" \\
  -d '{"status": "paused"}'

# Resume
curl -X PUT https://<your-domain>/api/agents/<agentId>/status \\
  -H "Content-Type: application/json" \\
  -d '{"status": "active"}'

# Stop permanently
curl -X PUT https://<your-domain>/api/agents/<agentId>/status \\
  -H "Content-Type: application/json" \\
  -d '{"status": "stopped"}'`,
      },
      {
        lang: "text", code:
`// Example monitor log output:
[23:31:28] DECISION agent-4df9...
  LLM: hold - pool reserves uninitialized
  riskLevel: high

[23:32:00] DECISION agent-54d7...
  LLM: hold - price in range
  riskLevel: low

[23:32:05] PENDING_SIGNATURE agent-54d7...
  TX: rebalance proposal ready
  Action needed: sign in Monitor page`,
      },
    ],
  },
];

export default function CliGuide() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-in fade-in duration-400">

      {/* Page header */}
      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">API / Web Guide</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">API & Setup Guide</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">Deploy and manage DLMM agents via the web UI or REST API.</p>
      </div>

      {/* Prerequisites */}
      <div className="border border-white/[0.10] flex items-start gap-0">
        <div className="border-r border-white/[0.10] p-4 flex items-center justify-center shrink-0">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        <div className="p-4 space-y-1.5 min-w-0">
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2.5">Prerequisites</div>
          <div className="font-mono text-[10px] text-white/30 leading-relaxed space-y-1">
            <div>› Base ETH (gas fees)</div>
            <div>› USDC on Base (if x402 payment gating is enabled)</div>
            <div>› MetaMask, Coinbase Wallet, or WalletConnect wallet</div>
          </div>
        </div>
      </div>

      {/* Step tabs - 2 col mobile, 4 col sm+ */}
      <div className="border border-white/[0.10] grid grid-cols-2 sm:grid-cols-4 overflow-hidden">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={[
              "px-4 py-3 font-mono text-[10px] transition-colors text-left border-b border-r border-white/[0.10]",
              active === i
                ? "bg-primary/[0.06] text-primary"
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
            <div className="p-4 min-w-0">
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
          GlidePool is non-custodial - the server never holds your private keys or funds.
          Every on-chain action (rebalance, add/remove liquidity) requires your explicit wallet signature.
          x402 micropayments are optional and must be enabled server-side via <span className="text-white/35">X402_ENABLED=true</span>.
        </p>
      </div>
    </div>
  );
}
