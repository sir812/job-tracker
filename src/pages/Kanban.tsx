import React, { useState } from "react";
import { useJobs } from "../context/JobContext";
import { useToasts } from "../context/ToastContext";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Briefcase, Bookmark, Calendar, Award, AlertCircle } from "lucide-react";

type ColumnStatus = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";

export const Kanban: React.FC = () => {
  const { jobs, updateJob } = useJobs();
  const { success } = useToasts();
  
  // Highlight columns during drag over
  const [draggedOverCol, setDraggedOverCol] = useState<ColumnStatus | null>(null);

  const columns: { label: ColumnStatus; color: string; icon: React.ReactNode }[] = [
    { label: "Saved", color: "border-t-cyan-500", icon: <Bookmark className="w-4 h-4 text-cyan-400" /> },
    { label: "Applied", color: "border-t-sky-500", icon: <Briefcase className="w-4 h-4 text-sky-400" /> },
    { label: "Interview", color: "border-t-amber-500", icon: <Calendar className="w-4 h-4 text-amber-400" /> },
    { label: "Offer", color: "border-t-emerald-500", icon: <Award className="w-4 h-4 text-emerald-400" /> },
    { label: "Rejected", color: "border-t-rose-500", icon: <AlertCircle className="w-4 h-4 text-rose-400" /> },
  ];

  // HTML5 Drag Events
  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData("text/plain", jobId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: ColumnStatus) => {
    e.preventDefault();
    if (draggedOverCol !== status) {
      setDraggedOverCol(status);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ColumnStatus) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const jobId = e.dataTransfer.getData("text/plain");
    
    if (jobId) {
      const activeJob = jobs.find((j) => j.id === jobId);
      if (activeJob && activeJob.status !== targetStatus) {
        await updateJob(jobId, { status: targetStatus });
        success(`${activeJob.role} moved to ${targetStatus}!`, "Board Updated");
      }
    }
  };

  // Quick Action Buttons (Useful for Mobile/Accessibility)
  const handleMoveStatus = async (jobId: string, currentStatus: ColumnStatus, direction: "next" | "prev") => {
    const statusOrder: ColumnStatus[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];
    const idx = statusOrder.indexOf(currentStatus);
    let targetIdx = direction === "next" ? idx + 1 : idx - 1;

    if (targetIdx >= 0 && targetIdx < statusOrder.length) {
      const targetStatus = statusOrder[targetIdx];
      const activeJob = jobs.find((j) => j.id === jobId);
      if (activeJob) {
        await updateJob(jobId, { status: targetStatus });
        success(`${activeJob.role} moved to ${targetStatus}!`, "Board Updated");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full select-none">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Applications Board</h2>
        <p className="text-xs text-black dark:text-white mt-1">Drag and drop job cards to update their status instantly</p>
      </div>

      {/* Kanban Grid */}
      <div className="grid gap-4 lg:grid-cols-5 flex-1 min-h-[500px] overflow-x-auto pb-4 scrollbar-thin select-none">
        {columns.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.label);
          const isOver = draggedOverCol === col.label;

          return (
            <div
              key={col.label}
              onDragOver={(e) => handleDragOver(e, col.label)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.label)}
              className={`flex flex-col gap-3.5 bg-slate-50 dark:bg-black/70 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4.5 min-w-[250px] shrink-0 border-t-2 ${
                col.color
              } ${isOver ? "bg-slate-100 dark:bg-black border-cyan-500/20 shadow-inner" : ""} transition-all`}
            >
              {/* Column Title */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-3 mb-1 shrink-0 select-none">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                    {col.label}
                  </span>
                </div>
                <span className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 text-[10px] text-black dark:text-white font-bold px-2 py-0.5 rounded-full">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1 py-1">
                <AnimatePresence mode="popLayout">
                  {colJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, job.id)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <Card className="flex flex-col gap-3 p-4 hover:border-slate-300 dark:hover:border-neutral-700 shadow-sm transition-all hover:scale-[1.01] bg-white dark:bg-black/70 relative group overflow-hidden">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-black">
                              {job.company}
                            </span>
                            <h4 className="text-xs font-bold text-black dark:text-white mt-0.5 truncate">{job.role}</h4>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-black dark:text-white">
                            <span className="truncate max-w-[100px]">📍 {job.location}</span>
                            <Badge variant="priority" className="scale-90 font-bold">
                              {job.priority}
                            </Badge>
                          </div>

                          {/* Quick controls on hover */}
                          <div className="flex items-center justify-between border-t border-slate-200 dark:border-neutral-800 pt-2 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              type="button"
                              title="Move status to previous column"
                              aria-label="Move status to previous column"
                              onClick={() => handleMoveStatus(job.id, job.status, "prev")}
                              disabled={col.label === "Saved"}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-900 text-black hover:text-black dark:hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[8px] font-bold text-black dark:text-white uppercase">Shift status</span>
                            <button
                              type="button"
                              title="Move status to next column"
                              aria-label="Move status to next column"
                              onClick={() => handleMoveStatus(job.id, job.status, "next")}
                              disabled={col.label === "Rejected"}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-900 text-black hover:text-black dark:hover:text-white rounded transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Card>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colJobs.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-10 border border-dashed border-slate-300 dark:border-neutral-800 rounded-xl text-center select-none text-[10px] text-black dark:text-white font-semibold leading-relaxed">
                    Drop applications here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Kanban;
