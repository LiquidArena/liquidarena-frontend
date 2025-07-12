"use client";

import { Button } from "@/components/ui/button";
import GridPatternBackground from "@/components/ui/grid-pattern-background";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function HeroSection() {
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  const handleButtonAction = () => {
    if (!address) {
      openConnectModal?.();
      return;
    }

    return router.push("/arena");
  };

  return (
    <section className="relative lg:max-h-[1080px] lg:py-20 p-6 lg:px-12 bg-gradient-to-b from-slate-900 via-gray-800 to-black">
      <GridPatternBackground />
      <div className="relative flex flex-col lg:flex-row lg:gap-6 items-center container max-w-6xl mx-auto">
        <div className="lg:max-w-xl space-y-4">
          <div>
            <p className="italic">Stake. Predict. Conquer.</p>
            <h1 className="font-bold text-3xl lg:text-5xl">
              Turn your LP tokens into skill-based battles for rewards.
            </h1>
          </div>
          <p>
            Liquid Arena lets you stake your LP positions in real-time price
            prediction duels. Outsmart your opponent, survive the price range,
            and win both LPs. No luck, just skill.
          </p>
          <Button
            onClick={handleButtonAction}
            className="bg-gradient-to-r from-slate-700 to-gray-800 py-5 text-white hover:scale-105 transition-all duration-300 ease-in-out"
          >
            🔥Enter The Arena
          </Button>
        </div>
        <div className="lg:w-1/2 h-full mx-auto">
          <Image
            src="/cyber-knight.png"
            alt="hero image"
            width={512}
            height={512}
            className="w-full h-auto mix-blend-exclusion rotate-6"
          />
        </div>
      </div>
    </section>
  );
}
