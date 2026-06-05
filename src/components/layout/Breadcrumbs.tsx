import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-black select-none dark:text-white">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-black hover:text-black transition-colors dark:text-white dark:hover:text-white"
      >
        <Home className="w-3.5 h-3.5 text-black dark:text-white" />
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const formattedName =
          value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ");

        return (
          <div key={to} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-black dark:text-black shrink-0" />
            {isLast ? (
              <span className="text-black dark:text-white font-bold truncate max-w-[120px]">
                {formattedName}
              </span>
            ) : (
              <Link
                to={to}
                className="text-black hover:text-black transition-colors truncate max-w-[120px] dark:text-white dark:hover:text-white"
              >
                {formattedName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
