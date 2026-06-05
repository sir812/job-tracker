import axios from "axios";
import { Job, Activity, InterviewEvent } from "../data/mockData";

// Simulate network latency (in ms)
const LATENCY = 600;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_AUTH_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000/api"
  : "http://localhost:4000/api";
const DEFAULT_AI_API_BASE_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000/api"
  : "http://127.0.0.1:8000/api";

const AUTH_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_AUTH_API_BASE_URL;
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || DEFAULT_AI_API_BASE_URL;

export const apiInstance = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const aiApiInstance = axios.create({
  baseURL: AI_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptors to automatically attach stored JWT token
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

aiApiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);

// Helper functions for Priority & Job Model mapping
const mapPriorityToBackend = (p: "Low" | "Medium" | "High" | string): number => {
  switch (p) {
    case "High": return 2;
    case "Medium": return 1;
    case "Low":
    default: return 0;
  }
};

const mapPriorityToFrontend = (p: number): "Low" | "Medium" | "High" => {
  switch (p) {
    case 2: return "High";
    case 1: return "Medium";
    case 0:
    default: return "Low";
  }
};

const mapJobToBackend = (job: Partial<Job>) => {
  return {
    title: job.role || job.company || "Untitled",
    company: job.company,
    role: job.role,
    status: job.status,
    link: job.jobLink,
    salary: job.salary,
    location: job.location,
    notes: job.notes,
    dateApplied: job.dateApplied ? new Date(job.dateApplied).toISOString() : null,
    priority: job.priority ? mapPriorityToBackend(job.priority) : 0,
    tags: job.tags,
  };
};

const mapJobToFrontend = (backendJob: any): Job => {
  return {
    id: String(backendJob.id),
    company: backendJob.company || "",
    role: backendJob.role || backendJob.title || "",
    status: (backendJob.status || "Applied") as Job["status"],
    salary: backendJob.salary || "",
    location: backendJob.location || "",
    notes: backendJob.notes || "",
    tags: Array.isArray(backendJob.tags) ? backendJob.tags : [],
    priority: mapPriorityToFrontend(backendJob.priority),
    dateApplied: backendJob.dateApplied ? backendJob.dateApplied.split("T")[0] : "",
    jobLink: backendJob.link || "",
    updatedAt: backendJob.updatedAt || new Date().toISOString(),
  };
};

// Mock Database State in Memory (synchronized with localStorage) - Fallback for local storage & activities/interviews
class MockDatabase {
  private jobs: Job[] = [];
  private activities: Activity[] = [];
  private interviews: InterviewEvent[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window !== "undefined") {
      const savedJobs = localStorage.getItem("jt_jobs");
      const savedActivities = localStorage.getItem("jt_activities");
      const savedInterviews = localStorage.getItem("jt_interviews");

      if (savedJobs) this.jobs = JSON.parse(savedJobs);
      if (savedActivities) this.activities = JSON.parse(savedActivities);
      if (savedInterviews) this.interviews = JSON.parse(savedInterviews);
    }
  }

  save() {
    if (typeof window !== "undefined") {
      localStorage.setItem("jt_jobs", JSON.stringify(this.jobs));
      localStorage.setItem("jt_activities", JSON.stringify(this.activities));
      localStorage.setItem("jt_interviews", JSON.stringify(this.interviews));
    }
  }

  setInitialData(jobs: Job[], activities: Activity[], interviews: InterviewEvent[]) {
    // Only seed mock jobs if user is NOT logged in to avoid polluting database accounts
    const token = localStorage.getItem("jt_token");
    if (!token && this.jobs.length === 0) {
      this.jobs = [...jobs];
      this.save();
    }
    if (this.activities.length === 0) {
      this.activities = [...activities];
      this.save();
    }
    if (this.interviews.length === 0) {
      this.interviews = [...interviews];
      this.save();
    }
  }

  getJobs() {
    return this.jobs;
  }

  addJob(job: Job) {
    this.jobs.unshift(job);
    this.addActivity({
      id: `act-${Date.now()}`,
      type: job.status.toLowerCase() as Activity["type"],
      message: `Added new job entry: ${job.role} at ${job.company}`,
      timestamp: new Date().toISOString(),
      jobId: job.id,
    });
    this.save();
    return job;
  }

  updateJob(id: string, updates: Partial<Job>) {
    const idx = this.jobs.findIndex((j) => j.id === id);
    if (idx !== -1) {
      const oldStatus = this.jobs[idx].status;
      const updatedJob = { ...this.jobs[idx], ...updates, updatedAt: new Date().toISOString() };
      this.jobs[idx] = updatedJob;

      if (updates.status && updates.status !== oldStatus) {
        this.addActivity({
          id: `act-${Date.now()}`,
          type: updates.status.toLowerCase() as Activity["type"],
          message: `Status of ${updatedJob.role} at ${updatedJob.company} changed from ${oldStatus} to ${updates.status}`,
          timestamp: new Date().toISOString(),
          jobId: updatedJob.id,
        });
      }
      this.save();
      return updatedJob;
    }
    throw new Error("Job not found");
  }

  deleteJob(id: string) {
    const idx = this.jobs.findIndex((j) => j.id === id);
    if (idx !== -1) {
      const deleted = this.jobs[idx];
      this.jobs.splice(idx, 1);
      this.interviews = this.interviews.filter((i) => i.jobId !== id);
      this.addActivity({
        id: `act-${Date.now()}`,
        type: "rejected",
        message: `Removed job entry: ${deleted.role} at ${deleted.company}`,
        timestamp: new Date().toISOString(),
      });
      this.save();
      return true;
    }
    return false;
  }

  getActivities() {
    return this.activities;
  }

  addActivity(act: Activity) {
    this.activities.unshift(act);
    if (this.activities.length > 50) this.activities.pop(); // limit log
    this.save();
  }

  getInterviews() {
    return this.interviews;
  }

  addInterview(evt: InterviewEvent) {
    this.interviews.unshift(evt);
    this.addActivity({
      id: `act-${Date.now()}`,
      type: "interview",
      message: `Scheduled ${evt.type} interview for ${evt.role} at ${evt.company} on ${evt.date}`,
      timestamp: new Date().toISOString(),
      jobId: evt.jobId,
    });
    this.save();
    return evt;
  }

  deleteInterview(id: string) {
    const idx = this.interviews.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.interviews.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new MockDatabase();

type AuthUser = {
  id?: number;
  email: string;
  name: string;
  avatar?: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

// Auth Service API
export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await apiInstance.post<AuthResponse>("/auth/login", { email, password });
    localStorage.setItem("jt_token", data.token);
    localStorage.setItem("jt_user", JSON.stringify(data.user));
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const { data } = await apiInstance.post<AuthResponse>("/auth/register", { name, email, password });
    localStorage.setItem("jt_token", data.token);
    localStorage.setItem("jt_user", JSON.stringify(data.user));
    return data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("jt_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  logout: () => {
    localStorage.removeItem("jt_token");
    localStorage.removeItem("jt_user");
    // Clear mock jobs from localStorage to ensure next user session starts clean
    localStorage.removeItem("jt_jobs");
    localStorage.removeItem("jt_activities");
    localStorage.removeItem("jt_interviews");
  },
};

// Real & Mock Hybrid Jobs CRUD Service API
export const jobsService = {
  fetchJobs: async (): Promise<Job[]> => {
    const token = localStorage.getItem("jt_token");
    if (!token) {
      await delay(LATENCY);
      return [...db.getJobs()];
    }
    const { data } = await apiInstance.get<{ jobs: any[] }>("/jobs");
    return data.jobs.map(mapJobToFrontend);
  },

  createJob: async (jobData: Omit<Job, "id" | "updatedAt">): Promise<Job> => {
    const token = localStorage.getItem("jt_token");
    if (!token) {
      await delay(LATENCY);
      const newJob: Job = {
        ...jobData,
        id: `job-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };
      return db.addJob(newJob);
    }
    const backendJobData = mapJobToBackend(jobData);
    const { data } = await apiInstance.post<{ job: any }>("/jobs", backendJobData);
    const created = mapJobToFrontend(data.job);
    
    // Add to activity logs (stored in localStorage)
    db.addActivity({
      id: `act-${Date.now()}`,
      type: created.status.toLowerCase() as Activity["type"],
      message: `Added new job entry: ${created.role} at ${created.company}`,
      timestamp: new Date().toISOString(),
      jobId: created.id,
    });

    return created;
  },

  updateJob: async (id: string, updates: Partial<Job>): Promise<Job> => {
    const token = localStorage.getItem("jt_token");
    // Fallback if local storage mock job (starts with "job-") or no token
    if (!token || id.startsWith("job-")) {
      await delay(LATENCY);
      return db.updateJob(id, updates);
    }
    const backendUpdates = mapJobToBackend(updates);
    const { data } = await apiInstance.put<{ job: any }>(`/jobs/${id}`, backendUpdates);
    const updated = mapJobToFrontend(data.job);

    if (updates.status) {
      db.addActivity({
        id: `act-${Date.now()}`,
        type: updates.status.toLowerCase() as Activity["type"],
        message: `Status of ${updated.role} at ${updated.company} changed to ${updates.status}`,
        timestamp: new Date().toISOString(),
        jobId: updated.id,
      });
    }

    return updated;
  },

  deleteJob: async (id: string): Promise<boolean> => {
    const token = localStorage.getItem("jt_token");
    if (!token || id.startsWith("job-")) {
      await delay(LATENCY);
      return db.deleteJob(id);
    }
    await apiInstance.delete(`/jobs/${id}`);
    
    db.addActivity({
      id: `act-${Date.now()}`,
      type: "rejected",
      message: `Removed job entry: ID ${id}`,
      timestamp: new Date().toISOString(),
    });

    return true;
  },

  fetchActivities: async (): Promise<Activity[]> => {
    await delay(LATENCY / 2);
    return [...db.getActivities()];
  },

  fetchInterviews: async (): Promise<InterviewEvent[]> => {
    await delay(LATENCY);
    return [...db.getInterviews()];
  },

  createInterview: async (evtData: Omit<InterviewEvent, "id">): Promise<InterviewEvent> => {
    await delay(LATENCY);
    const newEvt: InterviewEvent = {
      ...evtData,
      id: `int-${Date.now()}`,
    };
    return db.addInterview(newEvt);
  },

  deleteInterview: async (id: string): Promise<boolean> => {
    await delay(LATENCY);
    return db.deleteInterview(id);
  },
};

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  salary?: string;
  link: string;
  tags: string[];
  datePosted?: string;
  source: "remoteok" | "remotive";
}

export const scraperService = {
  fetchScrapedJobs: async (): Promise<ScrapedJob[]> => {
    const { data } = await apiInstance.get<{ jobs: ScrapedJob[] }>("/scraper/jobs");
    return data.jobs || [];
  },

  runScraper: async (): Promise<{ count: number; scrapedAt: string }> => {
    const { data } = await apiInstance.post<{ count: number; scrapedAt: string }>("/scraper/run");
    return data;
  },
};
