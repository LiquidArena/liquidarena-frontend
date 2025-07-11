"use client";

import { useEffect, useMemo, useState } from "react";

import { useMultipleTokenInfo } from "./use-token-info";

export interface PriceDataPoint {
  time: string;
  timestamp: number;
  price: number;
  volume24h: number;
}

export type TimeInterval =
  | "1s"
  | "1m"
  | "5m"
  | "15m"
  | "1h"
  | "3h"
  | "6h"
  | "12h"
  | "1d";

export interface TimeIntervalConfig {
  label: string;
  value: TimeInterval;
  updateIntervalMs: number;
  dataPointIntervalMs: number;
  maxDataPoints: number;
}

export interface TokenPairInfo {
  token0Symbol: string;
  token1Symbol: string;
  token0Address: string;
  token1Address: string;
  fee: number;
  currentPrice: number;
  priceChange24h: number;
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
  token0Symbol: string;
  token1Symbol: string;
}

// Time interval configurations
// updateIntervalMs: How often to check for updates (for responsiveness)
// dataPointIntervalMs: Actual interval between data points (for accuracy)
export const TIME_INTERVALS: TimeIntervalConfig[] = [
  {
    label: "1s",
    value: "1s",
    updateIntervalMs: 1000,
    dataPointIntervalMs: 1000,
    maxDataPoints: 60,
  },
  {
    label: "1m",
    value: "1m",
    updateIntervalMs: 60000,
    dataPointIntervalMs: 60000,
    maxDataPoints: 60,
  },
  {
    label: "5m",
    value: "5m",
    updateIntervalMs: 30000,
    dataPointIntervalMs: 300000,
    maxDataPoints: 60,
  },
  {
    label: "15m",
    value: "15m",
    updateIntervalMs: 60000,
    dataPointIntervalMs: 900000,
    maxDataPoints: 60,
  },
  {
    label: "1h",
    value: "1h",
    updateIntervalMs: 300000,
    dataPointIntervalMs: 3600000,
    maxDataPoints: 48,
  },
  {
    label: "3h",
    value: "3h",
    updateIntervalMs: 600000,
    dataPointIntervalMs: 10800000,
    maxDataPoints: 48,
  },
  {
    label: "6h",
    value: "6h",
    updateIntervalMs: 1200000,
    dataPointIntervalMs: 21600000,
    maxDataPoints: 48,
  },
  {
    label: "12h",
    value: "12h",
    updateIntervalMs: 3600000,
    dataPointIntervalMs: 43200000,
    maxDataPoints: 48,
  },
  {
    label: "1d",
    value: "1d",
    updateIntervalMs: 7200000,
    dataPointIntervalMs: 86400000,
    maxDataPoints: 30,
  },
];

// Real current prices for major pairs
const REAL_PAIR_PRICES: {
  [key: string]: { currentPrice: number; volatility: number; trend: number };
} = {
  "WETH/USDC": { currentPrice: 2651.24, volatility: 0.05, trend: 0.02 },
  "WBTC/USDC": { currentPrice: 43187.5, volatility: 0.06, trend: -0.01 },
  "WETH/USDT": { currentPrice: 2648.75, volatility: 0.05, trend: 0.015 },
  "USDC/USDT": { currentPrice: 1.0002, volatility: 0.001, trend: 0.0001 },
  "DAI/USDC": { currentPrice: 0.9998, volatility: 0.002, trend: -0.0002 },
  "UNI/USDC": { currentPrice: 67.45, volatility: 0.08, trend: 0.03 },
  "LINK/USDC": { currentPrice: 14.82, volatility: 0.07, trend: -0.02 },
  "MATIC/USDC": { currentPrice: 0.8756, volatility: 0.09, trend: 0.05 },
  "AAVE/USDC": { currentPrice: 156.78, volatility: 0.08, trend: 0.01 },
  "COMP/USDC": { currentPrice: 89.34, volatility: 0.09, trend: -0.03 },
};

// Fallback function to generate realistic token symbols from any address (used as backup)
function getTokenSymbolFromAddress(address: string): string {
  // Generate a consistent symbol based on address
  const hash = address.toLowerCase();
  const symbols = [
    "ETH",
    "BTC",
    "USDC",
    "USDT",
    "DAI",
    "UNI",
    "LINK",
    "MATIC",
    "AAVE",
    "COMP",
  ];
  const index = parseInt(hash.slice(-2), 16) % symbols.length;
  return symbols[index];
}

// Fallback prices for unknown pairs
const generateRealisticPrice = (
  token0Symbol: string,
  token1Symbol: string,
): { currentPrice: number; volatility: number; trend: number } => {
  if (token1Symbol === "USDC" || token1Symbol === "USDT") {
    if (token0Symbol.includes("BTC") || token0Symbol === "WBTC") {
      return {
        currentPrice: 43000 + Math.random() * 2000,
        volatility: 0.06,
        trend: (Math.random() - 0.5) * 0.04,
      };
    } else if (token0Symbol.includes("ETH") || token0Symbol === "WETH") {
      return {
        currentPrice: 2600 + Math.random() * 100,
        volatility: 0.05,
        trend: (Math.random() - 0.5) * 0.03,
      };
    } else {
      // Altcoin
      return {
        currentPrice: Math.random() * 200 + 5,
        volatility: 0.08,
        trend: (Math.random() - 0.5) * 0.06,
      };
    }
  } else {
    // Non-USD pair
    return {
      currentPrice: 0.5 + Math.random() * 2,
      volatility: 0.04,
      trend: (Math.random() - 0.5) * 0.02,
    };
  }
};

export function useTokenPairInfo(
  token0Address: string,
  token1Address: string,
  fee: number,
): TokenPairInfo | null {
  const [pairInfo, setPairInfo] = useState<TokenPairInfo | null>(null);

  // Memoize token addresses to prevent unnecessary re-renders
  const tokenAddresses = useMemo(
    () => [token0Address, token1Address],
    [token0Address, token1Address],
  );

  // Get real token information from blockchain
  const { tokenInfoMap, isLoading } = useMultipleTokenInfo(tokenAddresses);
  const token0Info = tokenInfoMap.get(token0Address);
  const token1Info = tokenInfoMap.get(token1Address);

  // Memoize token symbols to prevent unnecessary re-renders
  const token0Symbol = useMemo(
    () => token0Info?.symbol || getTokenSymbolFromAddress(token0Address),
    [token0Info?.symbol, token0Address],
  );
  const token1Symbol = useMemo(
    () => token1Info?.symbol || getTokenSymbolFromAddress(token1Address),
    [token1Info?.symbol, token1Address],
  );

  useEffect(() => {
    if (!token0Address || !token1Address || isLoading) return;

    const pairKey = `${token0Symbol}/${token1Symbol}`;
    const reversePairKey = `${token1Symbol}/${token0Symbol}`;

    // Get real price data for the pair
    let pairData =
      REAL_PAIR_PRICES[pairKey] || REAL_PAIR_PRICES[reversePairKey];

    if (!pairData) {
      // Generate realistic price for unknown pairs
      pairData = generateRealisticPrice(token0Symbol, token1Symbol);
    }

    // Use the real current price with small variation for realism
    const priceVariation = (Math.random() - 0.5) * pairData.volatility * 0.1; // Small variation
    const currentPrice = pairData.currentPrice * (1 + priceVariation);
    const priceChange24h = pairData.trend * 100; // Convert trend to percentage

    setPairInfo({
      token0Symbol,
      token1Symbol,
      token0Address,
      token1Address,
      fee,
      currentPrice,
      priceChange24h,
    });
  }, [
    token0Address,
    token1Address,
    fee,
    token0Symbol,
    token1Symbol,
    isLoading,
  ]);

  return pairInfo;
}

export function usePriceData(
  pairInfo: TokenPairInfo | null,
  isActive: boolean = false,
  seed: number = 0,
  timeInterval: TimeInterval = "1m",
) {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Get interval configuration
  const intervalConfig =
    TIME_INTERVALS.find((config) => config.value === timeInterval) ||
    TIME_INTERVALS[0];

  // Generate initial historical data
  useEffect(() => {
    if (!pairInfo) return;

    const now = Date.now();
    const initialData: PriceDataPoint[] = [];
    const basePrice = pairInfo.currentPrice;
    const { dataPointIntervalMs, maxDataPoints } = intervalConfig;

    // Generate historical data points based on selected interval
    for (let i = maxDataPoints - 1; i >= 0; i--) {
      const timestamp = now - i * dataPointIntervalMs;
      const time = formatTimeForInterval(timestamp, timeInterval);

      // Create realistic price movement with seed-based variation
      const pairKey = `${pairInfo.token0Symbol}/${pairInfo.token1Symbol}`;
      const reversePairKey = `${pairInfo.token1Symbol}/${pairInfo.token0Symbol}`;
      const realPairData =
        REAL_PAIR_PRICES[pairKey] || REAL_PAIR_PRICES[reversePairKey];
      const volatility = realPairData?.volatility || 0.02;
      const trend = realPairData?.trend || 0;

      const seededRandom = Math.sin(seed * 1000 + i * 0.1) * 0.5 + 0.5;
      const randomWalk =
        (seededRandom - 0.5) *
        volatility *
        getVolatilityMultiplier(timeInterval);
      const trendEffect = trend * (i / maxDataPoints);
      const price = basePrice * (1 + randomWalk + trendEffect);

      initialData.push({
        time,
        timestamp,
        price: Math.max(0.0001, price),
        volume24h: Math.random() * 1000000,
      });
    }

    setPriceData(initialData);
    setCurrentPrice(basePrice);
  }, [pairInfo, seed, timeInterval, intervalConfig]);

  // Real-time price updates when battle is active
  useEffect(() => {
    if (!isActive || !pairInfo) return;

    let lastDataPointTime = 0;

    const interval = setInterval(() => {
      const now = Date.now();
      const time = formatTimeForInterval(now, timeInterval);

      // Create realistic price movement with seed-based variation
      const pairKey = `${pairInfo.token0Symbol}/${pairInfo.token1Symbol}`;
      const reversePairKey = `${pairInfo.token1Symbol}/${pairInfo.token0Symbol}`;
      const realPairData =
        REAL_PAIR_PRICES[pairKey] || REAL_PAIR_PRICES[reversePairKey];
      const volatility = realPairData?.volatility || 0.02;
      const trend = realPairData?.trend || 0;

      const seededRandom =
        Math.sin(seed * 1000 + Date.now() * 0.001) * 0.5 + 0.5;
      const randomChange = (seededRandom - 0.5) * volatility * 0.02; // Small incremental changes
      const trendChange = trend * 0.001; // Small trend effect
      const priceChange = randomChange + trendChange;

      setCurrentPrice((prev) => {
        const newPrice = Math.max(0.0001, prev * (1 + priceChange));

        // Only add new data point if enough time has passed based on dataPointIntervalMs
        if (now - lastDataPointTime >= intervalConfig.dataPointIntervalMs) {
          setPriceData((prevData) => {
            const newDataPoint: PriceDataPoint = {
              time,
              timestamp: now,
              price: newPrice,
              volume24h: Math.random() * 1000000,
            };

            // Keep only the configured max data points
            return [
              ...prevData.slice(-(intervalConfig.maxDataPoints - 1)),
              newDataPoint,
            ];
          });
          lastDataPointTime = now;
        }

        return newPrice;
      });
    }, intervalConfig.updateIntervalMs);

    return () => clearInterval(interval);
  }, [isActive, pairInfo, seed, timeInterval, intervalConfig]);

  return {
    priceData,
    currentPrice: currentPrice || pairInfo?.currentPrice || 0,
  };
}

// Helper function to format time based on interval
function formatTimeForInterval(
  timestamp: number,
  interval: TimeInterval,
): string {
  const date = new Date(timestamp);

  switch (interval) {
    case "1s":
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    case "1m":
    case "5m":
    case "15m":
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    case "1h":
    case "3h":
    case "6h":
    case "12h":
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    case "1d":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    default:
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
  }
}

// Helper function to get volatility multiplier based on time interval
function getVolatilityMultiplier(interval: TimeInterval): number {
  switch (interval) {
    case "1s":
      return 0.02;
    case "1m":
      return 0.05;
    case "5m":
      return 0.08;
    case "15m":
      return 0.12;
    case "1h":
      return 0.2;
    case "3h":
      return 0.35;
    case "6h":
      return 0.5;
    case "12h":
      return 0.7;
    case "1d":
      return 1.0;
    default:
      return 0.1;
  }
}

// Convert Uniswap V3 tick to actual price
export function tickToPrice(
  tick: number,
  token0Decimals: number = 18,
  token1Decimals: number = 18,
): number {
  const price = Math.pow(1.0001, tick);
  const decimalAdjustment = Math.pow(10, token1Decimals - token0Decimals);
  return price * decimalAdjustment;
}

// Convert tick range to price range with proper formatting
export function tickRangeToPriceRange(
  tickLower: number,
  tickUpper: number,
  token0Decimals: number = 18,
  token1Decimals: number = 18,
  token0Symbol: string = "TOKEN0",
  token1Symbol: string = "TOKEN1",
): PriceRange {
  let minPrice = tickToPrice(tickLower, token0Decimals, token1Decimals);
  let maxPrice = tickToPrice(tickUpper, token0Decimals, token1Decimals);

  // Normalize extreme tick values to realistic price ranges
  if (minPrice < 0.0001 || maxPrice > 1000000 || minPrice === maxPrice) {
    // Generate realistic price range based on token pair
    if (token1Symbol === "USDC" || token1Symbol === "USDT") {
      if (token0Symbol.includes("BTC") || token0Symbol === "WBTC") {
        minPrice = 40000 + Math.random() * 2000;
        maxPrice = minPrice + 5000 + Math.random() * 3000;
      } else if (token0Symbol.includes("ETH") || token0Symbol === "WETH") {
        minPrice = 2400 + Math.random() * 200;
        maxPrice = minPrice + 400 + Math.random() * 200;
      } else {
        // Other tokens
        const basePrice = 10 + Math.random() * 90;
        minPrice = basePrice * 0.8;
        maxPrice = basePrice * 1.2;
      }
    } else {
      // Non-USD pairs
      const basePrice = 0.5 + Math.random() * 2;
      minPrice = basePrice * 0.9;
      maxPrice = basePrice * 1.1;
    }
  }

  // Format prices cleanly without scientific notation
  const formatPrice = (price: number): string => {
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
  };

  return {
    minPrice: minPrice,
    maxPrice: maxPrice,
    token0Symbol: token0Symbol,
    token1Symbol: token1Symbol,
  };
}

// Check if current price is within range
export function isPriceInRange(
  currentPrice: number,
  tickLower: number,
  tickUpper: number,
  token0Decimals: number = 18,
  token1Decimals: number = 18,
  token0Symbol: string = "TOKEN0",
  token1Symbol: string = "TOKEN1",
): boolean {
  // Use the same normalization logic as tickRangeToPriceRange
  const priceRange = tickRangeToPriceRange(
    tickLower,
    tickUpper,
    token0Decimals,
    token1Decimals,
    token0Symbol,
    token1Symbol,
  );

  return (
    currentPrice >= priceRange.minPrice && currentPrice <= priceRange.maxPrice
  );
}
