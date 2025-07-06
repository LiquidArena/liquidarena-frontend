// Contract addresses and configurations
// This file can be imported by both client and server code

import { Chain } from "viem";

// Contract addresses on Monad Testnet
export const CONTRACTS = {
  // Updated contract addresses
  RANGE_BATTLE: '0x9A84616E68F3B30752fB5659DCD33F3F49ee88dC' as const,
  FEE_BATTLE: '0x47864330857eA75f50cf4a9092073D3C13794361' as const,
  // Uniswap V3 Position Manager on Monad Testnet
  POSITION_MANAGER: '0x3dCc735C74F10FE2B9db2BB55C40fbBbf24490f7' as const,
} as const;

// Monad Testnet configuration
export const MONAD_TESTNET: Chain = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/monad_testnet"],
    },
    public: {
      http: ["https://rpc.ankr.com/monad_testnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadScan",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
};
