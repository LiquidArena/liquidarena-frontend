import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GradientLine from "@/components/ui/cards/gradient-line";
import { GradientLink } from "@/components/ui/gradient-button";
import { useCompleteBattleDetails } from "@/hooks/use-battle-contract";
import { useResolveBattle } from "@/hooks/use-resolve-battle";
import { BattleData, ContractBattleStatus } from "@/types/arena";
import { formatAddress, formatDuration, formatUSDValue } from "@/utils/arena";
import {
  Clock,
  Coins,
  Gavel,
  Loader2,
  Sword,
  Target,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface BattleCardProps {
  battle: BattleData;
}

// Utility function to check if battle has expired
const isBattleExpired = (startTime: number, duration: number): boolean => {
  if (!startTime || !duration) return false;
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const endTime = startTime + duration;
  return currentTime >= endTime;
};

// Helper function to get badge styling and text
const getBattleStatusDisplay = (
  status: ContractBattleStatus | string,
  isExpired: boolean = false,
) => {
  // If battle is expired but still active, show ready to resolve
  if (isExpired && (status === "active" || status === "onGoing")) {
    return {
      className: "bg-gradient-to-r from-orange-500 to-red-600 text-white",
      text: "⏰ READY TO RESOLVE",
      canJoin: false,
      canResolve: true,
    };
  }

  switch (status) {
    case "queued":
      return {
        className: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white",
        text: "⏳ QUEUED",
        canJoin: true,
        canResolve: false,
      };
    case "onGoing":
    case "active": // Handle both status names
      return {
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
        text: "ONGOING",
        canJoin: false,
        canResolve: false,
      };
    case "readyToResolve":
      return {
        className: "bg-gradient-to-r from-orange-500 to-red-600 text-white",
        text: "⏰ READY TO RESOLVE",
        canJoin: false,
        canResolve: true,
      };
    case "ended":
    case "finished": // Handle both status names
      return {
        className: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
        text: "✅ ENDED",
        canJoin: false,
        canResolve: false,
      };
    default:
      return {
        className: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white",
        text: "⏳ QUEUED",
        canJoin: true,
        canResolve: false,
      };
  }
};

export const BattleCard: React.FC<BattleCardProps> = ({ battle }) => {
  const router = useRouter();
  const {
    resolveBattle,
    isResolving,
    isSuccess: resolveSuccess,
    error: resolveError,
  } = useResolveBattle();

  // Local state to track if battle has been resolved
  const [localStatus, setLocalStatus] = React.useState(battle.status);

  // Get complete battle details to check expiration
  const { battleDetails: completeBattleDetails } = useCompleteBattleDetails(
    battle.battleId,
  );

  // Check if battle is expired
  const isExpired = completeBattleDetails
    ? isBattleExpired(
        completeBattleDetails.startTime,
        completeBattleDetails.duration,
      )
    : false;

  // Update local status when resolve is successful
  React.useEffect(() => {
    if (resolveSuccess) {
      setLocalStatus("ended");
    }
  }, [resolveSuccess]);

  const statusDisplay = getBattleStatusDisplay(localStatus, isExpired);

  // Debug logs for all battles to check status detection
  // console.log(`Battle ${battle.battleId} Debug:`, {
  //   originalStatus: battle.status,
  //   localStatus,
  //   isExpired,
  //   statusDisplay,
  //   canResolve: statusDisplay.canResolve,
  //   canJoin: statusDisplay.canJoin,
  //   completeBattleDetails: completeBattleDetails ? {
  //     status: completeBattleDetails.status,
  //     startTime: completeBattleDetails.startTime,
  //     duration: completeBattleDetails.duration
  //   } : null
  // });

  const handleJoinBattle = () => {
    // Navigate to battle page with battleId and required stake value
    router.push(
      `/arena/battle/${battle.battleId}?requiredStake=${battle.totalValueUSD}&join=true`,
    );
  };

  const handleResolveBattle = async () => {
    try {
      // console.log("🔥 End Battle clicked for battle:", battle.battleId);
      alert(`Ending battle ${battle.battleId}...`);
      await resolveBattle(battle.battleId, "range");
    } catch (error) {
      console.error("Failed to resolve battle:", error);
      alert(`Failed to end battle: ${error}`);
    }
  };

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

        {resolveError && (
          <div className="mb-2 p-2 bg-red-900/20 border border-red-400/30 rounded-lg">
            <div className="text-red-400 text-xs">Error: {resolveError}</div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
          <span className="text-xs text-gray-500 flex items-center">
            <div className="w-1 h-1 bg-gray-500 rounded-full mr-2"></div>
            {battle.createdAt}
          </span>
          {statusDisplay.canJoin ? (
            <Button
              onClick={handleJoinBattle}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              <Sword className="w-4 h-4 mr-2" />
              Join Battle
            </Button>
          ) : statusDisplay.canResolve ? (
            <Button
              onClick={handleResolveBattle}
              disabled={isResolving}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isResolving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Gavel className="w-4 h-4 mr-2" />
              )}
              {isResolving ? "Ending..." : "End Battle"}
            </Button>
          ) : (
            <GradientLink href={`/arena/battle/${battle.battleId}`}>
              <Sword className="w-4 h-4 mr-2" />
              View Battle
            </GradientLink>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
