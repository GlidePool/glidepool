---
name: Maverick pool ABI and Base addresses
description: Real Maverick pool addresses on Base mainnet, ABI quirks discovered via eth_call, and data source strategy.
---

## Key findings

**Pool ABI quirk** — `getState()` returns 4 words (128 bytes), not 9 as in the canonical Maverick V2 spec:
- Word 0: `activeTick` (int256, sign-extended from int32)
- Word 1: `reserveA` (uint256)
- Word 2: `reserveB` (uint256)
- Word 3: `binCounter` (uint256)

**Why:** The pools from `api.mav.xyz/api/v4/pools/8453` are Maverick V1 pools on Base, not V2. The on-chain struct is packed differently. `tokenA()`, `tokenB()`, `tickSpacing()`, `fee(bool)` all work with standard V2 ABI.

**Data source strategy:**
- Pool list TVL/price/activeTick → Maverick API (`api.mav.xyz/api/v4/pools/8453`)
- Pool detail live data → on-chain via viem (7 parallel calls, rate-limited by public Base RPC)
- `tickSpacing` from allowlist as fallback when on-chain call fails due to rate limiting

**Public RPC rate limits** — `https://mainnet.base.org` rate-limits parallel calls. Making 7+ simultaneous calls to this RPC causes intermittent failures. Use `Promise.allSettled` and always have allowlist fallbacks.

**Real pool addresses (Base mainnet, from Maverick API v4, March 2025 data):**
- WETH/USDC: `0x3d70b2f31f75dc84acdd5e1588695221959b2d37` (tickSpacing=487, fee=0.15%)
- WETH/USDbC: `0x06e6736ca9e922766279a22b75a600fe8b8473b6` (tickSpacing=198, fee=0.02%)
- DAI/USDC: `0x1b55d94b553475e7561fab889bf88fe4f491d29c` (tickSpacing=1, fee=0.002%)
- cbETH/WETH: `0x2cebcf66f023aa88003593804504a8df882d12e6` (tickSpacing=10, fee=0.01%)
- WETH/wstETH: `0xaaf7c86c2f631bac45c671645e583c7f93c8b6cf` (tickSpacing=10, fee=0.1%)
- WETH/MAV: `0xe6917fbf0f44053fd42b55657555afa89806cc24` (tickSpacing=2232, fee=1%)

**Maverick API data is stale** — cached March 24 2025 (~14 months ago as of June 2026). TVL from API is frozen; on-chain reserves may be near 0 for drained pools. Pool addresses and pair info are still accurate.

**How to apply:** When updating pool addresses or ABI in `artifacts/api-server/src/chain/constants.ts` and `poolReader.ts`, use the 4-field getState ABI and always include allowlist fallbacks for tickSpacing and fee rate.
