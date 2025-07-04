import React from "react";

interface HeroHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  title = "Be the First to Experience",
  subtitle = "Waitlis",
  className = "",
}) => {
  return (
    <div className={`text-center mb-20 ${className}`}>
      <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-6xl font-black leading-tight mb-8">
        <span className="block bg-gradient-to-r from-white via-blue-100 to-slate-100 bg-clip-text text-transparent drop-shadow-2xl">
          {title}
        </span>
        <span className="block bg-gradient-to-r from-blue-300 via-slate-300 to-blue-300 bg-clip-text text-transparent">
          to Experience{" "}
          <strong className="text-white font-light italic text-4xl sm:text-5xl lg:text-6xl mt-4">
            {subtitle}
          </strong>
        </span>
      </h1>
    </div>
  );
};
