import React from "react";

import { FeatureCard } from "./feature-card";

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgFrom?: string;
  iconBgTo?: string;
  iconColor?: string;
}

interface FeaturesGridProps {
  features?: Feature[];
  className?: string;
}

const defaultFeatures: Feature[] = [
  {
    id: "priority-support",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Priority Support",
    description:
      "Lightning-fast assistance for our valued early adopters and beta testers.",
    iconBgFrom: "blue-400/20",
    iconBgTo: "slate-400/20",
    iconColor: "blue-300",
  },
  {
    id: "exclusive-features",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
    title: "Exclusive Features",
    description:
      "Unlock premium capabilities and advanced tools before public release.",
    iconBgFrom: "slate-400/20",
    iconBgTo: "blue-400/20",
    iconColor: "slate-300",
  },
  {
    id: "beta-access",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Beta Access",
    description:
      "Be among the first pioneers to test and shape cutting-edge features.",
    iconBgFrom: "blue-400/20",
    iconBgTo: "slate-400/20",
    iconColor: "blue-300",
  },
  {
    id: "personal-guidance",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: "Personal Guidance",
    description:
      "Receive tailored support and one-on-one assistance from our expert team.",
    iconBgFrom: "slate-400/20",
    iconBgTo: "blue-400/20",
    iconColor: "slate-300",
  },
];

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({
  features = defaultFeatures,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-20 ${className}`}
    >
      {features.map((feature) => (
        <FeatureCard
          key={feature.id}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          iconBgFrom={feature.iconBgFrom}
          iconBgTo={feature.iconBgTo}
          iconColor={feature.iconColor}
        />
      ))}
    </div>
  );
};
