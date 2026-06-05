import React, { createContext, useContext, useState, useEffect } from "react";
import { Job, Activity, InterviewEvent, INITIAL_ACTIVITIES, INITIAL_INTERVIEWS } from "../data/mockData";
import { jobsService, db } from "../services/api";

interface JobContextType {
  jobs: Job[];
  activities: Activity[];
  interviews: InterviewEvent[];
  loading: boolean;
  fetchJobs: () => Promise<void>;
  createJob: (job: Omit<Job, "id" | "updatedAt">) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
  createInterview: (evt: Omit<InterviewEvent, "id">) => Promise<InterviewEvent>;
  deleteInterview: (id: string) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize DB with initial seed data on boot
  useEffect(() => {
    db.setInitialData([], INITIAL_ACTIVITIES, INITIAL_INTERVIEWS);
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const allJobs = await jobsService.fetchJobs();
      const allActs = await jobsService.fetchActivities();
      const allInts = await jobsService.fetchInterviews();
      setJobs(allJobs);
      setActivities(allActs);
      setInterviews(allInts);
    } catch (e) {
      console.error("Failed to load jobs data", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await jobsService.fetchJobs();
      setJobs(allJobs);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Omit<Job, "id" | "updatedAt">) => {
    const created = await jobsService.createJob(jobData);
    setJobs((prev) => [created, ...prev]);
    // Refresh activities
    const allActs = await jobsService.fetchActivities();
    setActivities(allActs);
    return created;
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    const updated = await jobsService.updateJob(id, updates);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    // Refresh activities
    const allActs = await jobsService.fetchActivities();
    setActivities(allActs);
    return updated;
  };

  const deleteJob = async (id: string) => {
    const success = await jobsService.deleteJob(id);
    if (success) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setInterviews((prev) => prev.filter((i) => i.jobId !== id));
      // Refresh activities
      const allActs = await jobsService.fetchActivities();
      setActivities(allActs);
    }
  };

  const createInterview = async (evtData: Omit<InterviewEvent, "id">) => {
    const created = await jobsService.createInterview(evtData);
    setInterviews((prev) => [created, ...prev]);
    // Refresh activities
    const allActs = await jobsService.fetchActivities();
    setActivities(allActs);
    return created;
  };

  const deleteInterview = async (id: string) => {
    const success = await jobsService.deleteInterview(id);
    if (success) {
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        activities,
        interviews,
        loading,
        fetchJobs,
        createJob,
        updateJob,
        deleteJob,
        createInterview,
        deleteInterview,
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
