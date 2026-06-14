export const MAVERICK_V2_ROUTER   = "0x5eDEd0d7E76C563FF081Ca01D9d12D6B404Df527" as const;
export const MAVERICK_V2_FACTORY  = "0x0A7e848Aca42d879EF06507Fca0E7b33A0a63c1e" as const;
export const MAVERICK_V2_POSITION = "0x116193c58B40D50687c0433B2aa0cC4AE00bC32c" as const;

export const ROUTER_ABI = [
  {
    name: "removeLiquidity",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "pool",            type: "address" },
      { name: "recipient",       type: "address" },
      { name: "subaccount",      type: "uint256" },
      {
        name: "params",
        type: "tuple[]",
        components: [
          { name: "binId",  type: "uint32"  },
          { name: "amount", type: "uint128" },
        ],
      },
      { name: "minTokenAAmount", type: "uint256" },
      { name: "minTokenBAmount", type: "uint256" },
      { name: "deadline",        type: "uint256" },
    ],
    outputs: [
      { name: "tokenAAmount", type: "uint256" },
      { name: "tokenBAmount", type: "uint256" },
    ],
  },
  {
    name: "addLiquidityToPool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "pool",            type: "address" },
      { name: "subaccount",      type: "uint256" },
      { name: "params",          type: "bytes"   },
      { name: "minTokenAAmount", type: "uint256" },
      { name: "minTokenBAmount", type: "uint256" },
      { name: "deadline",        type: "uint256" },
    ],
    outputs: [
      { name: "tokenAAmount", type: "uint256" },
      { name: "tokenBAmount", type: "uint256" },
      {
        name: "binDeltas",
        type: "tuple[]",
        components: [
          { name: "isDelta",        type: "bool"    },
          { name: "deltaLpBalance", type: "uint128" },
          { name: "deltaReserveA",  type: "uint128" },
          { name: "deltaReserveB",  type: "uint128" },
          { name: "kind",           type: "uint8"   },
          { name: "isActive",       type: "bool"    },
          { name: "tick",           type: "int32"   },
          { name: "binId",          type: "uint32"  },
        ],
      },
    ],
  },
] as const;

export const FACTORY_ABI = [
  {
    name: "create",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "feeAIn",      type: "uint64"  },
      { name: "feeBIn",      type: "uint64"  },
      { name: "tickSpacing", type: "uint16"  },
      { name: "lookback",    type: "uint32"  },
      { name: "tokenA",      type: "address" },
      { name: "tokenB",      type: "address" },
      { name: "kinds",       type: "uint8"   },
      { name: "accessor",    type: "address" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
  {
    name: "lookup",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "feeAIn",      type: "uint256" },
      { name: "feeBIn",      type: "uint256" },
      { name: "tickSpacing", type: "uint256" },
      { name: "lookback",    type: "uint256" },
      { name: "tokenA",      type: "address" },
      { name: "tokenB",      type: "address" },
      { name: "kinds",       type: "uint8"   },
      { name: "accessor",    type: "address" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
] as const;

export const POSITION_NFT_ABI = [
  {
    name: "isApprovedForAll",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner",    type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "setApprovalForAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool"    },
    ],
    outputs: [],
  },
] as const;

export const ERC20_READ_ABI = [
  { name: "name",     type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8"  }] },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner",   type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount",  type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export const FACTORY_POOL_CREATED_TOPIC =
  "0x4d4c3a87f0d5fbcea3c51d5baa727fceedb200dd7c9287f7ef85b60b794c6598";
