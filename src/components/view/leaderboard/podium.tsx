"use client";

import { Medal } from "lucide-react";
import React from "react";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  prize: number;
  emoji: string;
  position: number;
}

interface PodiumProps {
  users: LeaderboardUser[];
  isVisible: boolean;
}

const Podium: React.FC<PodiumProps> = ({ users, isVisible }) => {
  const getPositionStyles = (position: number) => {
    switch (position) {
      case 1:
        return {
          order: "order-1 lg:order-2",
          height: "h-56",
          gradient: "from-amber-500/20 to-amber-600/30",
          prizeColor: "text-amber-400",
          podiumGradient: "from-slate-800 to-slate-900",
          zIndex: "z-20",
        };
      case 2:
        return {
          order: "order-2 lg:order-1",
          height: "h-40",
          gradient: "from-slate-500/20 to-slate-600/30",
          prizeColor: "text-slate-300",
          podiumGradient: "from-slate-800/90 to-slate-900/90",
          zIndex: "z-10",
        };
      case 3:
        return {
          order: "order-3",
          height: "h-32",
          gradient: "from-orange-600/20 to-orange-700/30",
          prizeColor: "text-orange-400",
          podiumGradient: "from-slate-800/80 to-slate-900/80",
          zIndex: "z-10",
        };
      default:
        return {
          order: "",
          height: "h-24",
          gradient: "from-slate-600/20 to-slate-700/30",
          prizeColor: "text-slate-400",
          podiumGradient: "from-slate-800/70 to-slate-900/70",
          zIndex: "z-0",
        };
    }
  };

  const formatPrize = (prize: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(prize);
  };

  return (
    <div className="flex items-center lg:items-end justify-center gap-6 px-8 mb-8 mt-4 flex-col lg:flex-row">
      {users.map((user, index) => {
        const styles = getPositionStyles(user.position);
        return (
          <div
            key={user.id}
            className={`flex flex-col items-center ${styles.order} ${styles.zIndex} scroll-reveal ${isVisible ? "visible" : ""} animate-float`}
            style={{
              minWidth: "300px",
              animationDelay: `${index * 2}s`,
              transitionDelay: `${index * 0.2}s`,
            }}
          >
            <div className="relative mb-0 w-full">
              <div className="backdrop-blur-md bg-slate-800/50 rounded-3xl p-8 border border-white/10 relative overflow-hidden card-hover shimmer-effect shadow-2xl">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-50`}
                ></div>

                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-3xl"></div>

                <div className="relative z-10">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                    <span className="text-white font-bold text-3xl">
                      {user.emoji}
                    </span>
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {user.position === 1 && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 animate-pulseGlow"></div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white text-center mb-3 tracking-wide">
                    {user.name}
                  </h3>
                  <p className="text-lg text-slate-400 text-center mb-6">
                    <span className="font-semibold text-white">
                      {user.points.toLocaleString()}
                    </span>{" "}
                    points earned
                  </p>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 bg-black/30 rounded-xl px-6 py-3 backdrop-blur-sm border border-white/10 shadow-lg">
                      <Medal className={`w-6 h-6 ${styles.prizeColor}`} />
                      <span
                        className={`text-2xl font-bold ${styles.prizeColor}`}
                      >
                        ${formatPrize(user.prize)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full podium-3d">
              <div className="podium-top"></div>
              <div
                className={`${styles.height} w-full bg-gradient-to-b ${styles.podiumGradient} rounded-xl relative overflow-hidden border-t border-x border-white/5 shadow-2xl`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl font-bold text-white/5 select-none">
                    {user.position}
                  </span>
                </div>
              </div>
              <div className="podium-shadow"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Podium;
