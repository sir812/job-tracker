import React from "react";
import { Briefcase, Calendar, Sparkles, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { useJobs } from "../context/JobContext";
import { useToasts } from "../context/ToastContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export const Notifications: React.FC = () => {
  const { activities } = useJobs(); // We will simulate clear all or just show them
  const { success } = useToasts();

  const handleClear = () => {
    // Just mock clear by showing toast
    success("Notifications list cleared!", "Done");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "offer":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "interview":
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case "applied":
        return <Briefcase className="w-5 h-5 text-sky-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Notifications</h2>
          <p className="text-xs text-black dark:text-white mt-1">Review activity feeds and application timeline changes</p>
        </div>
        {activities.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            icon={<Trash2 className="w-4 h-4 text-black" />}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Notifications list */}
      <Card className="flex flex-col p-0 divide-y divide-slate-200 dark:divide-slate-800/80 overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-black animate-pulse" />
            <h4 className="font-semibold text-black dark:text-white">Quiet for now</h4>
            <p className="text-xs text-black dark:text-white max-w-xs">
              When you add new jobs or change application statuses, your notifications feed will populate here.
            </p>
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-4 p-5 hover:bg-slate-50 dark:hover:bg-black/60 transition-colors"
            >
              <div className="p-2 bg-slate-50 dark:bg-black/70 border border-slate-200 dark:border-neutral-800 rounded-xl shrink-0 mt-0.5 shadow-sm">
                {getActivityIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black dark:text-white leading-normal">
                  {act.message}
                </p>
                <p className="text-xs text-black dark:text-white mt-1.5 font-medium">
                  {formatFullDate(act.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
export default Notifications;
