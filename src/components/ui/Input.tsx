import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", type = "text", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
            <label className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
              <div className="absolute left-4 text-black dark:text-white pointer-events-none shrink-0">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
              className={`w-full bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 dark:bg-neutral-900/70 dark:hover:bg-neutral-900 dark:focus:bg-black dark:border-neutral-800 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 transition-all outline-none focus:ring-4 focus:ring-cyan-500/10 ${
              icon ? "pl-11" : ""
            } ${error ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10" : ""} ${className}`}
            {...props}
          />
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-rose-400 font-medium mt-0.5"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";
