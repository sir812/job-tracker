import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverLift = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-white text-black border border-slate-200 rounded-2xl p-6 transition-all duration-300 dark:bg-neutral-900/60 dark:text-white dark:border-neutral-800 dark:backdrop-blur-md dark:backdrop-saturate-150 ${
        hoverLift
          ? "hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-cyan-950/10 dark:hover:border-neutral-700"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
