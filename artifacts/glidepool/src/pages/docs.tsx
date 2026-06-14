import { BookOpen, Layers, Bot, Zap, Plus, Eye, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const SECTIONS = [
  {
    icon: <BookOpen className="w-4 h-4 text-primary" />,
    title: "Introduction",
    id: "intro",
    content: [
      {
        heading: "What is GlidePool?",
        body: `GlidePool is an autonomous AI advisor layer for Maverick V2 DLMM (Dynamic Liquidity Market Maker) positions on Base Mainnet. It connects three primitives:

· Maverick V2 — the DLMM protocol that manages on-chain liquidity bins
· Claude Opus 4 — Anthropic's frontier model that analyzes pool state and recommends actions
· x402 — an HTTP micropayment standard that gates each AI call with 0.05 USDC on Base

GlidePool is fully non-custodial. The server reads on-chain data and produces recommendations. Every write (rebalance, add/remove liquidity) requires your explicit wallet signature.`,
      },
    ],
  },
  {
    icon: <Layers className="w-4 h-4 text-primary" />,
    title: "Pool Explorer",
    id: "pools",
    content: [
      {
        heading: "Browsing Pools",
        body: `The Pools page lists all supported Maverick V2 DLMM pools on Base Mainnet. For each pool you can see:

· TVL (USD) — total value locked, computed from on-chain reserves × token price
· Current price — derived from the active tick and token pair
· Active tick — the current bin the pool is operating in
· Fee rate — the pool's fee tier (e.g. 0.05%)

Data is fetched live from Base Mainnet via viem every time you load the page.`,
      },
      {
        heading: "Adding a Pool",
        body: `Any Maverick V2 DLMM pool on Base Mainnet can be registered:

1. Navigate to Create Pool
2. To register an existing pool: enter its contract address
3. To deploy a new pool: enter Token A and Token B addresses (any ERC20 on Base, including Clanker tokens), choose a fee tier and pool mode, then sign the transaction
4. After deployment, click "Register Pool with GlidePool" to add it to the explorer`,
      },
    ],
  },
  {
    icon: <Bot className="w-4 h-4 text-primary" />,
    title: "AI Agents",
    id: "agents",
    content: [
      {
        heading: "Deploying an Agent",
        body: `An agent is a server-side loop that monitors a pool and generates LLM recommendations on a schedule. To deploy:

1. Go to Deploy Agent
2. Select a pool from the dropdown
3. Choose a strategy: Conservative (Static bins), Balanced (Both mode), or Aggressive (Right/Left mode)
4. Set a USDC budget and analysis interval (minimum 30s)
5. Submit — your wallet address is recorded as the agent owner

No wallet signature is required to create an agent. Signatures are only needed when you approve a transaction proposal.`,
      },
      {
        heading: "Agent Lifecycle",
        body: `active → The agent loop runs on the server every ~30 seconds. Each cycle checks if the analysis interval has elapsed, then calls Claude Opus 4 with the current pool snapshot.

paused → The loop skips analysis but the agent record is retained. Resume at any time from the Monitor page.

stopped → The agent is permanently halted. LLM history is retained for review.`,
      },
      {
        heading: "Strategies",
        body: `Conservative — Static bins. Tight range, no automatic rebalancing. Best for stablecoin pairs or low-volatility assets.

Balanced — Both mode. Liquidity follows price in both directions. Suitable for most pairs.

Aggressive — Right or Left mode. Follows the price trend directionally. Higher fee capture potential, higher impermanent loss risk.

Claude Opus 4 will recommend switching strategies if market conditions change significantly.`,
      },
    ],
  },
  {
    icon: <Eye className="w-4 h-4 text-primary" />,
    title: "Monitor",
    id: "monitor",
    content: [
      {
        heading: "Reviewing Decisions",
        body: `The Monitor page shows a real-time log of all LLM decisions across your active agents. Each entry includes:

· Action — hold, rebalance, withdraw, add_liquidity, or switch_mode
· Risk level — low, medium, or high
· LLM reasoning — the full text explanation from Claude Opus 4
· Timestamp and agent ID

Decisions are stored in the database and persist across sessions.`,
      },
      {
        heading: "Approving Transactions",
        body: `When the agent recommends a rebalance or liquidity action, it generates a transaction proposal. The proposal appears in Monitor with a "Sign" button. Clicking it opens your wallet (RainbowKit / Reown AppKit) for signature. GlidePool never signs on your behalf.`,
      },
    ],
  },
  {
    icon: <Zap className="w-4 h-4 text-primary" />,
    title: "x402 Payments",
    id: "x402",
    content: [
      {
        heading: "How x402 Works",
        body: `x402 is an HTTP micropayment standard built on the HTTP 402 (Payment Required) status code. When enabled:

1. Client calls GET /api/advisor
2. Server responds HTTP 402 with a payment header: treasury address + 0.05 USDC on Base
3. Client sends a USDC transfer on Base Mainnet
4. Client retries the request with the transaction hash
5. Server verifies the transfer on-chain via Base RPC
6. Server unlocks Claude Opus 4 and returns the analysis

x402 is disabled by default. Enable it server-side with X402_ENABLED=true and set TREASURY_ADDRESS.`,
      },
    ],
  },
  {
    icon: <Plus className="w-4 h-4 text-primary" />,
    title: "REST API",
    id: "api",
    content: [
      {
        heading: "Endpoints",
        body: `GET  /api/pools                        — list all supported pools
GET  /api/pools/:address               — single pool detail
POST /api/pools/register               — register a pool address

GET  /api/positions?userAddress=0x…   — NFT positions for a wallet
GET  /api/positions/:nftId             — single position detail

POST /api/agents                       — create an agent
GET  /api/agents?userAddress=0x…      — list agents for a wallet
GET  /api/agents/:id/actions           — LLM decision history
PUT  /api/agents/:id/status            — pause / resume / stop

GET  /api/advisor                      — AI advisor (x402-gated if enabled)`,
      },
      {
        heading: "Full Reference",
        body: `See the API Guide page for step-by-step examples with curl commands and JSON response samples.`,
      },
    ],
  },
];

export default function Docs() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto animate-in fade-in duration-400">

      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Documentation</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">GlidePool Docs</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">
          Complete reference for pools, agents, AI advisor, and the x402 payment protocol.
        </p>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`}
            className="font-mono text-[9px] px-2.5 py-1 border border-white/[0.08] text-white/35 hover:text-white/70 hover:border-white/20 transition-all">
            {s.title}
          </a>
        ))}
      </div>

      {SECTIONS.map((s) => (
        <div key={s.id} id={s.id} className="flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            {s.icon}
            <h2 className="font-bold text-base tracking-tight">{s.title}</h2>
          </div>
          {s.content.map(({ heading, body }) => (
            <div key={heading} className="flex flex-col gap-2 pl-2 border-l border-white/[0.06]">
              <h3 className="font-mono text-xs font-bold text-white/60">{heading}</h3>
              <p className="font-mono text-[10px] text-white/35 leading-relaxed whitespace-pre-line">{body}</p>
            </div>
          ))}
        </div>
      ))}

      <div className="border border-white/[0.06] px-5 py-4 flex flex-col gap-2">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Related</div>
        <div className="flex flex-wrap gap-4">
          <Link href="/cli">
            <span className="font-mono text-[10px] text-white/40 hover:text-primary/70 transition-colors cursor-pointer">API Guide →</span>
          </Link>
          <Link href="/architecture">
            <span className="font-mono text-[10px] text-white/40 hover:text-primary/70 transition-colors cursor-pointer">Architecture →</span>
          </Link>
          <Link href="/how-to">
            <span className="font-mono text-[10px] text-white/40 hover:text-primary/70 transition-colors cursor-pointer">How-To Guides →</span>
          </Link>
          <a href="https://mav.xyz" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10px] text-white/40 hover:text-primary/70 transition-colors">
            Maverick V2 <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
