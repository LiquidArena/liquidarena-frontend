// import { LPBattleVaultContractConfig } from "@/contracts";
import { FEE_BATTLE_ABI, RANGE_BATTLE_ABI } from "@/contracts/abis";
import { CONTRACTS } from "@/lib/contracts";
import { GET_ALL_USER_BATTLES, graphqlClient } from "@/lib/gql";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Address } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

// Battle type enum
export enum BattleType {
  RANGE = "RANGE",
  FEE = "FEE",
}

type UserBattlesData = {
  created: LPBattleVault_BattleCreated[];
  joined: LPBattleVault_BattleJoined[];
  won: LPBattleVault_BattleResolved[];
  allResolved: LPBattleVault_BattleResolved[];
};

// Enhanced type for calculated battle stats
export type BattleStats = {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  createdBattles: number;
  joinedBattles: number;
  //   lostBattles: BattleResolved[];
};

type UseUserBattlesParams = {
  userAddress: Address;
};

export const useProfileStats = ({
  userAddress,
}: UseUserBattlesParams): UseQueryResult<BattleStats> => {
  return useQuery({
    queryKey: ["userBattles", { userAddress }],
    queryFn: async () => {
      const response = await graphqlClient.request<UserBattlesData>(
        GET_ALL_USER_BATTLES,
        { userAddress },
      );

      const data = response ?? {
        created: [],
        joined: [],
        won: [],
        allResolved: [],
      };

      // Calculate battle statistics
      const stats = calculateBattleStats(data, userAddress);

      return stats;
    },
    enabled: !!userAddress,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Helper function to calculate battle statistics
function calculateBattleStats(
  data: UserBattlesData,
  userAddress: string,
): BattleStats {
  const { created, joined, won, allResolved } = data;

  // Get all battle IDs where user participated (created or joined)
  const userBattleIds = new Set([
    ...created.map((battle) => battle.battleId),
    ...joined.map((battle) => battle.battleId),
  ]);

  // Calculate losses: battles where user participated but didn't win
  const lostBattles = allResolved.filter((battle) => {
    const battleId = battle.battleId;
    const userParticipated = userBattleIds.has(battleId);
    const userWon = battle.winner.toLowerCase() === userAddress.toLowerCase();

    return userParticipated && !userWon;
  });

  const totalBattles = userBattleIds.size;
  const wins = won?.length;
  const losses = lostBattles?.length;
  const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0;

  return {
    totalBattles,
    wins,
    losses,
    winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
    createdBattles: created?.length,
    joinedBattles: joined?.length,
    // lostBattles,
  };
}

interface BattleDetails {
  creator: `0x${string}`;
  opponent: `0x${string}`;
  usdValue: bigint;
  winner: `0x${string}`;
  status: string;
  battleType: BattleType;
  creatorTokenId?: bigint;
  opponentTokenId?: bigint;
  startTime?: bigint;
  duration?: bigint;
  isResolved?: boolean;
}

// Type for the Range Battle getBattleDetails contract return value
type RangeBattleDetailsResult = readonly [
  `0x${string}`, // creator
  `0x${string}`, // opponent
  bigint, // usdValue
  `0x${string}`, // winner
  string, // status
];

// Type for the Fee Battle getBattleDetails contract return value
type FeeBattleDetailsResult = readonly [
  `0x${string}`, // creator
  `0x${string}`, // opponent
  bigint, // creatorTokenId
  bigint, // opponentTokenId
  boolean, // isResolved
  `0x${string}`, // winner
  bigint, // startTime
  bigint, // duration
  bigint, // creatorLPValueUSD
  string, // status
];

// Type for useReadContracts result
interface RangeContractResult {
  result?: RangeBattleDetailsResult;
  status: "success" | "failure";
  error?: Error;
}

interface FeeContractResult {
  result?: FeeBattleDetailsResult;
  status: "success" | "failure";
  error?: Error;
}

interface ContractResult {
  result?: RangeBattleDetailsResult | FeeBattleDetailsResult;
  status: "success" | "failure";
  error?: Error;
  battleType: BattleType;
}

interface UserBattleWithDetails {
  battleId: bigint;
  isCreator: boolean;
  details: BattleDetails | null;
  battleType: BattleType;
}

export const useRecentBattles = ({ userAddress }: UseUserBattlesParams) => {
  // Get Range Battle IDs
  const {
    data: rangeBattleDatas,
    error: rangeBattleIdsError,
    isLoading: isRangeBattleIdsLoading,
  } = useReadContract({
    address: CONTRACTS.RANGE_BATTLE,
    abi: RANGE_BATTLE_ABI,
    functionName: "getUserBattles",
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  // Get Fee Battle IDs
  const {
    data: feeBattleDatas,
    error: feeBattleIdsError,
    isLoading: isFeeBattleIdsLoading,
  } = useReadContract({
    address: CONTRACTS.FEE_BATTLE,
    abi: FEE_BATTLE_ABI,
    functionName: "getUserBattles",
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });

  // Safe destructuring for Range Battles
  const rangeBattleIds = useMemo(
    () => rangeBattleDatas?.[0] || [],
    [rangeBattleDatas],
  );
  const rangeIsCreatorFlags = useMemo(
    () => rangeBattleDatas?.[1] || [],
    [rangeBattleDatas],
  );

  // Safe destructuring for Fee Battles
  const feeBattleIds = useMemo(
    () => feeBattleDatas?.[0] || [],
    [feeBattleDatas],
  );
  const feeIsCreatorFlags = useMemo(
    () => feeBattleDatas?.[1] || [],
    [feeBattleDatas],
  );

  // Prepare contracts configuration for batch reading Range Battles
  const rangeBattleDetailsContracts = useMemo(() => {
    return rangeBattleIds.map((battleId) => ({
      address: CONTRACTS.RANGE_BATTLE,
      abi: RANGE_BATTLE_ABI,
      functionName: "getBattleDetails",
      args: [battleId],
    }));
  }, [rangeBattleIds]);

  // Prepare contracts configuration for batch reading Fee Battles
  const feeBattleDetailsContracts = useMemo(() => {
    return feeBattleIds.map((battleId) => ({
      address: CONTRACTS.FEE_BATTLE,
      abi: FEE_BATTLE_ABI,
      functionName: "getBattleDetails",
      args: [battleId],
    }));
  }, [feeBattleIds]);

  // Batch fetch all Range battle details
  const {
    data: rangeBattleDetailsData,
    error: rangeBattleDetailsError,
    isLoading: isRangeBattleDetailsLoading,
  } = useReadContracts({
    contracts: rangeBattleDetailsContracts,
    query: {
      enabled: rangeBattleIds.length > 0,
    },
  });

  // Batch fetch all Fee battle details
  const {
    data: feeBattleDetailsData,
    error: feeBattleDetailsError,
    isLoading: isFeeBattleDetailsLoading,
  } = useReadContracts({
    contracts: feeBattleDetailsContracts,
    query: {
      enabled: feeBattleIds.length > 0,
    },
  });

  // Transform Range battle data into a more usable format
  const rangeBattlesWithDetails: UserBattleWithDetails[] = useMemo(() => {
    if (!rangeBattleIds.length || !rangeBattleDetailsData) return [];

    return rangeBattleIds.map((battleId, index) => {
      const detailsResult = rangeBattleDetailsData[
        index
      ] as RangeContractResult;

      // Handle successful and failed contract calls with proper type checking
      const details: BattleDetails | null =
        detailsResult?.status === "success" && detailsResult.result
          ? {
              creator: detailsResult.result[0],
              opponent: detailsResult.result[1],
              usdValue: detailsResult.result[2],
              winner: detailsResult.result[3],
              status: detailsResult.result[4],
              battleType: BattleType.RANGE,
            }
          : null;

      return {
        battleId,
        isCreator: rangeIsCreatorFlags[index] || false,
        details,
        battleType: BattleType.RANGE,
      };
    });
  }, [rangeBattleIds, rangeIsCreatorFlags, rangeBattleDetailsData]);

  // Transform Fee battle data into a more usable format
  const feeBattlesWithDetails: UserBattleWithDetails[] = useMemo(() => {
    if (!feeBattleIds.length || !feeBattleDetailsData) return [];

    return feeBattleIds.map((battleId, index) => {
      const detailsResult = feeBattleDetailsData[index] as FeeContractResult;

      // Handle successful and failed contract calls with proper type checking
      const details: BattleDetails | null =
        detailsResult?.status === "success" && detailsResult.result
          ? {
              creator: detailsResult.result[0],
              opponent: detailsResult.result[1],
              creatorTokenId: detailsResult.result[2],
              opponentTokenId: detailsResult.result[3],
              isResolved: detailsResult.result[4],
              winner: detailsResult.result[5],
              startTime: detailsResult.result[6],
              duration: detailsResult.result[7],
              usdValue: detailsResult.result[8], // creatorLPValueUSD
              status: detailsResult.result[9],
              battleType: BattleType.FEE,
            }
          : null;

      return {
        battleId,
        isCreator: feeIsCreatorFlags[index] || false,
        details,
        battleType: BattleType.FEE,
      };
    });
  }, [feeBattleIds, feeIsCreatorFlags, feeBattleDetailsData]);

  // Combine both battle types
  const battlesWithDetails = useMemo(() => {
    return [...rangeBattlesWithDetails, ...feeBattlesWithDetails];
  }, [rangeBattlesWithDetails, feeBattlesWithDetails]);

  // Separate battles by role for easier consumption
  const createdBattles = battlesWithDetails.filter(
    (battle) => battle.isCreator,
  );
  const joinedBattles = battlesWithDetails.filter(
    (battle) => !battle.isCreator,
  );

  // Separate battles by type
  const rangeBattles = battlesWithDetails.filter(
    (battle) => battle.battleType === BattleType.RANGE,
  );
  const feeBattles = battlesWithDetails.filter(
    (battle) => battle.battleType === BattleType.FEE,
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalBattles = battlesWithDetails.length;
    const wonBattles = battlesWithDetails.filter(
      (battle) => battle.details?.winner === userAddress,
    ).length;
    const activeBattles = battlesWithDetails.filter(
      (battle) =>
        battle.details?.status === "Active" ||
        battle.details?.status === "Waiting",
    ).length;
    const completedBattles = battlesWithDetails.filter(
      (battle) => battle.details?.status === "Resolved",
    ).length;
    const rangeBattlesCount = rangeBattles.length;
    const feeBattlesCount = feeBattles.length;

    // Calculate lost battles: completed battles where user participated but didn't win
    const lostBattles = battlesWithDetails.filter(
      (battle) =>
        battle.details?.status === "resolved" &&
        battle.details?.winner !== userAddress &&
        battle.details?.winner !== "0x0000000000000000000000000000000000000000",
    ).length;

    // console.log(lostBattles);

    return {
      totalBattles,
      wonBattles,
      lostBattles,
      activeBattles,
      completedBattles,
      rangeBattlesCount,
      feeBattlesCount,
      winRate: totalBattles > 0 ? (wonBattles / totalBattles) * 100 : 0,
    };
  }, [battlesWithDetails, userAddress, rangeBattles, feeBattles]);

  const isLoading =
    isRangeBattleIdsLoading ||
    isRangeBattleDetailsLoading ||
    isFeeBattleIdsLoading ||
    isFeeBattleDetailsLoading;
  const error =
    rangeBattleIdsError ||
    rangeBattleDetailsError ||
    feeBattleIdsError ||
    feeBattleDetailsError;

  return {
    // Raw data
    rangeBattleIds,
    feeBattleIds,
    rangeIsCreatorFlags,
    feeIsCreatorFlags,

    // Processed data
    battles: battlesWithDetails,
    createdBattles,
    joinedBattles,
    rangeBattles,
    feeBattles,
    stats,

    // Status
    isLoading,
    error,
    hasBattles: battlesWithDetails.length > 0,

    // Helper functions
    getBattleById: (battleId: bigint) =>
      battlesWithDetails.find((battle) => battle.battleId === battleId),

    getBattlesByStatus: (status: string) =>
      battlesWithDetails.filter((battle) => battle.details?.status === status),

    getBattlesByType: (battleType: BattleType) =>
      battlesWithDetails.filter((battle) => battle.battleType === battleType),
  };
};
