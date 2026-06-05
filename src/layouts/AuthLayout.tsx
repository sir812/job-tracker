import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BriefcaseBusiness } from "lucide-react";

export const AuthLayout: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Main card wrapper */}
      <div className="w-full max-w-md flex flex-col gap-6 relative z-10">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 dark:shadow-black/40">
            <BriefcaseBusiness className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white mt-2">
            Job<span className="text-cyan-400">Tracker</span>
          </h2>
          <p className="text-xs text-black dark:text-black">Organize your job search. Land your dream offer.</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
};
export default AuthLayout;
