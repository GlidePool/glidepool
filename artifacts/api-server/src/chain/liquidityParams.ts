import { getAddress } from "viem";
import { publicClient } from "./viemClient.js";
import {
  POOL_LENS_ABI,
  POOL_BALANCE_ABI,
  MAVERICK_V2_POOL_LENS,
  MAVERICK_V2_POSITION,
  TOKEN_DECIMALS,
} from "./constants.js";
import { readPoolState } from "./poolReader.js";

export interface RemoveLiquidityResult {
  poolAddress: string;
  recipient: string;
  subaccount: number;
  binIds: string[];
  amounts: string[];
  estimatedTokenA: string;
  estimatedTokenB: string;
}

export interface AddLiquidityResult {
  poolAddress: string;
  kind: number;
  lowerTick: number;
  upperTick: number;
  estimatedTokenA: string;
  estimatedTokenB: string;
  params: object;
}

export async function computeRemoveParams(
  nftId: string,
  userAddress: string,
  poolAddress: string,
  withdrawPercent: number,
  binIds: string[],
  amountA: string,
  amountB: string
): Promise<RemoveLiquidityResult> {
  const poolAddr = getAddress(poolAddress);
  const positionAddr = getAddress(MAVERICK_V2_POSITION);
  const fraction = BigInt(withdrawPercent);

  // Fetch real LP balances for each bin.
  // NFT positions: the position contract holds LP on behalf of tokenId (= subaccount).
  const lpBalances = await Promise.allSettled(
    binIds.map((binId) =>
      publicClient.readContract({
        address: poolAddr,
        abi: POOL_BALANCE_ABI,
        functionName: "balanceOf",
        args: [positionAddr, BigInt(nftId), Number(binId)],
      })
    )
  );

  const amounts = lpBalances.map((result) => {
    if (result.status === "fulfilled" && result.value) {
      const lpBalance = result.value as bigint;
      return String((lpBalance * fraction) / 100n);
    }
    // Fallback if balanceOf call fails: proportional token proxy
    const perBin = BigInt(amountA) / BigInt(binIds.length || 1);
    return String((perBin * fraction) / 100n);
  });

  const estA = (BigInt(amountA) * fraction) / 100n;
  const estB = (BigInt(amountB) * fraction) / 100n;

  return {
    poolAddress,
    recipient: userAddress,
    subaccount: Number(nftId),
    binIds,
    amounts,
    estimatedTokenA: String(estA),
    estimatedTokenB: String(estB),
  };
}

export async function computeAddParams(
  poolAddress: string,
  kind: number,
  lowerTick: number,
  upperTick: number,
  userAddress: string
): Promise<AddLiquidityResult> {
  const poolAddr = getAddress(poolAddress);
  const lensAddr = getAddress(MAVERICK_V2_POOL_LENS);

  const numBins = upperTick - lowerTick + 1;
  const relativeLiquidityAmounts = Array.from(
    { length: numBins },
    () => BigInt("1000000000000000000")
  );
  const ticks = Array.from({ length: numBins }, (_, i) => lowerTick + i);

  let addParamsEncoded: `0x${string}` = "0x";
  let tickDeltas: bigint[] = [];

  try {
    const result = await publicClient.readContract({
      address: lensAddr,
      abi: POOL_LENS_ABI,
      functionName: "getAddLiquidityParams",
      args: [
        {
          pool: poolAddr,
          kind,
          ticks,
          relativeLiquidityAmounts,
          addSpec: {
            slippageFactorD18: 0n,
            numberOfPriceBreaksPerSide: 0n,
            targetAmount: 0n,
            targetIsA: true,
          },
        },
      ],
    }) as [`0x${string}`, bigint[]];

    addParamsEncoded = result[0];
    tickDeltas = result[1];
  } catch {
    tickDeltas = [0n, 0n];
  }

  const poolState = await readPoolState(poolAddress);
  const decimalsA = TOKEN_DECIMALS[poolState.tokenA.toLowerCase()] ?? 18;
  const decimalsB = TOKEN_DECIMALS[poolState.tokenB.toLowerCase()] ?? 18;
  void decimalsA; void decimalsB;

  const estA = tickDeltas[0] ?? 0n;
  const estB = tickDeltas[1] ?? 0n;

  return {
    poolAddress,
    kind,
    lowerTick,
    upperTick,
    estimatedTokenA: String(estA),
    estimatedTokenB: String(estB),
    params: {
      encoded: addParamsEncoded,
      ticks,
      kind,
      pool: poolAddress,
      recipient: userAddress,
      subaccount: 0,
    },
  };
}
