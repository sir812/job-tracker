import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  charLimit?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, charLimit, className = "", value, onChange, ...props }, ref) => {
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex justify-between items-center select-none">
          {label && (
            <label className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white">
              {label}
            </label>
          )}
          {charLimit && (
            <span className="text-[10px] font-medium text-black dark:text-white">
              {charCount} / {charLimit}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          maxLength={charLimit}
          className={`w-full min-h-[100px] bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 dark:bg-neutral-900/70 dark:hover:bg-neutral-900 dark:focus:bg-black dark:border-neutral-800 focus:border-cyan-500/50 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 transition-all outline-none focus:ring-4 focus:ring-cyan-500/10 resize-y ${
            error ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10" : ""
          } ${className}`}
          {...props}
        />
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

Textarea.displayName = "Textarea";
