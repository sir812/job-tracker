export interface Job {
  id: string;
  company: string;
  role: string;
  status: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
  salary: string;
  location: string;
  notes: string;
  tags: string[];
  priority: "Low" | "Medium" | "High";
  dateApplied: string;
  jobLink: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: "applied" | "interview" | "offer" | "rejected" | "saved" | "note";
  message: string;
  timestamp: string;
  jobId?: string;
}

export interface InterviewEvent {
  id: string;
  jobId: string;
  company: string;
  role: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: "Technical" | "Behavioral" | "HR" | "System Design";
  notes?: string;
}
