import React from "react";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden ${className}`}
    >
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {/* Floating orbs with different animations */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-800/80 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-700/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/10 to-slate-400/10 rounded-full blur-3xl"></div>

        {/* Additional animated elements */}
        <div
          className="absolute top-1/4 right-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/6 w-48 h-48 bg-slate-600/30 rounded-full blur-2xl animate-ping"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/6 w-32 h-32 bg-blue-400/25 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Gradient waves */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent transform -skew-y-6 animate-pulse"
            style={{ animationDuration: "6s" }}
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-transparent via-slate-500/5 to-transparent transform skew-y-3 animate-pulse"
            style={{ animationDuration: "8s", animationDelay: "3s" }}
          ></div>
        </div>

        {/* Floating particles */}
        <div
          className="absolute top-1/6 left-1/5 w-2 h-2 bg-blue-300/60 rounded-full animate-ping"
          style={{ animationDuration: "2s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/4 w-1 h-1 bg-slate-300/60 rounded-full animate-ping"
          style={{ animationDuration: "3s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-ping"
          style={{ animationDuration: "2.5s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/6 w-1 h-1 bg-slate-400/50 rounded-full animate-ping"
          style={{ animationDuration: "4s", animationDelay: "0.5s" }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes drift {
          0% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(30px);
          }
          100% {
            transform: translateX(0px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-drift {
          animation: drift 8s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10">{children}</div>
    </div>
  );
};
