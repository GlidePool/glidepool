import { useState } from "react";
import { Terminal, Copy, CheckCheck, ChevronRight, ChevronLeft, Bot, Zap, Eye, Shield } from "lucide-react";
import { Link } from "wouter";

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
    num: "01",
    icon: <Terminal className="w-5 h-5 text-primary" />,
    title: "Install CLI",
    desc: "Install @glide-pool/cli globally. The CLI is the primary way to create and manage agents — the web app only monitors and signs transactions.",
    blocks: [
      {
        lang: "bash", code:
`npm install -g @glide-pool/cli

# Verify installation
glidepool --version`,
      },
      {
        lang: "bash", code:
`# Point CLI at the GlidePool API server
glidepool config set-api https://api.glidepool.xyz

# Confirm connection — lists all 28 live pools
glidepool pools list`,
      },
    ],
  },
  {
    num: "02",
    icon: <Eye className="w-5 h-5 text-primary" />,
    title: "Pick a Pool",
    desc: "Browse all Maverick V2 DLMM pools on Base Mainnet. Data is read live from on-chain. Note the pool address you want your agent to manage.",
    blocks: [
      {
        lang: "bash", code:
`glidepool pools list

# ┌──────────────────┬──────────────┬──────────┐
# │ POOL             │ TVL          │ FEE      │
# ├──────────────────┼──────────────┼──────────┤
# │ msUSD/USDC       │ $127,718     │ 0.045%   │
# │ WETH/msETH       │ $71,475      │ 0.042%   │
# │ DAI/USDC         │ $64,202      │ 0.002%   │
# │ WETH/USDC        │ $21,310      │ 0.15%    │
# │ WETH/USDbC       │ $18,299      │ 0.02%    │
# │ cbETH/WETH       │ $8,861       │ 0.01%    │
# └──────────────────┴──────────────┴──────────┘`,
      },
      {
        lang: "bash", code:
`# Inspect a specific pool in detail
glidepool pools get 0x3d70b2f31f75dc84acdd5e1588695221959b2d37

# Shows: activeTick, sqrtPrice, reserves, fee rates, bin count`,
      },
    ],
  },
  {
    num: "03",
    icon: <Bot className="w-5 h-5 text-primary" />,
    title: "Deploy Agent",
    desc: "Create an autonomous agent via the CLI. It runs server-side, reads pool state every ~30s, and calls Claude Opus 4 for decisions. All on-chain actions are queued for your wallet signature.",
    blocks: [
      {
        lang: "bash", code:
`glidepool agent create \\
  --wallet   0xYOUR_WALLET_ADDRESS \\
  --pool     0x3d70b2f31f75dc84acdd5e1588695221959b2d37 \\
  --strategy balanced \\
  --budget   100 \\
  --interval 60

# Strategies:
#   static     → tight bin range, conservative
#   balanced   → Both mode, follows price both ways
#   aggressive → Right/Left mode, follows trend`,
      },
      {
        lang: "json", code:
`// Response
{
  "id": "3f9a8b2c-...",
  "userAddress": "0xYour...",
  "poolAddress": "0x3d70...",
  "strategy": "balanced",
  "budgetUsdc": "100",
  "status": "active",
  "analysisIntervalSec": 60
}`,
      },
    ],
  },
  {
    num: "04",
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: "LLM via x402",
    desc: "Each agent analysis calls Claude Opus 4 on the server. When X402_ENABLED is set, every LLM call requires 0.05 USDC paid on Base Mainnet — verified on-chain before the model responds. You can also query the advisor directly from the CLI.",
    blocks: [
      {
        lang: "text", code:
`x402 Payment Flow (per Claude Opus 4 call):
─────────────────────────────────────────────
  Agent loop → POST /api/advisor
      ↓
  HTTP 402 Payment Required
  { treasury: "0x...", amount: 0.05 USDC, chain: Base }
      ↓
  Transfer 0.05 USDC to treasury on Base
  Attach tx hash as x-payment-proof header
      ↓
  Server verifies transfer on-chain via viem
      ↓
  Claude Opus 4 → recommendation returned
  { action, riskLevel, binRange, reasoning }`,
      },
      {
        lang: "bash", code:
`# Query advisor manually from CLI
glidepool advisor \\
  --pool 0x3d70b2f31f75dc84acdd5e1588695221959b2d37 \\
  --goal "maximize yield, accept medium risk" \\
  --payment-proof <base64-encoded-proof>

# Output: action, riskLevel, suggestedBinRange, reasoning`,
      },
    ],
  },
  {
    num: "05",
    icon: <Shield className="w-5 h-5 text-primary" />,
    title: "Monitor & Sign",
    desc: "The Monitor page shows live agent decisions, LLM reasoning, and pending transactions. Every on-chain write needs your wallet signature — GlidePool never holds your keys or funds.",
    blocks: [
      {
        lang: "bash", code:
`# Check agent status via CLI
glidepool agent list --wallet 0xYOUR_WALLET

# View recent LLM decisions
glidepool agent actions <agentId> --limit 10

# Pause / resume / stop
glidepool agent pause  <agentId>
glidepool agent resume <agentId>
glidepool agent stop   <agentId>`,
      },
      {
        lang: "text", code:
`Monitor page (web app):
────────────────────────
  [LIVE] Agent 3f9a8b2c — WETH/USDC balanced
  ✓ 23:31:28  hold        risk: low   "Price in range, hold"
  ✓ 23:32:05  rebalance   risk: med   "Bin drift +12 ticks"
  ⏳ 23:33:10  PENDING SIGNATURE
              removeLiquidity → addLiquidity (new range)
              → Review and sign in your wallet`,
      },
    ],
  },
];

export default function AgentSetup() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-in fade-in duration-400">

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">CLI Quickstart</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Deploy an Agent</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">
          Agents are created via CLI or SDK. The web app monitors and signs.
        </p>
      </div>

      {/* Architecture banner */}
      <div className="border border-primary/20 bg-primary/[0.03] p-4 flex gap-3 items-start">
        <Bot className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="font-mono text-[10px] leading-relaxed space-y-1.5">
          <div><span className="text-primary/80">CLI / SDK</span> <span className="text-white/30">— create agents, pick strategy, query advisor</span></div>
          <div><span className="text-primary/80">Web App</span>  <span className="text-white/30">— monitor live LLM decisions, sign pending TXs</span></div>
          <div><span className="text-primary/80">x402</span>     <span className="text-white/30">— 0.05 USDC per Claude Opus 4 call, verified on Base</span></div>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="border border-white/[0.10] flex items-start gap-0">
        <div className="border-r border-white/[0.10] p-4 flex items-center justify-center shrink-0">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        <div className="p-4 min-w-0">
          <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-2.5">Prerequisites</div>
          <div className="font-mono text-[10px] text-white/30 leading-relaxed space-y-1">
            <div>› Node.js ≥ 18 &nbsp;(for CLI/SDK)</div>
            <div>› ETH on Base &nbsp;(gas fees)</div>
            <div>› USDC on Base &nbsp;(if x402 payment gating is enabled server-side)</div>
            <div>› Your wallet address &nbsp;(agent is linked to you — no private keys sent to server)</div>
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="border border-white/[0.10] grid grid-cols-2 sm:grid-cols-5 overflow-hidden">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={[
              "px-3 py-3 font-mono transition-colors text-left border-b border-r border-white/[0.10]",
              active === i
                ? "bg-primary/[0.06] text-primary"
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]",
            ].join(" ")}>
            <div className={`text-[9px] mb-0.5 font-mono ${active === i ? "text-primary/50" : "text-white/20"}`}>[{s.num}]</div>
            <div className="font-bold text-[9px] sm:text-[10px] leading-tight">{s.title}</div>
          </button>
        ))}
      </div>

      {/* Active step content */}
      {STEPS.map((s, i) => active === i && (
        <div key={i} className="flex flex-col gap-4 animate-in fade-in duration-200">
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
            {i < STEPS.length - 1 ? (
              <button onClick={() => setActive(i + 1)}
                className="inline-flex items-center gap-1 font-mono text-[10px] text-primary/70 hover:text-primary transition-colors">
                Next <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <Link href="/monitor">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-primary/70 hover:text-primary transition-colors cursor-pointer">
                  Open Monitor <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* SDK block */}
      <div className="border border-white/[0.06] p-5 flex flex-col gap-3">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">SDK — Programmatic Access</div>
        <CodeBlock lang="js" code={
`import { GlidePoolClient } from '@glide-pool/sdk';

const client = new GlidePoolClient({ apiUrl: 'https://api.glidepool.xyz' });

const agent = await client.createAgent({
  userAddress: '0xYour...',
  poolAddress:  '0x3d70b2f31f75dc84acdd5e1588695221959b2d37',
  strategy:    'balanced',
  budgetUsdc:   100,
});

const actions = await client.getAgentActions(agent.id);`
        } />
        <p className="font-mono text-[10px] text-white/25">
          npm install <span className="text-white/40">@glide-pool/sdk</span>
          &nbsp;·&nbsp;
          <a href="https://github.com/GlidePool/sdk" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 transition-colors">github.com/GlidePool/sdk</a>
        </p>
      </div>

      {/* Non-custodial note */}
      <div className="border border-white/[0.06] px-5 py-4">
        <p className="font-mono text-[10px] text-white/20 leading-relaxed">
          GlidePool is fully non-custodial. The server never holds your private keys or funds.
          Every on-chain action (rebalance, add/remove liquidity) requires your explicit wallet signature.
          Agent budget is informational — actual on-chain writes need your approval in the Monitor page.
        </p>
      </div>

    </div>
  );
}
