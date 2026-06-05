import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Save, ExternalLink, Globe } from "lucide-react";
import { scraperService, ScrapedJob } from "../services/api";
import { useJobs } from "../context/JobContext";
import { useToasts } from "../context/ToastContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export const JobSearch: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);
  const { createJob, jobs: savedJobs } = useJobs();
  const { success, error } = useToasts();

  const fetchRealJobs = async () => {
    setLoading(true);
    try {
      // First try to load cached
      let fetched = await scraperService.fetchScrapedJobs();
      if (fetched.length === 0) {
        // If empty, trigger scraper
        await scraperService.runScraper();
        fetched = await scraperService.fetchScrapedJobs();
      }
      setJobs(fetched);
    } catch (err) {
      console.error(err);
      error("Failed to fetch real job data from internet", "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealJobs();
  }, []);

  const handleSaveJob = async (job: ScrapedJob) => {
    try {
      await createJob({
        company: job.company,
        role: job.title,
        status: "Saved",
        salary: job.salary || "",
        location: job.location,
        notes: `Fetched from ${job.source}`,
        tags: job.tags || [],
        priority: "Medium",
        dateApplied: "",
        jobLink: job.link,
      });
      success("Job saved successfully", "Saved to tracker");
    } catch (err) {
      error("Failed to save job", "Error");
    }
  };

  const isSaved = (link: string) => savedJobs.some((j) => j.jobLink === link);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Discover Real Jobs</h2>
          <p className="text-xs text-black dark:text-white mt-1">Live data from RemoteOK & Remotive</p>
        </div>
        <Button size="sm" onClick={fetchRealJobs} disabled={loading} icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}>
          {loading ? "Searching..." : "Refresh Jobs"}
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {loading && jobs.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="py-16 text-center flex flex-col items-center gap-4">
            <Globe className="w-8 h-8 text-black" />
            <h4 className="font-semibold text-black dark:text-white">No jobs found</h4>
            <p className="text-xs text-black max-w-sm">
              Click refresh to fetch the latest remote roles from the internet.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 select-none">
            {jobs.map((job) => (
              <motion.div
                key={job.link}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="flex flex-col h-full gap-4 relative justify-between overflow-hidden group">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-500">
                          {job.company}
                        </span>
                        <h4 className="text-base font-bold text-black dark:text-white truncate mt-0.5">{job.title}</h4>
                      </div>
                      <Badge variant="slate" className="text-[10px] capitalize bg-slate-100 dark:bg-neutral-800 border-none">
                        {job.source}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-black dark:text-white font-medium">
                      <p className="truncate">📍 {job.location}</p>
                      {job.salary && <p>💰 {job.salary}</p>}
                    </div>

                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-black dark:text-white">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-neutral-800 pt-3 mt-1 shrink-0">
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-black hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" /> View Post
                    </a>
                    <Button
                      variant={isSaved(job.link) ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => handleSaveJob(job)}
                      disabled={isSaved(job.link)}
                      icon={!isSaved(job.link) && <Save className="w-3.5 h-3.5" />}
                      className="py-1 text-xs px-3"
                    >
                      {isSaved(job.link) ? "Saved" : "Save to Tracker"}
                    </Button>
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
export default JobSearch;
