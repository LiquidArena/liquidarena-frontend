export interface BattleViewProps {
  battleId: string;
}

export type BattleStatus =
  | "loading"
  | "notFound"
  | "waitingForOpponent"
  | "selectingPosition"
  | "ongoing"
  | "readyToResolve"
  | "ended";

export interface LPPosition {
  tokenId: string;
  poolName?: string;
  token0Symbol?: string;
  token1Symbol?: string;
  fee: number;
}

export interface LPPositionCardProps {
  position: LPPosition;
  isSelected: boolean;
  onSelect: () => void;
  minValue: number;
  maxValue: number;
}

export interface WinnerInfo {
  winner: "creator" | "opponent" | "draw";
  address: string;
  reason: string;
}

export interface BattleHeaderProps {
  battleId: string;
  requiredStakeValue: number;
  battleDetails: any;
  battleStatus: BattleStatus;
}

export interface BattleTimerProps {
  timeRemaining: number;
  battleDetails: any;
}

export interface BattleParticipantsProps {
  battleDetails: any;
}

export interface LPPositionSelectorProps {
  userLPPositions: LPPosition[];
  isLoadingPositions: boolean;
  selectedPool: string;
  setSelectedPool: (tokenId: string) => void;
  requiredStakeValue: number;
  minValue: number;
  maxValue: number;
  joinError: string | null;
  currentStep: string;
  isApproving: boolean;
  isJoining: boolean;
  handleApprove: () => void;
  handleActualJoin: () => void;
  handleJoinBattle: () => void;
}
