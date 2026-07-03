import React, { createContext, useContext, useState, useEffect } from "react";
import { Job, Activity, InterviewEvent } from "../types/job";
import { jobsService } from "../services/api";

interface JobContextType {
  jobs: Job[];
  activities: Activity[];
  interviews: InterviewEvent[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  createJob: (job: Omit<Job, "id" | "updatedAt">) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
  createInterview: (evt: Omit<InterviewEvent, "id">) => Promise<InterviewEvent>;
  deleteInterview: (id: string) => Promise<void>;
  reloadAllData: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only load data when a valid auth token is present.
  // This prevents unauthenticated API calls on the login/register pages
  // which would crash the dashboard on mobile and remote deployments.
  useEffect(() => {
    const token = localStorage.getItem("jt_token");
    if (token) {
      loadAllData();
    }

    // Handle cross-tab login/logout via the native storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "jt_token") {
        if (e.newValue) {
          loadAllData();
        } else {
          setJobs([]);
          setActivities([]);
          setInterviews([]);
          setError(null);
        }
      }
    };

    // Handle same-tab login/logout via a custom event dispatched by AuthContext
    const handleAuthChange = (e: CustomEvent) => {
      if (e.detail?.loggedIn) {
        loadAllData();
      } else {
        setJobs([]);
        setActivities([]);
        setInterviews([]);
        setError(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("jt_auth_change", handleAuthChange as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("jt_auth_change", handleAuthChange as EventListener);
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const allJobs = await jobsService.fetchJobs();
      const allActs = await jobsService.fetchActivities();
      const allInts = await jobsService.fetchInterviews();
      setJobs(allJobs);
      setActivities(allActs);
      setInterviews(allInts);
    } catch (e: any) {
      console.error("Failed to load jobs data from database", e);
      setError(e?.message || "Could not connect to database server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const allJobs = await jobsService.fetchJobs();
      setJobs(allJobs);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch job entries.");
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Omit<Job, "id" | "updatedAt">) => {
    setError(null);
    try {
      const created = await jobsService.createJob(jobData);
      setJobs((prev) => [created, ...prev]);
      // Refresh activities
      const allActs = await jobsService.fetchActivities();
      setActivities(allActs);
      return created;
    } catch (e: any) {
      setError(e?.message || "Failed to create job entry.");
      throw e;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    setError(null);
    try {
      const updated = await jobsService.updateJob(id, updates);
      setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
      // Refresh activities
      const allActs = await jobsService.fetchActivities();
      setActivities(allActs);
      return updated;
    } catch (e: any) {
      setError(e?.message || "Failed to update job details.");
      throw e;
    }
  };

  const deleteJob = async (id: string) => {
    setError(null);
    try {
      const success = await jobsService.deleteJob(id);
      if (success) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        setInterviews((prev) => prev.filter((i) => i.jobId !== id));
        // Refresh activities
        const allActs = await jobsService.fetchActivities();
        setActivities(allActs);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to delete job entry.");
      throw e;
    }
  };

  const createInterview = async (evtData: Omit<InterviewEvent, "id">) => {
    setError(null);
    try {
      const created = await jobsService.createInterview(evtData);
      setInterviews((prev) => [created, ...prev]);
      // Refresh activities
      const allActs = await jobsService.fetchActivities();
      setActivities(allActs);
      return created;
    } catch (e: any) {
      setError(e?.message || "Failed to schedule interview.");
      throw e;
    }
  };

  const deleteInterview = async (id: string) => {
    setError(null);
    try {
      const success = await jobsService.deleteInterview(id);
      if (success) {
        setInterviews((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to delete interview event.");
      throw e;
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        activities,
        interviews,
        loading,
        error,
        fetchJobs,
        createJob,
        updateJob,
        deleteJob,
        createInterview,
        deleteInterview,
        reloadAllData: loadAllData,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error("useJobs must be used within JobProvider");
  return context;
};
