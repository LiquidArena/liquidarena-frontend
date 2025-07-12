"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import * as React from "react";

export interface ThreeDCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  imageUrl?: string;
  backgroundUrl?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "shine" | "border";
  disabled?: boolean;
}

export function AnimatedCard({
  title,
  imageUrl,
  backgroundUrl,
  className,
  children,
  variant = "default",
  disabled = false,
  ...props
}: ThreeDCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [isInitialRender, setIsInitialRender] = React.useState(true);

  React.useEffect(() => {
    // Remove initial render flag after mount
    setIsInitialRender(false);
  }, []);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || disabled) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      // Calculate rotation with smoother values
      const rotateY = (mouseX / (rect.width / 2)) * 25;
      const rotateX = -(mouseY / (rect.height / 2)) * 25;

      // Calculate position with smoother values
      const moveX = (mouseX / rect.width) * 10;
      const moveY = (mouseY / rect.height) * 10;

      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setRotation({ x: rotateX, y: rotateY });
        setPosition({ x: moveX, y: moveY });
      });
    },
    [disabled],
  );

  const handleMouseLeave = React.useCallback(() => {
    if (disabled) return;
    requestAnimationFrame(() => {
      setRotation({ x: 0, y: 0 });
      setPosition({ x: 0, y: 0 });
      setIsHovered(false);
    });
  }, [disabled]);

  const handleMouseEnter = React.useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
  }, [disabled]);

  const transitionSettings = isInitialRender
    ? "none"
    : isHovered
      ? "transform 0.1s ease-out"
      : "transform 0.5s ease-out";

  const cardStyle = {
    transform: `
      perspective(2000px)
      rotateX(${disabled ? 0 : rotation.x}deg)
      rotateY(${disabled ? 0 : rotation.y}deg)
      scale(${isHovered && !disabled ? 1.05 : 1})
      ${disabled ? "translateZ(0)" : ""}
    `,
    transformStyle: "preserve-3d" as const,
    transition: transitionSettings,
    transformOrigin: "center center",
    filter: disabled ? "grayscale(1) brightness(0.8)" : "none",
    willChange: "transform",
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative h-[250px] w-[175px] cursor-pointer overflow-hidden rounded-xl",
        "transform-gpu shadow-2xl",
        // Border variant
        variant === "border" && [
          "before:absolute before:inset-0 before:z-20 before:rounded-xl before:border-2",
          "before:border-white/20 before:transition-colors before:duration-700",
          "hover:before:border-white/40",
        ],
        // Shine variant
        variant === "shine" && [
          "after:absolute after:inset-0 after:z-20",
          "after:bg-linear-to-br after:from-white/0 after:to-white/20",
          "after:transition-opacity after:duration-700",
          "hover:after:opacity-100",
        ],
        disabled && "cursor-not-allowed",
        className,
      )}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {/* Background Image with Parallax */}
      {backgroundUrl && (
        <div
          className={cn(
            "absolute inset-0 scale-110 bg-cover bg-center blur-md saturate-50",
            disabled && "brightness-75 grayscale",
          )}
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            transform: `
              translateZ(-75px)
              translateX(${position.x * 2}px)
              translateY(${position.y * 2}px)
              scale(${isHovered && !disabled ? 1.15 : 1.1})
            `,
            transition: transitionSettings,
            willChange: "transform",
          }}
        />
      )}

      {/* Glare Effect */}
      {!disabled && (
        <div
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{
            background: `linear-gradient(
              ${105 + rotation.x}deg,
              transparent 20%,
              rgba(255, 255, 255, ${isHovered ? 0.1 : 0}) 35%,
              rgba(255, 255, 255, ${isHovered ? 0.2 : 0}) 50%,
              transparent 80%
            )`,
            transform: "translateZ(1px)",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        />
      )}

      {/* Main Image with Enhanced Parallax */}
      {imageUrl && (
        <div className="relative h-full w-full">
          <Image
            src={imageUrl}
            alt={title || "Card image"}
            fill
            quality={75}
            priority={false}
            className={cn(
              "relative z-10 object-contain drop-shadow-2xl",
              disabled && "brightness-75 grayscale",
              isHovered &&
                !disabled &&
                "drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)]",
            )}
            style={{
              transform: `
                translateZ(${isHovered ? 120 : 75}px)
                translateX(${position.x * -2}px)
                translateY(${position.y * -2}px)
                scale(${isHovered && !disabled ? 1.2 : 1.1})
              `,
              transition: transitionSettings,
              willChange: "transform",
            }}
          />
        </div>
      )}

      {/* Text Content with Parallax */}
      <div
        className="absolute -bottom-3 z-20 w-full rounded-b-xl bg-linear-to-t from-black/90 via-black/50 to-transparent p-4"
        style={{
          transform: `
            translateZ(50px)
            translateX(${position.x * -1.5}px)
            translateY(${position.y * -1.5}px)
          `,
          transition: transitionSettings,
          willChange: "transform",
        }}
      >
        {title && (
          <h3
            className={cn(
              "text-lg font-bold text-white",
              disabled && "text-white/70",
            )}
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              transform: `translateZ(25px)`,
              transition: transitionSettings,
            }}
          >
            {title}
          </h3>
        )}
        {children}
      </div>

      {/* Hover ring effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl ring-2 ring-white/0",
          isHovered && !disabled && "ring-white/20",
        )}
        style={{
          transform: "translateZ(100px)",
          transition: "ring-color 0.5s ease-out",
        }}
      />
    </div>
  );
}
