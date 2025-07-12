"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useLPPositionUSDValue } from "@/hooks/use-lp-usd-value";

import { LPPositionCardProps } from "./types";
import { getPositionCompatibility, getUSDDisplay } from "./utils";

export function LPPositionCard({
  position,
  isSelected,
  onSelect,
  minValue,
  maxValue,
}: LPPositionCardProps) {
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
