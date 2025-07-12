"use client";

import { RANGE_BATTLE_ABI } from "@/contracts/abis";
import { CONTRACTS } from "@/lib/config";
import React, { useState } from "react";
import { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function useResolveBattle() {
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContract,
    data: transactionHash,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const resolveBattle = async (
    battleId: string,
    resolutionType: "range" | "fee" = "range",
  ) => {
    if (!battleId) {
      setError("Battle ID is required");
      return;
    }

    try {
      setIsResolving(true);
      setError(null);

      // console.log(`Resolving ${resolutionType} battle:`, battleId);

      // Use the range battle contract (adjust if you need fee battle support)
      const contractAddress =
        resolutionType === "range"
          ? CONTRACTS.RANGE_BATTLE
          : CONTRACTS.FEE_BATTLE;

      writeContract({
        address: contractAddress as Address,
        abi: RANGE_BATTLE_ABI,
        functionName: "resolveBattle",
        args: [BigInt(battleId)],
      });
    } catch (err) {
      console.error("Error resolving battle:", err);
      setError(err instanceof Error ? err.message : "Failed to resolve battle");
      setIsResolving(false);
    }
  };

  // Update resolving state based on transaction status
  React.useEffect(() => {
    if (isConfirming) {
      setIsResolving(true);
    } else if (isSuccess || writeError) {
      setIsResolving(false);
    }
  }, [isConfirming, isSuccess, writeError]);

  // Handle write errors
  React.useEffect(() => {
    if (writeError) {
      setError(`Transaction failed: ${writeError.message}`);
    }
  }, [writeError]);

  return {
    resolveBattle,
    isResolving: isResolving || isConfirming,
    isSuccess,
    error,
    transactionHash,
  };
}
