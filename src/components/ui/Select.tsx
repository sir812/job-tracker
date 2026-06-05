import React, { forwardRef, useId } from "react";
import "./select.css";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    const generatedId = useId();
    const selectId = (props as any).id || `select-${generatedId}`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white select-none">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full jt-select-arrow bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 dark:bg-neutral-900/70 dark:hover:bg-neutral-900 dark:focus:bg-black dark:border-neutral-800 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 transition-all outline-none focus:ring-4 focus:ring-cyan-500/10 appearance-none cursor-pointer ${
            error ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-black dark:bg-black dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
