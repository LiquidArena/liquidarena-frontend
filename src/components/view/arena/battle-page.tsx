"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GradientLine from "@/components/ui/cards/gradient-line";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { GradientButton, GradientLink } from "@/components/ui/gradient-button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BattleDetails,
  useCompleteBattleDetails,
} from "@/hooks/use-battle-contract";
import { useAvailableBattlePositions } from "@/hooks/use-create-battle";
import { useJoinBattleWithApproval } from "@/hooks/use-join-battle-with-approval";
import { useLPPositionUSDValue } from "@/hooks/use-lp-usd-value";
import { useResolveBattle } from "@/hooks/use-resolve-battle";
import { ZERO_ADDRESS } from "@/lib/contracts";
import {
  AlertCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useAccount } from "wagmi";

interface BattleViewProps {
  battleId: string;
}

// Battle status type based on contract states
type BattleStatus =
  | "loading"
  | "notFound"
  | "waitingForOpponent"
  | "selectingPosition"
  | "ongoing"
  | "readyToResolve"
  | "ended";

export function getDurationLeft(battle: BattleDetails): {
  secondsLeft: number;
  isOngoing: boolean;
  isEnded: boolean;
} {
  const now = Math.floor(Date.now() / 1000);
  const endTime = battle.startTime + battle.duration;
  const secondsLeft = endTime - now;

  return {
    secondsLeft: Math.max(secondsLeft, 0),
    isOngoing: secondsLeft > 0,
    isEnded: secondsLeft <= 0,
  };
}

export default function BattleView({ battleId }: BattleViewProps) {
  const { address } = useAccount();

  // Fetch battle details from smart contract
  const {
    battleDetails,
    isLoading: isBattleLoading,
    error: battleError,
  } = useCompleteBattleDetails(battleId || undefined);

  console.log(battleDetails);

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

  const [selectedPool, setSelectedPool] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Determine battle status based on contract data
  const battleStatus: BattleStatus = useMemo(() => {
    const invalidBattleArena =
      battleDetails?.creator === ZERO_ADDRESS &&
      battleDetails?.creatorTokenId === "0";

    if (isBattleLoading) return "loading";
    if (battleError || !battleDetails || invalidBattleArena) return "notFound";

    const isHost = battleDetails.creator === address;
    const hasOpponent =
      battleDetails.opponent !== "0x0000000000000000000000000000000000000000";
    const isResolved = battleDetails.isResolved;

    if (isResolved) {
      return "ended";
    }

    if (!hasOpponent) {
      return isHost ? "waitingForOpponent" : "selectingPosition";
    }

    // Battle has opponent, check if it's ongoing or ready to resolve
    const durationInfo = getDurationLeft(battleDetails);

    if (
      durationInfo.isEnded ||
      !battleDetails.creatorInRange ||
      !battleDetails.opponentInRange
    ) {
      return "readyToResolve";
    }

    return "ongoing";
  }, [battleDetails, isBattleLoading, battleError, address]);

  // Calculate required stake value using the same logic as LP positions
  const requiredStakeValue = useMemo(() => {
    if (!battleDetails?.usdValue) return 0;

    const rawValue = parseFloat(battleDetails.usdValue);
    const divisors = [
      1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30,
    ];

    for (const divisor of divisors) {
      const testValue = rawValue / divisor;
      if (testValue >= 0.1 && testValue <= 10) {
        return testValue;
      }
    }

    // Fallback to 1e30 divisor if no suitable divisor found
    return rawValue / 1e30;
  }, [battleDetails?.usdValue]);

  const tolerance = 0.05; // 5%
  const minValue = requiredStakeValue * (1 - tolerance);
  const maxValue = requiredStakeValue * (1 + tolerance);

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
      // Refresh battle details or navigate
      window.location.reload();
    }
  }, [joinSuccess]);

  // Handle successful resolve
  useEffect(() => {
    if (resolveSuccess) {
      // Refresh battle details
      window.location.reload();
    }
  }, [resolveSuccess]);

  // Component to show LP position with USD value
  function LPPositionCard({
    position,
    isSelected,
    onSelect,
  }: {
    position: {
      tokenId: string;
      poolName?: string;
      token0Symbol?: string;
      token1Symbol?: string;
      fee: number;
    };
    isSelected: boolean;
    onSelect: () => void;
  }) {
    const { usdValue, isLoading, error, isConnected, isOwner } =
      useLPPositionUSDValue(position.tokenId);

    const getUSDDisplay = () => {
      if (!isConnected) return { display: "Connect Wallet", numericValue: 0 };
      if (isOwner === false) return { display: "Not Owned", numericValue: 0 };
      if (isLoading) return { display: "Loading...", numericValue: 0 };
      if (error) return { display: "Error", numericValue: 0 };

      if (usdValue && usdValue.valueUSD !== "0") {
        const rawValue = parseFloat(usdValue.valueUSD);
        const divisors = [
          1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30,
        ];

        for (const divisor of divisors) {
          const testValue = rawValue / divisor;
          if (testValue >= 0.1 && testValue <= 10) {
            return {
              display: `$${testValue.toFixed(2)}`,
              numericValue: testValue,
            };
          }
        }
      }
      return { display: "$0.00", numericValue: 0 };
    };

    const usdInfo = getUSDDisplay();
    const isCompatible = getPositionCompatibility(usdInfo.numericValue);
    const isDisabled = !isConnected || !isOwner || error || !isCompatible;

    return (
      <Card
        key={position.tokenId}
        className={`cursor-pointer transition-all ${
          isSelected
            ? isCompatible
              ? "bg-green-600/20 border-green-400"
              : "bg-red-600/20 border-red-400"
            : isCompatible
              ? "bg-black/20 border-green-600 hover:border-green-400"
              : "bg-black/10 border-red-600/30 opacity-50 cursor-not-allowed"
        }`}
        onClick={isDisabled ? undefined : onSelect}
      >
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`font-medium ${
                  isCompatible ? "text-white" : "text-gray-400"
                }`}
              >
                {position.poolName ||
                  `${position.token0Symbol}/${position.token1Symbol}`}
              </div>
              <div className="text-sm text-gray-400">
                Token #{position.tokenId} • {position.fee / 10000}% Fee
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-medium ${
                  isCompatible ? "text-green-400" : "text-red-400"
                }`}
              >
                {usdInfo.display}
              </div>
              <div className="text-xs text-gray-400">
                {isLoading
                  ? "Loading..."
                  : isCompatible
                    ? "Compatible"
                    : "Incompatible"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPositionCompatibility = (usdValue: number) => {
    return usdValue >= minValue && usdValue <= maxValue;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

  const getWinner = () => {
    if (!battleDetails) return null;

    // Check contract winner first
    if (
      battleDetails.winner &&
      battleDetails.winner !== "0x0000000000000000000000000000000000000000"
    ) {
      return {
        winner:
          battleDetails.winner === battleDetails.creator
            ? "creator"
            : "opponent",
        address: battleDetails.winner,
        reason: "Contract determined winner",
      };
    }

    // Fallback logic based on range status
    if (!battleDetails.creatorInRange && battleDetails.opponentInRange) {
      return {
        winner: "opponent",
        address: battleDetails.opponent,
        reason: "Creator went out of price range",
      };
    }
    if (!battleDetails.opponentInRange && battleDetails.creatorInRange) {
      return {
        winner: "creator",
        address: battleDetails.creator,
        reason: "Opponent went out of price range",
      };
    }
    if (!battleDetails.creatorInRange && !battleDetails.opponentInRange) {
      return {
        winner: "draw",
        address: "",
        reason: "Both players went out of range",
      };
    }

    return null;
  };

  // Loading state
  if (battleStatus === "loading") {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-24">
        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Loading Battle...
            </h2>
            <p className="text-gray-400">
              Fetching battle details from blockchain
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Battle not found state
  if (battleStatus === "notFound") {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-24">
        <Card className="bg-black/40 border-red-800/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Battle Not Found
            </h2>
            <p className="text-gray-400 mb-4">
              {battleError?.message ||
                "This battle doesn't exist or failed to load"}
            </p>
            <GradientLink href="/arena" className="text-center w-fit mx-auto">
              Return to Arena
            </GradientLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-24">
      {/* Battle Info Header */}
      <Card className="mb-8 bg-black/40 border-purple-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Battle #{battleId}
              </h1>
              <div className="flex items-center flex-wrap space-x-4 text-sm text-gray-400">
                <span>Stake: ${requiredStakeValue.toFixed(2)}</span>
                <span>•</span>
                <span>
                  Duration:{" "}
                  {battleDetails
                    ? Math.floor(battleDetails.duration / 3600)
                    : 0}
                  h
                </span>
                <span>•</span>
                <Badge
                  className={`${
                    battleStatus === "ongoing"
                      ? "bg-green-500"
                      : battleStatus === "ended"
                        ? "bg-gray-500"
                        : battleStatus === "readyToResolve"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                  }`}
                >
                  {battleStatus
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Badge>
              </div>
            </div>
            {/* {battleStatus === "ongoing" && (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-gray-400 text-sm">Time Remaining</div>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Waiting for Opponent */}
      {battleStatus === "waitingForOpponent" && (
        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Waiting for Opponent
            </h2>
            <p className="text-gray-400 mb-6">
              Share this battle ID to invite other players
            </p>
            <div className="animate-pulse">
              <div className="text-purple-400">
                Searching for worthy opponents...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LP Position Selection */}
      {battleStatus === "selectingPosition" && (
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
                Accepted range: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)}{" "}
                (±5% tolerance)
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
                </div>
                <div className="grid gap-3">
                  {userLPPositions.map((position) => (
                    <LPPositionCard
                      key={position.tokenId}
                      position={position}
                      isSelected={selectedPool === position.tokenId}
                      onSelect={() => setSelectedPool(position.tokenId)}
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
      )}

      {/* Ongoing Battle */}
      {battleStatus === "ongoing" && battleDetails && (
        <>
          {/* Battle Timer */}
          <Card className="mb-8 bg-black/40 border-purple-800/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-4">
                <Clock className="h-8 w-8 text-purple-400" />
                <div>
                  <div className="text-3xl font-bold text-white">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-gray-400">Time Remaining</div>
                </div>
              </div>
              <Progress
                value={
                  ((battleDetails.duration - timeRemaining) /
                    battleDetails.duration) *
                  100
                }
                className="mt-4"
              />
            </CardContent>
          </Card>

          {/* Battle Participants */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Creator */}
            <Card className="bg-black/40 border-cyan-800/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Creator</CardTitle>
                  <Badge
                    variant="outline"
                    className="text-cyan-400 border-cyan-400"
                  >
                    {`${battleDetails.creator.slice(0, 6)}...${battleDetails.creator.slice(-4)}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Token ID:</span>
                  <span className="text-white font-medium">
                    #{battleDetails.creatorTokenId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Range Status:</span>
                  <Badge
                    className={
                      battleDetails.creatorInRange
                        ? "bg-green-500"
                        : "bg-red-500"
                    }
                  >
                    {battleDetails.creatorInRange ? "IN RANGE" : "OUT OF RANGE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Opponent */}
            <Card className="bg-black/40 border-pink-800/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Opponent</CardTitle>
                  <Badge
                    variant="outline"
                    className="text-pink-400 border-pink-400"
                  >
                    {`${battleDetails.opponent.slice(0, 6)}...${battleDetails.opponent.slice(-4)}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Token ID:</span>
                  <span className="text-white font-medium">
                    #{battleDetails.opponentTokenId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Range Status:</span>
                  <Badge
                    className={
                      battleDetails.opponentInRange
                        ? "bg-green-500"
                        : "bg-red-500"
                    }
                  >
                    {battleDetails.opponentInRange
                      ? "IN RANGE"
                      : "OUT OF RANGE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Ready to Resolve */}
      {battleStatus === "readyToResolve" && (
        <div className="text-center">
          <Card className="mb-8 bg-black/40 border-orange-800/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Battle Ready to Resolve
              </h2>
              <p className="text-gray-400 mb-6">
                The battle has ended and can now be resolved
              </p>

              {resolveError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-400/30 rounded-lg">
                  <div className="text-red-400 text-sm">{resolveError}</div>
                </div>
              )}

              <GradientButton
                onClick={handleResolveBattle}
                disabled={isResolving}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                size="lg"
              >
                {isResolving ? "Resolving..." : "Resolve Battle"}
              </GradientButton>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Battle Ended */}
      {battleStatus === "ended" && battleDetails && (
        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Battle Complete!
            </h2>

            {(() => {
              const winner = getWinner();
              if (!winner) {
                return (
                  <div className="text-xl text-gray-300 mb-6">
                    Battle ended - checking results...
                  </div>
                );
              }

              return (
                <>
                  <div className="text-xl text-gray-300 mb-2">
                    Winner:{" "}
                    <span
                      className={`font-bold ${
                        winner.winner === "creator"
                          ? "text-cyan-400"
                          : winner.winner === "opponent"
                            ? "text-pink-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {winner.winner === "creator"
                        ? `Creator (${battleDetails.creator.slice(0, 6)}...${battleDetails.creator.slice(-4)})`
                        : winner.winner === "opponent"
                          ? `Opponent (${battleDetails.opponent.slice(0, 6)}...${battleDetails.opponent.slice(-4)})`
                          : "DRAW"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-6">
                    Reason: {winner.reason}
                  </div>
                </>
              );
            })()}

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gray-800/20">
                <div className="text-white font-medium">Creator Status</div>
                <div
                  className={`text-lg font-bold ${
                    battleDetails.creatorInRange
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {battleDetails.creatorInRange ? "In Range" : "Out of Range"}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/20">
                <div className="text-white font-medium">Opponent Status</div>
                <div
                  className={`text-lg font-bold ${
                    battleDetails.opponentInRange
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {battleDetails.opponentInRange ? "In Range" : "Out of Range"}
                </div>
              </div>
            </div>

            <GradientLink href="/arena" className="text-center w-fit mx-auto">
              Return to Arena
            </GradientLink>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
