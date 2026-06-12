export const BASE_CHAIN_ID = 8453;

export const BASE_RPC = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";

export const MAVERICK_V2_FACTORY = "0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e" as const;
export const MAVERICK_V2_POOL_LENS = "0x6A9EB38DE5D349Fe751E0aDb4c0D9D391f94cc8D" as const;
export const MAVERICK_V2_ROUTER = "0x5eDEd0d7E76C563FF081Ca01D9d12D6B404Df527" as const;
export const MAVERICK_V2_POSITION = "0x116193c58B40D50687c0433B2aa0cC4AE00bC32c" as const;
export const MAVERICK_V2_QUOTER = "0xb40AfdB85a07f37aE217E7D6462e609900dD8D7A" as const;
export const WETH = "0x4200000000000000000000000000000000000006" as const;
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const CBETH = "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22" as const;
export const WSTETH = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452" as const;

export const TOKEN_SYMBOLS: Record<string, string> = {
  [WETH.toLowerCase()]: "WETH",
  [USDC.toLowerCase()]: "USDC",
  [CBETH.toLowerCase()]: "cbETH",
  [WSTETH.toLowerCase()]: "wstETH",
};

export const TOKEN_DECIMALS: Record<string, number> = {
  [WETH.toLowerCase()]: 18,
  [USDC.toLowerCase()]: 6,
  [CBETH.toLowerCase()]: 18,
  [WSTETH.toLowerCase()]: 18,
};

export const SUPPORTED_POOL_ALLOW_LIST: Array<{
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  tokenASymbol: string;
  tokenBSymbol: string;
}> = [
  {
    poolAddress: "0x8bB51E6c24f4BB50f9A2C2C67048bE03E7F73CB4",
    tokenA: WETH,
    tokenB: USDC,
    tokenASymbol: "WETH",
    tokenBSymbol: "USDC",
  },
  {
    poolAddress: "0x0d3DC0e1fc8e8F7e1A2FCA19CB47aD1d52A76df0",
    tokenA: WETH,
    tokenB: CBETH,
    tokenASymbol: "WETH",
    tokenBSymbol: "cbETH",
  },
  {
    poolAddress: "0xdDE5c19c0aAd0E4F20F5E99E4D5D4A3f36FD9E8e",
    tokenA: WETH,
    tokenB: WSTETH,
    tokenASymbol: "WETH",
    tokenBSymbol: "wstETH",
  },
];

export const POOL_STATE_ABI = [
  {
    name: "tokenA",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    name: "tokenB",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    name: "tickSpacing",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "fee",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bool", name: "tokenAIn" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getState",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "reserveA", type: "uint128" },
          { name: "reserveB", type: "uint128" },
          { name: "lastTwaD8", type: "int64" },
          { name: "lastLogPriceD8", type: "int64" },
          { name: "lastTimestamp", type: "uint40" },
          { name: "activeTick", type: "int32" },
          { name: "isLocked", type: "bool" },
          { name: "binCounter", type: "uint32" },
          { name: "protocolFeeRatioD3", type: "uint8" },
        ],
      },
    ],
  },
] as const;

export const POOL_LENS_ABI = [
  {
    name: "getPoolSqrtPrice",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "pool", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getAddLiquidityParams",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "pool", type: "address" },
          { name: "kind", type: "uint8" },
          { name: "ticks", type: "int32[]" },
          { name: "relativeLiquidityAmounts", type: "uint128[]" },
          {
            name: "addSpec",
            type: "tuple",
            components: [
              { name: "slippageFactorD18", type: "uint256" },
              { name: "numberOfPriceBreaksPerSide", type: "uint256" },
              { name: "targetAmount", type: "uint256" },
              { name: "targetIsA", type: "bool" },
            ],
          },
        ],
      },
    ],
    outputs: [
      { name: "addParams", type: "bytes" },
      { name: "tickDeltas", type: "uint256[]" },
    ],
  },
] as const;

export const POSITION_ABI = [
  {
    name: "tokenIdsOfOwner",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256[]" }],
  },
  {
    name: "tokenIdPositionInformation",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "subaccount", type: "uint256" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          {
            name: "poolBinIds",
            type: "tuple",
            components: [
              { name: "pool", type: "address" },
              { name: "binIds", type: "uint32[]" },
            ],
          },
          { name: "amountA", type: "uint256" },
          { name: "amountB", type: "uint256" },
        ],
      },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const USDC_PRICE_USD = 1.0;
export const ETH_PRICE_USD_FALLBACK = 3000;
