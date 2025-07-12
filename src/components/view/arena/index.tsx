"use client";

import { CreateBattleButton } from "@/components/battle/create-battle-dialog";
import { BattleIntegrationTest } from "@/components/test/battle-integration-test";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GradientLine from "@/components/ui/cards/gradient-line";
import { GradientButton, GradientLink } from "@/components/ui/gradient-button";
import GridPatternBackground from "@/components/ui/grid-pattern-background";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useArena } from "@/hooks/use-arena";
import { useResolveBattle } from "@/hooks/use-resolve-battle";
import { BattleData } from "@/types/arena";
import { formatAddress, formatDuration, formatUSDValue } from "@/utils/arena";
import {
  Activity,
  Clock,
  Coins,
  Eye,
  Loader2,
  Search,
  Sword,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function ArenaLobby() {
  const {
    battles,
    stats,
    isLoading,
    error,
    playerCountMap,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
  } = useArena();

  const formatTotalVolume = (value: number) => {
    if (!value) return;

    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact", // 'compact' gives you K, M, B, T
        maximumFractionDigits: 1,
      }).format(value) || 0
    );
  };

  return (
    <section className="min-h-screen bg-black relative overflow-hidden py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]"></div>

      {/* Grid Pattern */}
      <GridPatternBackground />

      {/* Header */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Welcome to The Arena
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stake your LP tokens in skill-based prediction duels. Outsmart
            opponents, survive the price range, and claim victory.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Active Battles
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.onGoingBattles}
            </div>
            <div className="text-xs text-green-400">Live battles ongoing</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Total Volume
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatTotalVolume(stats.totalVolume)}
            </div>
            <div className="text-xs text-green-400">Total staked value</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-pink-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-pink-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Total Battles
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.totalBattles}
            </div>
            <div className="text-xs text-green-400">All time created</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Waiting
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.queuedBattles}
            </div>
            <div className="text-xs text-cyan-400">Ready to join</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                placeholder="Search battles or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 w-full sm:w-80 h-12 rounded-xl backdrop-blur-sm focus:border-cyan-500 transition-all duration-300"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white w-full sm:w-48 rounded-xl backdrop-blur-sm h-12 py-6">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 backdrop-blur-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Waiting</SelectItem>
                <SelectItem value="onGoing">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CreateBattleButton />
        </div>

        {/* Integration Test */}
        {/* <div className="mb-12">
          <BattleIntegrationTest />
        </div> */}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="ml-2 text-gray-400">
              Loading battles from GraphQL...
            </span>
          </div>
        )}

        {/* Battle Tabs */}
        {!isLoading && (
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="bg-gray-900/50 border border-gray-700 rounded-2xl p-2 backdrop-blur-sm min-h-14 flex-col md:flex-row md:w-fit w-full h-full">
              <TabsTrigger
                value="all"
                className="w-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-medium transition-all duration-300"
              >
                All Battles ({battles.length})
              </TabsTrigger>
              <TabsTrigger
                value="waiting"
                className="w-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-medium transition-all duration-300"
              >
                Waiting ({battles.filter((b) => b.status === "queued").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <BattleGrid battles={battles} playerCountMap={playerCountMap} />
            </TabsContent>
            <TabsContent value="waiting" className="mt-8">
              <BattleGrid
                battles={battles.filter((b) => b.status === "queued")}
                playerCountMap={playerCountMap}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!isLoading && battles.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sword className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No battles found
            </h3>
            <p className="text-gray-400 mb-6">
              No battles were loaded from the GraphQL endpoint.
            </p>
            <CreateBattleButton />
          </div>
        )}
      </div>
    </section>
  );
}

// Helper function to get battle status styling
function getBattleStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "queued":
      return {
        className: "bg-gradient-to-r from-yellow-500 to-orange-600",
        icon: "⏳",
        text: "QUEUED",
      };

    case "ongoing":
      return {
        className: "bg-gradient-to-r from-green-500 to-emerald-600",
        icon: "⚔️",
        text: "ONGOING",
      };

    case "readytoresolve":
      return {
        className: "bg-gradient-to-r from-blue-500 to-indigo-600",
        icon: "⚡",
        text: "READY TO RESOLVE",
      };

    case "ended":
      return {
        className: "bg-gradient-to-r from-gray-500 to-slate-600",
        icon: "🏁",
        text: "ENDED",
      };

    default:
      return {
        className: "bg-gradient-to-r from-yellow-500 to-orange-600",
        icon: "⏳",
        text: "QUEUED",
      };
  }
}

function BattleGrid({
  battles,
  playerCountMap,
}: {
  battles: BattleData[];
  playerCountMap: Record<
    string,
    {
      current: number;
      max: number;
      hasOpponent: boolean;
      opponent: string | null;
    }
  >;
}) {
  const {
    resolveBattle,
    isResolving,
    // isSuccess: resolveSuccess,
    // error: resolveError,
  } = useResolveBattle();

  const handleResolveBattle = async (battleId: string) => {
    if (battleId) {
      await resolveBattle(battleId, "range");
    }
  };

  if (battles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No battles available for this filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {battles.map((battle) => {
        const statusBadge = getBattleStatusBadge(battle.status);
        const playerCount = playerCountMap[battle.battleId] || {
          current: 1,
          max: 2,
          hasOpponent: false,
          opponent: null,
        };
        return (
          <Card
            key={battle.id}
            className="relative bg-gray-900/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 backdrop-blur-sm rounded-2xl overflow-hidden group"
          >
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
                  className={`px-3 py-1 rounded-full font-semibold text-xs text-white ${statusBadge.className}`}
                >
                  {statusBadge.icon} {statusBadge.text}
                </Badge>
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
                    Total Value
                  </p>
                  <p className="text-cyan-400 font-bold flex items-center text-lg">
                    <Coins className="w-4 h-4 mr-1" />$
                    {formatUSDValue(battle.totalValueUSD)}
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
                    <Users
                      className={`w-4 h-4 mr-2 ${playerCount.hasOpponent ? "text-green-400" : "text-pink-400"}`}
                    />
                    {playerCount.current}/{playerCount.max}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                <span className="text-xs text-gray-500 flex items-center">
                  <div className="w-1 h-1 bg-gray-500 rounded-full mr-2"></div>
                  {battle.createdAt}
                </span>
                {battle.status === "readyToResolve" ? (
                  <GradientButton
                    disabled={isResolving}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={() => handleResolveBattle(battle.battleId)}
                  >
                    Resolve Battle
                  </GradientButton>
                ) : !playerCount?.hasOpponent ? (
                  <GradientLink href={`/arena/battle/${battle.battleId}`}>
                    <Sword className="w-4 h-4" />
                    Join
                  </GradientLink>
                ) : (
                  <Link href={`/arena/battle/${battle.battleId}`}>
                    <Button variant={"outline"} className="py-6">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
