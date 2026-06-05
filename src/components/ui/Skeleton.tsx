import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
}) => {
  const shapeClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "text"
      ? "rounded h-4 w-full"
      : "rounded-xl";

  return (
    <div
      className={`bg-neutral-900/70 border border-neutral-800/60 animate-pulse animate-shimmer ${shapeClass} ${className}`}
    />
  );
};
