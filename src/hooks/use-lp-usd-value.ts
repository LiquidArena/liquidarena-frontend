"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/config";
import { RANGE_BATTLE_ABI, POSITION_MANAGER_ABI } from "@/contracts/abis";

export interface LPUSDValue {
  amount0: string;
  amount1: string;
  valueUSD: string;
}

/**
 * Hook to check if user owns an LP token
 */
export function useTokenOwnership(tokenId: string | undefined) {
  const { address } = useAccount();

  const { data: owner } = useReadContract({
    address: CONTRACTS.POSITION_MANAGER,
    abi: POSITION_MANAGER_ABI,
    functionName: "ownerOf",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!(tokenId && address),
    },
  });

  const isOwner = owner === address;
  return { isOwner, owner };
}

/**
 * Hook to get LP position USD value from LPBattleVault contract
 * Requires user's wallet to be connected since contract checks ownership
 */
export function useLPPositionUSDValue(tokenId: string | undefined) {
  const { address, isConnected } = useAccount();
  const { isOwner } = useTokenOwnership(tokenId);

  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useReadContract({
    address: CONTRACTS.RANGE_BATTLE, // LPBattleVault contract
    abi: RANGE_BATTLE_ABI,
    functionName: "getLPTokenValueUSD",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!(tokenId && isConnected && address && isOwner), // Only call if user owns the token
      retry: 1,
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute
    },
  });

  // Parse the contract response
  const usdValue: LPUSDValue | null = data && Array.isArray(data) && data.length >= 3 
    ? {
        amount0: (data[0] as bigint).toString(),
        amount1: (data[1] as bigint).toString(), 
        valueUSD: (data[2] as bigint).toString(),
      }
    : null;

  return {
    usdValue,
    isLoading,
    error,
    refetch,
    isConnected,
    isOwner, // Include ownership info for debugging
  };
}

/**
 * Hook to get USD values for multiple LP positions
 */
export function useBatchLPPositionUSDValues(tokenIds: string[]) {
  const { address, isConnected } = useAccount();

  // Create multiple contract calls for each token ID
  const contractCalls = tokenIds.map(tokenId => ({
    address: CONTRACTS.RANGE_BATTLE,
    abi: RANGE_BATTLE_ABI,
    functionName: "getLPTokenValueUSD",
    args: [BigInt(tokenId)],
  }));

  // Note: This would require useReadContracts (plural) from wagmi for batch calls
  // For now, we'll use individual calls - can optimize later if needed

  return {
    // Placeholder for batch implementation
    // Individual hooks can be called in components for now
    isConnected,
  };
}