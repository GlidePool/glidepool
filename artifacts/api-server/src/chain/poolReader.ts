import { getAddress, formatUnits } from "viem";
import { publicClient } from "./viemClient.js";
import {
  POOL_STATE_ABI,
  POOL_LENS_ABI,
  MAVERICK_V2_POOL_LENS,
  SUPPORTED_POOL_ALLOW_LIST,
  TOKEN_SYMBOLS,
  TOKEN_DECIMALS,
  ERC20_ABI,
  ETH_PRICE_USD_FALLBACK,
  USDC_PRICE_USD,
  WETH,
  USDC,
} from "./constants.js";

export interface PoolState {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  activeTick: string;
  sqrtPrice: string;
  reserveA: string;
  reserveB: string;
  feeAIn: string;
  feeBIn: string;
  tickSpacing: string;
  binCounter: string;
  lastTwaD8: string;
  currentPrice: number;
}

export interface PoolSummary {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  tvlUsd: number;
  activeTick: string;
  currentPrice: number;
  feeRate: number;
}

async function getTokenSymbol(address: string): Promise<string> {
  const lower = address.toLowerCase();
  if (TOKEN_SYMBOLS[lower]) return TOKEN_SYMBOLS[lower];
  try {
    const symbol = await publicClient.readContract({
      address: getAddress(address),
      abi: ERC20_ABI,
      functionName: "symbol",
    });
    return symbol as string;
  } catch {
    return address.slice(0, 6) + "..." + address.slice(-4);
  }
}

async function getTokenDecimals(address: string): Promise<number> {
  const lower = address.toLowerCase();
  if (TOKEN_DECIMALS[lower] !== undefined) return TOKEN_DECIMALS[lower];
  try {
    const decimals = await publicClient.readContract({
      address: getAddress(address),
      abi: ERC20_ABI,
      functionName: "decimals",
    });
    return Number(decimals);
  } catch {
    return 18;
  }
}

function sqrtPriceToPrice(sqrtPrice: bigint, decimalsA: number, decimalsB: number): number {
  if (sqrtPrice === 0n) return 0;
  const sq = Number(sqrtPrice) / 2 ** 96;
  const rawPrice = sq * sq;
  return rawPrice * 10 ** (decimalsA - decimalsB);
}

function estimateTvlUsd(
  reserveA: bigint,
  reserveB: bigint,
  decimalsA: number,
  decimalsB: number,
  tokenAAddr: string,
  tokenBAddr: string,
  currentPrice: number
): number {
  const isAWeth = tokenAAddr.toLowerCase() === WETH.toLowerCase();
  const isBUsdc = tokenBAddr.toLowerCase() === USDC.toLowerCase();
  const amtA = Number(formatUnits(reserveA, decimalsA));
  const amtB = Number(formatUnits(reserveB, decimalsB));

  if (isAWeth && isBUsdc) {
    return amtA * ETH_PRICE_USD_FALLBACK + amtB * USDC_PRICE_USD;
  }
  if (isAWeth) {
    return amtA * ETH_PRICE_USD_FALLBACK * 2;
  }
  if (isBUsdc) {
    return amtB * USDC_PRICE_USD * 2;
  }
  return (amtA + amtB * currentPrice) * ETH_PRICE_USD_FALLBACK;
}

export async function readPoolState(poolAddress: string): Promise<PoolState> {
  const addr = getAddress(poolAddress);

  const [tokenA, tokenB, tickSpacing, state, feeAIn, feeBIn, sqrtPrice] =
    await Promise.all([
      publicClient.readContract({ address: addr, abi: POOL_STATE_ABI, functionName: "tokenA" }),
      publicClient.readContract({ address: addr, abi: POOL_STATE_ABI, functionName: "tokenB" }),
      publicClient.readContract({ address: addr, abi: POOL_STATE_ABI, functionName: "tickSpacing" }),
      publicClient.readContract({ address: addr, abi: POOL_STATE_ABI, functionName: "getState" }),
      publicClient.readContract({ address: addr, abi: POOL_STATE_ABI, functionName: "fee", args: [true] }),
      publicClient.readContract({ address: addr, abi: POOL_STATE_ABI, functionName: "fee", args: [false] }),
      publicClient.readContract({
        address: getAddress(MAVERICK_V2_POOL_LENS),
        abi: POOL_LENS_ABI,
        functionName: "getPoolSqrtPrice",
        args: [addr],
      }),
    ]);

  const tokenAAddr = tokenA as string;
  const tokenBAddr = tokenB as string;
  const [tokenASymbol, tokenBSymbol, decimalsA, decimalsB] = await Promise.all([
    getTokenSymbol(tokenAAddr),
    getTokenSymbol(tokenBAddr),
    getTokenDecimals(tokenAAddr),
    getTokenDecimals(tokenBAddr),
  ]);

  const stateResult = state as {
    reserveA: bigint;
    reserveB: bigint;
    lastTwaD8: bigint;
    activeTick: number;
    binCounter: number;
  };

  const currentPrice = sqrtPriceToPrice(sqrtPrice as bigint, decimalsA, decimalsB);

  return {
    poolAddress,
    tokenA: tokenAAddr,
    tokenB: tokenBAddr,
    tokenASymbol,
    tokenBSymbol,
    activeTick: String(stateResult.activeTick),
    sqrtPrice: String(sqrtPrice),
    reserveA: String(stateResult.reserveA),
    reserveB: String(stateResult.reserveB),
    feeAIn: String(feeAIn),
    feeBIn: String(feeBIn),
    tickSpacing: String(tickSpacing),
    binCounter: String(stateResult.binCounter),
    lastTwaD8: String(stateResult.lastTwaD8),
    currentPrice,
  };
}

export async function listSupportedPools(): Promise<PoolSummary[]> {
  const results = await Promise.allSettled(
    SUPPORTED_POOL_ALLOW_LIST.map(async (p) => {
      try {
        const state = await readPoolState(p.poolAddress);
        const decimalsA = TOKEN_DECIMALS[p.tokenA.toLowerCase()] ?? 18;
        const decimalsB = TOKEN_DECIMALS[p.tokenB.toLowerCase()] ?? 18;
        const tvlUsd = estimateTvlUsd(
          BigInt(state.reserveA),
          BigInt(state.reserveB),
          decimalsA,
          decimalsB,
          p.tokenA,
          p.tokenB,
          state.currentPrice
        );
        const feeRate = Number(state.feeAIn) / 1e18;
        return {
          poolAddress: p.poolAddress,
          tokenA: p.tokenA,
          tokenB: p.tokenB,
          tokenASymbol: p.tokenASymbol,
          tokenBSymbol: p.tokenBSymbol,
          tvlUsd,
          activeTick: state.activeTick,
          currentPrice: state.currentPrice,
          feeRate,
        } satisfies PoolSummary;
      } catch {
        return {
          poolAddress: p.poolAddress,
          tokenA: p.tokenA,
          tokenB: p.tokenB,
          tokenASymbol: p.tokenASymbol,
          tokenBSymbol: p.tokenBSymbol,
          tvlUsd: 0,
          activeTick: "0",
          currentPrice: 0,
          feeRate: 0,
        } satisfies PoolSummary;
      }
    })
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<PoolSummary>).value);
}
