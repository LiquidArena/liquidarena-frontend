"use client";

import { useUserLPPositionsWithUSD, formatUSDValue, isPositionCompatibleForBattle } from "@/hooks/use-user-lp-positions-with-usd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, DollarSign, Users, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";

export function UserLPPositionsWithUSDDemo() {
  const { isConnected } = useAccount();
  const {
    positions,
    compatiblePositions,
    isLoading,
    // isPositionsLoading,
    // isUsdLoading,
    error,
    totalUsdValue,
    hasCompatiblePositions,
    refetch,
  } = useUserLPPositionsWithUSD();

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your LP positions and their USD values.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading LP Positions
          </CardTitle>
          <CardDescription>
            Fetching your LP positions and their USD values...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            Error Loading Positions
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Failed to load LP positions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            No LP Positions Found
          </CardTitle>
          <CardDescription>
            You don&apos;t have any LP positions yet. Create some liquidity positions to get started with battles.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            LP Positions Summary
          </CardTitle>
          <CardDescription>
            Overview of your LP positions and their USD values
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Total Positions</div>
            <div className="text-2xl font-bold text-white">{positions.length}</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Compatible for Battles</div>
            <div className="text-2xl font-bold text-green-400">{compatiblePositions.length}</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Total USD Value</div>
            <div className="text-2xl font-bold text-blue-400">
              {formatUSDValue({ 
                amount0: "0", 
                amount1: "0", 
                valueUSD: totalUsdValue.toString() 
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your LP Positions</CardTitle>
          <CardDescription>
            All your LP positions with USD values from the battle contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position) => {
              const isCompatible = isPositionCompatibleForBattle(position);
              
              return (
                <div
                  key={position.tokenId}
                  className={`p-4 rounded-lg border-2 ${
                    isCompatible 
                      ? 'bg-green-900/20 border-green-500/50' 
                      : 'bg-gray-800/50 border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {position.poolName || `${position.token0Symbol}/${position.token1Symbol}`}
                      </div>
                      <div className="text-sm text-gray-400">
                        Token ID: #{position.tokenId} | Fee: {position.fee / 10000}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {position.isUsdLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      )}
                      <Badge
                        variant={isCompatible ? "default" : "secondary"}
                        className={
                          isCompatible 
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/50"
                        }
                      >
                        {position.isUsdLoading 
                          ? "Loading..." 
                          : formatUSDValue(position.usdValue)
                        }
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className={position.isOwner ? "text-green-400" : "text-red-400"}>
                      {position.isOwner ? "Owned" : "Not Owned"}
                    </Badge>
                    <Badge variant="outline" className={position.liquidity !== "0" ? "text-blue-400" : "text-orange-400"}>
                      {position.liquidity !== "0" ? "Active" : "Closed"}
                    </Badge>
                    <Badge variant="outline" className={isCompatible ? "text-green-400" : "text-gray-400"}>
                      {isCompatible ? "Battle Ready" : "Not Compatible"}
                    </Badge>
                  </div>

                  {/* Error display */}
                  {position.usdError && (
                    <div className="mt-2 text-sm text-red-400">
                      USD Value Error: {position.usdError.message}
                    </div>
                  )}

                  {/* Position details */}
                  <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
                    <div>Liquidity: {position.liquidity}</div>
                    <div>Tick Range: {position.tickLower} to {position.tickUpper}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compatible Positions for Battles */}
      {hasCompatiblePositions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-400">Battle-Ready Positions</CardTitle>
            <CardDescription>
              These positions can be used to create or join battles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compatiblePositions.map((position) => (
                <div
                  key={position.tokenId}
                  className="p-3 bg-green-900/20 border border-green-500/50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {position.poolName}
                      </div>
                      <div className="text-sm text-gray-400">
                        Token #{position.tokenId}
                      </div>
                    </div>
                    <div className="text-green-400 font-bold">
                      {formatUSDValue(position.usdValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={refetch} variant="outline" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            "Refresh Data"
          )}
        </Button>
      </div>
    </div>
  );
}