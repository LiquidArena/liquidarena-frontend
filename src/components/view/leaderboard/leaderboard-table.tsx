"use client";

import { Medal, Timer } from "lucide-react";
import React from "react";

interface LeaderboardTableProps {
  isVisible: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ isVisible }) => {
  const formatPrize = (prize: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(prize);
  };

  const leaderboardData = [
    {
      position: 4,
      name: "Sarah Kim",
      avatar:
        "https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg",
      points: 1850,
      prize: 15000,
    },
    {
      position: 5,
      name: "Mike Chen",
      avatar:
        "https://i.pinimg.com/736x/02/00/4a/02004aeabe5c2a6bb7cecda2ee4e9151.jpg",
      points: 1720,
      prize: 10000,
    },
    {
      position: 6,
      name: "Emma Wilson",
      avatar:
        "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5474.jpg",
      points: 1680,
      prize: 7500,
    },
    {
      position: 7,
      name: "Alex Rodriguez",
      avatar:
        "https://i.pinimg.com/736x/aa/d6/32/aad632dd278be79ba13165c7b9e0ea34.jpg",
      points: 1620,
      prize: 5000,
    },
    {
      position: 8,
      name: "Lisa Park",
      avatar:
        "https://i.pinimg.com/736x/1a/79/75/1a7975b898ea36f85cc38c5ce7b72d1c.jpg",
      points: 1580,
      prize: 2500,
    },
    {
      position: 9,
      name: "James Taylor",
      avatar:
        "https://i.pinimg.com/736x/91/ac/e7/91ace7e4b77a12c9a7a48522b2a6c9a7.jpg",
      points: 1520,
      prize: 1000,
    },
    {
      position: 10,
      name: "Nina Zhang",
      avatar:
        "https://i.pinimg.com/736x/47/aa/22/47aa22dfecfdbff79e59eeaa2690a5f8.jpg",
      points: 1480,
      prize: 500,
    },
  ];

  return (
    <>
      <div
        className={`flex flex-col items-center justify-center scroll-reveal ${isVisible ? "visible" : ""} mb-8`}
        style={{ transitionDelay: "0.8s" }}
      >
        <div className="flex flex-col items-center justify-center opacity-60 gap-3 mb-4">
          <Timer className="w-10 h-10 text-blue-400 animate-pulse" />
          <span className="text-lg text-slate-300">Contest Ends In</span>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/10 shadow-xl">
          <p className="text-xl font-bold text-white tracking-wider">
            10d 23h 59m 29s
          </p>
        </div>
      </div>
      <div
        className={`w-full max-w-4xl mx-auto mb-12 scroll-reveal ${isVisible ? "visible" : ""}`}
        style={{ transitionDelay: "1s" }}
      >
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 shadow-lg shimmer-effect card-hover">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">#247</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Your Position</h3>
                <p className="text-slate-400">Out of 2,738 users</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">1,250 points</p>
              <p className="text-slate-400">Keep climbing!</p>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`w-full max-w-4xl mx-auto scroll-reveal ${isVisible ? "visible" : ""}`}
        style={{ transitionDelay: "1.2s" }}
      >
        <div className="space-y-4">
          {leaderboardData.map((item) => (
            <div
              key={item.position}
              className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl card-hover shimmer-effect"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold">
                      #{item.position}
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/20">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {item.name}
                    </h3>
                    <p className="text-slate-400">
                      {item.points.toLocaleString()} points
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 bg-black/30 rounded-lg px-4 py-2">
                    <Medal className="w-4 h-4 text-slate-400" />
                    <span className="text-lg font-bold text-slate-400">
                      ${formatPrize(item.prize)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="text-center pt-6">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
              Load More
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaderboardTable;
