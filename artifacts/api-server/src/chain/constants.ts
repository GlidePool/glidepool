export const BASE_CHAIN_ID = 8453;

export const BASE_RPC = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";

export const MAVERICK_V2_FACTORY = "0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e" as const;
export const MAVERICK_V2_POOL_LENS = "0x6A9EB38DE5D349Fe751E0aDb4c0D9D391f94cc8D" as const;
export const MAVERICK_V2_ROUTER = "0x5eDEd0d7E76C563FF081Ca01D9d12D6B404Df527" as const;
export const MAVERICK_V2_POSITION = "0x116193c58B40D50687c0433B2aa0cC4AE00bC32c" as const;
export const MAVERICK_V2_QUOTER = "0xb40AfdB85a07f37aE217E7D6462e609900dD8D7A" as const;

export const MAVERICK_API_BASE = "https://api.mav.xyz/api/v4";

export const WETH = "0x4200000000000000000000000000000000000006" as const;
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const CBETH = "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22" as const;
export const WSTETH = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452" as const;
export const DAI = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb" as const;
export const USDBC = "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA" as const;
export const MAV = "0x64b88c73A5DfA78D1713fE1b4c69a22d7E0faAa7" as const;

export const TOKEN_SYMBOLS: Record<string, string> = {
  [WETH.toLowerCase()]: "WETH",
  [USDC.toLowerCase()]: "USDC",
  [CBETH.toLowerCase()]: "cbETH",
  [WSTETH.toLowerCase()]: "wstETH",
  [DAI.toLowerCase()]: "DAI",
  [USDBC.toLowerCase()]: "USDbC",
  [MAV.toLowerCase()]: "MAV",
};

export const TOKEN_DECIMALS: Record<string, number> = {
  [WETH.toLowerCase()]: 18,
  [USDC.toLowerCase()]: 6,
  [CBETH.toLowerCase()]: 18,
  [WSTETH.toLowerCase()]: 18,
  [DAI.toLowerCase()]: 18,
  [USDBC.toLowerCase()]: 6,
  [MAV.toLowerCase()]: 18,
};

// Real Maverick pool addresses on Base mainnet (verified via Maverick API + eth_getCode)
// Sourced from https://api.mav.xyz/api/v4/pools/8453
export const SUPPORTED_POOL_ALLOW_LIST: Array<{
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  feeRate: number;
  tickSpacing: number;
}> = [
  {
    poolAddress: "0x3d70b2f31f75dc84acdd5e1588695221959b2d37",
    tokenA: WETH,
    tokenB: USDC,
    tokenASymbol: "WETH",
    tokenBSymbol: "USDC",
    feeRate: 0.0015,
    tickSpacing: 487,
  },
  {
    poolAddress: "0x06e6736ca9e922766279a22b75a600fe8b8473b6",
    tokenA: WETH,
    tokenB: USDBC,
    tokenASymbol: "WETH",
    tokenBSymbol: "USDbC",
    feeRate: 0.0002,
    tickSpacing: 198,
  },
  {
    poolAddress: "0x1b55d94b553475e7561fab889bf88fe4f491d29c",
    tokenA: DAI,
    tokenB: USDC,
    tokenASymbol: "DAI",
    tokenBSymbol: "USDC",
    feeRate: 0.00002,
    tickSpacing: 1,
  },
  {
    poolAddress: "0x2cebcf66f023aa88003593804504a8df882d12e6",
    tokenA: CBETH,
    tokenB: WETH,
    tokenASymbol: "cbETH",
    tokenBSymbol: "WETH",
    feeRate: 0.0001,
    tickSpacing: 10,
  },
  {
    poolAddress: "0xaaf7c86c2f631bac45c671645e583c7f93c8b6cf",
    tokenA: WETH,
    tokenB: WSTETH,
    tokenASymbol: "WETH",
    tokenBSymbol: "wstETH",
    feeRate: 0.001,
    tickSpacing: 10,
  },
  {
    poolAddress: "0xe6917fbf0f44053fd42b55657555afa89806cc24",
    tokenA: WETH,
    tokenB: MAV,
    tokenASymbol: "WETH",
    tokenBSymbol: "MAV",
    feeRate: 0.01,
    tickSpacing: 2232,
  },
  {
    poolAddress: "0xdcc8a6ba71a6c0053cbb32f935e9b4b64d465ea3",
    tokenA: DAI,
    tokenB: USDBC,
    tokenASymbol: "DAI",
    tokenBSymbol: "USDbC",
    feeRate: 0.00002,
    tickSpacing: 1,
  },
  {
    poolAddress: "0x5bdb08ae195c8f085704582a27d566028a719265",
    tokenA: WETH,
    tokenB: DAI,
    tokenASymbol: "WETH",
    tokenBSymbol: "DAI",
    feeRate: 0.0002,
    tickSpacing: 198,
  },
];

// Maverick pool ABI — getState() returns 4 words (verified via eth_call on Base mainnet):
//   word 0: activeTick (int256, sign-extended from int32)
//   word 1: reserveA (uint256)
//   word 2: reserveB (uint256)
//   word 3: binCounter (uint256)
// tokenA(), tokenB(), tickSpacing(), fee(bool) verified working.
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
    // Maverick V2 State struct (real layout):
    // reserveA uint128, reserveB uint128, activeTick int32,
    // status uint8, binCounter uint128, protocolFeeRatioD3 uint96, lastTwapD8 uint8
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
          { name: "activeTick", type: "int32" },
          { name: "status", type: "uint8" },
          { name: "binCounter", type: "uint128" },
          { name: "protocolFeeRatioD3", type: "uint96" },
          { name: "lastTwapD8", type: "uint8" },
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
