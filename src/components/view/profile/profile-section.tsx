"use client";

import ArchOrnament from "@/components/ui/arch-ornament";
import { Badge } from "@/components/ui/badge";
import LPNFTCard from "@/components/ui/cards/lp-nft-card";
import RecentBattleCard from "@/components/ui/cards/recent-battle-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatsCard from "@/components/ui/stats-card";
import { mockRecentBattles, mockStats, mocklpNFTs } from "@/mocks/user-profile";
import { useAccount } from "wagmi";

/* eslint-disable @next/next/no-img-element */

export default function ProfileSection() {
  const { address, isConnected, chain, chainId } = useAccount();

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
              <p>
                {address?.slice(0, 6).toUpperCase()}...{address?.slice(-4)}
              </p>
            </div>
            <div>
              <h2>CHAIN: </h2>
              <p>
                {chain?.name} | {chainId}
              </p>
            </div>
            <Badge className="bg-green-200">ONLINE</Badge>
          </div>
        </div>

        <h2>STATISTICS</h2>
        <div className="grid md:grid-cols-2 gap-2">
          {mockStats.map((stat, i) => (
            <StatsCard
              key={i}
              title={stat.title}
              value={stat.value}
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
        {mocklpNFTs.length > 0 ? (
          <ScrollArea className="min-h-0 h-full max-h-[calc(50%-6.5rem)] [&>div>div]:space-y-4">
            {mocklpNFTs.map((lpNFT, i) => (
              <LPNFTCard
                key={i}
                pairs={lpNFT.pairs}
                value={lpNFT.value}
                isActive={lpNFT.isActive}
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
        {mockRecentBattles.length > 0 ? (
          <ScrollArea className="min-h-0 h-full max-h-[calc(50%-6.5rem)] [&>div>div]:space-y-4">
            {mockRecentBattles.map((item, index) => (
              <RecentBattleCard
                key={index}
                isWinner={item.isWinner}
                amount={item.amount}
                opponentAddress={item.opponentAddress}
                timeStamp={item.timeStamp}
              />
            ))}
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
