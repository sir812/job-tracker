import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 transition-colors rounded-xl cursor-pointer flex items-center justify-center shrink-0 relative overflow-hidden bg-white text-black hover:text-black border border-slate-200 hover:bg-slate-50 dark:bg-neutral-900 dark:text-white dark:hover:text-white dark:border-neutral-800 dark:hover:bg-black"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Dark mode (click to switch to light)" : "Light mode (click to switch to dark)"}
    >
      <motion.div
        animate={{ rotate: theme === "dark" ? 0 : 90, scale: theme === "dark" ? 1 : 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-cyan-400" />
      </motion.div>
      <motion.div
        animate={{ rotate: theme === "light" ? 0 : -90, scale: theme === "light" ? 1 : 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Sun className="w-5 h-5 text-amber-400" />
      </motion.div>
    </button>
  );
};
