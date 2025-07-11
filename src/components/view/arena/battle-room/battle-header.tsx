"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { BattleHeaderProps } from "./types";

export function BattleHeader({
  battleId,
  requiredStakeValue,
  battleDetails,
  battleStatus,
}: BattleHeaderProps) {
  return (
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
                {battleDetails ? Math.floor(battleDetails.duration / 3600) : 0}h
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
        </div>
      </CardContent>
    </Card>
  );
}
