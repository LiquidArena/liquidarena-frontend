"use client";

import LeaderboardTable from "@/components/view/leaderboard/leaderboard-table";
import "@/components/view/leaderboard/leaderboard.styles.css";
import Podium from "@/components/view/leaderboard/podium";
import React, { useEffect, useState } from "react";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  prize: number;
  position: number;
  emoji: string;
}

const Leaderboard: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    // Trigger visibility animation
    const timer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const topUsers: LeaderboardUser[] = [
    {
      id: "1",
      name: "Brian Ngo",
      avatar:
        "https://i.pinimg.com/736x/3e/13/0a/3e130acfeda3dfeafe5542def0afcc9d.jpg",
      points: 2000,
      prize: 50000,
      position: 2,
      emoji: "😤",
    },
    {
      id: "2",
      name: "Jolie Joie",
      avatar:
        "https://i.pinimg.com/736x/67/8e/4d/678e4dcf1ce03f2b70df3a133bfd653b.jpg",
      points: 2000,
      prize: 100000,
      position: 1,
      emoji: "🔥",
    },
    {
      id: "3",
      name: "David Do",
      avatar:
        "https://i.pinimg.com/736x/0e/ec/ea/0eecea46987c10435e974d7b778925c7.jpg",
      points: 2000,
      prize: 20000,
      position: 3,
      emoji: "🗿",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative pt-20 pb-36">
        {/* Grid Pattern Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]"></div>

        <div className="absolute inset-0 overflow-hidden">
          {/* Moving gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-backgroundMove animate-pulseGlow"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-backgroundMove"
            style={{ animationDelay: "10s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-500/5 rounded-full filter blur-2xl animate-backgroundMove"
            style={{ animationDelay: "5s" }}
          ></div>

          <div className="floating-particles particle-1"></div>
          <div className="floating-particles particle-2"></div>
          <div className="floating-particles particle-3"></div>
          <div className="floating-particles particle-4"></div>
        </div>

        <div
          className="flex items-center justify-center p-4 relative z-10 py-12"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <div className="w-full max-w-5xl">
            <Podium users={topUsers} isVisible={isVisible} />
            <LeaderboardTable isVisible={isVisible} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
