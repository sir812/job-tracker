import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  KanbanSquare,
  BarChart3,
  Calendar,
  Bookmark,
  Search,
  User,
  Settings,
  Bot,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useJobs } from "../../context/JobContext";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { jobs } = useJobs();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/auth/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
    { label: "Kanban Board", href: "/kanban", icon: KanbanSquare },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Saved Jobs", href: "/saved", icon: Bookmark, badge: jobs.filter(j => j.status === "Saved").length },
    { label: "Search Jobs", href: "/search", icon: Search },
    { label: "AI Chat", href: "/ai-chat", icon: Bot },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-80 max-w-[85vw] h-full bg-white text-black border-r border-slate-200 flex flex-col z-10 dark:bg-black dark:text-white dark:border-neutral-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200 h-[72px] dark:border-neutral-800">
              <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
                <BriefcaseBusiness className="w-7 h-7 text-cyan-500 dark:text-cyan-400" />
                <span className="text-lg font-bold tracking-tight text-black dark:text-white">
                  Job<span className="text-cyan-400">Tracker</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close mobile navigation"
                title="Close mobile navigation"
                className="text-black hover:text-black transition-colors p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer dark:text-white dark:hover:text-white dark:hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all relative font-semibold text-sm ${
                      isActive
                        ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-black border-l-2 border-cyan-500 dark:border-cyan-400 pl-3.5"
                        : "text-black hover:text-black hover:bg-slate-100 dark:text-white dark:hover:text-white dark:hover:bg-neutral-900/80"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-slate-100 border border-slate-200 text-[10px] text-cyan-600 font-bold px-2 py-0.5 rounded-full shrink-0 dark:bg-black dark:border-neutral-800 dark:text-cyan-400">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>

            {/* User footer profile */}
            <div className="p-4 border-t border-slate-200 space-y-3 dark:border-neutral-800">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center font-bold text-cyan-700 uppercase select-none shrink-0 dark:bg-black dark:border-neutral-800 dark:text-cyan-400">
                  {user?.name?.substring(0, 2) ?? "US"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate dark:text-white">{user?.name ?? "User"}</p>
                  <p className="text-xs text-black truncate dark:text-white">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-3.5 py-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-black transition-colors font-semibold text-sm cursor-pointer border border-transparent hover:border-rose-200 dark:hover:bg-black dark:hover:text-rose-400 dark:text-white dark:hover:border-rose-500/10"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
