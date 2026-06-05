import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useJobs } from "../context/JobContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import {
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Compass,
  FileCheck2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type MetricTone = "sky" | "amber" | "emerald" | "rose";

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: MetricTone;
  borderTone: string;
}

const themeClasses = {
  title: "text-[hsl(var(--foreground))]",
  body: "text-[hsl(var(--foreground))]/85",
  muted: "text-[hsl(var(--muted-foreground))]",
  subtle: "text-[hsl(var(--muted-foreground))]/85",
  border: "border-[hsl(var(--border))]",
  surfaceMuted: "bg-[hsl(var(--muted))]",
  surfaceMutedSoft: "bg-[hsl(var(--muted))]/90",
  surfaceMutedHover: "hover:bg-[hsl(var(--muted))]/80",
};

const toneStyles: Record<MetricTone, { container: string; icon: string }> = {
  sky: {
    container: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30",
    icon: "text-sky-600 dark:text-sky-300",
  },
  amber: {
    container: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
    icon: "text-amber-600 dark:text-amber-300",
  },
  emerald: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
    icon: "text-emerald-600 dark:text-emerald-300",
  },
  rose: {
    container: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
    icon: "text-rose-600 dark:text-rose-300",
  },
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, tone, borderTone }) => {
  const styles = toneStyles[tone];

  return (
    <Card className={`flex items-center justify-between p-5 border-l-4 ${borderTone}`}>
      <div className="flex flex-col gap-1">
        <span className={`text-[10px] uppercase font-bold ${themeClasses.muted}`}>{label}</span>
        <h4 className={`text-2xl font-bold ${themeClasses.title}`}>{value}</h4>
      </div>
      <div className={`p-3 rounded-xl border ${styles.container}`}>
        <span className={styles.icon}>{icon}</span>
      </div>
    </Card>
  );
};

const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className={`flex items-center justify-between px-6 py-5 border-b ${themeClasses.border}`}>
    <h3 className={`text-sm font-bold uppercase tracking-wider ${themeClasses.title}`}>{title}</h3>
    {action}
  </div>
);

const EmptyStateText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-xs text-center ${themeClasses.muted} ${className}`}>{children}</p>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { jobs, activities, interviews, loading } = useJobs();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Aggregated calculations
  const offers = jobs.filter((j) => j.status === "Offer").length;
  const interviewsCount = jobs.filter((j) => j.status === "Interview").length;
  const rejected = jobs.filter((j) => j.status === "Rejected").length;

  const recentJobs = jobs.slice(0, 4);
  const upcomingInts = interviews.slice(0, 2);

  // Pie chart summary
  const pieData = [
    { name: "Applied", value: jobs.filter((j) => j.status === "Applied").length, color: "#38bdf8" },
    { name: "Interview", value: interviewsCount, color: "#fbbf24" },
    { name: "Offer", value: offers, color: "#34d399" },
    { name: "Rejected", value: rejected, color: "#f87171" },
  ].filter((d) => d.value > 0);

  const getColorClass = (hex: string) => {
    // Map commonly used chart hex colors to Tailwind utility classes.
    switch (hex.toLowerCase()) {
      case "#38bdf8":
        return "bg-sky-400";
      case "#fbbf24":
        return "bg-amber-400";
      case "#34d399":
        return "bg-emerald-400";
      case "#f87171":
        return "bg-rose-400";
      default:
        return "bg-slate-400";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" className="text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${themeClasses.title}`}>
            <span>{greeting}, {user?.name ?? "Hunter"}!</span>
            <Sparkles className="w-5 h-5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          </h2>
          <p className={`text-xs mt-1 ${themeClasses.muted}`}>Here is a quick overview of your applications pipeline</p>
        </div>
        <Link to="/jobs">
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            New Application
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none">
        <MetricCard label="Applied" value={jobs.filter((j) => j.status === "Applied").length} icon={<Compass className="w-5 h-5" />} tone="sky" borderTone="border-l-sky-500" />
        <MetricCard label="Interviews" value={interviewsCount} icon={<Calendar className="w-5 h-5" />} tone="amber" borderTone="border-l-amber-500" />
        <MetricCard label="Offers" value={offers} icon={<Award className="w-5 h-5" />} tone="emerald" borderTone="border-l-emerald-500" />
        <MetricCard label="Rejections" value={rejected} icon={<FileCheck2 className="w-5 h-5" />} tone="rose" borderTone="border-l-rose-500" />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Recent Jobs list and Interviews */}
        <div className="lg:col-span-2 flex flex-col gap-6 select-none">
          {/* Recent entries table */}
          <Card className="p-0 overflow-hidden">
            <SectionHeader
              title="Recent Applications"
              action={(
                <Link to="/jobs" className="text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            />

            {recentJobs.length === 0 ? (
              <div className="py-12">
                <EmptyStateText>No jobs tracked yet</EmptyStateText>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={`border-b font-bold select-none text-xs uppercase tracking-wider ${themeClasses.surfaceMutedSoft} ${themeClasses.border} ${themeClasses.muted}`}>
                    <tr>
                      <th className="px-6 py-3.5">Company</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${themeClasses.border}`}>
                    {recentJobs.map((job) => (
                      <tr key={job.id} className={`transition-colors ${themeClasses.surfaceMutedHover}`}>
                        <td className={`px-6 py-4.5 font-bold ${themeClasses.title}`}>{job.company}</td>
                        <td className={`px-6 py-4.5 ${themeClasses.body}`}>{job.role}</td>
                        <td className="px-6 py-4.5">
                          <Badge variant="status">{job.status}</Badge>
                        </td>
                        <td className={`px-6 py-4.5 text-xs font-semibold ${themeClasses.muted}`}>
                          {job.dateApplied || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Upcoming Interviews schedule widget */}
          <Card className="flex flex-col gap-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider border-b pb-3 ${themeClasses.title} ${themeClasses.border}`}>
              Upcoming Interviews
            </h3>
            {upcomingInts.length === 0 ? (
              <EmptyStateText className="py-4">No upcoming interviews scheduled</EmptyStateText>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {upcomingInts.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-4 border rounded-2xl flex flex-col gap-3 ${themeClasses.surfaceMuted} ${themeClasses.border}`}
                  >
                    <div>
                      <span className={`text-[9px] uppercase font-bold ${themeClasses.muted}`}>{evt.company}</span>
                      <h4 className={`text-sm font-bold mt-0.5 truncate ${themeClasses.title}`}>{evt.role}</h4>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 font-semibold">{evt.title}</p>
                    </div>
                    <div className={`flex items-center gap-3 text-xs border-t pt-3 mt-1 ${themeClasses.subtle} ${themeClasses.border}`}>
                      <span className="flex items-center gap-1">⏰ {evt.time}</span>
                      <span className="flex items-center gap-1">📅 {evt.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Charts breakdown and Feed activity logs */}
        <div className="lg:col-span-1 flex flex-col gap-6 select-none">
          {/* Status share Pie Chart widget */}
          <Card className="flex flex-col gap-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider border-b pb-3 ${themeClasses.title} ${themeClasses.border}`}>
              Pipeline Ratio
            </h3>
            <div className="h-44 flex items-center justify-center">
              {pieData.length === 0 ? (
                <EmptyStateText>No applications active</EmptyStateText>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {pieData.length > 0 && (
              <div className={`grid grid-cols-2 gap-2 text-[10px] font-bold border-t pt-4 ${themeClasses.muted} ${themeClasses.border}`}>
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getColorClass(d.color)}`} />
                    <span className="truncate">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Activity log feed widget */}
          <Card className="flex flex-col gap-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider border-b pb-3 ${themeClasses.title} ${themeClasses.border}`}>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.slice(0, 4).length === 0 ? (
                <EmptyStateText className="py-4">No logs generated</EmptyStateText>
              ) : (
                activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 block mt-1.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed font-semibold ${themeClasses.body}`}>{act.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
