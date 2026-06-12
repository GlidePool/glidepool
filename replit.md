# GlidePool

AI advisor layer for Maverick V2 DLMM liquidity positions on Base mainnet — reads on-chain pool/position state, runs LLM analysis, gates access via x402 micropayments (USDC on Base), and lets users review/approve transactions via their own wallet.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/glidepool run dev` — run the frontend (port 19243)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `X402_ENABLED=true` — enable micropayment gating on the advisor endpoint
- Optional env: `TREASURY_ADDRESS` — USDC recipient for x402 payments

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite, Tailwind CSS v4, wagmi v2, RainbowKit, wouter, TanStack Query
- API: Express 5, pino logging
- DB: PostgreSQL + Drizzle ORM (conversations + messages for LLM history)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Chain: viem, Base mainnet RPC (`https://mainnet.base.org`)
- AI: OpenAI via Replit AI integration (`AI_INTEGRATIONS_OPENAI_*` env vars)
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/glidepool/` — React/Vite frontend
  - `src/pages/` — Landing, Pools, PoolDetail, Positions, PositionDetail, Advisor
  - `src/components/layout.tsx` — nav + shell
  - `src/lib/format.ts` — formatUsd, formatCrypto, formatPercent, truncateAddress
  - `src/index.css` — dark terminal theme (deep navy + cyan primary)
- `artifacts/api-server/` — Express 5 API
  - `src/chain/` — viem client, pool reader, position reader, liquidity params
  - `src/llm/` — prompt builder, OpenAI advisor
  - `src/middleware/x402.ts` — optional payment gating middleware
  - `src/routes/` — pools, positions, advisor, liquidity
- `lib/api-spec/` — OpenAPI spec (source of truth for all contracts)
- `lib/api-client-react/` — generated React Query hooks (run codegen to regenerate)
- `lib/api-zod/` — generated Zod schemas
- `lib/db/` — Drizzle schema + client
- `lib/integrations-openai-ai-server/` — Replit AI integration wrapper

## Architecture decisions

- **Contract-first API** — OpenAPI spec in `lib/api-spec/openapi.yaml` is the source of truth; frontend hooks and backend Zod schemas are both generated from it.
- **Read-only on-chain access** — The API server only reads from Base mainnet via viem; it never signs transactions. Users sign all writes through RainbowKit in their browser.
- **x402 payment gating** — The `/api/advisor` endpoint optionally requires a USDC micropayment on Base before returning LLM analysis. Toggle with `X402_ENABLED=true`.
- **Provider ordering** — `QueryClientProvider` must wrap `WagmiProvider` and `RainbowKitProvider` because wagmi uses TanStack Query internally.
- **Pool allowlist** — Supported pools are hardcoded in `artifacts/api-server/src/chain/constants.ts`. Update `SUPPORTED_POOL_ALLOW_LIST` with real Maverick V2 pool addresses from Base mainnet to populate TVL/price data.

## Product

- **Pool Explorer** — browse and search supported Maverick V2 pools; see TVL, current price, active tick, fee rate
- **Positions** — connect wallet to view your NFT-based Maverick V2 LP positions with value and token breakdowns
- **Position Detail** — drill into a single position: bin IDs, pool state, and one-click AI advice with remove-liquidity transaction preview
- **AI Advisor** — select any pool + optional existing position, describe your goal, and get a GPT-powered recommendation (action, risk level, suggested bin range, withdraw %)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Pool TVL/price shows $0** — The allowlisted pool addresses in `constants.ts` must match real, deployed Maverick V2 pool addresses on Base mainnet. Update them to see live data.
- **WalletConnect 403 in dev** — `projectId: 'GLIDEPOOL_DEMO_ID'` is a placeholder. RainbowKit falls back gracefully; no user-visible impact in dev. Replace with a real WalletConnect Cloud project ID for production.
- **`pnpm --filter @workspace/api-spec run codegen`** must be run after any OpenAPI spec changes before the frontend will pick up new hooks.
- **Always `QueryClientProvider` outermost** — wagmi and RainbowKit both depend on TanStack Query; wrapping them inside `QueryClientProvider` causes a "No QueryClient set" crash.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
