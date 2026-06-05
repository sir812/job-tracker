import React from "react";
import { useJobs } from "../context/JobContext";
import { Card } from "../components/ui/Card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Award, CheckCircle2, Percent } from "lucide-react";

export const Analytics: React.FC = () => {
  const { jobs } = useJobs();

  // Metrics aggregations
  const totalApplications = jobs.filter((j) => j.status !== "Saved").length;
  const offersCount = jobs.filter((j) => j.status === "Offer").length;
  const interviewsCount = jobs.filter((j) => j.status === "Interview").length;
  const conversionRate = totalApplications > 0 ? Math.round((offersCount / totalApplications) * 100) : 0;
  const interviewRate = totalApplications > 0 ? Math.round((interviewsCount / totalApplications) * 100) : 0;

  // Status breakdown data for Pie Chart
  const statusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(statusCounts)
    .filter(([key]) => key !== "Saved") // Only map active pipeline
    .map(([name, value]) => ({ name, value }));

  const COLORS = {
    Applied: "#38bdf8",
    Interview: "#fbbf24",
    Offer: "#34d399",
    Rejected: "#f87171",
  };

  // Weekly applications trends data (Mocked for area chart)
  const weeklyTrends = [
    { week: "W1", applications: 2, interviews: 0 },
    { week: "W2", applications: 3, interviews: 1 },
    { week: "W3", applications: 5, interviews: 2 },
    { week: "W4", applications: 4, interviews: 3 },
  ];

  // Salary range mappings (Mocked for bar chart)
  const salaryCompare = [
    { company: "Discord", min: 170, max: 195 },
    { company: "Google", min: 185, max: 220 },
    { company: "Stripe", min: 160, max: 190 },
    { company: "Netflix", min: 210, max: 210 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="select-none">
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Analytics Dashboard</h2>
        <p className="text-xs text-black dark:text-white mt-1">Analyze your application progress, salary stats, and outcomes</p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none">
        <Card className="flex items-center gap-4 py-5 px-6">
          <div className="p-3 bg-sky-50 dark:bg-black/70 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-black dark:text-white">Pipeline Total</span>
            <h4 className="text-xl font-bold text-black dark:text-white mt-0.5">{totalApplications}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-5 px-6">
          <div className="p-3 bg-emerald-50 dark:bg-black/70 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-black dark:text-white">Offers</span>
            <h4 className="text-xl font-bold text-black dark:text-white mt-0.5">{offersCount}</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-5 px-6">
          <div className="p-3 bg-amber-50 dark:bg-black/70 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-black dark:text-white">Interview Rate</span>
            <h4 className="text-xl font-bold text-black dark:text-white mt-0.5">{interviewRate}%</h4>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-5 px-6">
          <div className="p-3 bg-cyan-50 dark:bg-black/70 border border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-black dark:text-white">Conversion Rate</span>
            <h4 className="text-xl font-bold text-black dark:text-white mt-0.5">{conversionRate}%</h4>
          </div>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Trend (Area Chart) */}
        <Card className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Weekly Trends</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                  }}
                />
                <Area type="monotone" dataKey="applications" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution (Pie Chart) */}
        <Card className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Status Breakdown</h4>
          <div className="h-64 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-black">No applications data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name as keyof typeof COLORS] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                      color: "#f1f5f9",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Salary Comparisons (Bar Chart) */}
        <Card className="flex flex-col gap-4 lg:col-span-2">
          <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Estimated Salary ranges ($k)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryCompare}>
                <XAxis dataKey="company" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="max" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Analytics;
