import { ExternalLink } from "lucide-react";

const LAYERS = [
  {
    label: "FRONTEND",
    color: "text-primary",
    border: "border-primary/20",
    bg: "from-primary/[0.04]",
    title: "React / Vite",
    tech: ["React 18", "Vite", "Tailwind CSS v4", "wagmi v2", "RainbowKit", "TanStack Query", "wouter"],
    desc: "Single-page application served as a static bundle. Communicates with the API server via generated React Query hooks (Orval codegen from the OpenAPI spec). All wallet interactions go through wagmi v2 — no private keys ever leave the browser.",
    nodes: [
      { name: "Pool Explorer", desc: "Reads /api/pools — live TVL, price, tick" },
      { name: "Positions", desc: "Reads /api/positions — NFT LP positions" },
      { name: "AI Advisor", desc: "Calls /api/advisor — x402-gated LLM analysis" },
      { name: "Deploy Agent", desc: "POST /api/agents — server-side loop config" },
      { name: "Monitor", desc: "Polls /api/agents/:id/actions — LLM decision log" },
      { name: "Create Pool", desc: "Calls Maverick V2 Factory directly via wagmi" },
    ],
  },
  {
    label: "API SERVER",
    color: "text-amber-400",
    border: "border-amber-500/20",
    bg: "from-amber-500/[0.03]",
    title: "Express 5 / Node.js 24",
    tech: ["Express 5", "Node.js 24", "TypeScript 5.9", "pino logging", "Zod", "esbuild (CJS)"],
    desc: "Stateless REST API built contract-first from the OpenAPI spec in lib/api-spec. Routes are thin — business logic lives in chain/ (viem reads) and llm/ (Claude calls). The agent loop runs as a background setInterval on the same process.",
    nodes: [
      { name: "GET /api/pools", desc: "Reads Maverick V2 PoolLens + factory on-chain" },
      { name: "GET /api/positions", desc: "Reads NFT position data via viem" },
      { name: "POST /api/agents", desc: "Persists agent config to PostgreSQL" },
      { name: "GET /api/advisor", desc: "Builds prompt → Claude Opus 4 → structured JSON" },
      { name: "Agent loop", desc: "setInterval ~30s — runs analysis for active agents" },
      { name: "x402 middleware", desc: "HTTP 402 → verify USDC transfer on Base RPC" },
    ],
  },
  {
    label: "AI LAYER",
    color: "text-[#d4a574]",
    border: "border-[#d4a574]/20",
    bg: "from-[#d4a574]/[0.03]",
    title: "Claude Opus 4 (Anthropic)",
    tech: ["Claude Opus 4", "Structured output (JSON mode)", "Replit AI Integration proxy", "OpenAI-compatible SDK"],
    desc: "Each analysis cycle constructs a prompt from the live pool snapshot (activeTick, TVL, currentPrice, feeRate, bin count, reserve tokens) and the user's stated goal. Claude returns structured JSON: action, riskLevel, suggestedBinRange, withdrawPercent, summary, and reasoning. The response is persisted to the database.",
    nodes: [
      { name: "Prompt builder", desc: "lib/llm/prompt.ts — pool state + user goal" },
      { name: "OpenAI client", desc: "lib/integrations-openai-ai-server — Replit proxy" },
      { name: "Structured output", desc: "JSON schema enforced — no free-text parsing" },
      { name: "DB persistence", desc: "agent_actions table — full reasoning stored" },
    ],
  },
  {
    label: "DATA LAYER",
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "from-blue-500/[0.03]",
    title: "PostgreSQL + Drizzle ORM",
    tech: ["PostgreSQL", "Drizzle ORM", "drizzle-zod", "drizzle-kit (migrations)"],
    desc: "Stores agent configuration, LLM decision history (agent_actions), and conversation context. Schema is managed via Drizzle migrations — push changes with pnpm --filter @workspace/db run push. No personally identifiable information is stored.",
    nodes: [
      { name: "agents table", desc: "userAddress, poolAddress, strategy, status, budget" },
      { name: "agent_actions table", desc: "agentId, actionType, llmReasoning, recommendation" },
      { name: "custom_pools table", desc: "User-registered pool addresses + metadata" },
    ],
  },
  {
    label: "CHAIN LAYER",
    color: "text-blue-300",
    border: "border-blue-400/20",
    bg: "from-blue-400/[0.03]",
    title: "Base Mainnet (viem)",
    tech: ["viem", "Base Mainnet (chain ID 8453)", "Maverick V2 Factory", "Maverick V2 PoolLens", "Maverick V2 Router", "ERC20", "ERC721 (NFT positions)"],
    desc: "All on-chain reads go through viem using the public Base RPC (mainnet.base.org). The API server is read-only — it never signs transactions. Writes (rebalance, add/remove liquidity, pool creation) are signed in the user's browser via wagmi and submitted directly to Base Mainnet.",
    nodes: [
      { name: "Factory: 0x0A7e…C1e", desc: "Pool enumeration + creation" },
      { name: "PoolLens: 0x6A9E…c8D", desc: "Batch pool state reads" },
      { name: "Router: 0x5eDe…527", desc: "Add/remove liquidity (user-signed)" },
      { name: "Position NFT: 0x1161…32c", desc: "ERC721 LP position tokens" },
    ],
  },
];

const CONTRACT_LINKS = [
  { label: "Maverick V2 Factory", address: "0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e" },
  { label: "Maverick V2 PoolLens", address: "0x6A9EB38DE5D349Fe751E0aDb4c0D9D391f94cc8D" },
  { label: "Maverick V2 Router",   address: "0x5eDEd0d7E76C563FF081Ca01D9d12D6B404Df527" },
  { label: "Position NFT",         address: "0x116193c58B40D50687c0433B2aa0cC4AE00bC32c" },
];

export default function Architecture() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto animate-in fade-in duration-400">

      <div className="border-b border-white/[0.06] pb-5">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Technical</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Architecture</h1>
        <p className="font-mono text-[10px] text-white/35 mt-0.5">
          How GlidePool is built — layers, contracts, and data flow.
        </p>
      </div>

      {/* Data flow banner */}
      <div className="border border-white/[0.08] bg-black/40 px-5 py-4">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-3">Data flow</div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
          {["Browser (wagmi)", "→", "API Server (Express)", "→", "Claude Opus 4", "→", "PostgreSQL"].map((s, i) => (
            <span key={i} className={s === "→" ? "text-white/20" : "text-white/50 border border-white/[0.08] px-2 py-0.5"}>{s}</span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] mt-2">
          {["Base Mainnet (viem)", "→", "API Server (read-only)", "→", "Frontend (React Query)"].map((s, i) => (
            <span key={i} className={s === "→" ? "text-white/20" : "text-blue-400/50 border border-blue-500/[0.15] px-2 py-0.5"}>{s}</span>
          ))}
        </div>
        <p className="font-mono text-[10px] text-white/20 mt-3 leading-relaxed">
          The API server is the only component that reads from Base Mainnet and calls Claude. The browser signs all writes. There is no custody layer — private keys never leave the user's wallet.
        </p>
      </div>

      {/* Layer cards */}
      {LAYERS.map((layer) => (
        <div key={layer.label} className={`border ${layer.border} bg-gradient-to-b ${layer.bg} to-transparent flex flex-col gap-4 p-5`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`font-mono text-[9px] uppercase tracking-widest mb-1 ${layer.color}`}>{layer.label}</div>
              <h2 className="font-bold text-base">{layer.title}</h2>
              <p className="font-mono text-[10px] text-white/35 leading-relaxed mt-1 max-w-lg">{layer.desc}</p>
            </div>
          </div>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-1.5">
            {layer.tech.map((t) => (
              <span key={t} className={`font-mono text-[9px] border px-1.5 py-0.5 ${layer.border} ${layer.color} opacity-60`}>{t}</span>
            ))}
          </div>

          {/* Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/[0.05] pt-4">
            {layer.nodes.map((node) => (
              <div key={node.name} className="flex flex-col gap-0.5">
                <div className={`font-mono text-[10px] font-bold ${layer.color} opacity-70`}>{node.name}</div>
                <div className="font-mono text-[9px] text-white/25">{node.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Contract addresses */}
      <div className="border border-white/[0.08] p-5 flex flex-col gap-3">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest mb-1">Deployed Contracts — Base Mainnet</div>
        {CONTRACT_LINKS.map(({ label, address }) => (
          <div key={address} className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-mono text-[10px] text-white/40">{label}</span>
            <a
              href={`https://basescan.org/address/${address}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-white/30 hover:text-primary/70 transition-colors"
            >
              {address.slice(0, 12)}…{address.slice(-8)}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Design decisions */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Key Design Decisions</div>
        {[
          { title: "Contract-first API", body: "The OpenAPI spec in lib/api-spec/ is the single source of truth. Frontend React Query hooks and backend Zod validators are both generated from it via Orval. Any contract change requires a codegen run before the frontend will compile." },
          { title: "Read-only server", body: "The API server never holds a private key. It reads chain state via viem and produces transaction calldata. Users sign all writes through RainbowKit / wagmi in their own browser." },
          { title: "Agent loop on server", body: "The agent loop runs as a setInterval on the API server process — not a separate worker. This keeps the deployment simple (single Node.js process). For scale, the loop can be moved to a queue worker without changing the API contract." },
          { title: "Structured LLM output", body: "Claude is instructed to return JSON conforming to a fixed schema. The server validates the schema before persisting. This eliminates brittle text parsing and makes the AI output auditable." },
          { title: "x402 optional", body: "x402 is disabled by default so the product is usable without USDC. Operators can enable it server-side with X402_ENABLED=true to monetize AI calls at 0.05 USDC each." },
        ].map(({ title, body }) => (
          <div key={title} className="border border-white/[0.06] px-5 py-4 flex flex-col gap-1">
            <div className="font-mono text-xs font-bold text-white/60">{title}</div>
            <p className="font-mono text-[10px] text-white/30 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
