import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, ExternalLink, ArrowRight, Trash2, Plus } from "lucide-react";
import { useJobs } from "../context/JobContext";
import { useToasts } from "../context/ToastContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export const SavedJobs: React.FC = () => {
  const { jobs, updateJob, deleteJob } = useJobs();
  const { success } = useToasts();

  const savedList = jobs.filter((j) => j.status === "Saved");

  const handleApply = async (id: string) => {
    await updateJob(id, { status: "Applied", dateApplied: new Date().toISOString().split("T")[0] });
    success("Job status updated to Applied!", "Moved to Pipeline");
  };

  const handleRemove = async (id: string) => {
    await deleteJob(id);
    success("Saved job removed!", "Bookmark Deleted");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Saved Jobs</h2>
          <p className="text-xs text-black dark:text-white mt-1">Bookmark opportunities you intend to apply to</p>
        </div>
        <Link to="/jobs">
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Opportunity
          </Button>
        </Link>
      </div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {savedList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <Card className="py-16 text-center flex flex-col items-center gap-4 select-none">
              <div className="w-12 h-12 bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center text-black shadow-md">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold text-black dark:text-white">No saved opportunities</h4>
                <p className="text-xs text-black dark:text-white max-w-sm">
                  Add jobs with a "Saved" status to keep track of details here before you apply.
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 select-none">
            {savedList.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Card hoverLift className="flex flex-col h-full gap-4 relative justify-between overflow-hidden">
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-black dark:text-white">
                          {job.company}
                        </span>
                        <h4 className="text-base font-bold text-black dark:text-white truncate mt-0.5">{job.role}</h4>
                      </div>
                      <Badge variant="priority">{job.priority}</Badge>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 text-xs text-black dark:text-white font-medium">
                      <p className="truncate">📍 {job.location}</p>
                      {job.salary && <p>💰 {job.salary}</p>}
                    </div>

                    {/* Notes */}
                    {job.notes && (
                      <p className="text-xs text-black dark:text-white line-clamp-2 italic leading-relaxed border-l-2 border-slate-200 dark:border-neutral-800 pl-2 mt-1">
                        "{job.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-neutral-800 pt-3 mt-1 shrink-0">
                    <button
                      onClick={() => handleRemove(job.id)}
                      className="text-black hover:text-rose-400 p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2">
                      {job.jobLink && (
                        <a
                          href={job.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open job listing for ${job.company}`}
                          title={`Open job listing for ${job.company}`}
                          className="p-1.5 text-black hover:text-black dark:hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => handleApply(job.id)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="py-1 px-3 text-[11px] font-semibold border-cyan-500/10"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SavedJobs;
