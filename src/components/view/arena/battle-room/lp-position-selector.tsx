"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GradientLine from "@/components/ui/cards/gradient-line";
import { GradientButton } from "@/components/ui/gradient-button";
import { useLPPositionUSDValue } from "@/hooks/use-lp-usd-value";
import { useEffect, useMemo, useState } from "react";

import { LPPositionCard } from "./lp-position-card";
import { LPPositionSelectorProps } from "./types";
import { getPositionCompatibility } from "./utils";
import { getUSDDisplay } from "./utils";

// Hook to get compatibility for a position
function usePositionCompatibility(
  tokenId: string,
  minValue: number,
  maxValue: number,
) {
  const { usdValue, isLoading, error, isConnected, isOwner } =
    useLPPositionUSDValue(tokenId);

  return useMemo(() => {
    if (!isConnected || !isOwner || error || isLoading) {
      return { isCompatible: false, isLoading, error };
    }

    const usdInfo = getUSDDisplay(
      usdValue,
      isConnected,
      isOwner,
      isLoading,
      error,
    );
    const isCompatible = getPositionCompatibility(
      usdInfo.numericValue,
      minValue,
      maxValue,
    );

    return { isCompatible, isLoading: false, error: null };
  }, [usdValue, isConnected, isOwner, error, isLoading, minValue, maxValue]);
}

export function LPPositionSelector({
  userLPPositions,
  isLoadingPositions,
  selectedPool,
  setSelectedPool,
  requiredStakeValue,
  minValue,
  maxValue,
  joinError,
  currentStep,
  isApproving,
  isJoining,
  handleApprove,
  handleActualJoin,
  handleJoinBattle,
}: LPPositionSelectorProps) {
  // State to track compatibility for each position
  const [positionCompatibility, setPositionCompatibility] = useState<
    Record<string, boolean>
  >({});

  // Sort positions by compatibility - compatible positions first
  const sortedPositions = useMemo(() => {
    return [...userLPPositions].sort((a, b) => {
      const aCompatible = positionCompatibility[a.tokenId] ?? false;
      const bCompatible = positionCompatibility[b.tokenId] ?? false;

      // Compatible positions first
      if (aCompatible && !bCompatible) return -1;
      if (!aCompatible && bCompatible) return 1;

      // Within same compatibility group, sort by tokenId
      return parseInt(a.tokenId) - parseInt(b.tokenId);
    });
  }, [userLPPositions, positionCompatibility]);

  return (
    <Card className="relative bg-black/40 border-cyan-800/30 backdrop-blur-sm overflow-hidden">
      <GradientLine />
      <CardHeader>
        <CardTitle className="text-white text-2xl font-bold">
          Select Your LP Position
        </CardTitle>
        <CardDescription className="text-gray-300">
          Choose your LP token to stake in this battle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 p-3 bg-gray-900/20 border border-purple-400/30 rounded-lg">
          <div className="text-sm bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent font-medium">
            Required Stake Value
          </div>
          <div className="text-white text-lg font-bold">
            ${requiredStakeValue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">
            Accepted range: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)} (±5%
            tolerance)
          </div>
        </div>

        {isLoadingPositions ? (
          <div className="text-center py-4">
            <div className="text-white">Loading your LP positions...</div>
          </div>
        ) : userLPPositions.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-white font-medium">
              Your LP Positions
              <span className="text-xs text-gray-400 ml-2">
                (Compatible positions shown first)
              </span>
            </div>
            <div className="grid gap-3">
              {sortedPositions.map((position) => (
                <LPPositionCardWithCompatibility
                  key={position.tokenId}
                  position={position}
                  isSelected={selectedPool === position.tokenId}
                  onSelect={() => setSelectedPool(position.tokenId)}
                  minValue={minValue}
                  maxValue={maxValue}
                  onCompatibilityChange={(tokenId, isCompatible) => {
                    setPositionCompatibility((prev) => ({
                      ...prev,
                      [tokenId]: isCompatible,
                    }));
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-red-400 text-lg mb-2">
              No LP Positions Found
            </div>
            <div className="text-gray-400 text-sm">
              You need to create LP positions first to join battles
            </div>
          </div>
        )}

        {joinError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-400/30 rounded-lg">
            <div className="text-red-400 text-sm">{joinError}</div>
          </div>
        )}

        <GradientButton
          onClick={
            currentStep === "approval"
              ? handleApprove
              : currentStep === "joining"
                ? handleActualJoin
                : handleJoinBattle
          }
          disabled={
            !selectedPool ||
            isApproving ||
            isJoining ||
            isLoadingPositions ||
            userLPPositions.length === 0
          }
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
          size="lg"
        >
          {isApproving
            ? "Approving NFT..."
            : isJoining
              ? "Joining Battle..."
              : isLoadingPositions
                ? "Loading Positions..."
                : userLPPositions.length === 0
                  ? "No LP Positions"
                  : !selectedPool
                    ? "Select a Position"
                    : currentStep === "approval"
                      ? "Approve NFT"
                      : currentStep === "joining"
                        ? "Join Battle"
                        : "Join Battle"}
        </GradientButton>
      </CardContent>
    </Card>
  );
}

// Helper component that includes compatibility checking
function LPPositionCardWithCompatibility({
  position,
  isSelected,
  onSelect,
  minValue,
  maxValue,
  onCompatibilityChange,
}: {
  position: any;
  isSelected: boolean;
  onSelect: () => void;
  minValue: number;
  maxValue: number;
  onCompatibilityChange: (tokenId: string, isCompatible: boolean) => void;
}) {
  const { usdValue, isLoading, error, isConnected, isOwner } =
    useLPPositionUSDValue(position.tokenId);

  const usdInfo = getUSDDisplay(
    usdValue,
    isConnected,
    isOwner,
    isLoading,
    error,
  );
  const isCompatible = getPositionCompatibility(
    usdInfo.numericValue,
    minValue,
    maxValue,
  );

  // Report compatibility back to parent
  useEffect(() => {
    if (!isLoading && isConnected && isOwner !== undefined) {
      onCompatibilityChange(position.tokenId, isCompatible);
    }
  }, [position.tokenId, isCompatible, isLoading, isConnected, isOwner]);

  return (
    <LPPositionCard
      position={position}
      isSelected={isSelected}
      onSelect={onSelect}
      minValue={minValue}
      maxValue={maxValue}
    />
  );
}
