---
name: GlidePool Agent System Architecture
description: How the agent-per-wallet system, x402, loop, and DB are wired together.
---

## Agent System (implemented and verified working)

### DB Tables
- `agents` — agent per wallet, stores poolAddress, strategy, budgetUsdc, status, lastAnalysisAt
- `agent_actions` — LLM decisions per agent: actionType, llmReasoning, llmRecommendation, status (pending_signature/completed/signed), txHash
- `x402_payments` — verified USDC payments tied to agents

### Agent Loop
- Runs every 30s on server startup via `startAgentLoop()` in `artifacts/api-server/src/agent/loop.ts`
- Called from `artifacts/api-server/src/app.ts`
- Checks `lastAnalysisAt` vs `analysisIntervalSec`, runs LLM if due
- Stores result as `agent_action` (status=completed for hold, pending_signature for actions)

### API Routes
- `POST /api/agents` — create agent (validates wallet address, optional x402 payment verification)
- `GET /api/agents?userAddress=` — list agents per wallet
- `GET /api/agents/:id` — agent detail + recent actions
- `PUT /api/agents/:id/status` — pause/resume/stop
- `GET /api/agents/:id/actions` — action history
- `POST /api/agents/:id/actions/:actionId/confirm` — confirm tx hash after user signs

### Real x402 Verification
- Reads USDC Transfer event from tx receipt on Base mainnet
- Checks: USDC contract address, Transfer to=TREASURY_ADDRESS, value >= required
- TX must be <30 minutes old
- Enabled only when `X402_ENABLED=true` env var is set

### Frontend Flow
- Setup Agent (`/agent/setup`) → connects to real `POST /api/agents`
- Dashboard (`/dashboard`) → real agents from DB, pause/resume/stop controls
- Monitor (`/monitor`) → real LLM decisions from agent_actions table, auto-refreshes

### getState() ABI Fix
- Old ABI had wrong field order: (activeTick int256, reserveA uint256, reserveB uint256, binCounter uint256)
- Fixed to real Maverick V2 struct: (reserveA uint128, reserveB uint128, activeTick int32, status uint8, binCounter uint128, protocolFeeRatioD3 uint96, lastTwapD8 uint8)

**Why:** getState() was returning all zeros before the fix because ABI tuple order must exactly match the Solidity struct layout.
