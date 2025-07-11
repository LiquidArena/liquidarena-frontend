"use client";

import { BattleHeader } from "./battle-room/battle-header";
import { BattleParticipants } from "./battle-room/battle-participants";
import {
  BattleEndedState,
  LoadingState,
  NotFoundState,
  ReadyToResolveState,
  WaitingForOpponentState,
} from "./battle-room/battle-status-cards";
import { BattleTimer } from "./battle-room/battle-timer";
import { LPPositionSelector } from "./battle-room/lp-position-selector";
import { BattleViewProps } from "./battle-room/types";
import { useBattleLogic } from "./battle-room/use-battle-logic";

// Export the utility function for external use
export { getDurationLeft } from "./battle-room/utils";

export default function BattleView({ battleId }: BattleViewProps) {
  const {
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
    userLPPositions,
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
  } = useBattleLogic(battleId);

  // Loading state
  if (battleStatus === "loading") {
    return <LoadingState />;
  }

  // Battle not found state
  if (battleStatus === "notFound") {
    return <NotFoundState battleError={battleError?.message as string} />;
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-24">
      <BattleHeader
        battleId={battleId}
        battleDetails={battleDetails}
        battleStatus={battleStatus}
        requiredStakeValue={requiredStakeValue}
      />

      {/* Waiting for Opponent */}
      {battleStatus === "waitingForOpponent" && <WaitingForOpponentState />}

      {/* LP Position Selection */}
      {battleStatus === "selectingPosition" && (
        <LPPositionSelector
          requiredStakeValue={requiredStakeValue}
          minValue={minValue}
          maxValue={maxValue}
          userLPPositions={userLPPositions}
          isLoadingPositions={isLoadingPositions}
          selectedPool={selectedPool}
          setSelectedPool={setSelectedPool}
          joinError={joinError}
          isApproving={isApproving}
          isJoining={isJoining}
          currentStep={currentStep}
          handleApprove={handleApprove}
          handleActualJoin={handleActualJoin}
          handleJoinBattle={handleJoinBattle}
        />
      )}

      {/* Ongoing Battle */}
      {battleStatus === "ongoing" && battleDetails && (
        <>
          <BattleTimer
            timeRemaining={timeRemaining}
            battleDetails={battleDetails}
          />
          <BattleParticipants battleDetails={battleDetails} />
        </>
      )}

      {/* Ready to Resolve */}
      {battleStatus === "readyToResolve" && (
        <ReadyToResolveState
          handleResolveBattle={handleResolveBattle}
          isResolving={isResolving}
          resolveError={resolveError}
        />
      )}

      {/* Battle Ended */}
      {battleStatus === "ended" && battleDetails && (
        <BattleEndedState battleDetails={battleDetails} />
      )}
    </div>
  );
}
