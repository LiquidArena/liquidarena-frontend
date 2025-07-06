"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { Address } from "viem";
import { CONTRACTS } from "@/lib/config";
import { RANGE_BATTLE_ABI, POSITION_MANAGER_ABI } from "@/contracts/abis";

export interface JoinBattleParams {
  battleId: string;
  tokenId: string;
}

export interface JoinBattleState {
  // Approval step
  needsApproval: boolean;
  isApproving: boolean;
  isApproved: boolean;
  approvalHash: string | null;
  
  // Battle joining step
  isJoining: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash: string | null;
  
  // Current step
  currentStep: 'checking' | 'approval' | 'joining' | 'complete';
}

export function useJoinBattleWithApproval() {
  const { address } = useAccount();
  
  // Separate write contracts for approval and battle joining
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

  const [state, setState] = useState<JoinBattleState>({
    needsApproval: false,
    isApproving: false,
    isApproved: false,
    approvalHash: null,
    isJoining: false,
    isSuccess: false,
    error: null,
    transactionHash: null,
    currentStep: 'checking',
  });

  const [currentParams, setCurrentParams] = useState<JoinBattleParams | null>(null);

  // Check if approval is needed for the specific token
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
      const battleContractAddress = CONTRACTS.RANGE_BATTLE;
      const needsApproval = currentApproval.toLowerCase() !== battleContractAddress.toLowerCase();

      setState(prev => ({
        ...prev,
        needsApproval,
        currentStep: needsApproval ? 'approval' : 'joining',
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
        currentStep: 'joining',
      }));
    }
  }, [isApprovalSuccess, approvalHash]);

  // Handle battle joining transaction confirmation
  useEffect(() => {
    if (isBattleSuccess && battleHash) {
      setState(prev => ({
        ...prev,
        isJoining: false,
        isSuccess: true,
        transactionHash: battleHash,
        currentStep: 'complete',
      }));
    }
  }, [isBattleSuccess, battleHash]);

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

  // Handle battle joining errors
  useEffect(() => {
    if (battleError) {
      setState(prev => ({
        ...prev,
        isJoining: false,
        error: `Join battle failed: ${battleError.message}`,
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

  // Update joining state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isJoining: isBattleConfirming,
    }));
  }, [isBattleConfirming]);

  const startJoinBattle = async (params: JoinBattleParams) => {
    if (!address) {
      setState(prev => ({ ...prev, error: "Please connect your wallet" }));
      return;
    }

    if (!params.tokenId) {
      setState(prev => ({ ...prev, error: "Please select an LP position" }));
      return;
    }

    if (!params.battleId) {
      setState(prev => ({ ...prev, error: "Battle ID is required" }));
      return;
    }

    // Reset state and set current params
    setState(prev => ({
      ...prev,
      error: null,
      isSuccess: false,
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
      const battleContractAddress = CONTRACTS.RANGE_BATTLE;

      console.log(`Approving token ${currentParams.tokenId} for range battle contract:`, battleContractAddress);

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

  const joinBattle = async () => {
    if (!currentParams) return;

    try {
      console.log(`Joining battle with:`, {
        battleId: currentParams.battleId,
        tokenId: currentParams.tokenId,
      });

      writeBattle({
        address: CONTRACTS.RANGE_BATTLE as Address,
        abi: RANGE_BATTLE_ABI,
        functionName: "joinBattle",
        args: [BigInt(currentParams.battleId), BigInt(currentParams.tokenId)],
      });

    } catch (error) {
      console.error("Error joining battle:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to join battle",
      }));
    }
  };

  const resetState = () => {
    setState({
      needsApproval: false,
      isApproving: false,
      isApproved: false,
      approvalHash: null,
      isJoining: false,
      isSuccess: false,
      error: null,
      transactionHash: null,
      currentStep: 'checking',
    });
    setCurrentParams(null);
    resetApproval();
    resetBattle();
  };

  return {
    // Actions
    startJoinBattle,
    approveToken,
    joinBattle,
    resetState,
    
    // State
    state,
    currentParams,
    
    // Convenience flags
    needsApproval: state.needsApproval,
    isApproving: state.isApproving,
    isApproved: state.isApproved,
    isJoining: state.isJoining,
    isSuccess: state.isSuccess,
    error: state.error,
    currentStep: state.currentStep,
    transactionHash: state.transactionHash,
    approvalHash: state.approvalHash,
  };
}