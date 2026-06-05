import React from "react";
import { motion } from "framer-motion";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const sizeStyles = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  const variantStyles = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-md shadow-cyan-500/10",
    secondary: "bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700/60",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/10",
    ghost: "bg-transparent hover:bg-neutral-900 text-black hover:text-white",
    glass: "bg-white text-black border border-slate-200 hover:bg-slate-50 shadow-sm dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-white/15 dark:backdrop-blur-md dark:backdrop-saturate-150",
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <Spinner size="sm" className="mr-2" />
      ) : icon ? (
        <span className="mr-2 flex items-center shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};
