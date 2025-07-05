export type ContractBattleStatus =
  | "queued"
  | "onGoing"
  | "readyToResolve"
  | "ended";

export type BattleData = {
  id: string;
  battleId: string;
  creator: string;
  creatorTokenId: string;
  duration: string;
  totalValueUSD: string;
  status: ContractBattleStatus;
  createdAt: string;
};

export type BattleStats = {
  queuedBattles: number;
  onGoingBattles: number;
  readyToResolveBattles: number;
  endedBattles: number;
  totalBattles: number;
  totalVolume: number;
};
