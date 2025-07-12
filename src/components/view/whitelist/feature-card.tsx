import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgFrom?: string;
  iconBgTo?: string;
  iconColor?: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconBgFrom = "blue-400/20",
  iconBgTo = "slate-400/20",
  iconColor = "blue-300",
  className = "",
}) => {
  return (
    <div
      className={`group bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-left hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 ${className}`}
    >
      <div
        className={`w-20 h-20 mb-6 bg-gradient-to-br from-${iconBgFrom} to-${iconBgTo} backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300`}
      >
        <div className={`text-${iconColor}`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/60 font-light leading-relaxed">{description}</p>
    </div>
  );
};
