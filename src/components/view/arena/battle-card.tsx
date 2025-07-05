import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GradientLine from "@/components/ui/cards/gradient-line";
import { GradientLink } from "@/components/ui/gradient-button";
import { BattleData, ContractBattleStatus } from "@/types/arena";
import { formatAddress, formatDuration, formatUSDValue } from "@/utils/arena";
import { Clock, Coins, Sword, Target, Users } from "lucide-react";
import React from "react";

interface BattleCardProps {
  battle: BattleData;
}

// Helper function to get badge styling and text
const getBattleStatusDisplay = (status: ContractBattleStatus) => {
  switch (status) {
    case "queued":
      return {
        className: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white",
        text: "⏳ QUEUED",
        canJoin: true,
      };
    case "onGoing":
      return {
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
        text: "🔥 LIVE",
        canJoin: false,
      };
    case "readyToResolve":
      return {
        className: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
        text: "⚡ RESOLVING",
        canJoin: false,
      };
    case "ended":
      return {
        className: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
        text: "✅ ENDED",
        canJoin: false,
      };
    default:
      return {
        className: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white",
        text: "⏳ QUEUED",
        canJoin: true,
      };
  }
};

export const BattleCard: React.FC<BattleCardProps> = ({ battle }) => {
  const statusDisplay = getBattleStatusDisplay(battle.status);

  return (
    <Card className="relative bg-gray-900/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 backdrop-blur-sm rounded-2xl overflow-hidden group">
      <GradientLine />
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
              <Target className="w-4 h-4 text-black" />
            </div>
            Battle #{battle.battleId}
          </CardTitle>
          <Badge
            className={`px-3 py-1 rounded-full font-semibold text-xs ${statusDisplay.className}`}
          >
            {statusDisplay.text}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400">Token ID:</span>
            <span className="text-cyan-400 font-bold">
              #{battle.creatorTokenId}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Creator
            </p>
            <p className="text-white font-mono text-sm bg-gray-800/50 px-2 py-1 rounded-lg">
              {formatAddress(battle.creator)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Stake Value
            </p>
            <p className="text-cyan-400 font-bold flex items-center text-lg">
              <Coins className="w-4 h-4 mr-1" />
              {formatUSDValue(battle.totalValueUSD)}
              <span className="ml-1 text-sm">USD</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Duration
            </p>
            <p className="text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-purple-400" />
              {formatDuration(battle.duration)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Players
            </p>
            <p className="text-white flex items-center">
              <Users className="w-4 h-4 mr-2 text-pink-400" />
              {battle.status === "queued" ? "1/2" : "2/2"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
          <span className="text-xs text-gray-500 flex items-center">
            <div className="w-1 h-1 bg-gray-500 rounded-full mr-2"></div>
            {battle.createdAt}
          </span>
          <GradientLink
            disabled={!statusDisplay.canJoin}
            href={`/arena/battle/${battle.battleId}`}
          >
            <Sword className="w-4 h-4" />
            {statusDisplay.canJoin ? "Join Battle" : "View Battle"}
          </GradientLink>
        </div>
      </CardContent>
    </Card>
  );
};
