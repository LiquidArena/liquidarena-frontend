import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http } from "wagmi";
import { MONAD_TESTNET } from "./contracts";

export const config = getDefaultConfig({
  appName: "LiquidArena",
  projectId: process.env.NEXT_PUBLIC_REOWN_WALLET_PROJECT_ID!,
  chains: [MONAD_TESTNET],
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [MONAD_TESTNET.id]: http(),
  },
  ssr: true,
});

// Re-export contracts for convenience
export { CONTRACTS } from "./contracts";
