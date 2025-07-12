"use client";

import { ChevronLeft, Coins, Home, Swords, Wallet } from "lucide-react";
import { useState } from "react";

export default function HowItWorksSection() {
  const [selected, setSelected] = useState(0);

  return (
    <section className="bg-black px-4 lg:px-12 min-h-[600px] flex flex-col">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center max-w-3xl space-y-2 mx-auto">
          <h2 className="font-bold text-3xl lg:text-5xl">How it works</h2>
          <p>
            Liquid Arena lets you stake your LP positions in real-time price
            prediction duels. Outsmart your opponent, survive the price range,
            and win both LPs. No luck, just skill.
          </p>
        </div>
        <div className="w-0.5 h-12 bg-white/10 mx-auto"></div>
        <div className="w-full h-full bg-gray-100/5 min-h-[600px] rounded-2xl outline outline-offset-6 mt-1.5 border border-white/10 p-4 flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2 bg-gray-100/0.5 backdrop-blur-sm rounded-2xl p-8 relative overflow-hidden">
            <h3 className="text-3xl">{howItWorks[selected].title}</h3>
            <p className="text-2xl">{howItWorks[selected].body}</p>
            {(() => {
              const IconComponent = howItWorks[selected].icon;
              return (
                <IconComponent className="size-[400px] absolute -right-24 -bottom-16 text-white/10 opacity-10 -rotate-12" />
              );
            })()}
          </div>
          <div className="lg:w-1/2 h-full my-auto space-y-6">
            {howItWorks.map((item) => (
              <button
                onClick={() => setSelected(item.id)}
                key={item.id}
                className="w-full group p-4 bg-gray-100/5 rounded-xl min-h-20 flex items-center justify-between hover:bg-gray-100/20 transition-all ease-in-out duration-300 hover:scale-105"
              >
                <ChevronLeft className="text-gray-400 size-8" />
                <h3 className="text-xl lg:text-3xl text-end">{item.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const howItWorks = [
  {
    id: 0,
    title: "Connect Wallet",
    body: "Connect your wallet to get started.",
    icon: Wallet,
  },
  {
    id: 1,
    title: "Create/Join a Battle",
    body: "Select time window and LP tokens to stake.",
    icon: Home,
  },
  {
    id: 2,
    title: "Let The Fight Begin",
    body: "Confirm your stake and wait for the battle to begin.",
    icon: Swords,
  },
  {
    id: 3,
    title: "The Winner Takes All",
    body: "Outsmart your opponent, survive the price range, and win both LPs. No luck, just skill.",
    icon: Coins,
  },
];
