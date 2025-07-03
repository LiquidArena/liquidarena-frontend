import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage } from "wagmi";
import { Chain } from "wagmi/chains";

const monadTestnet: Chain = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz/"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz/"],
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

export const config = getDefaultConfig({
  appName: "Simple DEX",
  projectId: process.env.NEXT_PUBLIC_REOWN_WALLET_PROJECT_ID!,
  chains: [monadTestnet],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
