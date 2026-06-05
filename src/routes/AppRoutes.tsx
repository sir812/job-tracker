import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";

// Lazy-load pages to split bundles
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Jobs = lazy(() => import("../pages/Jobs"));
const Kanban = lazy(() => import("../pages/Kanban"));
const Analytics = lazy(() => import("../pages/Analytics"));
const Calendar = lazy(() => import("../pages/Calendar"));
const SavedJobs = lazy(() => import("../pages/SavedJobs"));
const JobSearch = lazy(() => import("../pages/JobSearch"));
const AIChat = lazy(() => import("../pages/AIChat"));
const Settings = lazy(() => import("../pages/Settings"));
const Profile = lazy(() => import("../pages/Profile"));
const Notifications = lazy(() => import("../pages/Notifications"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Landing = lazy(() => import("../pages/Landing"));

const RouteFallback: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const LazyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<RouteFallback />}>
    {children}
  </Suspense>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LazyRoute><Login /></LazyRoute>} />
        <Route path="/auth/register" element={<LazyRoute><Register /></LazyRoute>} />
      </Route>

      {/* App Routes (Protected via token checking inside AppLayout) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<LazyRoute><Dashboard /></LazyRoute>} />
        <Route path="/jobs" element={<LazyRoute><Jobs /></LazyRoute>} />
        <Route path="/kanban" element={<LazyRoute><Kanban /></LazyRoute>} />
        <Route path="/analytics" element={<LazyRoute><Analytics /></LazyRoute>} />
        <Route path="/calendar" element={<LazyRoute><Calendar /></LazyRoute>} />
        <Route path="/saved" element={<LazyRoute><SavedJobs /></LazyRoute>} />
        <Route path="/search" element={<LazyRoute><JobSearch /></LazyRoute>} />
        <Route path="/ai-chat" element={<LazyRoute><AIChat /></LazyRoute>} />
        <Route path="/profile" element={<LazyRoute><Profile /></LazyRoute>} />
        <Route path="/settings" element={<LazyRoute><Settings /></LazyRoute>} />
        <Route path="/notifications" element={<LazyRoute><Notifications /></LazyRoute>} />
      </Route>

      {/* Wildcard Redirects */}
      {/* Public / Landing Route */}
      <Route path="/" element={<LazyRoute><Landing /></LazyRoute>} />
      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
    </Routes>
  );
};
export default AppRoutes;
