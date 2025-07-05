// Contract ABIs for LiquidArena Protocol
// This file contains the ABIs for all contracts used in the frontend

// ERC20 Token ABI (minimal)
export const ERC20_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Uniswap V3 Position Manager ABI (minimal)
export const POSITION_MANAGER_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "positions",
    outputs: [
      { name: "nonce", type: "uint96" },
      { name: "operator", type: "address" },
      { name: "token0", type: "address" },
      { name: "token1", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickLower", type: "int24" },
      { name: "tickUpper", type: "int24" },
      { name: "liquidity", type: "uint128" },
      { name: "feeGrowthInside0LastX128", type: "uint256" },
      { name: "feeGrowthInside1LastX128", type: "uint256" },
      { name: "tokensOwed0", type: "uint128" },
      { name: "tokensOwed1", type: "uint128" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Range Battle ABI (from LPBattleVault contract)
export const RANGE_BATTLE_ABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getPositionDetails",
    outputs: [
      { name: "token0", type: "address" },
      { name: "token1", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickLower", type: "int24" },
      { name: "tickUpper", type: "int24" },
      { name: "liquidity", type: "uint128" },
      { name: "amount0", type: "uint256" },
      { name: "amount1", type: "uint256" },
      { name: "valueUSD", type: "uint256" },
      { name: "fees0", type: "uint256" },
      { name: "fees1", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "battleId", type: "uint256" },
      { name: "userTokenId", type: "uint256" },
    ],
    name: "canJoinBattle",
    outputs: [
      { name: "canJoin", type: "bool" },
      { name: "reason", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "duration", type: "uint256" },
    ],
    name: "createBattle",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "battleId", type: "uint256" },
      { name: "opponentTokenId", type: "uint256" },
    ],
    name: "joinBattle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "battleId", type: "uint256" }],
    name: "resolveBattle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "battleId", type: "uint256" }],
    name: "getBattleDetails",
    outputs: [
      { name: "creator", type: "address" },
      { name: "opponent", type: "address" },
      { name: "usdValue", type: "uint256" },
      { name: "winner", type: "address" },
      { name: "status", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "battleId", type: "uint256" }],
    name: "getCompleteBattleDetails",
    outputs: [
      { name: "creator", type: "address" },
      { name: "opponent", type: "address" },
      { name: "creatorTokenId", type: "uint256" },
      { name: "opponentTokenId", type: "uint256" },
      { name: "isResolved", type: "bool" },
      { name: "winner", type: "address" },
      { name: "startTime", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "valueUSD", type: "uint256" },
      { name: "status", type: "string" },
      { name: "creatorInRange", type: "bool" },
      { name: "opponentInRange", type: "bool" },
      { name: "currentTick", type: "int24" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllActiveBattles",
    outputs: [
      { name: "battleIds", type: "uint256[]" },
      { name: "statuses", type: "string[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserBattles",
    outputs: [
      { name: "battleIds", type: "uint256[]" },
      { name: "isCreator", type: "bool[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Fee Battle ABI (from LPFeeBattle contract)
export const FEE_BATTLE_ABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getPositionDetails",
    outputs: [
      { name: "token0", type: "address" },
      { name: "token1", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickLower", type: "int24" },
      { name: "tickUpper", type: "int24" },
      { name: "liquidity", type: "uint128" },
      { name: "amount0", type: "uint256" },
      { name: "amount1", type: "uint256" },
      { name: "valueUSD", type: "uint256" },
      { name: "fees0", type: "uint256" },
      { name: "fees1", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "battleId", type: "uint256" },
      { name: "userTokenId", type: "uint256" },
    ],
    name: "canJoinBattle",
    outputs: [
      { name: "canJoin", type: "bool" },
      { name: "reason", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "duration", type: "uint256" },
    ],
    name: "createBattle",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "battleId", type: "uint256" },
      { name: "tokenId", type: "uint256" },
    ],
    name: "joinBattle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "battleId", type: "uint256" }],
    name: "resolveBattle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "battleId", type: "uint256" }],
    name: "getBattleDetails",
    outputs: [
      { name: "creator", type: "address" },
      { name: "opponent", type: "address" },
      { name: "creatorTokenId", type: "uint256" },
      { name: "opponentTokenId", type: "uint256" },
      { name: "isResolved", type: "bool" },
      { name: "winner", type: "address" },
      { name: "startTime", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "creatorLPValueUSD", type: "uint256" },
      { name: "status", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "battleId", type: "uint256" }],
    name: "getCurrentFeePerformance",
    outputs: [
      { name: "creatorFeeGrowthUSD", type: "uint256" },
      { name: "opponentFeeGrowthUSD", type: "uint256" },
      { name: "creatorFeeRate", type: "uint256" },
      { name: "opponentFeeRate", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllActiveBattles",
    outputs: [
      { name: "battleIds", type: "uint256[]" },
      { name: "statuses", type: "string[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserBattles",
    outputs: [
      { name: "battleIds", type: "uint256[]" },
      { name: "isCreator", type: "bool[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
