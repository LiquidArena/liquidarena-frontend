"use client";

import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { Swords } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function Navbar() {
  const { push } = useRouter();

  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const { openAccountModal } = useAccountModal();

  const handleButtonAction = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    return push("/lobby");
  };

  return (
    <header className="fixed bottom-0 lg:top-0 lg:bottom-full z-50 left-0 w-full">
      <div className="absolute h-1.5 w-full lg:top-0 left-0 bg-gray-100/10 backdrop-blur-sm border-b border-white/10 outline-gray-100/10 outline outline-offset-4 hidden lg:block" />
      <nav className="w-full px-4 max-w-3xl mx-auto bg-white/5 backdrop-blur-sm rounded-t-2xl lg:rounded-t-none lg:rounded-b-2xl min-h-16 border-b border-white/10 relative flex items-center justify-between">
        <div className="hidden lg:contents">
          <p className="font-bold">
            LIQUID<span className="font-light">ARENA</span>
          </p>
          <ul className="flex items-center gap-4">
            {menus.map((menu) => (
              <li
                className="text-sm text-gray-400 hover:text-gray-100"
                key={menu.id}
              >
                <Link href={menu.href}>{menu.label}</Link>
              </li>
            ))}
            {isConnected && (
              <>
                <li className="text-sm text-gray-400 hover:text-gray-100">
                  <button onClick={openAccountModal}>Profile</button>
                </li>
              </>
            )}
          </ul>
        </div>
        <button
          onClick={handleButtonAction}
          className="grid place-content-center rounded-full size-14 bg-gradient-to-br from-gray-200 to-slate-600 backdrop-blur-md absolute -top-6 lg:top-6 left-1/2 -translate-x-1/2 border-white/10 outline-2 outline-white/10 outline-offset-2 transition-all duration-150 ease-in-out hover:scale-105"
        >
          <Swords className="text-white" />
        </button>
      </nav>
    </header>
  );
}

const menus = [
  {
    id: 1,
    label: "Leaderboard",
    href: "/leaderboard",
  },
  {
    id: 2,
    label: "Lobby",
    href: "/lobby",
  },
  {
    id: 3,
    label: "Whitelist",
    href: "/whitelist",
  },
  // {
  //   id: 4,
  //   label: "Profile",
  //   href: "/profile",
  // },
];
