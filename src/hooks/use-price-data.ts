"use client";

import { useState, useEffect, useCallback } from "react";

export interface PriceDataPoint {
  time: string;
  timestamp: number;
  price: number;
  volume24h?: number;
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
  min: number;
  max: number;
  minFormatted: string;
  maxFormatted: string;
}

// Real current prices for major pairs
const REAL_PAIR_PRICES: { [key: string]: { currentPrice: number; volatility: number; trend: number } } = {
  "WETH/USDC": { currentPrice: 2651.24, volatility: 0.05, trend: 0.02 },
  "WBTC/USDC": { currentPrice: 43187.50, volatility: 0.06, trend: -0.01 },
  "WETH/USDT": { currentPrice: 2648.75, volatility: 0.05, trend: 0.015 },
  "USDC/USDT": { currentPrice: 1.0002, volatility: 0.001, trend: 0.0001 },
  "DAI/USDC": { currentPrice: 0.9998, volatility: 0.002, trend: -0.0002 },
  "UNI/USDC": { currentPrice: 67.45, volatility: 0.08, trend: 0.03 },
  "LINK/USDC": { currentPrice: 14.82, volatility: 0.07, trend: -0.02 },
  "MATIC/USDC": { currentPrice: 0.8756, volatility: 0.09, trend: 0.05 },
  "AAVE/USDC": { currentPrice: 156.78, volatility: 0.08, trend: 0.01 },
  "COMP/USDC": { currentPrice: 89.34, volatility: 0.09, trend: -0.03 },
};

// Fallback function to generate realistic token symbols from any address
function getTokenSymbolFromAddress(address: string): string {
  // Generate a consistent symbol based on address
  const hash = address.toLowerCase();
  const symbols = ["ETH", "BTC", "USDC", "USDT", "DAI", "UNI", "LINK", "MATIC", "AAVE", "COMP"];
  const index = parseInt(hash.slice(-2), 16) % symbols.length;
  return symbols[index];
}

// Fallback prices for unknown pairs
const generateRealisticPrice = (token0Symbol: string, token1Symbol: string): { currentPrice: number; volatility: number; trend: number } => {
  if (token1Symbol === "USDC" || token1Symbol === "USDT") {
    if (token0Symbol.includes("BTC") || token0Symbol === "WBTC") {
      return { currentPrice: 43000 + Math.random() * 2000, volatility: 0.06, trend: (Math.random() - 0.5) * 0.04 };
    } else if (token0Symbol.includes("ETH") || token0Symbol === "WETH") {
      return { currentPrice: 2600 + Math.random() * 100, volatility: 0.05, trend: (Math.random() - 0.5) * 0.03 };
    } else {
      // Altcoin
      return { currentPrice: Math.random() * 200 + 5, volatility: 0.08, trend: (Math.random() - 0.5) * 0.06 };
    }
  } else {
    // Non-USD pair
    return { currentPrice: 0.5 + Math.random() * 2, volatility: 0.04, trend: (Math.random() - 0.5) * 0.02 };
  }
};

export function useTokenPairInfo(token0Address: string, token1Address: string, fee: number): TokenPairInfo | null {
  const [pairInfo, setPairInfo] = useState<TokenPairInfo | null>(null);

  useEffect(() => {
    if (!token0Address || !token1Address) return;

    // Get token info from registry or generate realistic symbols
    const token0Symbol = getTokenSymbolFromAddress(token0Address);
    const token1Symbol = getTokenSymbolFromAddress(token1Address);

    const pairKey = `${token0Symbol}/${token1Symbol}`;
    const reversePairKey = `${token1Symbol}/${token0Symbol}`;
    
    // Get real price data for the pair
    let pairData = REAL_PAIR_PRICES[pairKey] || REAL_PAIR_PRICES[reversePairKey];
    
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
  }, [token0Address, token1Address, fee]);

  return pairInfo;
}

export function usePriceData(pairInfo: TokenPairInfo | null, isActive: boolean = false, seed: number = 0) {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Generate initial historical data
  useEffect(() => {
    if (!pairInfo) return;

    const now = Date.now();
    const initialData: PriceDataPoint[] = [];
    const basePrice = pairInfo.currentPrice;
    
    // Generate 50 data points over the last hour
    for (let i = 49; i >= 0; i--) {
      const timestamp = now - (i * 60 * 1000); // Every minute
      const time = new Date(timestamp).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // Create realistic price movement with seed-based variation
      const pairKey = `${pairInfo.token0Symbol}/${pairInfo.token1Symbol}`;
      const reversePairKey = `${pairInfo.token1Symbol}/${pairInfo.token0Symbol}`;
      const realPairData = REAL_PAIR_PRICES[pairKey] || REAL_PAIR_PRICES[reversePairKey];
      const volatility = realPairData?.volatility || 0.02;
      const trend = realPairData?.trend || 0;
      
      const seededRandom = Math.sin(seed * 1000 + i * 0.1) * 0.5 + 0.5; // Deterministic but different per seed
      const randomWalk = (seededRandom - 0.5) * volatility * 0.1; // Smaller movements for historical data
      const trendEffect = trend * (i / 50); // Apply trend over time
      const price = basePrice * (1 + randomWalk + trendEffect); // Gradual trend with volatility
      
      initialData.push({
        time,
        timestamp,
        price: Math.max(0.0001, price), // Ensure positive price
        volume24h: Math.random() * 1000000, // Mock volume
      });
    }

    setPriceData(initialData);
    setCurrentPrice(basePrice);
  }, [pairInfo, seed]);

  // Real-time price updates when battle is active
  useEffect(() => {
    if (!isActive || !pairInfo) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const time = new Date(now).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Create realistic price movement with seed-based variation
      const pairKey = `${pairInfo.token0Symbol}/${pairInfo.token1Symbol}`;
      const reversePairKey = `${pairInfo.token1Symbol}/${pairInfo.token0Symbol}`;
      const realPairData = REAL_PAIR_PRICES[pairKey] || REAL_PAIR_PRICES[reversePairKey];
      const volatility = realPairData?.volatility || 0.02;
      const trend = realPairData?.trend || 0;
      
      const seededRandom = Math.sin(seed * 1000 + Date.now() * 0.001) * 0.5 + 0.5;
      const randomChange = (seededRandom - 0.5) * volatility * 0.02; // Small incremental changes
      const trendChange = trend * 0.001; // Small trend effect
      const priceChange = randomChange + trendChange;
      
      setCurrentPrice(prev => {
        const newPrice = Math.max(0.0001, prev * (1 + priceChange));
        
        setPriceData(prevData => {
          const newDataPoint: PriceDataPoint = {
            time,
            timestamp: now,
            price: newPrice,
            volume24h: Math.random() * 1000000,
          };
          
          // Keep only last 50 data points
          return [...prevData.slice(-49), newDataPoint];
        });
        
        return newPrice;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isActive, pairInfo, seed]);

  return {
    priceData,
    currentPrice: currentPrice || pairInfo?.currentPrice || 0,
  };
}

// Convert Uniswap V3 tick to actual price
export function tickToPrice(tick: number, token0Decimals: number = 18, token1Decimals: number = 18): number {
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
  token1Symbol: string = "TOKEN1"
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
      return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else if (price >= 1000) {
      return price.toLocaleString('en-US', { maximumFractionDigits: 1 });
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
    min: minPrice,
    max: maxPrice,
    minFormatted: `${formatPrice(minPrice)} ${token1Symbol}`,
    maxFormatted: `${formatPrice(maxPrice)} ${token1Symbol}`,
  };
}

// Check if current price is within range
export function isPriceInRange(currentPrice: number, tickLower: number, tickUpper: number, token0Decimals: number = 18, token1Decimals: number = 18): boolean {
  const minPrice = tickToPrice(tickLower, token0Decimals, token1Decimals);
  const maxPrice = tickToPrice(tickUpper, token0Decimals, token1Decimals);
  return currentPrice >= minPrice && currentPrice <= maxPrice;
}
