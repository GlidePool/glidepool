# LLM Advisor for Maverick V2 DLMM Positions on Base — Architecture & Flow

## 1. Overview

This project is an **AI advisory layer** for liquidity positions on **Maverick V2**
(a bin-based "DLMM-style" AMM) deployed on **Base mainnet** (chain ID `8453`).

- The LLM **never holds funds and never signs transactions**.
- The LLM **reads on-chain pool/position state** and produces a **recommendation**
  (text + suggested transaction parameters).
- The **user manually reviews and approves** every on-chain action via their own wallet.
- Access to the advisor's analysis endpoint is metered via **x402** (pay-per-request
  in USDC on Base).

```
┌─────────────┐     read-only RPC calls      ┌──────────────────┐
│  Base Chain  │ ───────────────────────────▶ │  Backend Service  │
│  (Maverick   │                               │  (Node/TS)        │
│   V2 pools)  │                               │  - data fetchers  │
└─────────────┘                               │  - LLM advisor    │
                                               │  - x402 paywall   │
                                               └─────────┬─────────┘
                                                          │ recommendation JSON
                                                          ▼
                                               ┌──────────────────┐
                                               │   Frontend (UI)   │
                                               │  - shows advice   │
                                               │  - user approves  │
                                               │  - wallet signs   │
                                               └─────────┬─────────┘
                                                          │ signed tx
                                                          ▼
                                               ┌──────────────────┐
                                               │   Base Chain      │
                                               │  (executes        │
                                               │   add/remove      │
                                               │   liquidity)       │
                                               └──────────────────┘
```

---

## 2. Verified Contract Addresses (Base Mainnet, chain ID 8453)

Source: official Maverick docs (`docs.mav.xyz/technical-reference/contract-addresses/v2-contract-addresses`)
and official examples repo (`github.com/maverickprotocol/maverick-v2-examples`).
Both sources agree on these values.

| Contract | Address | Purpose |
|---|---|---|
| `MaverickV2Factory` | `0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e` | Lists/creates pools |
| `MaverickV2PoolLens` | `0x6A9EB38DE5D349Fe751E0aDb4c0D9D391f94cc8D` | Read-only helpers: price, add-liquidity param calculation |
| `MaverickV2Router` | `0x5eDEd0d7E76C563FF081Ca01D9d12D6B404Df527` | Swap / multicall entrypoint |
| `MaverickV2Position` | `0x116193c58B40D50687c0433B2aa0cC4AE00bC32c` | ERC-721 representing LP positions |
| `MaverickV2Quoter` | `0xb40AfdB85a07f37aE217E7D6462e609900dD8D7A` | Swap quoting |
| `WETH` (Base) | `0x4200000000000000000000000000000000000006` | Wrapped ETH |

> **Pool addresses are NOT fixed** — each token pair (e.g. WETH/USDC) has its own
> pool contract, discovered via `MaverickV2Factory.lookup(...)` or `.poolCount()`.

---

## 3. Token Compatibility — Which Tokens Can Be Used?

A token pair can be managed by this system **only if a Maverick V2 pool already
exists for that pair on Base**.

- Check via `MaverickV2Factory.lookup(startIndex, count)` → returns pool addresses.
- For each pool, read `tokenA()` / `tokenB()` to identify the pair.
- If no pool exists for the desired pair:
  - The advisor cannot manage an existing position (there is none).
  - Creating a new pool is a separate, heavier flow (`MaverickV2Factory.create(...)`)
    requiring initial liquidity — **out of scope for the advisor MVP**.
- Token must be a standard ERC-20. Rebasing tokens are **not fully supported** by
  the pool's accounting and should be excluded from the advisor's supported list.

**MVP recommendation:** maintain a small allow-list of pools (pair address +
token symbols) that the advisor actively supports, built by scanning the Factory
once and filtering for pairs with meaningful TVL.

---

## 4. Core Data Model

### 4.1 Pool State (read via `MaverickV2Pool` + `MaverickV2PoolLens`)

```ts
interface PoolState {
  poolAddress: string;
  tokenA: string;          // ERC-20 address
  tokenB: string;          // ERC-20 address
  tickSpacing: bigint;
  activeTick: bigint;       // current price tick
  binCounter: bigint;       // number of bins created
  feeAIn: bigint;            // fee for A->B swaps (18-decimal)
  feeBIn: bigint;            // fee for B->A swaps
  sqrtPrice: bigint;         // from PoolLens.getPoolSqrtPrice()
  reserveA: bigint;
  reserveB: bigint;
  lastTwaD8: bigint;         // time-weighted average (8-decimal)
}
```

Contract calls used:
- `pool.tokenA()`, `pool.tokenB()`
- `pool.tickSpacing()`
- `pool.getState()` → `{reserveA, reserveB, lastTwaD8, lastLogPriceD8, lastTimestamp, activeTick, isLocked, binCounter, protocolFeeRatioD3}`
- `pool.fee(true)`, `pool.fee(false)`
- `lens.getPoolSqrtPrice(poolAddress)`

### 4.2 User Position (read via `MaverickV2Position` NFT)

```ts
interface UserPosition {
  nftId: bigint;
  poolAddress: string;
  binIds: bigint[];          // which bins this position has liquidity in
  amountA: bigint;           // current value in tokenA
  amountB: bigint;           // current value in tokenB
}
```

Contract calls used:
- `position.tokenIdsOfOwner(userAddress)` → `bigint[]` of NFT IDs owned
- `position.tokenIdPositionInformation(nftId, 0)` → returns
  `{ poolBinIds: { pool, binIds }, amountA, amountB, ... }`
  (the `0` is the `subaccount` index — `0` is the default subaccount)

### 4.3 Liquidity "Modes" (Kinds)

Maverick V2 bins can be one of 4 movement modes, encoded as a bitmask:

| Bit | Mode | Behavior |
|---|---|---|
| `0b0001` (1) | Static | Liquidity stays fixed at chosen price range |
| `0b0010` (2) | Right | Liquidity follows price upward only |
| `0b0100` (4) | Left | Liquidity follows price downward only |
| `0b1000` (8) | Both | Liquidity follows price in both directions |

A pool supporting all 4 modes has `kinds = 0b1111 = 15`.
The LLM's recommendation will reference these modes by name (e.g. "switch this
position toward Right mode because price is trending up").

---

## 5. LLM Advisor Logic

### 5.1 Input to the LLM

For each request, the backend assembles a JSON payload combining:

```json
{
  "pool": { "...": "PoolState" },
  "position": { "...": "UserPosition, if user provided an NFT ID" },
  "marketContext": {
    "currentPriceFromSqrtPrice": "...",
    "twa": "...",
    "activeTickVsPositionBins": "..."
  },
  "userGoal": "e.g. 'maximize fee income while limiting impermanent loss'"
}
```

### 5.2 LLM Output (strict JSON, no prose)

The backend prompts the LLM to return **only** structured JSON:

```json
{
  "summary": "Plain-language explanation of current position status",
  "riskLevel": "low | medium | high",
  "recommendation": {
    "action": "hold | rebalance | withdraw | add_liquidity | switch_mode",
    "reasoning": "...",
    "suggestedMode": "static | right | left | both | null",
    "suggestedBinRange": { "lowerTick": -100, "upperTick": 100 },
    "suggestedWithdrawPercent": 0
  }
}
```

This JSON is what gets shown to the user and (if they approve) translated into an
actual transaction by the frontend — **the LLM itself never builds raw calldata.**

### 5.3 Why the LLM Doesn't Compute Bin/Tick Math Directly

Bin/tick math in Maverick V2 is intricate (sqrt-price encoding, bin ID packing).
Instead of having the LLM compute this:

1. LLM outputs a **high-level intent** (e.g. "remove 50% of liquidity",
   "shift range to be centered on current price with +/-5 ticks").
2. Backend calls `MaverickV2PoolLens.getAddLiquidityParams(...)` (for adding) or
   constructs `RemoveLiquidityParams` directly from the user's existing
   `binIds` (for withdrawing) — these are **deterministic on-chain view calls**,
   not LLM guesses.
3. Backend returns ready-to-sign transaction parameters to the frontend.

This separation keeps the LLM's role to *judgment* (should we act, and roughly
how) while the *precise on-chain math* comes from verified contract view functions.

---

## 6. Withdraw (Remove Liquidity) — Real Flow

### 6.1 Contract Interface (verified from official ABI)

```solidity
struct RemoveLiquidityParams {
  uint32[] binIds;     // which bins to remove liquidity from
  uint128[] amounts;   // how much LP-share liquidity to remove per bin
}

function removeLiquidity(
  address recipient,
  uint256 subaccount,
  RemoveLiquidityParams calldata params
) external returns (uint256 tokenAOut, uint256 tokenBOut);
```

### 6.2 Step-by-Step Withdraw Flow

1. **Fetch the user's position**: `position.tokenIdsOfOwner(user)` -> pick `nftId`.
2. **Get position detail**: `position.tokenIdPositionInformation(nftId, 0)` ->
   gives `poolAddress`, `binIds[]`, current `amountA`/`amountB`.
3. **LLM advisor** is consulted (via x402-gated endpoint) with this data and
   returns `suggestedWithdrawPercent` (e.g. 50%).
4. **Backend computes amounts**: for each `binId` in the position, the backend
   reads the user's LP balance in that bin (via pool/lens view functions) and
   multiplies by `suggestedWithdrawPercent / 100` to get the `amounts[]` array.
5. **Frontend builds the transaction**:
   ```ts
   pool.removeLiquidity(
     userAddress,      // recipient
     0n,                // subaccount (default)
     { binIds: [...], amounts: [...] }
   )
   ```
6. **User reviews** the recommendation + the exact transaction parameters in the UI.
7. **User signs** via their wallet (e.g. MetaMask, Coinbase Wallet) — this is the
   ONLY point where funds move.
8. **Transaction is broadcast** to Base mainnet. On success, `tokenAOut` and
   `tokenBOut` (actual withdrawn amounts) are returned and the position's NFT
   state updates (bins may be fully or partially emptied).

### 6.3 Important Withdraw Notes

- `subaccount` is almost always `0` unless the user has explicitly created
  sub-accounts for the same address (advanced feature, not needed for MVP).
- Withdrawing does **not burn the NFT** unless the position becomes fully empty
  across all its bins — partial withdraws keep the NFT alive with reduced amounts.
- There is **no "undo"** — this is a real mainnet transaction with real funds and
  gas costs (paid in ETH on Base).

---

## 7. Add Liquidity (Reposition) — Real Flow

### 7.1 Contract Interface

```solidity
struct AddLiquidityParams {
  // populated by MaverickV2PoolLens.getAddLiquidityParams(...)
  // contains packed tick/bin distribution data
}

function addLiquidity(
  address recipient,
  uint256 subaccount,
  AddLiquidityParams calldata params,
  bytes calldata data
) external returns (uint256 tokenAAmount, uint256 tokenBAmount, uint32[] memory binIds);
```

### 7.2 Step-by-Step Add/Reposition Flow

1. After a withdraw (Section 6) or when the user wants to enter a new range:
2. Backend calls `MaverickV2PoolLens.getAddLiquidityParams(AddParamsViewInputs)`
   where the inputs express the user's **intent**:
   ```ts
   {
     pool: poolAddress,
     kind: 1 | 2 | 4 | 8,            // Static / Right / Left / Both
     ticks: [lowerTick, upperTick],  // from LLM's suggestedBinRange
     relativeLiquidityAmounts: [/* ... */],
     addSpec: {
       slippageFactorD18: 0,
       numberOfPriceBreaksPerSide: 0,
       targetAmount: 0,
       targetIsA: true
     }
   }
   ```
3. This view call returns `addParams` (ready-to-use `AddLiquidityParams[]`) and
   `tickDeltas` (expected token amounts required).
4. Frontend shows the user: "This will deposit X tokenA + Y tokenB into bins
   covering ticks [lower, upper] in [Mode] mode."
5. User approves token spending (`ERC20.approve`) if not already approved.
6. User signs `pool.addLiquidity(recipient, subaccount, addParams, data)`.
7. Transaction broadcasts; returned `binIds[]` identify the new bin positions,
   which become part of the user's NFT position.

---

## 8. x402 Payment Gating

### 8.1 What x402 Adds

x402 is an HTTP-native micropayment protocol settled in stablecoins on Base.
It gates access to the LLM advisor endpoint so each analysis call has a cost.

### 8.2 Flow

```
1. Client  -> GET /api/advisor?nftId=123&pool=0x...
2. Server  -> 402 Payment Required
              Headers include payment details (amount in USDC, recipient address, Base chain)
3. Client  -> constructs and sends an x402 payment (USDC transfer on Base)
4. Client  -> retries GET /api/advisor with payment proof
5. Server  -> verifies payment on-chain (or via facilitator)
6. Server  -> runs the full advisor pipeline (Sections 4-5)
7. Server  -> returns recommendation JSON (Section 5.2)
```

### 8.3 Implementation Notes

- The backend needs a **payment receiving address** on Base (can be the same
  service wallet or a separate treasury address).
- Payment verification can be done via:
  - Direct on-chain check (watch for USDC `Transfer` event matching the proof), or
  - An x402 facilitator service that verifies and confirms payment server-side.
- Price per advisor call should be small (e.g. $0.01-$0.10 USDC) — this is a
  micropayment model, not a subscription.

---

## 9. Project Structure (Suggested)

```
project-root/
|-- backend/
|   |-- src/
|   |   |-- chain/
|   |   |   |-- constants.ts          # contract addresses (Base mainnet)
|   |   |   |-- poolReader.ts         # PoolState fetchers
|   |   |   |-- positionReader.ts     # UserPosition fetchers (NFT)
|   |   |   `-- liquidityParams.ts    # wraps PoolLens.getAddLiquidityParams
|   |   |-- llm/
|   |   |   |-- prompt.ts             # system prompt + JSON schema
|   |   |   `-- advisor.ts            # calls LLM API, validates JSON output
|   |   |-- x402/
|   |   |   `-- middleware.ts         # payment gating middleware
|   |   |-- routes/
|   |   |   `-- advisor.ts            # GET /api/advisor (x402-gated)
|   |   `-- server.ts
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- PositionCard.tsx      # shows current position
|   |   |   |-- AdvisorPanel.tsx      # shows LLM recommendation
|   |   |   `-- ApproveTxButton.tsx   # wallet signing UI
|   |   |-- hooks/
|   |   |   |-- useUserPositions.ts   # wagmi hooks for NFT positions
|   |   |   `-- usePoolState.ts
|   |   `-- App.tsx
|   `-- package.json
`-- README.md
```

---

## 10. Build & Test Order (Recommended)

1. **Phase 1 - Read-only data layer** (no funds at risk)
   - Implement `poolReader.ts` and `positionReader.ts`.
   - Test against Base mainnet RPC (e.g. via Alchemy/Infura/public RPC).
   - Verify: can list pools, can read a real position's bins/amounts.

2. **Phase 2 - LLM advisor (no execution)**
   - Implement prompt + JSON schema validation.
   - Feed real Phase 1 data into the LLM, confirm recommendations are sensible
     and always return valid JSON matching the schema.

3. **Phase 3 - x402 gating**
   - Add payment middleware in front of the advisor endpoint.
   - Test the 402 -> pay -> retry -> 200 flow with small USDC amounts.

4. **Phase 4 - Transaction construction (still no signing)**
   - Implement `liquidityParams.ts` to turn LLM intent into
     `RemoveLiquidityParams` / `AddLiquidityParams`.
   - Verify computed params against `PoolLens` view calls (read-only, safe).

5. **Phase 5 - Frontend + wallet signing**
   - Build UI showing position, recommendation, and the exact transaction.
   - Wire up wallet (wagmi/viem) for the user to sign.
   - **Test with very small amounts first** on mainnet before larger positions.

---

## 11. Key Risks & Open Items

- **No testnet equivalent recommended** - Maverick V2 is deployed on Base
  mainnet; Base Sepolia addresses exist but pool liquidity there is likely
  sparse/non-representative. Real testing should use small mainnet amounts.
- **Pool existence check is mandatory** before any advisor call - if
  `MaverickV2Factory` has no pool for a pair, there is nothing to advise on.
- **Rebasing tokens excluded** - pool accounting can desync; filter these out
  of the supported pool allow-list.
- **LLM output must be schema-validated** before being shown to the user or
  used to compute transaction parameters - never trust raw LLM text for
  numeric values that affect fund movement.
- **Gas costs** (paid in ETH on Base) apply to every add/remove liquidity
  transaction - factor this into "is rebalancing worth it" logic, possibly
  as an additional LLM input or a backend-side threshold check.
