"use client";

import ArchOrnament from "@/components/ui/arch-ornament";
import { Badge } from "@/components/ui/badge";
import LPNFTCard from "@/components/ui/cards/lp-nft-card";
import RecentBattleCard, {
  RecentBattleCardSkeleton,
} from "@/components/ui/cards/recent-battle-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatsCard from "@/components/ui/stats-card";
import { useUserLPPositions } from "@/hooks/use-lp-positions";
import { useRecentBattles } from "@/hooks/use-profile-data";
import { Percent, Skull, Swords, Trophy } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

/* eslint-disable @next/next/no-img-element */

export default function ProfileSection() {
  const { address, isConnected, chain, chainId } = useAccount();

  const {
    battles: recentBattles,
    stats: profileStats,
    isLoading: isRecentBattleLoading,
  } = useRecentBattles({
    userAddress: address!,
  });

  const { positions: availableLPNFTS, isLoading: isLPPositionsLoading } =
    useUserLPPositions();

  const stats = [
    {
      id: 1,
      title: "Win Rates",
      value: String(profileStats?.winRate) + "%",
      icon: Percent,
    },
    {
      id: 2,
      title: "Total Battles",
      value: String(profileStats?.totalBattles),
      icon: Swords,
    },
    {
      id: 3,
      title: "Total Wins",
      value: String(profileStats?.wonBattles),
      icon: Trophy,
    },
    {
      id: 4,
      title: "Total Loses",
      value: String(profileStats?.lostBattles),
      icon: Skull,
    },
  ];

  return (
    <div className="lg:max-h-[500px] flex flex-col lg:flex-row gap-6 container max-w-6xl mx-auto">
      <div className="space-y-4 shadow-lg w-full h-full bg-gray-100/5 backdrop-blur-md rounded-2xl p-4 border border-gray-100/10 outline outline-offset-4 outline-gray-100/10 lg:max-w-md relative">
        <h1 className="text-2xl font-bold">
          ARENA <span className="font-light text-gray-400">PROFILE</span>
        </h1>

        <div className="flex items-center flex-col md:flex-row gap-4">
          {!isConnected ? (
            <div className="h-35 w-35 bg-slate-500/10 rounded-xl border-4 p-4 animate-pulse"></div>
          ) : (
            <div className="h-35 w-35 bg-slate-500/10 rounded-xl border-4 p-4">
              <img
                src={`https://api.dicebear.com/6.x/identicon/svg?seed=${address}`}
                alt="avatar"
                className="w-full h-full"
              />
            </div>
          )}
          <div className="w-full text-center lg:text-start lg:w-1/2 space-y-2">
            <div>
              <h2>ADDRESS:</h2>
              {isConnected ? (
                <p>
                  {address?.slice(0, 6).toUpperCase()}...{address?.slice(-4)}
                </p>
              ) : (
                <div className="w-full h-6 bg-gray-200/10 animate-pulse rounded-lg" />
              )}
            </div>
            <div>
              <h2>CHAIN: </h2>
              {isConnected ? (
                <p>
                  {chain?.name} | {chainId}
                </p>
              ) : (
                <div className="w-full h-6 bg-gray-200/10 animate-pulse rounded-lg" />
              )}
            </div>
            <Badge className="bg-green-200">ONLINE</Badge>
          </div>
        </div>

        <h2>STATISTICS</h2>
        <div className="grid md:grid-cols-2 gap-2">
          {isRecentBattleLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-full px-2 py-8 bg-gray-900/30 animate-pulse rounded-lg"
                />
              ))
            : stats?.map((stat, i) => (
                <StatsCard
                  key={i}
                  title={stat.title}
                  value={stat.value!}
                  icon={stat.icon}
                />
              ))}
        </div>
        <ArchOrnament position="top" direction="left" />
      </div>

      <div className="relative w-full h-0.5 lg:w-0.5 lg:h-full bg-slate-200/10 rounded-full before:absolute before:w-1.5 before:h-1.5 before:bg-slate-200 lg:before:-top-1 before:-top-0.5 before:-left-0.5 after:absolute after:w-1.5 after:h-1.5 after:bg-slate-200 after:-bottom-0.5 lg:after:-bottom-1 lg:after:-left-0.5 after:-right-0.5"></div>

      <div className="space-y-4 w-full lg:border-y lg:border-x-0 border-x px-1 relative">
        <ArchOrnament position="bottom" direction="right" />
        <h2 className="text-xl bg-gradient-to-r from-transparent via-gray-100/10 py-6 to-transparent">
          ACTIVE LP NFTs
        </h2>
        {isLPPositionsLoading ? (
          <RecentBattleCardSkeleton />
        ) : availableLPNFTS.length > 0 ? (
          <ScrollArea className="min-h-0 h-full max-h-[calc(50%-6.5rem)] [&>div>div]:space-y-4">
            {availableLPNFTS?.map((lpNFT, i) => (
              <LPNFTCard
                key={i}
                pairs={lpNFT.poolName!}
                value={lpNFT.valueUSD}
                // isActive={lpNFT.}
              />
            ))}
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center min-h-0 h-full max-h-[calc(50%-6.5rem)] py-4">
            <p className="text-slate-400">No active LP NFTs</p>
          </div>
        )}

        <h2 className="text-xl text-end bg-gradient-to-r from-transparent via-gray-100/10 py-6 to-transparent">
          RECENT BATTLES
        </h2>
        {isRecentBattleLoading ? (
          <RecentBattleCardSkeleton />
        ) : recentBattles.length > 0 ? (
          <ScrollArea className="min-h-0 h-full max-h-[calc(50%-6.5rem)] [&>div>div]:space-y-4">
            {recentBattles.map((item, index) => {
              const opponentAddres = item?.details?.opponent;

              return (
                <RecentBattleCard
                  key={index}
                  isWinner={item?.details?.winner === address}
                  amount={parseFloat(
                    formatUnits(item?.details?.usdValue as bigint, 18),
                  ).toFixed(2)}
                  opponentAddress={`${opponentAddres?.slice(0, 3) as string}...${opponentAddres?.slice(opponentAddres?.length - 4)}`}
                  status={item?.details?.status as string}
                />
              );
            })}
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center min-h-0 h-full max-h-[calc(50%-6.5rem)] py-4">
            <p className="text-slate-400">No recent battles</p>
          </div>
        )}
      </div>
      <div className="relative w-full h-0.5 lg:w-0.5 lg:h-full bg-slate-200/10 rounded-full before:absolute before:w-1.5 before:h-1.5 before:bg-slate-200 lg:before:-top-1 before:-top-0.5 before:-left-0.5 after:absolute after:w-1.5 after:h-1.5 after:bg-slate-200 after:-bottom-0.5 lg:after:-bottom-1 lg:after:-left-0.5 after:-right-0.5"></div>
    </div>
  );
}
