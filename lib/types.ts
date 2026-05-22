export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Saved';

export type AuthUser = {
  id: number;
  name: string | null;
  email: string;
};

export type Job = {
  id: number;
  title: string;
  company: string;
  role: string | null;
  status: JobStatus | string;
  link: string | null;
  salary: string | null;
  location: string | null;
  notes: string | null;
  dateApplied: string | null;
  priority: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};
