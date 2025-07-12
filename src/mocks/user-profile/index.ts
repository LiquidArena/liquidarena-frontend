import { Coins, Skull, Swords, Trophy } from "lucide-react";

const mockStats = [
  {
    id: 1,
    title: "Active LP NFTs",
    value: 2,
    icon: Coins,
  },
  {
    id: 2,
    title: "Total Battles",
    value: 3,
    icon: Swords,
  },
  {
    id: 3,
    title: "Total Wins",
    value: 5,
    icon: Trophy,
  },
  {
    id: 4,
    title: "Total Loses",
    value: 2,
    icon: Skull,
  },
];

const mocklpNFTs = [
  {
    id: 1,
    pairs: "LP NFT #1",
    value: "0.05 ETH",
    isActive: true,
  },
  {
    id: 2,
    pairs: "LP NFT #2",
    value: "0.05 ETH",
    isActive: false,
  },
  {
    id: 3,
    pairs: "LP NFT #3",
    value: "0.05 ETH",
    isActive: true,
  },
];

const mockRecentBattles = [
  {
    id: 1,
    isWinner: true,
    amount: "0.05 ETH",
    opponentAddress: "0x1234",
    timeStamp: "2 hours ago",
  },
  {
    id: 2,
    isWinner: false,
    amount: "0.05 ETH",
    opponentAddress: "0x1234",
    timeStamp: "2 hours ago",
  },
  {
    id: 3,
    isWinner: true,
    amount: "0.05 ETH",
    opponentAddress: "0x1234",
    timeStamp: "2 hours ago",
  },
] as const;

export { mockStats, mocklpNFTs, mockRecentBattles };
