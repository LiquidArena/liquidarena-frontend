"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LPPositionDetails,
  TokenInfo,
  useLPPositionDetailsContract,
} from "@/hooks/use-lp-position-details";
import {
  TIME_INTERVALS,
  TimeInterval,
  isPriceInRange,
  tickRangeToPriceRange,
  tickToPrice,
  usePriceData,
  useTokenPairInfo,
} from "@/hooks/use-price-data";
import { Activity, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface LPPerformanceChartProps {
  creatorTokenId: string;
  opponentTokenId?: string;
  battleStartTime: number;
  battleEndTime: number;
}

// Type definitions
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

interface ParticipantChartProps {
  tokenId: string;
  participantType: "creator" | "opponent";
  isActive?: boolean;
  timeInterval?: TimeInterval;
}

interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

interface PerformanceMetrics {
  initialPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

// Individual chart component for each participant
const ParticipantChart = memo<ParticipantChartProps>(function ParticipantChart({
  tokenId,
  participantType,
  isActive = true,
  timeInterval = "1m",
}) {
  const [seed] = useState(() => parseInt(tokenId) || Math.random() * 1000);

  // Get position details from contract
  const { positionDetails, token0Info, token1Info, isLoading, error } =
    useLPPositionDetailsContract(tokenId);

  // Get token pair info and price data
  const pairInfo = useTokenPairInfo(
    positionDetails?.token0 || "",
    positionDetails?.token1 || "",
    positionDetails?.fee || 0,
  );

  const { priceData, currentPrice } = usePriceData(
    pairInfo,
    isActive,
    seed,
    timeInterval,
  );

  // Memoize price range calculation
  const priceRange = useMemo((): PriceRange | null => {
    if (!pairInfo || !positionDetails) return null;
    return tickRangeToPriceRange(
      positionDetails.tickLower,
      positionDetails.tickUpper,
      token0Info?.decimals || 18,
      token1Info?.decimals || 18,
      token0Info?.symbol || "TOKEN0",
      token1Info?.symbol || "TOKEN1",
    );
  }, [
    pairInfo,
    positionDetails,
    token0Info?.decimals,
    token0Info?.symbol,
    token1Info?.decimals,
    token1Info?.symbol,
  ]);

  // Memoize performance metrics
  const performanceMetrics = useMemo((): PerformanceMetrics => {
    const initialPrice =
      priceData.length > 0 ? priceData[0].price : currentPrice;
    const priceChange = currentPrice - initialPrice;
    const priceChangePercent =
      initialPrice > 0 ? (priceChange / initialPrice) * 100 : 0;
    return { initialPrice, priceChange, priceChangePercent };
  }, [priceData, currentPrice]);

  // Memoize range status check
  const currentlyInRange = useMemo((): boolean => {
    if (!pairInfo || !priceRange || !positionDetails) return false;
    return isPriceInRange(
      currentPrice,
      positionDetails.tickLower,
      positionDetails.tickUpper,
      token0Info?.decimals || 18,
      token1Info?.decimals || 18,
      token0Info?.symbol || "TOKEN0",
      token1Info?.symbol || "TOKEN1",
    );
  }, [
    currentPrice,
    pairInfo,
    priceRange,
    positionDetails,
    token0Info?.decimals,
    token0Info?.symbol,
    token1Info?.decimals,
    token1Info?.symbol,
  ]);

  // Memoize formatPrice function
  const formatPrice = useCallback((price: number | undefined): string => {
    if (price === undefined) {
      return "N/A";
    }
    if (price >= 10000) {
      return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
    } else if (price >= 1000) {
      return price.toLocaleString("en-US", { maximumFractionDigits: 1 });
    } else if (price >= 100) {
      return price.toFixed(2);
    } else if (price >= 1) {
      return price.toFixed(3);
    } else if (price >= 0.1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(6);
    }
  }, []);

  // Memoize time formatter
  const formatTime = useCallback((value: string | number): string => {
    // If value is already a formatted string, return it directly
    if (typeof value === "string") {
      return value;
    }
    // If value is a timestamp, format it
    const date = new Date(value);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Memoize CustomTooltip component
  const CustomTooltip = useCallback(
    ({ active, payload, label }: TooltipProps) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-lg">
            <p className="text-gray-300 text-sm">{`Time: ${label}`}</p>
            <p className="text-white font-medium">
              {`Price: ${formatPrice(payload[0].value)} ${token1Info?.symbol || "TOKEN1"}`}
            </p>
          </div>
        );
      }
      return null;
    },
    [formatPrice, token1Info?.symbol],
  );

  // Memoize active dot configuration
  const activeDot = useMemo(
    () => ({
      r: 4,
      stroke: participantType === "creator" ? "#06B6D4" : "#EC4899",
    }),
    [participantType],
  );

  // Memoize card className
  const cardClassName = useMemo(
    () =>
      `bg-black/40 border-${participantType === "creator" ? "cyan" : "pink"}-800/30 backdrop-blur-sm`,
    [participantType],
  );

  // Memoize line stroke color
  const lineStrokeColor = useMemo(
    () => (participantType === "creator" ? "#06B6D4" : "#EC4899"),
    [participantType],
  );

  if (isLoading) {
    return (
      <Card className={cardClassName}>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">
              Error loading position data
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Token #{tokenId} Performance
          </CardTitle>
          <Badge className={currentlyInRange ? "bg-green-500" : "bg-red-500"}>
            {currentlyInRange ? "IN RANGE" : "OUT OF RANGE"}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {token0Info?.symbol || "TOKEN0"}/{token1Info?.symbol || "TOKEN1"}
          </span>
          <div className="flex items-center gap-2">
            {performanceMetrics.priceChangePercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span
              className={
                performanceMetrics.priceChangePercent >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {performanceMetrics.priceChangePercent >= 0 ? "+" : ""}
              {performanceMetrics.priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Current Price Display */}
        <div className="mb-4 p-3 bg-gray-900/20 border border-gray-700/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Current Price</span>
            <span className="text-white font-bold text-lg">
              {formatPrice(currentPrice)} {token1Info?.symbol || "TOKEN1"}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-400 text-xs">Range</span>
            <span className="text-gray-300 text-xs">
              {formatPrice(priceRange?.minPrice)} -{" "}
              {formatPrice(priceRange?.maxPrice)}
            </span>
          </div>
        </div>

        {/* Price Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                tickFormatter={formatTime}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                domain={["dataMin - 10", "dataMax + 10"]}
                tickFormatter={formatPrice}
              />
              <Tooltip
                content={(props) =>
                  CustomTooltip({
                    active: props.active,
                    payload: props.payload,
                    label: props.label?.toString(),
                  })
                }
              />

              {/* Range boundaries */}
              {priceRange && (
                <>
                  <ReferenceLine
                    y={priceRange.minPrice}
                    stroke="#EF4444"
                    strokeDasharray="5 5"
                    label={{ value: "Min Range", position: "insideTopLeft" }}
                  />
                  <ReferenceLine
                    y={priceRange.maxPrice}
                    stroke="#EF4444"
                    strokeDasharray="5 5"
                    label={{ value: "Max Range", position: "insideBottomLeft" }}
                  />
                </>
              )}

              {/* Price line */}
              <Line
                type="monotone"
                dataKey="price"
                stroke={lineStrokeColor}
                strokeWidth={2}
                dot={false}
                activeDot={activeDot}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-gray-400 text-xs">24h Change</div>
            <div
              className={`font-medium ${(pairInfo?.priceChange24h || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {(pairInfo?.priceChange24h || 0) >= 0 ? "+" : ""}
              {(pairInfo?.priceChange24h || 0).toFixed(2)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs">Fee Tier</div>
            <div className="text-white font-medium">
              {(Number(positionDetails?.fee) / 10000).toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export function LPPerformanceChart({
  creatorTokenId,
  opponentTokenId,
  battleStartTime,
  battleEndTime,
}: LPPerformanceChartProps) {
  // Fix: Calculate end time properly - battleEndTime should be startTime + duration
  // If battleEndTime is already calculated, use it; otherwise calculate it
  const calculatedEndTime =
    battleEndTime > 1000000000000
      ? Math.floor(battleEndTime / 1000) // Convert from ms to seconds if needed
      : battleEndTime; // Already in seconds

  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  const battleIsActive = currentTimeSeconds < calculatedEndTime;
  const [selectedTimeInterval, setSelectedTimeInterval] =
    useState<TimeInterval>("1m");

  // Calculate time remaining for display
  const currentTime = Date.now();
  const battleEndTimeMs = calculatedEndTime * 1000;
  const timeUntilEnd = battleEndTimeMs - currentTime;
  const minutesUntilEnd = Math.floor(timeUntilEnd / (1000 * 60));
  const secondsUntilEnd = Math.floor((timeUntilEnd % (1000 * 60)) / 1000);
  const hoursUntilEnd = Math.floor(timeUntilEnd / (1000 * 60 * 60));

  // Memoize the interval change handler
  const handleIntervalChange = useCallback((interval: TimeInterval) => {
    setSelectedTimeInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          LP Token Performance
        </h3>
        <p className="text-gray-400 text-sm">
          Real-time price tracking and range status for battle participants
        </p>

        {/* Battle Status Indicator */}
        {/* <div className="mt-3 p-2 bg-gray-900/30 border border-gray-700/40 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${battleIsActive ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            ></div>
            <span
              className={battleIsActive ? "text-green-400" : "text-red-400"}
            >
              Battle {battleIsActive ? "Active" : "Ended"}
            </span>
            {battleIsActive && (
              <span className="text-gray-400">
                ({hoursUntilEnd}h {minutesUntilEnd % 60}m remaining)
              </span>
            )}
            {!battleIsActive && timeUntilEnd < 0 && (
              <span className="text-gray-400">
                (Ended {Math.abs(Math.floor(timeUntilEnd / (1000 * 60 * 60)))}h{" "}
                {Math.abs(minutesUntilEnd) % 60}m ago)
              </span>
            )}
          </div>
          {!battleIsActive && (
            <div className="text-center text-xs text-yellow-400 mt-1">
              ⚠️ Real-time updates are disabled for ended battles
            </div>
          )}
        </div> */}

        {/* Time Interval Selector */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-4 p-3 bg-gray-900/20 border border-gray-700/30 rounded-lg">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400 text-sm mr-2">Time Interval:</span>
          <div className="flex flex-col md:flex-row gap-1 w-full md:w-fit">
            {TIME_INTERVALS.map((interval) => (
              <Button
                key={interval.value}
                variant={
                  selectedTimeInterval === interval.value
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => handleIntervalChange(interval.value)}
                className={`h-8 px-3 text-xs ${
                  selectedTimeInterval === interval.value
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {interval.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creator Chart */}
        <ParticipantChart
          tokenId={creatorTokenId}
          participantType="creator"
          isActive={battleIsActive}
          timeInterval={selectedTimeInterval}
        />

        {/* Opponent Chart */}
        {opponentTokenId && (
          <ParticipantChart
            tokenId={opponentTokenId}
            participantType="opponent"
            isActive={battleIsActive}
            timeInterval={selectedTimeInterval}
          />
        )}

        {/* Waiting for opponent placeholder */}
        {!opponentTokenId && (
          <Card className="bg-black/40 border-gray-800/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Waiting for opponent to join...</p>
                <p className="text-sm mt-2">Opponent chart will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
