"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockBattleRooms,
  mockLPNFTS,
  mockTimeWindows,
} from "@/mocks/battle-arena/create-battle";
import {
  Activity,
  Clock,
  Coins,
  Plus,
  Search,
  Shield,
  Sword,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function ArenaLobby() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPair, setFilterPair] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredBattles = mockBattleRooms.filter((battle) => {
    const matchesSearch =
      battle.hostPool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      battle.hostPool.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPair =
      filterPair === "all" ||
      battle.hostPool.includes(filterPair.toUpperCase());
    const matchesStatus =
      filterStatus === "all" || battle.status === filterStatus;

    return matchesSearch && matchesPair && matchesStatus;
  });

  return (
    <section className="min-h-screen bg-black relative overflow-hidden py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]"></div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      ></div>

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
            <div className="text-2xl font-bold text-white">24</div>
            <div className="text-xs text-green-400">+12% from yesterday</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Total Volume
              </span>
            </div>
            <div className="text-2xl font-bold text-white">1,247 ETH</div>
            <div className="text-xs text-green-400">+8.3% this week</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-pink-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-pink-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Active Players
              </span>
            </div>
            <div className="text-2xl font-bold text-white">892</div>
            <div className="text-xs text-green-400">+15% growth</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Avg Multiplier
              </span>
            </div>
            <div className="text-2xl font-bold text-white">2.4x</div>
            <div className="text-xs text-cyan-400">High risk, high reward</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                placeholder="Search battles or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 w-full sm:w-80 h-12 rounded-xl backdrop-blur-sm focus:border-cyan-500 transition-all duration-300"
              />
            </div>
            <Select value={filterPair} onValueChange={setFilterPair}>
              <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white w-full sm:w-48 rounded-xl backdrop-blur-sm h-12 py-6">
                <SelectValue placeholder="All Trading Pairs" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 backdrop-blur-xl">
                <SelectItem value="all">All Pairs</SelectItem>
                {mockBattleRooms.map(({ hostPool, id }) => (
                  <SelectItem key={id} value={hostPool}>
                    {hostPool}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white w-full sm:w-48 rounded-xl backdrop-blur-sm h-12 py-6">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 backdrop-blur-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-12 px-8 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40">
                <Plus className="w-5 h-5 mr-2" />
                Create Battle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900/95 border-gray-700 text-white backdrop-blur-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Create New Battle
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="bg-yellow-900/20 border-yellow-400/30 text-yellow-400 p-2 rounded-lg">
                    Only players with LP tokens of equivalent value can join
                    your battle. Choose your stake carefully as it determines
                    who can challenge you.
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pair" className="text-gray-300 font-medium">
                    Trading Pair
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-600 mt-2 h-12 py-5 rounded-xl w-full">
                      <SelectValue placeholder="Select trading pair" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {mockLPNFTS.map((lpNFT) => (
                        <SelectItem key={lpNFT.value} value={lpNFT.id}>
                          {lpNFT.pool} ({lpNFT.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="timeframe"
                    className="text-gray-300 font-medium"
                  >
                    Battle Duration
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-600 mt-2 h-12 py-5 rounded-xl w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {mockTimeWindows.map((timeWindow) => (
                        <SelectItem
                          key={timeWindow.value}
                          value={timeWindow.value}
                        >
                          {timeWindow.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="min-price"
                      className="text-gray-300 font-medium"
                    >
                      Min Price ($)
                    </Label>
                    <Input
                      id="min-price"
                      placeholder="0.00"
                      className="bg-gray-800 border-gray-600 mt-2 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="max-price"
                      className="text-gray-300 font-medium"
                    >
                      Max Price ($)
                    </Label>
                    <Input
                      id="max-price"
                      placeholder="0.00"
                      className="bg-gray-800 border-gray-600 mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Instant Loss:</strong>{" "}
                      First player to go outside their price range loses
                      immediately
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Time Expiry:</strong> If no
                      one exits range, winner determined by biggest percentage
                      gain
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 h-12 rounded-xl font-semibold text-white">
                  <Sword className="w-5 h-5 mr-2" />
                  Launch Battle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Battle Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-gray-900/50 border border-gray-700 rounded-2xl p-2 backdrop-blur-sm min-h-14">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-medium transition-all duration-300"
            >
              All Battles ({filteredBattles.length})
            </TabsTrigger>
            <TabsTrigger
              value="waiting"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-medium transition-all duration-300"
            >
              Waiting (
              {filteredBattles.filter((b) => b.status === "waiting").length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-6 py-3 font-medium transition-all duration-300"
            >
              Active (
              {filteredBattles.filter((b) => b.status === "active").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            <BattleGrid battles={filteredBattles} />
          </TabsContent>
          <TabsContent value="waiting" className="mt-8">
            <BattleGrid
              battles={filteredBattles.filter((b) => b.status === "waiting")}
            />
          </TabsContent>
          <TabsContent value="active" className="mt-8">
            <BattleGrid
              battles={filteredBattles.filter((b) => b.status === "active")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function BattleGrid({ battles }: { battles: typeof mockBattleRooms }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {battles.map((battle) => (
        <Card
          key={battle.id}
          className="relative bg-gray-900/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 backdrop-blur-sm rounded-2xl overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
          <CardHeader className="pb-4 relative">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <Target className="w-4 h-4 text-black" />
                </div>
                {battle.hostPool}
              </CardTitle>
              <Badge
                className={`px-3 py-1 rounded-full font-semibold text-xs ${
                  battle.status === "active"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                }`}
              >
                {battle.status === "active" ? "🔥 LIVE" : "⏳ WAITING"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400">Multiplier:</span>
                {/* <span className="text-cyan-400 font-bold">
                  {battle.multiplier}
                </span> */}
              </div>
              {/* <div className="text-gray-400">
                Vol:{" "}
                <span className="text-purple-400 font-semibold">
                  {battle.volume}
                </span>
              </div> */}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Host
                </p>
                <p className="text-white font-mono text-sm bg-gray-800/50 px-2 py-1 rounded-lg">
                  {battle.host}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Stake
                </p>
                <p className="text-cyan-400 font-bold flex items-center text-lg">
                  <Coins className="w-4 h-4 mr-1" />
                  {battle.stake}
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
                  {battle.timeWindow}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Players
                </p>
                <p className="text-white flex items-center">
                  <Users className="w-4 h-4 mr-2 text-pink-400" />
                  {battle.participants}/{battle.maxParticipants}
                </p>
              </div>
            </div>

            {/* <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                Price Range
              </p>
              <p className="text-white font-mono text-lg font-bold">
                {battle.priceRange}
              </p>
            </div> */}

            <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
              <span className="text-xs text-gray-500 flex items-center">
                <div className="w-1 h-1 bg-gray-500 rounded-full mr-2"></div>
                {battle.createdAt}
              </span>
              <Button
                size="sm"
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  battle.status === "waiting"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
                disabled={battle.status === "active"}
              >
                {battle.status === "waiting" ? (
                  <>
                    <Sword className="w-4 h-4 mr-2" />
                    Join Battle
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    In Progress
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
