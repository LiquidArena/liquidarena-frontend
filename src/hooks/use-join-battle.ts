"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { RANGE_BATTLE_ABI } from "@/contracts/abis";
import { useState } from "react";

export function useJoinBattle() {
  const [battleId, setBattleId] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  
  const {
    writeContract,
    data: hash,
    isPending: isJoining,
    error: joinError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const joinBattle = async (battleIdParam: string, tokenIdParam: string) => {
    setBattleId(battleIdParam);
    setTokenId(tokenIdParam);
    
    try {
      await writeContract({
        address: CONTRACTS.RANGE_BATTLE,
        abi: RANGE_BATTLE_ABI,
        functionName: "joinBattle",
        args: [BigInt(battleIdParam), BigInt(tokenIdParam)],
      });
    } catch (error) {
      console.error("Failed to join battle:", error);
      throw error;
    }
  };

  const resetState = () => {
    setBattleId("");
    setTokenId("");
  };

  return {
    joinBattle,
    resetState,
    battleId,
    tokenId,
    hash,
    isJoining,
    isConfirming,
    isConfirmed,
    error: joinError || confirmError,
    isLoading: isJoining || isConfirming,
  };
}