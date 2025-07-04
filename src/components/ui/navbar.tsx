"use client";

import { useWalletAuth } from "@/hooks/use-wallet-auth";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Flag, Swords, Trophy, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useAccountEffect } from "wagmi";

export default function Navbar() {
  const { push } = useRouter();

  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const { signIn, signOut } = useWalletAuth();

  const handleButtonAction = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    return push("/arena");
  };

  useAccountEffect({
    onConnect(data) {
      signIn(data.address);
    },
    onDisconnect() {
      signOut();
    },
  });

  return (
    <header className="fixed bottom-0 lg:top-0 lg:bottom-full z-50 left-0 w-full">
      <div className="absolute h-1.5 w-full bottom-0 lg:top-0 left-0 bg-gray-100/10 backdrop-blur-sm border-b border-white/10 outline-gray-100/10 outline outline-offset-4" />
      <nav className="w-full px-4 max-w-sm lg:max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-t-2xl lg:rounded-t-none lg:rounded-b-2xl min-h-16 border-b border-white/10 relative flex items-center justify-between">
        <div className="hidden lg:contents">
          <Link href="/" className="font-bold">
            LIQUID<span className="font-light">ARENA</span>
          </Link>
          <ul className="flex items-center gap-4">
            {menus.map(
              (menu) =>
                (!menu.requireAuth || isConnected) && (
                  <li
                    className="text-sm text-gray-400 hover:text-gray-100"
                    key={menu.id}
                  >
                    <Link href={menu.href}>{menu.label}</Link>
                  </li>
                ),
            )}
          </ul>
        </div>
        <div className="lg:hidden contents">
          <div className="flex items-center gap-8">
            {menus.slice(0, 2).map((menu) => (
              <Link href={menu.href} key={menu.id}>
                <menu.icon className="text-gray-300" />
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-8">
            {menus.slice(2, 4).map((menu) => (
              <Link href={menu.href} key={menu.id}>
                <menu.icon className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={handleButtonAction}
          className="grid place-content-center rounded-full size-14 bg-gradient-to-br from-gray-200 to-slate-600 backdrop-blur-md absolute -top-6 lg:top-6 left-1/2 -translate-x-1/2 border-white/10 outline-2 outline-white/10 outline-offset-2 transition-all duration-150 ease-in-out hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 h-[100cqh] w-full bg-gradient-to-br from-gray-100 to-gray-800 animate-pulse [aspect-ratio:1] [border-radius:0] [mask:none]"></div>
          <Swords className="text-white relative" />
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
    requireAuth: false,
    icon: Trophy,
  },
  {
    id: 2,
    label: "Arena",
    href: "/arena",
    requireAuth: false,
    icon: Users,
  },
  {
    id: 3,
    label: "Whitelist",
    href: "/whitelist",
    requireAuth: false,
    icon: Flag,
  },
  {
    id: 4,
    label: "Profile",
    href: "/profile",
    requireAuth: true,
    icon: User,
  },
];
