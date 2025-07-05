import { GET_ALL_BATTLES, graphqlClient } from "@/lib/gql";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

type UseListOfBattlesParams = {
  limit?: number;
};

type BattlesData = {
  LPBattleVault_BattleCreated: LPBattleVault_BattleCreated[];
  LPFeeBattle_BattleCreated: LPFeeBattle_BattleCreated[];
};

type GetAllBattlesResponse = {
  data: BattlesData;
};

export const useListOfBattles = ({
  limit = 10,
}: UseListOfBattlesParams = {}): UseQueryResult<BattlesData> => {
  return useQuery({
    queryKey: ["battles", { limit }],
    queryFn: async (): Promise<BattlesData> => {
      try {
        const response = await graphqlClient.request<GetAllBattlesResponse>(
          GET_ALL_BATTLES,
          { limit },
        );

        // Ensure we always return a defined value
        return (
          response?.data ?? {
            LPBattleVault_BattleCreated: [],
            LPFeeBattle_BattleCreated: [],
          }
        );
      } catch (error) {
        console.error("Error fetching battles:", error);

        // Return empty data structure instead of throwing
        // This prevents the query from failing and shows empty state
        return {
          LPBattleVault_BattleCreated: [],
          LPFeeBattle_BattleCreated: [],
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on GraphQL errors (usually 400 status)
      if (error && typeof error === "object" && "response" in error) {
        const response = error.response as any;
        if (response?.status === 400) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};
