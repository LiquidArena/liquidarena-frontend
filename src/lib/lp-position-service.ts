"use client";

import { CONTRACTS } from "@/lib/config";
import { Address } from "viem";

// Types
export interface LPPosition {
  tokenId: string;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  amount0: string;
  amount1: string;
  valueUSD: string;
  fees0: string;
  fees1: string;
  token0Symbol?: string;
  token1Symbol?: string;
  poolName?: string;
}

export interface TokenInfo {
  address: Address;
  symbol: string;
  decimals: number;
  name: string;
}

export interface BattleDetails {
  battleId: string;
  creator: Address;
  opponent?: Address;
  creatorTokenId: string;
  opponentTokenId?: string;
  isResolved: boolean;
  winner?: Address;
  startTime: number;
  duration: number;
  valueUSD: string;
  status: string;
}

// Contract interaction utilities
export class LPPositionService {
  /**
   * Get user's LP token IDs using the Position Manager contract
   */
  static async getUserTokenIds(userAddress: Address): Promise<bigint[]> {
    try {
      const response = await fetch("/api/v1/positions/user-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: userAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch tokens");
      }

      const data = await response.json();
      return data.tokenIds.map((id: string) => BigInt(id));
    } catch (error) {
      console.error("Error fetching user token IDs:", error);
      throw error;
    }
  }

  /**
   * Get detailed position information for a specific token ID from Position Manager
   */
  static async getPositionDetails(tokenId: string): Promise<LPPosition> {
    try {
      const response = await fetch("/api/v1/positions/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific error cases
        if (response.status === 404) {
          throw new Error(
            `Position not found: Token ID ${tokenId} does not exist in the Position Manager`,
          );
        }

        if (response.status === 503) {
          throw new Error(
            `Network error: ${errorData.error || "Service temporarily unavailable"}`,
          );
        }

        throw new Error(
          errorData.error ||
            `Failed to fetch position details (${response.status})`,
        );
      }

      const data = await response.json();
      return data.position as LPPosition;
    } catch (error) {
      // Log the error but don't expose internal details to the UI
      if (
        error instanceof Error &&
        error.message.includes("Position not found")
      ) {
        console.warn(
          `Position ${tokenId} not found in Position Manager - this token ID may not exist`,
        );
      } else {
        console.error(
          `Error fetching position details for token ${tokenId}:`,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Get all LP positions for a user
   */
  static async getUserPositions(userAddress: Address): Promise<LPPosition[]> {
    try {
      const tokenIds = await this.getUserTokenIds(userAddress);

      if (tokenIds.length === 0) {
        return [];
      }

      // Batch fetch position details
      const positionPromises = tokenIds.map(async (tokenId) => {
        try {
          return await this.getPositionDetails(tokenId.toString());
        } catch (error) {
          console.warn(`Failed to fetch position ${tokenId}:`, error);
          return null;
        }
      });

      const positions = await Promise.all(positionPromises);

      // Filter out null positions and closed positions (liquidity = 0)
      const activePositions = positions.filter(
        (position): position is LPPosition => {
          if (position === null) return false;

          // Hide closed positions (liquidity = 0)
          const liquidity = BigInt(position.liquidity);
          if (liquidity === 0n) {
            // console.log(`Hiding closed position ${position.tokenId} (${position.poolName}) - liquidity: ${position.liquidity}`);
            return false;
          }

          // console.log(`Showing active position ${position.tokenId} (${position.poolName}) - liquidity: ${position.liquidity}`);
          return true;
        },
      );

      // console.log(`Filtered ${positions.length} total positions to ${activePositions.length} active positions`);
      return activePositions;
    } catch (error) {
      console.error("Error fetching user positions:", error);
      throw error;
    }
  }

  /**
   * Check if a user can join a battle with their LP position
   */
  static async canJoinBattle(
    battleId: string,
    tokenId: string,
    battleType: "range" | "fee" = "range",
  ): Promise<{ canJoin: boolean; reason: string }> {
    try {
      const contractAddress =
        battleType === "range" ? CONTRACTS.RANGE_BATTLE : CONTRACTS.FEE_BATTLE;

      const response = await fetch("/api/v1/battles/can-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battleId,
          tokenId,
          contractAddress,
          battleType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to check battle eligibility",
        );
      }

      const data = await response.json();
      return { canJoin: data.canJoin, reason: data.reason };
    } catch (error) {
      console.error("Error checking battle eligibility:", error);
      return { canJoin: false, reason: "Error checking eligibility" };
    }
  }

  /**
   * Get battle details for a specific battle ID
   */
  static async getBattleDetails(
    battleId: string,
    battleType: "range" | "fee" = "range",
  ): Promise<BattleDetails> {
    try {
      const contractAddress =
        battleType === "range" ? CONTRACTS.RANGE_BATTLE : CONTRACTS.FEE_BATTLE;

      const response = await fetch("/api/v1/battles/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battleId,
          contractAddress,
          battleType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch battle details");
      }

      const data = await response.json();
      return data.battle as BattleDetails;
    } catch (error) {
      console.error(`Error fetching battle details for ${battleId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active battles
   */
  static async getActiveBattles(
    battleType: "range" | "fee" = "range",
  ): Promise<string[]> {
    try {
      const contractAddress =
        battleType === "range" ? CONTRACTS.RANGE_BATTLE : CONTRACTS.FEE_BATTLE;

      const response = await fetch("/api/v1/battles/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress,
          battleType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch active battles");
      }

      const data = await response.json();
      return data.battleIds;
    } catch (error) {
      console.error("Error fetching active battles:", error);
      throw error;
    }
  }

  /**
   * Get user's battles
   */
  static async getUserBattles(
    userAddress: Address,
    battleType: "range" | "fee" = "range",
  ): Promise<{ battleIds: string[]; isCreator: boolean[] }> {
    try {
      const contractAddress =
        battleType === "range" ? CONTRACTS.RANGE_BATTLE : CONTRACTS.FEE_BATTLE;

      const response = await fetch("/api/v1/battles/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress,
          contractAddress,
          battleType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user battles");
      }

      const data = await response.json();
      return { battleIds: data.battleIds, isCreator: data.isCreator };
    } catch (error) {
      console.error("Error fetching user battles:", error);
      throw error;
    }
  }
}

// Utility functions for mock data and debugging
export function shouldUseMockData(error?: Error): boolean {
  // Use mock data if there's a network error or contract not found
  return (
    !!error &&
    (error.message.includes("network") ||
      error.message.includes("contract") ||
      error.message.includes("not found"))
  );
}

export function generateMockLPPositions(
  _userAddress: Address,
  count: number,
): LPPosition[] {
  const mockPositions: LPPosition[] = [];

  for (let i = 0; i < count; i++) {
    mockPositions.push({
      tokenId: (1000 + i).toString(),
      token0: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address, // USDC
      token1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address, // WETH
      fee: 3000,
      tickLower: -276320,
      tickUpper: -276300,
      liquidity: "1000000000000000000",
      amount0: "1000000000", // 1000 USDC
      amount1: "500000000000000000", // 0.5 WETH
      valueUSD: "2000000000", // $2000
      fees0: "1000000", // 1 USDC
      fees1: "500000000000000", // 0.0005 WETH
      token0Symbol: "USDC",
      token1Symbol: "WETH",
      poolName: "USDC/WETH",
    });
  }

  return mockPositions;
}

export function logPositionDebugInfo(
  userAddress: Address,
  balance: bigint,
  positions: LPPosition[],
): void {
  console.log("=== LP Position Debug Info ===");
  console.log("User Address:", userAddress);
  console.log("LP NFT Balance:", balance.toString());
  console.log("Positions Found:", positions.length);
  console.log("Positions:", positions);
  console.log("==============================");
}
