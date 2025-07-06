import { RANGE_BATTLE_ABI } from "@/contracts/abis";
import { CONTRACTS } from "@/lib/contracts";
import { useReadContract } from "wagmi";

// Battle details structure from contract
export interface BattleDetails {
  creator: string;
  opponent: string;
  usdValue: string;
  winner: string;
  status: string;
  startTime: number;
  duration: number;
  creatorTokenId: string;
  opponentTokenId: string;
  isResolved: boolean;
  creatorInRange: boolean;
  opponentInRange: boolean;
  currentTick: number;
}

export const useCompleteBattleDetails = (battleId: string | undefined) => {
  const {
    data: battleData,
    isLoading,
    error,
  } = useReadContract({
    address: CONTRACTS.RANGE_BATTLE,
    abi: RANGE_BATTLE_ABI,
    functionName: "getCompleteBattleDetails",
    args: battleId ? [BigInt(battleId)] : undefined,
    query: {
      enabled: !!battleId,
    },
  });

  // Convert the contract response to our BattleDetails interface
  const battleDetails: BattleDetails | null = 
    battleData && Array.isArray(battleData)
      ? {
          creator: battleData[0] as string,
          opponent: battleData[1] as string,
          creatorTokenId: (battleData[2] as bigint).toString(),
          opponentTokenId: (battleData[3] as bigint).toString(),
          isResolved: battleData[4] as boolean,
          winner: battleData[5] as string,
          startTime: Number(battleData[6] as bigint),
          duration: Number(battleData[7] as bigint),
          usdValue: (battleData[8] as bigint).toString(),
          status: battleData[9] as string,
          creatorInRange: battleData[10] as boolean,
          opponentInRange: battleData[11] as boolean,
          currentTick: Number(battleData[12] as bigint),
        }
      : null;

  return {
    battleDetails,
    isLoading,
    error,
  };
};

// Legacy alias for backward compatibility
export const useBattleDetails = useCompleteBattleDetails;