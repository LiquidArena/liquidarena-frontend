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
  currentStep: 'checking' | 'approval' | 'creation' | 'complete';
}

export function useCreateBattleWithApproval() {
  const { address } = useAccount();
  const { positions, refetch: refetchPositions } = useUserLPPositions();
  
  // Separate write contracts for approval and battle creation
  const { 
    writeContract: writeApproval, 
    data: approvalHash, 
    error: approvalError, 
    reset: resetApproval 
  } = useWriteContract();
  
  const { 
    writeContract: writeBattle, 
    data: battleHash, 
    error: battleError, 
    reset: resetBattle 
  } = useWriteContract();

  // Transaction confirmations
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ 
    hash: approvalHash 
  });
  
  const { isLoading: isBattleConfirming, isSuccess: isBattleSuccess } = useWaitForTransactionReceipt({ 
    hash: battleHash 
  });

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
    currentStep: 'checking',
  });

  const [currentParams, setCurrentParams] = useState<CreateBattleParams | null>(null);

  // Check if approval is needed for a specific token and battle type
  const { data: currentApproval } = useReadContract({
    address: CONTRACTS.POSITION_MANAGER,
    abi: POSITION_MANAGER_ABI,
    functionName: "getApproved",
    args: currentParams ? [BigInt(currentParams.tokenId)] : undefined,
    query: {
      enabled: !!currentParams?.tokenId,
    },
  });

  // Check if approval is needed
  useEffect(() => {
    if (currentParams && currentApproval !== undefined) {
      const battleContractAddress = currentParams.battleType === 'range'
        ? CONTRACTS.RANGE_BATTLE
        : CONTRACTS.FEE_BATTLE;

      const needsApproval = currentApproval.toLowerCase() !== battleContractAddress.toLowerCase();

      setState(prev => ({
        ...prev,
        needsApproval,
        currentStep: needsApproval ? 'approval' : 'creation',
      }));
    }
  }, [currentApproval, currentParams]);

  // Handle approval transaction confirmation
  useEffect(() => {
    if (isApprovalSuccess && approvalHash) {
      setState(prev => ({
        ...prev,
        isApproving: false,
        isApproved: true,
        approvalHash,
        currentStep: 'creation',
      }));
    }
  }, [isApprovalSuccess, approvalHash]);

  // Handle battle creation transaction confirmation
  useEffect(() => {
    if (isBattleSuccess && battleHash) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        isSuccess: true,
        transactionHash: battleHash,
        currentStep: 'complete',
        battleId: "pending", // This should be extracted from transaction logs
      }));

      // Refetch positions since one was used to create a battle
      refetchPositions();
    }
  }, [isBattleSuccess, battleHash, refetchPositions]);

  // Handle approval errors
  useEffect(() => {
    if (approvalError) {
      setState(prev => ({
        ...prev,
        isApproving: false,
        error: `Approval failed: ${approvalError.message}`,
      }));
    }
  }, [approvalError]);

  // Handle battle creation errors
  useEffect(() => {
    if (battleError) {
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: `Battle creation failed: ${battleError.message}`,
      }));
    }
  }, [battleError]);

  // Update approving state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isApproving: isApprovalConfirming,
    }));
  }, [isApprovalConfirming]);

  // Update creating state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isCreating: isBattleConfirming,
    }));
  }, [isBattleConfirming]);

  const startBattleCreation = async (params: CreateBattleParams) => {
    if (!address) {
      setState(prev => ({ ...prev, error: "Please connect your wallet" }));
      return;
    }

    if (!params.tokenId) {
      setState(prev => ({ ...prev, error: "Please select an LP position" }));
      return;
    }

    if (params.duration < 300) {
      setState(prev => ({ ...prev, error: "Battle duration must be at least 5 minutes" }));
      return;
    }

    if (params.duration > 604800) {
      setState(prev => ({ ...prev, error: "Battle duration cannot exceed 7 days" }));
      return;
    }

    // Check if user owns the LP position
    const position = positions.find(p => p.tokenId === params.tokenId);
    if (!position) {
      setState(prev => ({ ...prev, error: "You don't own this LP position" }));
      return;
    }

    // Reset state and set current params
    setState(prev => ({
      ...prev,
      error: null,
      isSuccess: false,
      battleId: null,
      transactionHash: null,
      approvalHash: null,
      isApproved: false,
      currentStep: 'checking',
    }));

    setCurrentParams(params);
  };

  const approveToken = async () => {
    if (!currentParams) return;

    try {
      const battleContractAddress = currentParams.battleType === 'range' 
        ? CONTRACTS.RANGE_BATTLE 
        : CONTRACTS.FEE_BATTLE;

      console.log(`Approving token ${currentParams.tokenId} for ${currentParams.battleType} battle contract:`, battleContractAddress);

      writeApproval({
        address: CONTRACTS.POSITION_MANAGER as Address,
        abi: POSITION_MANAGER_ABI,
        functionName: "approve",
        args: [battleContractAddress as Address, BigInt(currentParams.tokenId)],
      });

    } catch (error) {
      console.error("Error approving token:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to approve token",
      }));
    }
  };

  const createBattle = async () => {
    if (!currentParams) return;

    try {
      const contractAddress = currentParams.battleType === 'range' 
        ? CONTRACTS.RANGE_BATTLE 
        : CONTRACTS.FEE_BATTLE;
      const abi = currentParams.battleType === 'range' ? RANGE_BATTLE_ABI : FEE_BATTLE_ABI;

      console.log(`Creating ${currentParams.battleType} battle with:`, {
        tokenId: currentParams.tokenId,
        duration: currentParams.duration,
        contractAddress,
      });

      writeBattle({
        address: contractAddress as Address,
        abi: abi,
        functionName: "createBattle",
        args: [BigInt(currentParams.tokenId), BigInt(currentParams.duration)],
      });

    } catch (error) {
      console.error("Error creating battle:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to create battle",
      }));
    }
  };

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
      currentStep: 'checking',
    });
    setCurrentParams(null);
    resetApproval();
    resetBattle();
  };

  return {
    // Actions
    startBattleCreation,
    approveToken,
    createBattle,
    resetState,
    
    // State
    state,
    currentParams,
    
    // Convenience flags
    needsApproval: state.needsApproval,
    isApproving: state.isApproving,
    isApproved: state.isApproved,
    isCreating: state.isCreating,
    isSuccess: state.isSuccess,
    error: state.error,
    currentStep: state.currentStep,
    battleId: state.battleId,
    transactionHash: state.transactionHash,
    approvalHash: state.approvalHash,
  };
}
