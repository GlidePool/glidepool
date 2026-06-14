---
name: Maverick V2 DLMM contracts
description: Contract addresses and ABI shapes for Maverick V2 on Base mainnet — router, factory, position NFT.
---

## Addresses (Base Mainnet)
- Router:       `0x5eDEd0d7E76C563FF081Ca01D9d12D6B404Df527`
- Factory:      `0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e`
- Position NFT: `0x116193c58B40D50687c0433B2aa0cC4AE00bC32c`

## Remove Liquidity (router)
```
removeLiquidity(pool, recipient, subaccount, [{binId:uint32, amount:uint128}...], minA, minB, deadline)
```
- `subaccount` = NFT token ID for NFT-based positions
- `amount` = LP shares to burn (from pool.balanceOf(POSITION, nftId, binId)), NOT token amounts
- Returns (tokenAAmount, tokenBAmount)

## Pool LP balance
```
pool.balanceOf(address user, uint256 subaccount, uint32 binId) → uint128 lpShares
```
For NFT positions: user = POSITION contract address, subaccount = nftId.

## Factory Create
```
create(feeAIn, feeBIn, tickSpacing, lookback, tokenA, tokenB, kinds, accessor) → pool
```
- tokenA must be < tokenB (sorted by address, enforced by factory)
- fee in 1e18 scale: 0.01% = 1e14, 0.1% = 1e15, 1% = 1e16
- kinds bitmask: 1=Static, 2=Right, 4=Left, 8=Both, 15=All
- accessor = address(0) for permissionless pool
- PoolCreated event emitted: pool address is first word of log data (padded 32 bytes)

**Why:** These are confirmed Maverick V2 mainnet contract addresses. The key non-obvious thing is that LP amounts (not token amounts) must be passed to removeLiquidity, and subaccount=nftId for NFT positions.

**How to apply:** Any remove/add liquidity TX must use these ABIs. Pool creation must sort tokens before calling factory.
