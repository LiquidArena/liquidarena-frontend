type LPBattleVault_BattleCreated = {
  id: string;
  battleId: bigint;
  creator: string;
  creatorTokenId: bigint;
  duration: bigint;
  totalValueUSD: bigint;
};

type LPBattleVault_BattleJoined = {
  id: string;
  battleId: bigint;
  opponent: string;
  opponentTokenId: bigint;
  startTime: bigint;
};

type LPBattleVault_BattleResolved = {
  id: string;
  battleId: bigint;
  winner: string;
  resolver: string;
  resolverReward: bigint;
};

type LPBattleVault_ContractPausedByOwner = {
  id: string;
  by: string;
};

type LPBattleVault_ContractUnpausedByOwner = {
  id: string;
  by: string;
};

type LPBattleVault_EmergencyWithdrawal = {
  id: string;
  battleId: bigint;
  to: string;
  tokenId: bigint;
};

type LPBattleVault_OwnershipTransferred = {
  id: string;
  previousOwner: string;
  newOwner: string;
};

type LPBattleVault_Paused = {
  id: string;
  account: string;
};

type LPBattleVault_PriceFeedSet = {
  id: string;
  token: string;
  priceFeed: string;
};

type LPBattleVault_StablecoinSet = {
  id: string;
  token: string;
  isStablecoin: boolean;
};

type LPBattleVault_Unpaused = {
  id: string;
  account: string;
};

type LPFeeBattle_BattleCreated = {
  id: string;
  battleId: bigint;
  creator: string;
  creatorTokenId: bigint;
};

type LPFeeBattle_BattleJoined = {
  id: string;
  battleId: bigint;
  opponent: string;
  opponentTokenId: bigint;
};

type LPFeeBattle_BattleResolved = {
  id: string;
  battleId: bigint;
  winner: string;
};

type LPFeeBattle_OwnershipTransferred = {
  id: string;
  previousOwner: string;
  newOwner: string;
};

type LPFeeBattle_Paused = {
  id: string;
  account: string;
};

type LPFeeBattle_PriceFeedSet = {
  id: string;
  token: string;
  priceFeed: string;
};

type LPFeeBattle_StablecoinSet = {
  id: string;
  token: string;
  isStablecoin: boolean;
};

type LPFeeBattle_Unpaused = {
  id: string;
  account: string;
};
