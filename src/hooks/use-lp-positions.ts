"use client";

import { POSITION_MANAGER_ABI } from "@/contracts/abis";
import { CONTRACTS } from "@/lib/config";
import {
  LPPositionService,
  generateMockLPPositions,
  logPositionDebugInfo,
  shouldUseMockData,
} from "@/lib/lp-position-service";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";

// Hook to get user's LP NFT token IDs
export function useUserLPTokenIds() {
  const { address } = useAccount();

  const { data: balance, error: balanceError } = useReadContract({
    address: CONTRACTS.POSITION_MANAGER,
    abi: POSITION_MANAGER_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: 1, // Only retry once to avoid long delays
    },
  });

  // Log balance information for debugging
  if (balance !== undefined) {
    // console.log(`LP NFT balance for ${address}:`, balance.toString());
  }
  if (balanceError) {
    // console.error("Error fetching LP NFT balance:", balanceError.message);
  }

  const tokenIdsQuery = useQuery({
    queryKey: ["userLPTokenIds", address, balance?.toString()],
    queryFn: async () => {
      if (!address) return [];

      // If balance query failed, return empty array (contract might not exist)
      if (balanceError) {
        console.warn(
          "Position Manager contract not available:",
          balanceError.message,
        );
        return [];
      }

      if (!balance || balance === 0n) {
        // console.log("User has no LP NFTs");
        return [];
      }

      // console.log(`Fetching ${balance} LP NFT token IDs for user ${address}`);

      try {
        // Use the centralized service
        const tokenIds = await LPPositionService.getUserTokenIds(address);
        // console.log(
        //   `Successfully fetched ${tokenIds.length} real token IDs:`,
        //   tokenIds.map((id: bigint) => id.toString()),
        // );
        return tokenIds;
      } catch (error) {
        console.error("Error fetching real token IDs, using fallback:", error);

        // Fallback to mock token IDs if real fetching fails
        const mockTokenIds: bigint[] = [];
        for (let i = 0; i < Number(balance); i++) {
          mockTokenIds.push(BigInt(i + 1));
        }

        // console.log(
        //   "Using fallback mock token IDs:",
        //   mockTokenIds.map((id) => id.toString()),
        // );
        return mockTokenIds;
      }
    },
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    retry: 1, // Only retry once
  });

  return {
    tokenIds: tokenIdsQuery.data || [],
    isLoading: tokenIdsQuery.isLoading,
    error: tokenIdsQuery.error || balanceError,
  };
}

// Hook to get detailed LP position information from Position Manager
export function useLPPositionDetails(tokenId: string | undefined) {
  const positionQuery = useQuery({
    queryKey: ["lpPositionDetails", tokenId],
    queryFn: async () => {
      if (!tokenId) return null;
      return await LPPositionService.getPositionDetails(tokenId);
    },
    enabled: !!tokenId,
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    position: positionQuery.data || null,
    isLoading: positionQuery.isLoading,
    error: positionQuery.error,
  };
}

// Hook to get all user's LP positions
export function useUserLPPositions() {
  const { address } = useAccount();

  const positionsQuery = useQuery({
    queryKey: ["userLPPositions", address],
    queryFn: async () => {
      if (!address) return [];

      try {
        // Use the centralized service
        const positions = await LPPositionService.getUserPositions(address);
        // console.log(
        //   `Successfully fetched ${positions.length} positions for user ${address}`,
        // );
        logPositionDebugInfo(address, BigInt(positions.length), positions);
        return positions;
      } catch (error) {
        console.error(
          "Error fetching real position data, falling back to mock:",
          error,
        );

        // Fallback to mock data if real contract calls fail
        const mockPositions = generateMockLPPositions(address, 3); // Default to 3 mock positions
        console.warn("Using mock positions due to contract error");
        logPositionDebugInfo(address, BigInt(3), mockPositions);
        return mockPositions;
      }
    },
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    positions: positionsQuery.data || [],
    isLoading: positionsQuery.isLoading,
    error: shouldUseMockData(positionsQuery.error || undefined)
      ? null
      : positionsQuery.error,
    refetch: positionsQuery.refetch,
  };
}

// Hook to check if user can join a battle with their LP position
export function useCanJoinBattle(
  battleId: string | undefined,
  tokenId: string | undefined,
  battleType: "range" | "fee" = "range",
) {
  return useQuery({
    queryKey: ["canJoinBattle", battleId, tokenId, battleType],
    queryFn: async () => {
      if (!battleId || !tokenId)
        return { canJoin: false, reason: "Missing parameters" };
      return await LPPositionService.canJoinBattle(
        battleId,
        tokenId,
        battleType,
      );
    },
    enabled: !!battleId && !!tokenId,
    staleTime: 10000, // 10 seconds
  });
}
