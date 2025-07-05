"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { Address } from "viem";
import { CONTRACTS } from "@/lib/config";
import { RANGE_BATTLE_ABI, FEE_BATTLE_ABI, POSITION_MANAGER_ABI } from "@/contracts/abis";
import { useUserLPPositions } from "./use-lp-positions";

export interface CreateBattleParams {
  tokenId: string;
  duration: number; // in seconds
  battleType: 'range' | 'fee';
}

export interface CreateBattleState {
  // Approval step
  needsApproval: boolean;
  isApproving: boolean;
  isApproved: boolean;
  approvalHash: string | null;

  // Battle creation step
  isCreating: boolean;
  isSuccess: boolean;
  error: string | null;
  battleId: string | null;
  transactionHash: string | null;

  // Current step
  currentStep: 'approval' | 'creation' | 'complete';
}

export function useCreateBattle() {
  const { address } = useAccount();
  const { positions, refetch: refetchPositions } = useUserLPPositions();
  const { writeContract, data: hash, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [state, setState] = useState<CreateBattleState>({
    needsApproval: false,
    isApproving: false,
    isApproved: false,
    approvalHash: null,
    isCreating: false,
    isSuccess: false,
    error: null,
    battleId: null,
    transactionHash: null,
    currentStep: 'approval',
  });

  const createBattle = async (params: CreateBattleParams) => {
    if (!address) {
      setState(prev => ({ ...prev, error: "Please connect your wallet" }));
      return;
    }

    if (!params.tokenId) {
      setState(prev => ({ ...prev, error: "Please select an LP position" }));
      return;
    }

    if (params.duration < 300) { // 5 minutes minimum
      setState(prev => ({ ...prev, error: "Battle duration must be at least 5 minutes" }));
      return;
    }

    if (params.duration > 604800) { // 7 days maximum
      setState(prev => ({ ...prev, error: "Battle duration cannot exceed 7 days" }));
      return;
    }

    // Check if user owns the LP position
    const position = positions.find(p => p.tokenId === params.tokenId);
    if (!position) {
      setState(prev => ({ ...prev, error: "You don't own this LP position" }));
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isCreating: true, 
        error: null,
        isSuccess: false,
        battleId: null,
        transactionHash: null
      }));

      const contractAddress = params.battleType === 'range' ? CONTRACTS.RANGE_BATTLE : CONTRACTS.FEE_BATTLE;
      const abi = params.battleType === 'range' ? RANGE_BATTLE_ABI : FEE_BATTLE_ABI;

      console.log(`Creating ${params.battleType} battle with:`, {
        tokenId: params.tokenId,
        duration: params.duration,
        contractAddress,
        position
      });

      writeContract({
        address: contractAddress as Address,
        abi: abi,
        functionName: "createBattle",
        args: [BigInt(params.tokenId), BigInt(params.duration)],
      });

    } catch (error) {
      console.error("Error creating battle:", error);
      setState(prev => ({ 
        ...prev, 
        isCreating: false, 
        error: error instanceof Error ? error.message : "Failed to create battle" 
      }));
    }
  };

  // Update state when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        isSuccess: true,
        transactionHash: hash,
        // Note: We would need to parse the transaction receipt to get the actual battle ID
        // For now, we'll set it to a placeholder
        battleId: "pending" // This should be extracted from the transaction logs
      }));

      // Refetch positions since one was used to create a battle
      refetchPositions();
    }
  }, [isSuccess, hash, refetchPositions]);

  // Update state when there's a write error
  useEffect(() => {
    if (writeError) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: writeError.message || "Failed to create battle"
      }));
    }
  }, [writeError]);

  // Update creating state based on confirmation status
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isCreating: isConfirming
    }));
  }, [isConfirming]);

  const resetState = () => {
    setState({
      needsApproval: false,
      isApproving: false,
      isApproved: false,
      approvalHash: null,
      isCreating: false,
      isSuccess: false,
      error: null,
      battleId: null,
      transactionHash: null,
      currentStep: 'approval',
    });
    reset();
  };

  return {
    createBattle,
    resetState,
    state,
    // Convenience flags
    isCreating: state.isCreating,
    isSuccess: state.isSuccess,
    error: state.error,
    battleId: state.battleId,
    transactionHash: state.transactionHash,
  };
}

// Hook for getting available LP positions for battle creation
export function useAvailableBattlePositions() {
  const { positions, isLoading, error } = useUserLPPositions();

  // Filter positions that can be used for battles
  // Hide closed positions (positions with 0 liquidity)
  const availablePositions = positions.filter(position => {
    // Only show positions with active liquidity
    const liquidity = BigInt(position.liquidity || '0');
    return liquidity > 0n;
  });

  return {
    positions: availablePositions,
    isLoading,
    error,
    hasPositions: availablePositions.length > 0,
  };
}

// Duration options for battle creation
export const BATTLE_DURATIONS = [
  { label: "5 minutes", value: 300, description: "Quick battle" },
  { label: "15 minutes", value: 900, description: "Short battle" },
  { label: "30 minutes", value: 1800, description: "Medium battle" },
  { label: "1 hour", value: 3600, description: "Standard battle" },
  { label: "2 hours", value: 7200, description: "Extended battle" },
  { label: "4 hours", value: 14400, description: "Long battle" },
  { label: "8 hours", value: 28800, description: "Marathon battle" },
  { label: "1 day", value: 86400, description: "Daily battle" },
  { label: "3 days", value: 259200, description: "Multi-day battle" },
  { label: "7 days", value: 604800, description: "Weekly battle" },
] as const;

// Utility function to format duration
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// Utility function to get duration description
export function getDurationDescription(seconds: number): string {
  const duration = BATTLE_DURATIONS.find(d => d.value === seconds);
  return duration?.description || "Custom duration";
}
