"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

import { BattleTimerProps } from "./types";
import { formatTime } from "./utils";

export function BattleTimer({
  timeRemaining,
  battleDetails,
}: BattleTimerProps) {
  return (
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
        <Progress
          value={
            ((battleDetails.duration - timeRemaining) /
              battleDetails.duration) *
            100
          }
          className="mt-4"
        />
      </CardContent>
    </Card>
  );
}
