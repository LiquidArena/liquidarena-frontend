const mockLPNFTS = [
  {
    id: "1",
    pool: "BTC/USDT",
    dex: "PancakeSwap",
    amount: "0.02 BTC",
    value: "$865",
    numericValue: 865,
  },
  {
    id: "2",
    pool: "ADA/BNB",
    dex: "PancakeSwap",
    amount: "5000 ADA",
    value: "$1,200",
    numericValue: 1200,
  },
  {
    id: "3",
    pool: "DOT/USDC",
    dex: "Uniswap",
    amount: "150 DOT",
    value: "$750",
    numericValue: 750,
  },
  {
    id: "4",
    pool: "ETH/USDC",
    dex: "Uniswap",
    amount: "0.5 ETH",
    value: "$1,250",
    numericValue: 1250,
  },
  {
    id: "5",
    pool: "LINK/USDT",
    dex: "Uniswap",
    amount: "85 LINK",
    value: "$630",
    numericValue: 630,
  },
];

const mockTimeWindows = [
  { value: "30min", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "2h", label: "2 Hours" },
  { value: "6h", label: "6 Hours" },
  { value: "12h", label: "12 Hours" },
  { value: "24h", label: "24 Hours" },
];

const mockBattleRooms = [
  {
    id: "1",
    host: "0x1234...5678",
    timeWindow: "1h",
    hostPool: "ETH/USDC",
    hostDex: "Uniswap",
    stake: "0.5 ETH",
    stakeValue: 1250, // Add USD value
    status: "waiting",
    participants: 1,
    maxParticipants: 2,
    createdAt: "5 mins ago",
  },
  {
    id: "2",
    host: "0x9876...4321",
    timeWindow: "30min",
    hostPool: "BNB/BUSD",
    hostDex: "PancakeSwap",
    stake: "2.1 BNB",
    stakeValue: 630, // Add USD value
    status: "waiting",
    participants: 1,
    maxParticipants: 2,
    createdAt: "10 mins ago",
  },
  {
    id: "3",
    host: "0xabcd...efgh",
    timeWindow: "6h",
    hostPool: "MATIC/USDT",
    hostDex: "QuickSwap",
    stake: "1000 MATIC",
    stakeValue: 850, // Add USD value
    status: "active",
    participants: 2,
    maxParticipants: 2,
    createdAt: "15 mins ago",
  },
];

export { mockLPNFTS, mockTimeWindows, mockBattleRooms };
