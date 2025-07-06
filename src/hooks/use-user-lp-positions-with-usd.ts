"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useUserLPPositions } from "@/hooks/use-lp-positions";
import { useLPPositionUSDValue, LPUSDValue } from "@/hooks/use-lp-usd-value";
import { LPPosition } from "@/lib/lp-position-service";
import { useMemo } from "react";

export interface LPPositionWithUSD extends LPPosition {
  usdValue: LPUSDValue | null;
  isUsdLoading: boolean;
  usdError: Error | null;
  isOwner: boolean;
}

/**
 * Hook to fetch user's LP NFT positions with their USD values
 * Returns positions with integrated USD value data for filtering compatible ones for battles
 */
export function useUserLPPositionsWithUSD() {
  const { address, isConnected } = useAccount();
  const { positions, isLoading: isPositionsLoading, error: positionsError, refetch } = useUserLPPositions();

  // Create a query that fetches USD values for all positions
  const positionsWithUsdQuery = useQuery({
    queryKey: ["userLPPositionsWithUSD", address, positions?.length],
    queryFn: async () => {
      if (!address || !isConnected || !positions || positions.length === 0) {
        return [];
      }

      // Fetch USD values for all positions in parallel
      const positionsWithUsd = await Promise.all(
        positions.map(async (position) => {
          try {
            // Make direct contract call to get USD value
            const response = await fetch('/api/v1/positions/usd-value', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tokenId: position.tokenId,
                userAddress: address,
              }),
            });

            let usdValue: LPUSDValue | null = null;
            let usdError: Error | null = null;
            let isOwner = false;

            if (response.ok) {
              const data = await response.json();
              usdValue = data.usdValue;
              isOwner = data.isOwner;
            } else {
              const errorData = await response.json();
              usdError = new Error(errorData.error || "Failed to fetch USD value");
              // Still check ownership even if USD value fails
              isOwner = errorData?.isOwner || false;
            }

            return {
              ...position,
              usdValue,
              isUsdLoading: false,
              usdError,
              isOwner,
            } as LPPositionWithUSD;
          } catch (error) {
            console.error(`Error fetching USD value for position ${position.tokenId}:`, error);
            return {
              ...position,
              usdValue: null,
              isUsdLoading: false,
              usdError: error instanceof Error ? error : new Error('Unknown error'),
              isOwner: false,
            } as LPPositionWithUSD;
          }
        })
      );

      return positionsWithUsd;
    },
    enabled: !!address && isConnected && !!positions && positions.length > 0,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: 1,
  });

  // Calculate derived values
  const positionsWithUsd = useMemo(() => positionsWithUsdQuery.data || [], [positionsWithUsdQuery.data]);
  const isLoading = isPositionsLoading || positionsWithUsdQuery.isLoading;
  const error = positionsError || positionsWithUsdQuery.error;

  // Filter positions that are compatible for battles (have USD value and user owns them)
  const compatiblePositions = useMemo(() => {
    return positionsWithUsd.filter(position => {
      // Must be owned by user
      if (!position.isOwner) return false;
      
      // Must have USD value
      if (!position.usdValue) return false;
      
      // Must have non-zero USD value
      if (position.usdValue.valueUSD === "0") return false;
      
      // Must have liquidity
      if (position.liquidity === "0") return false;
      
      return true;
    });
  }, [positionsWithUsd]);

  // Calculate total USD value
  const totalUsdValue = useMemo(() => {
    return compatiblePositions.reduce((total, position) => {
      if (position.usdValue?.valueUSD) {
        const value = parseFloat(position.usdValue.valueUSD);
        return total + value;
      }
      return total;
    }, 0);
  }, [compatiblePositions]);

  return {
    // All positions with USD data
    positions: positionsWithUsd,
    
    // Filtered positions that can be used for battles
    compatiblePositions,
    
    // Loading states
    isLoading,
    isPositionsLoading,
    isUsdLoading: positionsWithUsdQuery.isLoading,
    
    // Error states
    error,
    positionsError,
    usdError: positionsWithUsdQuery.error,
    
    // Derived values
    totalUsdValue,
    hasCompatiblePositions: compatiblePositions.length > 0,
    
    // Utility functions
    refetch: () => {
      refetch();
      positionsWithUsdQuery.refetch();
    },
    
    // Connection state
    isConnected,
  };
}

/**
 * Hook to get a specific LP position with USD value
 * Useful for individual position details
 */
export function useLPPositionWithUSD(tokenId: string | undefined) {
  const { isConnected } = useAccount();
  const { usdValue, isLoading: isUsdLoading, error: usdError, isOwner } = useLPPositionUSDValue(tokenId);

  const positionQuery = useQuery({
    queryKey: ["lpPositionWithUSD", tokenId],
    queryFn: async () => {
      if (!tokenId) return null;
      
      // Fetch position details
      const response = await fetch('/api/v1/positions/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch position details");
      }

      const data = await response.json();
      return data.position as LPPosition;
    },
    enabled: !!tokenId,
    staleTime: 30000,
  });

  const position = positionQuery.data;

  const positionWithUsd: LPPositionWithUSD | null = useMemo(() => {
    if (!position) return null;

    return {
      ...position,
      usdValue,
      isUsdLoading,
      usdError,
      isOwner,
    };
  }, [position, usdValue, isUsdLoading, usdError, isOwner]);

  return {
    position: positionWithUsd,
    isLoading: positionQuery.isLoading || isUsdLoading,
    error: positionQuery.error || usdError,
    isConnected,
  };
}

/**
 * Utility function to check if a position is compatible for battles
 */
export function isPositionCompatibleForBattle(position: LPPositionWithUSD): boolean {
  // Must be owned by user
  if (!position.isOwner) return false;
  
  // Must have USD value
  if (!position.usdValue) return false;
  
  // Must have non-zero USD value
  if (position.usdValue.valueUSD === "0") return false;
  
  // Must have liquidity
  if (position.liquidity === "0") return false;
  
  return true;
}

/**
 * Utility function to format USD value for display
 */
export function formatUSDValue(usdValue: LPUSDValue | null): string {
  if (!usdValue || usdValue.valueUSD === "0") {
    return "$0.00";
  }

  const rawValue = parseFloat(usdValue.valueUSD);
  
  // Dynamic conversion to find the real USD value
  // The contract returns values in some unknown unit, we need to find the right divisor
  const divisors = [1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30];
  
  for (const divisor of divisors) {
    const testValue = rawValue / divisor;
    
    // Check if this gives us a reasonable USD amount (between $0.1 and $10,000 for LP positions)
    if (testValue >= 0.1 && testValue <= 10000) {
      return `$${testValue.toFixed(2)}`;
    }
  }
  
  // If no reasonable value found, use the largest divisor
  return `$${(rawValue / 1e30).toFixed(2)}`;
}