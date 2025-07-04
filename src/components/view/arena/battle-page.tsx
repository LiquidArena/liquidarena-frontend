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
import { Clock, TrendingDown, TrendingUp, Trophy } from "lucide-react";
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

export default function BattleView() {
  // const params = useParams();
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  const [battleStatus, setBattleStatus] = useState<
    "waiting" | "selecting" | "active" | "finished"
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

  // Mock LP positions for opponent selection with numeric values
  const lpPositions = [
    {
      id: "1",
      pool: "BTC/USDT",
      dex: "PancakeSwap",
      amount: "0.02 BTC",
      value: "$865",
      numericValue: 865,
    },
    {
      id: "2",
      pool: "ADA/BNB",
      dex: "PancakeSwap",
      amount: "5000 ADA",
      value: "$1,200",
      numericValue: 1200,
    },
    {
      id: "3",
      pool: "DOT/USDC",
      dex: "Uniswap",
      amount: "150 DOT",
      value: "$750",
      numericValue: 750,
    },
    {
      id: "4",
      pool: "ETH/USDC",
      dex: "Uniswap",
      amount: "0.5 ETH",
      value: "$1,250",
      numericValue: 1250,
    },
    {
      id: "5",
      pool: "LINK/USDT",
      dex: "Uniswap",
      amount: "85 LINK",
      value: "$630",
      numericValue: 630,
    },
  ];

  // Add required stake value (this would come from the room data)
  const requiredStakeValue = 1250; // This should be passed from the room data

  // Filter positions that match the required stake value (within 5% tolerance)
  const matchingPositions = lpPositions.filter((position) => {
    const tolerance = 0.05; // 5% tolerance
    const minValue = requiredStakeValue * (1 - tolerance);
    const maxValue = requiredStakeValue * (1 + tolerance);
    return (
      position.numericValue >= minValue && position.numericValue <= maxValue
    );
  });

  const nonMatchingPositions = lpPositions.filter((position) => {
    const tolerance = 0.05;
    const minValue = requiredStakeValue * (1 - tolerance);
    const maxValue = requiredStakeValue * (1 + tolerance);
    return position.numericValue < minValue || position.numericValue > maxValue;
  });

  useEffect(() => {
    if (!isHost && battleStatus === "waiting") {
      setBattleStatus("selecting");
    }
  }, [isHost, battleStatus]);

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

  const handleJoinBattle = () => {
    if (selectedPool) {
      setBattleStatus("active");
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
      {/* {battleStatus === "waiting" && (
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
      )} */}

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
                ${requiredStakeValue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                You must stake equivalent value to join this battle
              </div>
            </div>

            {matchingPositions.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-green-400 font-medium">
                  ✓ Compatible LP Positions
                </div>
                <div className="grid gap-3">
                  {matchingPositions.map((position) => (
                    <Card
                      key={position.id}
                      className={`cursor-pointer transition-all ${
                        selectedPool === position.id
                          ? "bg-green-600/20 border-green-400"
                          : "bg-black/20 border-green-600 hover:border-green-400"
                      }`}
                      onClick={() => setSelectedPool(position.id)}
                    >
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">
                              {position.pool}
                            </div>
                            <div className="text-sm text-gray-400">
                              {position.dex}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-medium">
                              {position.amount}
                            </div>
                            <div className="text-xs text-green-400">
                              {position.value}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {nonMatchingPositions.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-red-400 font-medium">
                  ✗ Incompatible LP Positions
                </div>
                <div className="grid gap-3">
                  {nonMatchingPositions.map((position) => (
                    <Card
                      key={position.id}
                      className="bg-black/10 border-red-600/30 opacity-50 cursor-not-allowed"
                    >
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-gray-400 font-medium">
                              {position.pool}
                            </div>
                            <div className="text-sm text-gray-500">
                              {position.dex}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-400 font-medium">
                              {position.amount}
                            </div>
                            <div className="text-xs text-red-400">
                              {position.value}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {matchingPositions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-red-400 text-lg mb-2">
                  No Compatible LP Positions
                </div>
                <div className="text-gray-400 text-sm">
                  You need LP tokens worth approximately $
                  {requiredStakeValue.toLocaleString()} to join this battle
                </div>
              </div>
            )}

            <GradientButton
              onClick={handleJoinBattle}
              disabled={!selectedPool || matchingPositions.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              size="lg"
            >
              {matchingPositions.length === 0
                ? "No Compatible Stakes"
                : "Join Battle"}
            </GradientButton>
          </CardContent>
        </Card>
      )}

      {/* Active Battle */}
      {battleStatus === "active" && (
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
                <span className="text-white font-medium">{hostData.pool}</span>
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
