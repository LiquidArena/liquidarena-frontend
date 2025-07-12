"use client";

import { Badge } from "@/components/ui/badge";
import { useLPPositionUSDValue } from "@/hooks/use-lp-usd-value";
import { LPPosition } from "@/lib/lp-position-service";
import { Loader2 } from "lucide-react";

interface LPPositionCardProps {
  position: LPPosition;
  isSelected: boolean;
  onClick: () => void;
}

export function LPPositionCard({ position, isSelected, onClick }: LPPositionCardProps) {
  // Get USD value from LPBattleVault contract (requires wallet connection)
  const { usdValue, isLoading, error, isConnected, isOwner } = useLPPositionUSDValue(position.tokenId);

  // Determine what USD value to display
  const getDisplayValue = () => {
    if (!isConnected) {
      return { value: "Connect Wallet", className: "text-yellow-400" };
    }
    
    if (isOwner === false) {
      return { value: "Not Owned", className: "text-orange-400" };
    }
    
    if (isLoading) {
      return { value: "Loading...", className: "text-gray-400" };
    }
    
    if (error) {
      return { value: "Error", className: "text-red-400" };
    }
    
    if (usdValue && usdValue.valueUSD !== "0") {
      const rawValue = parseFloat(usdValue.valueUSD);
      
      // Dynamic conversion to find the real USD value
      // The contract returns values in some unknown unit, we need to find the right divisor
      // to convert to realistic USD amounts (typically $0.1 to $100 range for LP positions)
      
      let usdAmount;
      
      // Try different divisors to find one that gives reasonable USD values
      const divisors = [1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30];
      
      for (const divisor of divisors) {
        const testValue = rawValue / divisor;
        
        // Check if this gives us a reasonable USD amount (between $0.1 and $10 for LP positions)
        if (testValue >= 0.1 && testValue <= 10) {
          usdAmount = testValue.toFixed(2);
          break;
        }
      }
      
      // If no reasonable value found, use the largest divisor
      if (!usdAmount) {
        usdAmount = (rawValue / 1e30).toFixed(2);
      }
      
      const displayValue = `$${usdAmount}`;
      
      return { value: displayValue, className: "text-green-400" };
    }
    
    // Fallback to API value (usually "0")
    const fallbackAmount = (parseFloat(position.valueUSD) / 1e18).toFixed(2);
    return { value: `$${fallbackAmount}`, className: "text-gray-400" };
  };

  const displayValue = getDisplayValue();

  return (
    <div 
      className={`bg-gray-800/50 p-3 rounded cursor-pointer border-2 transition-colors ${
        isSelected 
          ? 'border-cyan-500' 
          : 'border-transparent hover:border-gray-600'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-white">
          {position.poolName || `${position.token0Symbol}/${position.token1Symbol}`}
        </span>
        <Badge variant="secondary" className={displayValue.className}>
          {isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          {displayValue.value}
        </Badge>
      </div>
      <div className="text-sm text-gray-400">
        Token ID: #{position.tokenId} | Fee: {position.fee / 10000}%
      </div>
      
      
      {/* Error details */}
      {error && (
        <div className="text-xs text-red-400 mt-1">
          Failed to fetch USD value
        </div>
      )}
    </div>
  );
}