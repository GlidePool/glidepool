import { getAddress, formatUnits } from "viem";
import { publicClient } from "./viemClient.js";
import {
  POOL_STATE_ABI,
  POOL_LENS_ABI,
  MAVERICK_V2_POOL_LENS,
  MAVERICK_API_BASE,
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

interface MaverickApiPool {
  id: string;
  tokenA: { address: string; symbol: string; decimals: number };
  tokenB: { address: string; symbol: string; decimals: number };
  tvl: { amount: number };
  price: number;
  lowerTick: number;
  fee: number;
  tickSpacing: number;
}

// Fetch pool data from Maverick API (TVL, price, activeTick).
// API data may be cached; we use it to supplement on-chain reads.
async function fetchMaverickApiPools(): Promise<Map<string, MaverickApiPool>> {
  try {
    const resp = await fetch(`${MAVERICK_API_BASE}/pools/${8453}?pageSize=100`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return new Map();
    const data = (await resp.json()) as { pools: MaverickApiPool[] };
    const map = new Map<string, MaverickApiPool>();
    for (const p of data.pools ?? []) {
      map.set(p.id.toLowerCase(), p);
    }
    return map;
  } catch {
    return new Map();
  }
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

  // Fetch on-chain data with individual resilient calls
  const [tokenARes, tokenBRes, tickSpacingRes, stateRes, feeAInRes, feeBInRes, sqrtPriceRes] =
    await Promise.allSettled([
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

  // Fallback to allowlist for known tokens
  const allowlistEntry = SUPPORTED_POOL_ALLOW_LIST.find(
    (p) => p.poolAddress.toLowerCase() === poolAddress.toLowerCase()
  );

  const tokenAAddr =
    tokenARes.status === "fulfilled"
      ? (tokenARes.value as string)
      : (allowlistEntry?.tokenA ?? poolAddress);
  const tokenBAddr =
    tokenBRes.status === "fulfilled"
      ? (tokenBRes.value as string)
      : (allowlistEntry?.tokenB ?? poolAddress);

  const [tokenASymbol, tokenBSymbol, decimalsA, decimalsB] = await Promise.all([
    getTokenSymbol(tokenAAddr),
    getTokenSymbol(tokenBAddr),
    getTokenDecimals(tokenAAddr),
    getTokenDecimals(tokenBAddr),
  ]);

  // Maverick V2 State struct: reserveA uint128, reserveB uint128, activeTick int32,
  // status uint8, binCounter uint128, protocolFeeRatioD3 uint96, lastTwapD8 uint8
  const stateResult =
    stateRes.status === "fulfilled"
      ? (stateRes.value as {
          reserveA: bigint;
          reserveB: bigint;
          activeTick: number;
          status: number;
          binCounter: bigint;
          protocolFeeRatioD3: bigint;
          lastTwapD8: number;
        })
      : { reserveA: 0n, reserveB: 0n, activeTick: 0, status: 0, binCounter: 0n, protocolFeeRatioD3: 0n, lastTwapD8: 0 };

  const sqrtPrice =
    sqrtPriceRes.status === "fulfilled" ? (sqrtPriceRes.value as bigint) : 0n;

  let currentPrice = sqrtPriceToPrice(sqrtPrice, decimalsA, decimalsB);

  // If lens price failed or is 0, try Maverick API price
  if (currentPrice === 0) {
    try {
      const apiMap = await fetchMaverickApiPools();
      const apiPool = apiMap.get(poolAddress.toLowerCase());
      if (apiPool?.price) {
        currentPrice = apiPool.price;
      }
    } catch {
      // ignore
    }
  }

  const feeAIn =
    feeAInRes.status === "fulfilled" ? (feeAInRes.value as bigint) : BigInt(Math.round((allowlistEntry?.feeRate ?? 0) * 1e18));
  const feeBIn =
    feeBInRes.status === "fulfilled" ? (feeBInRes.value as bigint) : feeAIn;

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
    tickSpacing:
      tickSpacingRes.status === "fulfilled"
        ? String(tickSpacingRes.value)
        : String(allowlistEntry?.tickSpacing ?? 0),
    binCounter: String(stateResult.binCounter),
    lastTwaD8: String(stateResult.lastTwapD8),
    currentPrice,
  };
}

export async function listSupportedPools(): Promise<PoolSummary[]> {
  // Fetch Maverick API data in parallel with pool-level on-chain reads
  const [apiMap] = await Promise.all([fetchMaverickApiPools()]);

  const results = await Promise.allSettled(
    SUPPORTED_POOL_ALLOW_LIST.map(async (p) => {
      const apiPool = apiMap.get(p.poolAddress.toLowerCase());

      // Use API data when available (it has real TVL + price);
      // fall back to on-chain reads if API misses this pool.
      if (apiPool) {
        return {
          poolAddress: p.poolAddress,
          tokenA: p.tokenA,
          tokenB: p.tokenB,
          tokenASymbol: p.tokenASymbol,
          tokenBSymbol: p.tokenBSymbol,
          tvlUsd: apiPool.tvl?.amount ?? 0,
          activeTick: String(apiPool.lowerTick ?? 0),
          currentPrice: apiPool.price ?? 0,
          feeRate: apiPool.fee ?? p.feeRate,
        } satisfies PoolSummary;
      }

      // No API data — fall back to on-chain reads
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
          feeRate: p.feeRate,
        } satisfies PoolSummary;
      }
    })
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<PoolSummary>).value);
}
