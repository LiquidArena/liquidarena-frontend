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
import { useCompleteBattleDetails } from "@/hooks/use-battle-contract";
import { useAvailableBattlePositions } from "@/hooks/use-create-battle";
import { useJoinBattleWithApproval } from "@/hooks/use-join-battle-with-approval";
import { useLPPositionUSDValue } from "@/hooks/use-lp-usd-value";
import { useResolveBattle } from "@/hooks/use-resolve-battle";
import { Clock, TrendingDown, TrendingUp, Trophy, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

interface BattleViewProps {
  battleId: string;
}

export default function BattleView({ battleId }: BattleViewProps) {
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";

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
    needsApproval,
    isApproving,
    isJoining,
    isSuccess,
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

  // Use the same hook as create battle for consistency
  const { positions: userLPPositions, isLoading: isLoadingPositions } =
    useAvailableBattlePositions();

  // Debug logs
  // console.log("Battle ID from URL:", battleId);
  // console.log("Battle Details:", battleDetails);
  // console.log("Battle Loading:", isBattleLoading);
  // console.log("Battle Error:", battleError);
  // console.log("User LP Positions:", userLPPositions);

  const [battleStatus, setBattleStatus] = useState<
    "waiting" | "selecting" | "active" | "readyToResolve" | "finished"
  >("waiting");
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds
  const [selectedPool, setSelectedPool] = useState("");
  // Add price range data to the state
  const [hostData, setHostData] = useState({
    address: "0x1234...5678",
    pool: "ETH/USDC",
    dex: "Uniswap",
    stake: "0.5 ETH",
    currentPrice: 2650.45,
    entryPrice: 2645.3,
    priceRangeMin: 2580.0, // 2.5% below entry
    priceRangeMax: 2710.6, // 2.5% above entry
    gain: 0.19,
    isOutOfRange: false,
  });

  const [opponentData, setOpponentData] = useState({
    address: "0x9876...4321",
    pool: "BTC/USDT",
    dex: "PancakeSwap",
    stake: "0.02 BTC",
    currentPrice: 43250.8,
    entryPrice: 43180.2,
    priceRangeMin: 42100.7, // 2.5% below entry
    priceRangeMax: 44259.7, // 2.5% above entry
    gain: 0.16,
    isOutOfRange: false,
  });

  const [chartData, setChartData] = useState<
    Array<{
      time: string;
      hostPrice: number;
      opponentPrice: number;
      timestamp: number;
    }>
  >([]);

  // Get required stake value from battle details using 1e30 divisor
  const requiredStakeValue = battleDetails?.usdValue
    ? parseFloat(battleDetails.usdValue) / 1e30
    : 1.25; // Default fallback

  // Calculate 5% tolerance range
  const tolerance = 0.05; // 5%
  const minValue = requiredStakeValue * (1 - tolerance);
  const maxValue = requiredStakeValue * (1 + tolerance);

  // console.log("Required stake value:", requiredStakeValue);
  // console.log("Battle details usdValue:", battleDetails?.usdValue);

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
        return {
          display: `$${(rawValue / 1e30).toFixed(2)}`,
          numericValue: rawValue / 1e30,
        };
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
                className={`font-medium ${isCompatible ? "text-white" : "text-gray-400"}`}
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
                className={`font-medium ${isCompatible ? "text-green-400" : "text-red-400"}`}
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
    const tolerance = 0.05; // 5% tolerance
    const minValue = requiredStakeValue * (1 - tolerance);
    const maxValue = requiredStakeValue * (1 + tolerance);
    return usdValue >= minValue && usdValue <= maxValue;
  };

  useEffect(() => {
    if (!isHost && battleStatus === "waiting") {
      setBattleStatus("selecting");
    }
  }, [isHost, battleStatus]);

  // Update battle status based on smart contract data
  useEffect(() => {
    if (battleDetails) {
      // Determine status based on battle details
      if (
        battleDetails.status === "queued" &&
        battleDetails.opponent === "0x0000000000000000000000000000000000000000"
      ) {
        // Battle has no opponent - show LP selection for joining
        setBattleStatus("selecting");
      } else if (
        battleDetails.status === "queued" &&
        battleDetails.opponent !== "0x0000000000000000000000000000000000000000"
      ) {
        // Battle has opponent but not started yet - show battle view
        setBattleStatus("active");
      } else if (
        battleDetails.status === "active" ||
        battleDetails.status === "onGoing"
      ) {
        // Battle is actively running
        setBattleStatus("active");
      } else if (battleDetails.status === "readyToResolve") {
        // Battle is ready to be resolved - show battle view with resolve option
        setBattleStatus("readyToResolve");
      } else if (
        battleDetails.status === "finished" ||
        battleDetails.status === "ended"
      ) {
        // Battle is completely finished
        setBattleStatus("finished");
      } else {
        // Default fallback - if queued without opponent, allow joining
        if (
          battleDetails.opponent ===
          "0x0000000000000000000000000000000000000000"
        ) {
          setBattleStatus("selecting");
        } else {
          setBattleStatus("active");
        }
      }
    }
  }, [battleDetails]);

  // In the useEffect for price updates, replace the existing logic:
  useEffect(() => {
    if (battleStatus === "active") {
      const startTime = Date.now();

      const timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedMinutes = Math.floor((currentTime - startTime) / 60000);
        const elapsedSeconds =
          Math.floor((currentTime - startTime) / 1000) % 60;
        const timeLabel = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, "0")}`;

        setTimeRemaining((prev) => {
          if (prev <= 0) {
            setBattleStatus("finished");
            return 0;
          }
          return prev - 1;
        });

        // Mock price updates with range checking
        setHostData((prev) => {
          const newPrice = prev.currentPrice + (Math.random() - 0.5) * 20;
          const newGain =
            ((newPrice - prev.entryPrice) / prev.entryPrice) * 100;
          const isOutOfRange =
            newPrice < prev.priceRangeMin || newPrice > prev.priceRangeMax;

          if (isOutOfRange && !prev.isOutOfRange) {
            setBattleStatus("finished");
          }

          return {
            ...prev,
            currentPrice: newPrice,
            gain: newGain,
            isOutOfRange,
          };
        });

        setOpponentData((prev) => {
          const newPrice = prev.currentPrice + (Math.random() - 0.5) * 200;
          const newGain =
            ((newPrice - prev.entryPrice) / prev.entryPrice) * 100;
          const isOutOfRange =
            newPrice < prev.priceRangeMin || newPrice > prev.priceRangeMax;

          if (isOutOfRange && !prev.isOutOfRange) {
            setBattleStatus("finished");
          }

          return {
            ...prev,
            currentPrice: newPrice,
            gain: newGain,
            isOutOfRange,
          };
        });

        // Update chart data
        setChartData((prevData) => {
          const newDataPoint = {
            time: timeLabel,
            hostPrice: hostData.currentPrice,
            opponentPrice: opponentData.currentPrice,
            timestamp: currentTime,
          };

          // Keep only last 50 data points for performance
          const updatedData = [...prevData, newDataPoint].slice(-50);
          return updatedData;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [battleStatus, hostData.currentPrice, opponentData.currentPrice]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleJoinBattle = async () => {
    if (!selectedPool || !battleId) return;

    const selectedPosition = userLPPositions.find(
      (pos: { tokenId: string }) => pos.tokenId === selectedPool,
    );
    if (!selectedPosition?.tokenId) return;

    // Start the approval flow
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

  // Handle successful join
  useEffect(() => {
    if (isSuccess) {
      setBattleStatus("active");
    }
  }, [isSuccess]);

  // Handle successful resolve
  useEffect(() => {
    if (resolveSuccess) {
      setBattleStatus("finished");
    }
  }, [resolveSuccess]);

  const handleResolveBattle = async () => {
    if (battleId) {
      await resolveBattle(battleId, "range");
    }
  };

  const getWinner = () => {
    // Check if anyone is out of range (instant loss)
    if (hostData.isOutOfRange && !opponentData.isOutOfRange) {
      return { winner: "opponent", reason: "Host went out of price range" };
    }
    if (opponentData.isOutOfRange && !hostData.isOutOfRange) {
      return { winner: "host", reason: "Opponent went out of price range" };
    }
    if (hostData.isOutOfRange && opponentData.isOutOfRange) {
      return { winner: "draw", reason: "Both players went out of range" };
    }

    // If no one is out of range, determine by biggest gain
    if (hostData.gain > opponentData.gain) {
      return { winner: "host", reason: "Biggest percentage gain" };
    } else if (opponentData.gain > hostData.gain) {
      return { winner: "opponent", reason: "Biggest percentage gain" };
    } else {
      return { winner: "draw", reason: "Equal gains" };
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-24">
      {/* Battle Timer */}
      {battleStatus === "active" && (
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
            <Progress value={(3600 - timeRemaining) / 36} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Price Movement Chart */}
      {battleStatus === "active" && chartData.length > 0 && (
        <Card className="mb-8 bg-black/40 border-purple-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Price Movement Chart</CardTitle>
            <CardDescription className="text-gray-300">
              Real-time price tracking with range boundaries
            </CardDescription>
          </CardHeader>
          <CardContent className="@container">
            <ScrollArea className="overflow-x-auto">
              <ChartContainer
                config={{
                  hostPrice: {
                    label: "Host Price",
                    color: "hsl(var(--chart-1))",
                  },
                  opponentPrice: {
                    label: "Opponent Price",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px] lg:w-full min-w-sm"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      domain={["dataMin - 50", "dataMax + 50"]}
                    />

                    {/* Host Price Range Area */}
                    <ReferenceArea
                      y1={hostData.priceRangeMin}
                      y2={hostData.priceRangeMax}
                      fill="#8B5CF6"
                      fillOpacity={0.1}
                      stroke="#8B5CF6"
                      strokeOpacity={0.3}
                    />

                    {/* Opponent Price Range Area */}
                    <ReferenceArea
                      y1={opponentData.priceRangeMin}
                      y2={opponentData.priceRangeMax}
                      fill="#10B981"
                      fillOpacity={0.1}
                      stroke="#10B981"
                      strokeOpacity={0.3}
                    />

                    {/* Entry Price Lines */}
                    <ReferenceLine
                      y={hostData.entryPrice}
                      stroke="#8B5CF6"
                      strokeDasharray="5 5"
                      strokeOpacity={0.7}
                    />
                    <ReferenceLine
                      y={opponentData.entryPrice}
                      stroke="#10B981"
                      strokeDasharray="5 5"
                      strokeOpacity={0.7}
                    />

                    {/* Price Lines */}
                    <Line
                      type="monotone"
                      dataKey="hostPrice"
                      stroke="var(--color-hostPrice)"
                      strokeWidth={2}
                      dot={false}
                      name="Host Price"
                    />
                    <Line
                      type="monotone"
                      dataKey="opponentPrice"
                      stroke="var(--color-opponentPrice)"
                      strokeWidth={2}
                      dot={false}
                      name="Opponent Price"
                    />

                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelStyle={{ color: "#fff" }}
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </ScrollArea>

            {/* Chart Legend */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-cyan-400 font-medium">
                  Host ({hostData.pool})
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-cyan-400"></div>
                  <span className="text-gray-300">Current Price</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-0.5 bg-cyan-400 opacity-70"
                    style={{ borderTop: "1px dashed" }}
                  ></div>
                  <span className="text-gray-300">Entry Price</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-400 opacity-20 border border-cyan-400 border-opacity-30"></div>
                  <span className="text-gray-300">Safe Range</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-pink-400 font-medium">
                  Opponent ({opponentData.pool})
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-pink-400"></div>
                  <span className="text-gray-300">Current Price</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-0.5 bg-pink-400 opacity-70"
                    style={{ borderTop: "1px dashed" }}
                  ></div>
                  <span className="text-gray-300">Entry Price</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-400 opacity-20 border border-pink-400 border-opacity-30"></div>
                  <span className="text-gray-300">Safe Range</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waiting State */}
      {battleStatus === "waiting" && (
        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Waiting for Opponent
            </h2>
            <p className="text-gray-400 mb-6">
              Share this room to invite other players
            </p>
            <div className="animate-pulse">
              <div className="text-purple-400">
                Searching for worthy opponents...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pool Selection for Opponent */}
      {battleStatus === "selecting" && !isHost && (
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
                {isBattleLoading
                  ? "Loading..."
                  : `$${requiredStakeValue.toFixed(2)}`}
              </div>
              <div className="text-xs text-gray-400">
                Accepted range: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)}{" "}
                (±5% tolerance)
              </div>
              {battleId && (
                <div className="text-xs text-gray-500 mt-1">
                  Battle ID: {battleId}
                </div>
              )}
              {battleError && (
                <div className="text-xs text-red-400 mt-1">
                  Error: {battleError.message || battleError.toString()}
                </div>
              )}
              {!isBattleLoading && !battleDetails && battleId && (
                <div className="text-xs text-yellow-400 mt-1">
                  Battle not found or failed to load
                </div>
              )}
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
            ) : null}

            {!isLoadingPositions && userLPPositions.length === 0 && (
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

      {/* Active Battle */}
      {(battleStatus === "active" || battleStatus === "readyToResolve") && (
        <>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Host */}
            <Card className="bg-black/40 border-cyan-800/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Host</CardTitle>
                  <Badge
                    variant="outline"
                    className="text-cyan-400 border-cyan-400"
                  >
                    {hostData.address}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pool:</span>
                  <span className="text-white font-medium">
                    {hostData.pool}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">DEX:</span>
                  <span className="text-white">{hostData.dex}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Stake:</span>
                  <span className="text-cyan-400 font-medium">
                    {hostData.stake}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Price:</span>
                  <span className="text-white">
                    ${hostData.currentPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Entry Price:</span>
                  <span className="text-white">
                    ${hostData.entryPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Price Range:</span>
                  <span className="text-white text-sm">
                    ${hostData.priceRangeMin.toFixed(2)} - $
                    {hostData.priceRangeMax.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Range Status:</span>
                  <Badge
                    className={
                      hostData.isOutOfRange ? "bg-red-500" : "bg-green-500"
                    }
                  >
                    {hostData.isOutOfRange ? "OUT OF RANGE" : "IN RANGE"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gain/Loss:</span>
                  <div
                    className={`flex items-center ${hostData.gain >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {hostData.gain >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {hostData.gain.toFixed(2)}%
                  </div>
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
                    {opponentData.address}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pool:</span>
                  <span className="text-white font-medium">
                    {opponentData.pool}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">DEX:</span>
                  <span className="text-white">{opponentData.dex}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Stake:</span>
                  <span className="text-pink-400 font-medium">
                    {opponentData.stake}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Price:</span>
                  <span className="text-white">
                    ${opponentData.currentPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Entry Price:</span>
                  <span className="text-white">
                    ${opponentData.entryPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Price Range:</span>
                  <span className="text-white text-sm">
                    ${opponentData.priceRangeMin.toFixed(2)} - $
                    {opponentData.priceRangeMax.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Range Status:</span>
                  <Badge
                    className={
                      opponentData.isOutOfRange ? "bg-red-500" : "bg-green-500"
                    }
                  >
                    {opponentData.isOutOfRange ? "OUT OF RANGE" : "IN RANGE"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gain/Loss:</span>
                  <div
                    className={`flex items-center ${opponentData.gain >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {opponentData.gain >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {opponentData.gain.toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Solve Button for Ready to Resolve */}
          {battleStatus === "readyToResolve" && (
            <div className="mt-8 text-center">
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
                {isResolving ? "Solving..." : "Solve"}
              </GradientButton>
            </div>
          )}
        </>
      )}

      {/* Battle Finished */}
      {battleStatus === "finished" && (
        <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Battle Complete!
            </h2>
            <div className="text-xl text-gray-300 mb-2">
              Winner:{" "}
              <span
                className={`font-bold ${
                  getWinner().winner === "host"
                    ? "text-cyan-400"
                    : getWinner().winner === "opponent"
                      ? "text-red-400"
                      : "text-yellow-400"
                }`}
              >
                {getWinner().winner === "host"
                  ? hostData.address
                  : getWinner().winner === "opponent"
                    ? opponentData.address
                    : "DRAW"}
              </span>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              Reason: {getWinner().reason}
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div
                className={`p-4 rounded-lg ${getWinner().winner === "host" ? "bg-gray-900/20 border border-cyan-900" : "bg-gray-800/20"}`}
              >
                <div className="text-white font-medium">Host Final Gain</div>
                <div
                  className={`text-2xl font-bold ${hostData.gain >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {hostData.gain.toFixed(2)}%
                </div>
              </div>
              <div
                className={`p-4 rounded-lg ${getWinner().winner === "opponent" ? "bg-gray-900/20 border border-pink-900" : "bg-gray-800/20"}`}
              >
                <div className="text-white font-medium">
                  Opponent Final Gain
                </div>
                <div
                  className={`text-2xl font-bold ${opponentData.gain >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {opponentData.gain.toFixed(2)}%
                </div>
              </div>
            </div>
            <GradientLink href={"/arena"} className="text-center w-fit mx-auto">
              Return to Lobby
            </GradientLink>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
