"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LPPerformanceChart } from "./lp-performance-chart";
import { BattleParticipantsProps } from "./types";
import { formatAddress } from "./utils";

export function BattleParticipants({ battleDetails }: BattleParticipantsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Creator */}
      <Card className="bg-black/40 border-cyan-800/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Creator</CardTitle>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              {formatAddress(battleDetails.creator)}
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
                battleDetails.creatorInRange ? "bg-green-500" : "bg-red-500"
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
            <Badge variant="outline" className="text-pink-400 border-pink-400">
              {formatAddress(battleDetails.opponent)}
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
                battleDetails.opponentInRange ? "bg-green-500" : "bg-red-500"
              }
            >
              {battleDetails.opponentInRange ? "IN RANGE" : "OUT OF RANGE"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* LP Performance Chart */}
      <div className="mt-6 w-full lg:col-span-2">
        <LPPerformanceChart
          creatorTokenId={battleDetails.creatorTokenId}
          opponentTokenId={battleDetails.opponentTokenId}
          battleEndTime={battleDetails.startTime + battleDetails.duration}
          battleStartTime={battleDetails.startTime}
        />
      </div>
    </div>
  );
}
