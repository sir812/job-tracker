import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const UserDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/auth/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-full transition-colors cursor-pointer select-none dark:hover:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700"
      >
        <div className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center font-bold text-cyan-700 uppercase text-xs dark:bg-black dark:border-cyan-500/20 dark:text-cyan-400">
          {user?.name?.substring(0, 2) ?? "US"}
        </div>
        <ChevronDown className="w-4 h-4 text-black mr-1 hidden sm:inline dark:text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white text-black border border-slate-200 rounded-2xl shadow-xl py-2 z-50 origin-top-right dark:bg-black dark:text-white dark:border-neutral-800 dark:backdrop-blur-md dark:backdrop-saturate-150"
          >
            <div className="px-4 py-2 border-b border-slate-200 mb-1 select-none dark:border-neutral-800">
              <p className="text-xs text-black font-semibold uppercase tracking-wider">Account</p>
              <p className="text-sm font-bold text-black truncate mt-0.5 dark:text-white">{user?.name ?? "User"}</p>
              <p className="text-xs text-black truncate mt-0.5 dark:text-white">{user?.email}</p>
            </div>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-black hover:text-black hover:bg-slate-100 transition-colors dark:text-white dark:hover:text-white dark:hover:bg-neutral-900/80"
            >
              <User className="w-4 h-4 text-black shrink-0 dark:text-white" />
              <span>My Profile</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-black hover:text-black hover:bg-slate-100 transition-colors dark:text-white dark:hover:text-white dark:hover:bg-neutral-900/80"
            >
              <Settings className="w-4 h-4 text-black shrink-0 dark:text-white" />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors border-t border-slate-200 mt-1 cursor-pointer dark:text-rose-400 dark:hover:bg-neutral-900 dark:hover:text-rose-300 dark:border-neutral-800"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
