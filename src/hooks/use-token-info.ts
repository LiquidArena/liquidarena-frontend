"use client";

import { ERC20_ABI } from "@/contracts/abis";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { useReadContracts } from "wagmi";

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

export interface UseTokenInfoResult {
  tokenInfo: TokenInfo | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch real token information from the blockchain using ERC-20 contract calls
 * @param tokenAddress - The token contract address
 * @returns Token information including symbol, decimals, and name
 */
export function useTokenInfo(
  tokenAddress: string | undefined,
): UseTokenInfoResult {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prepare contract calls for token metadata
  const contracts = tokenAddress
    ? [
        {
          address: tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "symbol",
        },
        {
          address: tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "decimals",
        },
        {
          address: tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "name",
        },
      ]
    : [];

  const {
    data: contractResults,
    isLoading,
    error: contractError,
  } = useReadContracts({
    contracts,
    query: {
      enabled:
        !!tokenAddress &&
        tokenAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  useEffect(() => {
    if (!tokenAddress) {
      setTokenInfo(null);
      setError(null);
      return;
    }

    if (contractError) {
      console.error(
        `Error fetching token info for ${tokenAddress}:`,
        contractError,
      );
      setError(contractError.message || "Failed to fetch token information");
      return;
    }

    if (contractResults && contractResults.length === 3) {
      try {
        const [symbolResult, decimalsResult, nameResult] = contractResults;

        // Check if all calls were successful
        if (
          symbolResult.status === "success" &&
          decimalsResult.status === "success" &&
          nameResult.status === "success"
        ) {
          const info: TokenInfo = {
            address: tokenAddress,
            symbol: symbolResult.result as string,
            decimals: Number(decimalsResult.result),
            name: nameResult.result as string,
          };

          setTokenInfo(info);
          setError(null);
        } else {
          // Handle individual call failures
          const failedCalls = [];
          if (symbolResult.status === "failure") failedCalls.push("symbol");
          if (decimalsResult.status === "failure") failedCalls.push("decimals");
          if (nameResult.status === "failure") failedCalls.push("name");

          setError(`Failed to fetch: ${failedCalls.join(", ")}`);
        }
      } catch (err) {
        console.error("Error parsing token info:", err);
        setError("Failed to parse token information");
      }
    }
  }, [contractResults, contractError, tokenAddress]);

  return {
    tokenInfo,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch information for multiple tokens at once
 * @param tokenAddresses - Array of token contract addresses
 * @returns Map of token address to token information
 */
export function useMultipleTokenInfo(tokenAddresses: (string | undefined)[]): {
  tokenInfoMap: Map<string, TokenInfo>;
  isLoading: boolean;
  errors: Map<string, string>;
} {
  const [tokenInfoMap, setTokenInfoMap] = useState<Map<string, TokenInfo>>(
    new Map(),
  );
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  // Filter out undefined addresses and create contract calls
  const validAddresses = useMemo(
    () =>
      tokenAddresses.filter(
        (addr): addr is string =>
          !!addr && addr !== "0x0000000000000000000000000000000000000000",
      ),
    [tokenAddresses],
  );

  const contracts = useMemo(
    () =>
      validAddresses.flatMap((address) => [
        {
          address: address as Address,
          abi: ERC20_ABI,
          functionName: "symbol",
        },
        {
          address: address as Address,
          abi: ERC20_ABI,
          functionName: "decimals",
        },
        {
          address: address as Address,
          abi: ERC20_ABI,
          functionName: "name",
        },
      ]),
    [validAddresses],
  );

  const {
    data: contractResults,
    isLoading,
    error: contractError,
  } = useReadContracts({
    contracts,
    query: {
      enabled: validAddresses.length > 0,
    },
  });

  // Memoize the processed token info map and errors to prevent infinite re-renders
  const { processedTokenInfoMap, processedErrors } = useMemo(() => {
    if (!contractResults || validAddresses.length === 0) {
      return {
        processedTokenInfoMap: new Map<string, TokenInfo>(),
        processedErrors: new Map<string, string>(),
      };
    }

    const newTokenInfoMap = new Map<string, TokenInfo>();
    const newErrors = new Map<string, string>();

    // Process results in groups of 3 (symbol, decimals, name)
    for (let i = 0; i < validAddresses.length; i++) {
      const address = validAddresses[i];
      const startIndex = i * 3;
      const symbolResult = contractResults[startIndex];
      const decimalsResult = contractResults[startIndex + 1];
      const nameResult = contractResults[startIndex + 2];

      if (
        symbolResult?.status === "success" &&
        decimalsResult?.status === "success" &&
        nameResult?.status === "success"
      ) {
        const info: TokenInfo = {
          address,
          symbol: symbolResult.result as string,
          decimals: Number(decimalsResult.result),
          name: nameResult.result as string,
        };
        newTokenInfoMap.set(address, info);
      } else {
        const failedCalls = [];
        if (symbolResult?.status === "failure") failedCalls.push("symbol");
        if (decimalsResult?.status === "failure") failedCalls.push("decimals");
        if (nameResult?.status === "failure") failedCalls.push("name");

        newErrors.set(address, `Failed to fetch: ${failedCalls.join(", ")}`);
      }
    }

    return {
      processedTokenInfoMap: newTokenInfoMap,
      processedErrors: newErrors,
    };
  }, [contractResults, validAddresses]);

  useEffect(() => {
    setTokenInfoMap(processedTokenInfoMap);
    setErrors(processedErrors);
  }, [processedTokenInfoMap, processedErrors]);

  return {
    tokenInfoMap,
    isLoading,
    errors,
  };
}
