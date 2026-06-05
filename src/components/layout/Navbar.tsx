import React, { useState } from "react";
import { Menu, Search } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserDropdown } from "./UserDropdown";

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar }) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-[72px] bg-white/85 text-black backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 select-none dark:bg-black/85 dark:text-white dark:border-neutral-800">
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-black hover:text-black transition-colors bg-slate-100 border border-slate-200 rounded-xl cursor-pointer dark:text-white dark:hover:text-white dark:bg-neutral-900 dark:border-neutral-800"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumbs />
      </div>

      {/* Right: Actions (Search, Theme, Notify, User) */}
      <div className="flex items-center gap-3">
        {/* Expanding Search bar */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-black dark:text-white absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search applications..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`bg-white border border-slate-200 focus:border-slate-300 rounded-full pl-9 pr-4 py-2 text-xs text-black placeholder-slate-500 focus:outline-none transition-all duration-300 focus:ring-4 focus:ring-cyan-500/5 dark:bg-neutral-900 dark:border-neutral-800 dark:focus:border-neutral-700 dark:text-white ${
              searchFocused ? "w-64 bg-white dark:bg-black" : "w-44"
            }`}
          />
        </div>

        <ThemeToggle />
        <NotificationDropdown />
        
        {/* Divider */}
        <span className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:inline dark:bg-neutral-800" />

        <UserDropdown />
      </div>
    </header>
  );
};
export default Navbar;
