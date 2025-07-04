"use client";

import { useAccountModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

/* eslint-disable @next/next/no-img-element */

export default function WalletProfile() {
  const { address } = useAccount();
  const { openAccountModal } = useAccountModal();

  if (!address) return null;

  return (
    <button
      onClick={openAccountModal}
      className="flex items-center fixed right-4 top-6 z-50"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-l-sm border border-white/10 outline outline-gray-200/10 outline-offset-2 pr-6 pl-4 -mr-2">
        {address.slice(0, 3)}...
        {address.slice(address.length - 4)}
      </div>
      <div className="bg-slate-500/50 backdrop-blur-sm grid place-content-center size-8 p-1 outline outline-offset-2 rounded-full relative">
        <img
          src={`https://api.dicebear.com/6.x/identicon/svg?seed=${address}`}
          alt="avatar"
          className="w-full h-full"
        />
      </div>
    </button>
  );
}
