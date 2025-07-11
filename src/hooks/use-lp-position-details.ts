"use client";

import { RANGE_BATTLE_ABI } from "@/contracts/abis";
import { CONTRACTS } from "@/lib/contracts";
import { useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";

import { TokenInfo, useMultipleTokenInfo } from "./use-token-info";

export interface LPPositionDetails {
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  amount0: string;
  amount1: string;
  valueUSD: string;
  fees0: string;
  fees1: string;
}

// Re-export TokenInfo for backward compatibility
export type { TokenInfo };

export function useLPPositionDetailsContract(tokenId: string | undefined) {
  const [positionDetails, setPositionDetails] =
    useState<LPPositionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Read position details from contract
  const {
    data: contractData,
    isLoading: isContractLoading,
    error: contractError,
  } = useReadContract({
    address: CONTRACTS.RANGE_BATTLE,
    abi: RANGE_BATTLE_ABI,
    functionName: "getPositionDetails",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  // Get token info for both tokens - memoize to prevent unnecessary re-renders
  const tokenAddresses = useMemo(
    () =>
      positionDetails ? [positionDetails.token0, positionDetails.token1] : [],
    [positionDetails?.token0, positionDetails?.token1],
  );
  const { tokenInfoMap, isLoading: isTokenInfoLoading } =
    useMultipleTokenInfo(tokenAddresses);
  const token0Info = positionDetails
    ? tokenInfoMap.get(positionDetails.token0) || null
    : null;
  const token1Info = positionDetails
    ? tokenInfoMap.get(positionDetails.token1) || null
    : null;

  useEffect(() => {
    if (contractData && Array.isArray(contractData)) {
      try {
        const [
          token0,
          token1,
          fee,
          tickLower,
          tickUpper,
          liquidity,
          amount0,
          amount1,
          valueUSD,
          fees0,
          fees1,
        ] = contractData;

        const details: LPPositionDetails = {
          token0: token0 as string,
          token1: token1 as string,
          fee: Number(fee),
          tickLower: Number(tickLower),
          tickUpper: Number(tickUpper),
          liquidity: liquidity.toString(),
          amount0: amount0.toString(),
          amount1: amount1.toString(),
          valueUSD: valueUSD.toString(),
          fees0: fees0.toString(),
          fees1: fees1.toString(),
        };

        setPositionDetails(details);
        setError(null);
      } catch (err) {
        console.error("Error parsing position details:", err);
        setError("Failed to parse position details");
      }
    } else if (contractError) {
      setError(contractError.message || "Failed to fetch position details");
    }
  }, [contractData, contractError]);

  // Fallback mock data for demo purposes when contract call fails
  useEffect(() => {
    if (!tokenId) return;

    if (contractError && !positionDetails) {
      // Generate mock position data based on tokenId for demo
      const mockDetails: LPPositionDetails = {
        token0: `0x${tokenId.padStart(40, "0")}`,
        token1: `0x${(parseInt(tokenId) + 1).toString().padStart(40, "0")}`,
        fee: 3000, // 0.3%
        tickLower: -887220, // Wide range for demo
        tickUpper: 887220,
        liquidity: "1000000000000000000",
        amount0: "1000000000000000000",
        amount1: "1000000000",
        valueUSD: "2000000000000000000000", // $2000
        fees0: "1000000000000000",
        fees1: "1000000",
      };

      setPositionDetails(mockDetails);
      setError(null);
    }
  }, [tokenId, contractError]);

  return {
    positionDetails,
    token0Info,
    token1Info,
    isLoading: isContractLoading || isTokenInfoLoading,
    error,
  };
}
