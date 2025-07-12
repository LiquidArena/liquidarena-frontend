"use client";

import { CONTRACTS } from "@/lib/contracts";
import { useEffect, useState } from "react";
import { Address } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

// Uniswap V3 NFT Position Manager contract address
const UNISWAP_V3_NFT_ADDRESS =
  "0x3dCc735C74F10FE2B9db2BB55C40fbBbf24490f7" as Address;

// ERC721 ABI for approval functions
const ERC721_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "operator", type: "address" },
    ],
    name: "isApprovedForAll",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface UniswapNFTApprovalState {
  needsApproval: boolean;
  isApproving: boolean;
  isApproved: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash: string | null;
}

export function useUniswapNFTApproval(tokenId?: string) {
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    error: approvalError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const [state, setState] = useState<UniswapNFTApprovalState>({
    needsApproval: false,
    isApproving: false,
    isApproved: false,
    isSuccess: false,
    error: null,
    transactionHash: null,
  });

  // Check if the battle contract is approved for all NFTs
  const { data: isApprovedForAll, isLoading: checkingApproval } =
    useReadContract({
      address: UNISWAP_V3_NFT_ADDRESS,
      abi: ERC721_ABI,
      functionName: "isApprovedForAll",
      args: address ? [address, CONTRACTS.RANGE_BATTLE as Address] : undefined,
      query: { enabled: !!address },
    });

  // Check specific token approval if tokenId is provided
  const { data: approvedAddress } = useReadContract({
    address: UNISWAP_V3_NFT_ADDRESS,
    abi: ERC721_ABI,
    functionName: "getApproved",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: { enabled: !!tokenId },
  });

  // Update approval status
  useEffect(() => {
    if (!address) return;

    const isTokenApproved = tokenId
      ? approvedAddress === CONTRACTS.RANGE_BATTLE || isApprovedForAll
      : isApprovedForAll;

    setState((prev) => ({
      ...prev,
      needsApproval: !isTokenApproved,
      isApproved: !!isTokenApproved,
    }));
  }, [address, isApprovedForAll, approvedAddress, tokenId]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      setState((prev) => ({
        ...prev,
        isApproving: false,
        isSuccess: true,
        isApproved: true,
        needsApproval: false,
        transactionHash: hash,
      }));
    }
  }, [isConfirmed, hash]);

  // Handle transaction pending state
  useEffect(() => {
    if (hash && isConfirming) {
      setState((prev) => ({
        ...prev,
        isApproving: true,
        transactionHash: hash,
      }));
    }
  }, [hash, isConfirming]);

  // Handle errors
  useEffect(() => {
    if (approvalError) {
      setState((prev) => ({
        ...prev,
        error: approvalError.message || "Failed to approve NFT",
        isApproving: false,
      }));
    }
  }, [approvalError]);

  useEffect(() => {
    if (confirmError) {
      setState((prev) => ({
        ...prev,
        error: confirmError.message || "Transaction confirmation failed",
        isApproving: false,
      }));
    }
  }, [confirmError]);

  // Approve specific token
  const approveToken = async (tokenId: string) => {
    if (!address) {
      setState((prev) => ({ ...prev, error: "Please connect your wallet" }));
      return;
    }

    if (!tokenId) {
      setState((prev) => ({ ...prev, error: "Token ID is required" }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isApproving: true,
        error: null,
      }));

      // console.log("Approving Uniswap V3 NFT token:", {
      //   tokenId,
      //   spender: CONTRACTS.RANGE_BATTLE,
      //   nftContract: UNISWAP_V3_NFT_ADDRESS,
      // });

      writeContract({
        address: UNISWAP_V3_NFT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "approve",
        args: [CONTRACTS.RANGE_BATTLE as Address, BigInt(tokenId)],
      });
    } catch (error) {
      console.error("Error approving NFT:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to approve NFT",
        isApproving: false,
      }));
    }
  };

  // Approve all tokens (setApprovalForAll)
  const approveAll = async () => {
    if (!address) {
      setState((prev) => ({ ...prev, error: "Please connect your wallet" }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isApproving: true,
        error: null,
      }));

      // console.log("Approving all Uniswap V3 NFTs for battle contract:", {
      //   operator: CONTRACTS.RANGE_BATTLE,
      //   nftContract: UNISWAP_V3_NFT_ADDRESS,
      // });

      writeContract({
        address: UNISWAP_V3_NFT_ADDRESS,
        abi: ERC721_ABI,
        functionName: "setApprovalForAll",
        args: [CONTRACTS.RANGE_BATTLE as Address, true],
      });
    } catch (error) {
      console.error("Error approving all NFTs:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to approve NFTs",
        isApproving: false,
      }));
    }
  };

  const resetState = () => {
    setState({
      needsApproval: false,
      isApproving: false,
      isApproved: false,
      isSuccess: false,
      error: null,
      transactionHash: null,
    });
    reset();
  };

  return {
    // Actions
    approveToken,
    approveAll,
    resetState,

    // State
    state,

    // Convenience flags
    needsApproval: state.needsApproval && !checkingApproval,
    isApproving: state.isApproving,
    isApproved: state.isApproved,
    isSuccess: state.isSuccess,
    error: state.error,
    transactionHash: state.transactionHash,
    checkingApproval,
  };
}
