"use client";

import { useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";

export function useWalletAuth() {
  const { address: addressClient, chainId } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (address?: string) => {
    if (!addressClient && !address) throw new Error("Wallet not connected");

    setIsLoading(true);
    try {
      const message = `Sign in to LiquidArena\n\nAddress: ${address || addressClient}\nChain ID: ${chainId}\nTimestamp: ${Date.now()}`;

      const signature = await signMessageAsync({ message });

      const response = await fetch("/api/v1/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address || addressClient,
          signature,
          message,
          chainId,
        }),
      });

      if (!response.ok) {
        await disconnectAsync();
      }
    } catch (error) {
      console.warn(error);
      await disconnectAsync();
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/v1/auth/signin", {
      method: "DELETE",
    });

    // refresh();
    window.location.reload();
  };

  return { signIn, signOut, isLoading };
}
