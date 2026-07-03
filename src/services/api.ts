import axios from "axios";
import { Job, Activity, InterviewEvent } from "../types/job";

// Use the browser's current hostname so the app works from both localhost
// AND from phones / other devices on the same network (e.g. 192.168.x.x).
const DEV_HOST = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";

const DEFAULT_AUTH_API_BASE_URL = import.meta.env.DEV
  ? `http://${DEV_HOST}:4000/api`
  : "/api";
const AUTH_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_AUTH_API_BASE_URL;
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || (import.meta.env.DEV ? `http://${DEV_HOST}:8000/api` : AUTH_API_BASE_URL);

console.log("Resolved Auth API URL:", AUTH_API_BASE_URL);
console.log("Resolved AI API URL:", AI_API_BASE_URL);

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
    localStorage.removeItem("jt_jobs");
    localStorage.removeItem("jt_activities");
    localStorage.removeItem("jt_interviews");
  },
};

// Real DB Driven Jobs, Activities, and Interviews CRUD Service API
export const jobsService = {
  fetchJobs: async (): Promise<Job[]> => {
    const { data } = await apiInstance.get<{ jobs: any[] }>("/jobs");
    return data.jobs.map(mapJobToFrontend);
  },

  createJob: async (jobData: Omit<Job, "id" | "updatedAt">): Promise<Job> => {
    const backendJobData = mapJobToBackend(jobData);
    const { data } = await apiInstance.post<{ job: any }>("/jobs", backendJobData);
    return mapJobToFrontend(data.job);
  },

  updateJob: async (id: string, updates: Partial<Job>): Promise<Job> => {
    const backendUpdates = mapJobToBackend(updates);
    const { data } = await apiInstance.put<{ job: any }>(`/jobs/${id}`, backendUpdates);
    return mapJobToFrontend(data.job);
  },

  deleteJob: async (id: string): Promise<boolean> => {
    await apiInstance.delete(`/jobs/${id}`);
    return true;
  },

  fetchActivities: async (): Promise<Activity[]> => {
    const { data } = await apiInstance.get<{ activities: any[] }>("/activities");
    return data.activities.map((act) => ({
      id: String(act.id),
      type: act.type as Activity["type"],
      message: act.message,
      timestamp: act.timestamp || new Date().toISOString(),
      jobId: act.jobId ? String(act.jobId) : undefined,
    }));
  },

  fetchInterviews: async (): Promise<InterviewEvent[]> => {
    const { data } = await apiInstance.get<{ interviews: any[] }>("/interviews");
    return data.interviews.map((evt) => ({
      id: String(evt.id),
      jobId: String(evt.jobId),
      company: evt.company,
      role: evt.role,
      title: evt.title,
      date: evt.date,
      time: evt.time,
      type: evt.type as InterviewEvent["type"],
      notes: evt.notes || undefined,
    }));
  },

  createInterview: async (evtData: Omit<InterviewEvent, "id">): Promise<InterviewEvent> => {
    const { data } = await apiInstance.post<{ interview: any }>("/interviews", {
      jobId: Number(evtData.jobId),
      company: evtData.company,
      role: evtData.role,
      title: evtData.title,
      date: evtData.date,
      time: evtData.time,
      type: evtData.type,
      notes: evtData.notes,
    });
    const created = data.interview;
    return {
      id: String(created.id),
      jobId: String(created.jobId),
      company: created.company,
      role: created.role,
      title: created.title,
      date: created.date,
      time: created.time,
      type: created.type as InterviewEvent["type"],
      notes: created.notes || undefined,
    };
  },

  deleteInterview: async (id: string): Promise<boolean> => {
    await apiInstance.delete(`/interviews/${id}`);
    return true;
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
