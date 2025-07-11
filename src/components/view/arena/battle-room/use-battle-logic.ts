"use client";

import {
  BattleDetails,
  useCompleteBattleDetails,
} from "@/hooks/use-battle-contract";
import { useAvailableBattlePositions } from "@/hooks/use-create-battle";
import { useJoinBattleWithApproval } from "@/hooks/use-join-battle-with-approval";
import { useLPPositionUSDValue } from "@/hooks/use-lp-usd-value";
import { useResolveBattle } from "@/hooks/use-resolve-battle";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { BattleStatus, LPPosition } from "./types";
import {
  calculateRequiredStakeValue,
  calculateToleranceRange,
  getBattleStatus,
  getDurationLeft,
  getPositionCompatibility,
  sortLPPositionsByCompatibility,
} from "./utils";
import { getUSDDisplay } from "./utils";

export function useBattleLogic(battleId: string) {
  const { address } = useAccount();
  const [selectedPool, setSelectedPool] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Fetch battle details from smart contract
  const {
    battleDetails,
    isLoading: isBattleLoading,
    error: battleError,
  } = useCompleteBattleDetails(battleId || undefined);

  // Join battle with approval functionality
  const {
    startJoinBattle,
    approveToken,
    joinBattle,
    isApproving,
    isJoining,
    isSuccess: joinSuccess,
    error: joinError,
    currentStep,
  } = useJoinBattleWithApproval();

  // Resolve battle functionality
  const {
    resolveBattle,
    isResolving,
    isSuccess: resolveSuccess,
    error: resolveError,
  } = useResolveBattle();

  // User LP positions for joining
  const { positions: userLPPositions, isLoading: isLoadingPositions } =
    useAvailableBattlePositions();

  // Calculate battle status
  const battleStatus: BattleStatus = useMemo(
    () =>
      getBattleStatus(
        battleDetails as BattleDetails,
        isBattleLoading,
        battleError,
        address,
      ),
    [battleDetails, isBattleLoading, battleError, address],
  );

  // Calculate required stake value and tolerance range
  const requiredStakeValue = useMemo(
    () => calculateRequiredStakeValue(battleDetails?.usdValue),
    [battleDetails?.usdValue],
  );

  const { minValue, maxValue } = useMemo(
    () => calculateToleranceRange(requiredStakeValue),
    [requiredStakeValue],
  );

  // Sort LP positions by compatibility
  const sortedLPPositions = useMemo(() => {
    if (!userLPPositions.length) return [];

    // We need to create a compatibility checker that works with the current data
    const getCompatibilityForPosition = (position: LPPosition) => {
      // This is a simplified approach - in practice, you might want to
      // pre-fetch USD values or use a different strategy
      return true; // Placeholder
    };

    return sortLPPositionsByCompatibility(
      userLPPositions,
      getCompatibilityForPosition,
    );
  }, [userLPPositions, minValue, maxValue]);

  // Update time remaining for ongoing battles
  useEffect(() => {
    if (battleStatus === "ongoing" && battleDetails) {
      const updateTimer = () => {
        const durationInfo = getDurationLeft(battleDetails);
        setTimeRemaining(durationInfo.secondsLeft);
      };

      updateTimer(); // Initial update
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [battleStatus, battleDetails]);

  // Handle successful join
  useEffect(() => {
    if (joinSuccess) {
      window.location.reload();
    }
  }, [joinSuccess]);

  // Handle successful resolve
  useEffect(() => {
    if (resolveSuccess) {
      window.location.reload();
    }
  }, [resolveSuccess]);

  // Battle action handlers
  const handleJoinBattle = async () => {
    if (!selectedPool || !battleId) return;

    const selectedPosition = userLPPositions.find(
      (pos: { tokenId: string }) => pos.tokenId === selectedPool,
    );
    if (!selectedPosition?.tokenId) return;

    await startJoinBattle({
      battleId: battleId,
      tokenId: selectedPosition.tokenId,
    });
  };

  const handleApprove = async () => {
    await approveToken();
  };

  const handleActualJoin = async () => {
    await joinBattle();
  };

  const handleResolveBattle = async () => {
    if (battleId) {
      await resolveBattle(battleId, "range");
    }
  };

  return {
    // Battle data
    battleDetails,
    battleStatus,
    battleError,
    isBattleLoading,

    // Calculated values
    requiredStakeValue,
    minValue,
    maxValue,
    timeRemaining,

    // LP positions
    userLPPositions: sortedLPPositions,
    isLoadingPositions,
    selectedPool,
    setSelectedPool,

    // Join battle state
    isApproving,
    isJoining,
    joinError,
    currentStep,

    // Resolve battle state
    isResolving,
    resolveError,

    // Action handlers
    handleJoinBattle,
    handleApprove,
    handleActualJoin,
    handleResolveBattle,
  };
}
