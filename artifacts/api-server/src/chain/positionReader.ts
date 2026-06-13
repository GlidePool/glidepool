import { getAddress, formatUnits } from "viem";
import { publicClient } from "./viemClient.js";
import { POSITION_ABI, MAVERICK_V2_POSITION, TOKEN_DECIMALS, ETH_PRICE_USD_FALLBACK, USDC_PRICE_USD, WETH, USDC } from "./constants.js";
import { readPoolState, PoolState } from "./poolReader.js";

export interface UserPosition {
  nftId: string;
  poolAddress: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  amountA: string;
  amountB: string;
  binCount: number;
  valueUsd: number;
}

export interface PositionDetail {
  nftId: string;
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  binIds: string[];
  amountA: string;
  amountB: string;
  valueUsd: number;
  poolState: PoolState;
}

function estimatePositionUsd(
  amountA: bigint,
  amountB: bigint,
  tokenA: string,
  tokenB: string,
  decimalsA: number,
  decimalsB: number
): number {
  const isAWeth = tokenA.toLowerCase() === WETH.toLowerCase();
  const isBUsdc = tokenB.toLowerCase() === USDC.toLowerCase();
  const valA = Number(formatUnits(amountA, decimalsA));
  const valB = Number(formatUnits(amountB, decimalsB));

  if (isAWeth && isBUsdc) {
    return valA * ETH_PRICE_USD_FALLBACK + valB * USDC_PRICE_USD;
  }
  if (isAWeth) return valA * ETH_PRICE_USD_FALLBACK * 2;
  if (isBUsdc) return valB * USDC_PRICE_USD * 2;
  return (valA + valB) * ETH_PRICE_USD_FALLBACK;
}

export async function getUserPositions(userAddress: string): Promise<UserPosition[]> {
  const addr = getAddress(userAddress);
  const positionAddr = getAddress(MAVERICK_V2_POSITION);

  let tokenIds: bigint[] = [];
  try {
    tokenIds = await publicClient.readContract({
      address: positionAddr,
      abi: POSITION_ABI,
      functionName: "tokenIdsOfOwner",
      args: [addr],
    }) as bigint[];
  } catch {
    return [];
  }

  if (!tokenIds || tokenIds.length === 0) return [];

  const details = await Promise.allSettled(
    tokenIds.map(async (tokenId) => {
      try {
        const info = await publicClient.readContract({
          address: positionAddr,
          abi: POSITION_ABI,
          functionName: "tokenIdPositionInformation",
          args: [tokenId, 0n],
        }) as {
          poolBinIds: { pool: string; binIds: number[] };
          amountA: bigint;
          amountB: bigint;
        };

        const poolAddr = info.poolBinIds.pool;
        const poolState = await readPoolState(poolAddr);
        const decimalsA = TOKEN_DECIMALS[poolState.tokenA.toLowerCase()] ?? 18;
        const decimalsB = TOKEN_DECIMALS[poolState.tokenB.toLowerCase()] ?? 18;

        const valueUsd = estimatePositionUsd(
          info.amountA,
          info.amountB,
          poolState.tokenA,
          poolState.tokenB,
          decimalsA,
          decimalsB
        );

        return {
          nftId: String(tokenId),
          poolAddress: poolAddr,
          tokenASymbol: poolState.tokenASymbol,
          tokenBSymbol: poolState.tokenBSymbol,
          amountA: String(info.amountA),
          amountB: String(info.amountB),
          binCount: info.poolBinIds.binIds.length,
          valueUsd,
        } satisfies UserPosition;
      } catch {
        return null;
      }
    })
  );

  return details
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => (r as PromiseFulfilledResult<UserPosition>).value);
}

export async function getPositionDetail(
  userAddress: string,
  nftId: string
): Promise<PositionDetail | null> {
  const positionAddr = getAddress(MAVERICK_V2_POSITION);

  let info: {
    poolBinIds: { pool: string; binIds: number[] };
    amountA: bigint;
    amountB: bigint;
  };

  try {
    info = await publicClient.readContract({
      address: positionAddr,
      abi: POSITION_ABI,
      functionName: "tokenIdPositionInformation",
      args: [BigInt(nftId), 0n],
    }) as typeof info;
  } catch {
    return null;
  }

  const poolAddr = info.poolBinIds.pool;
  const poolState = await readPoolState(poolAddr);
  const decimalsA = TOKEN_DECIMALS[poolState.tokenA.toLowerCase()] ?? 18;
  const decimalsB = TOKEN_DECIMALS[poolState.tokenB.toLowerCase()] ?? 18;

  const valueUsd = estimatePositionUsd(
    info.amountA,
    info.amountB,
    poolState.tokenA,
    poolState.tokenB,
    decimalsA,
    decimalsB
  );

  return {
    nftId,
    poolAddress: poolAddr,
    tokenA: poolState.tokenA,
    tokenB: poolState.tokenB,
    tokenASymbol: poolState.tokenASymbol,
    tokenBSymbol: poolState.tokenBSymbol,
    binIds: info.poolBinIds.binIds.map(String),
    amountA: String(info.amountA),
    amountB: String(info.amountB),
    valueUsd,
    poolState,
  };
}
