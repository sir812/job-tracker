import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Briefcase, Calendar, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useJobs } from "../../context/JobContext";

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activities } = useJobs();

  // Show only top 4 activities in dropdown
  const recentActs = activities.slice(0, 4);
  const unreadCount = activities.length > 0 ? 2 : 0; // Simulated unread count

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "offer":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "interview":
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case "applied":
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    const diff = Date.now() - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-black hover:text-black transition-colors bg-slate-100 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-200 flex items-center justify-center shrink-0 relative dark:text-white dark:hover:text-white dark:bg-neutral-900/80 dark:border-neutral-800 dark:hover:bg-black"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white text-black border border-slate-200 rounded-2xl shadow-xl py-2 z-50 origin-top-right select-none dark:bg-black dark:text-white dark:border-neutral-800 dark:backdrop-blur-md dark:backdrop-saturate-150"
          >
            <div className="px-4 py-2 border-b border-slate-200 mb-1 flex items-center justify-between dark:border-neutral-800">
              <span className="text-xs text-black font-semibold uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">New updates</span>}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {recentActs.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <p className="text-xs text-black dark:text-black">No new notifications</p>
                </div>
              ) : (
                recentActs.map((act) => (
                  <div
                    key={act.id}
                    className="flex gap-3 px-4 py-3 hover:bg-slate-100 transition-colors border-b border-slate-200 last:border-0 dark:hover:bg-neutral-900/80 dark:border-neutral-800"
                  >
                    <div className="mt-0.5 shrink-0">{getActivityIcon(act.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-black dark:text-white leading-normal font-medium break-words">
                        {act.message}
                      </p>
                      <span className="text-[9px] text-black mt-1 block dark:text-white">
                        {timeAgo(act.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-semibold text-cyan-600 hover:text-cyan-500 py-2 border-t border-slate-200 mt-1 transition-colors dark:text-cyan-400 dark:hover:text-cyan-300 dark:border-neutral-800"
            >
              See all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
