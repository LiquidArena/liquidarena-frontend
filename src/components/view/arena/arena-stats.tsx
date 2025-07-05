import { BattleStats } from "@/types/arena";
import {
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React from "react";

interface ArenaStatsProps {
  stats: BattleStats;
}

export const ArenaStats: React.FC<ArenaStatsProps> = ({ stats }) => {
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  const statItems = [
    {
      icon: Clock,
      label: "Queued",
      value: stats.queuedBattles,
      description: "Waiting to start",
      color: "yellow",
    },
    {
      icon: Activity,
      label: "Ongoing",
      value: stats.onGoingBattles,
      description: "Currently active",
      color: "green",
    },
    {
      icon: CheckCircle,
      label: "Ready to Resolve",
      value: stats.readyToResolveBattles,
      description: "Awaiting resolution",
      color: "blue",
    },
    {
      icon: XCircle,
      label: "Ended",
      value: stats.endedBattles,
      description: "Completed battles",
      color: "gray",
    },
    {
      icon: TrendingUp,
      label: "Total Volume",
      value: formatVolume(stats.totalVolume),
      description: "Total staked value",
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br from-gray-900/50 to-black/50 border border-${item.color}-500/20 rounded-2xl p-6 backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-2">
            <item.icon className={`w-5 h-5 text-${item.color}-400`} />
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {item.label}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{item.value}</div>
          <div className="text-xs text-green-400">{item.description}</div>
        </div>
      ))}
    </div>
  );
};
