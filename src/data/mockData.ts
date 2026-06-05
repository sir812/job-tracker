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

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    company: "Google",
    role: "Senior Software Engineer (Frontend)",
    status: "Offer",
    salary: "$185,000 - $220,000",
    location: "Mountain View, CA (Hybrid)",
    notes: "Completed 5 rounds of interviews. Recruiter called to discuss numbers. Need to check details of equity grant.",
    tags: ["React", "TypeScript", "System Design"],
    priority: "High",
    dateApplied: "2026-04-10",
    jobLink: "https://careers.google.com/jobs/results/12345",
    updatedAt: "2026-05-24T10:00:00.000Z",
  },
  {
    id: "job-2",
    company: "Stripe",
    role: "Fullstack Engineer",
    status: "Interview",
    salary: "$160,000 - $190,000",
    location: "Remote (US)",
    notes: "Technical phone screen done. Virtual onsite scheduled for next Tuesday. Topics: React performance, system design, API design.",
    tags: ["React", "Node.js", "PostgreSQL"],
    priority: "High",
    dateApplied: "2026-05-02",
    jobLink: "https://stripe.com/jobs/54321",
    updatedAt: "2026-05-22T14:30:00.000Z",
  },
  {
    id: "job-3",
    company: "Netflix",
    role: "UI Engineer",
    status: "Applied",
    salary: "$210,000",
    location: "Los Gatos, CA (Onsite)",
    notes: "Applied via employee referral. Recruiter reached out for availability. Awaiting initial call.",
    tags: ["React", "CSS", "Performance"],
    priority: "Medium",
    dateApplied: "2026-05-18",
    jobLink: "https://jobs.netflix.com/jobs/99999",
    updatedAt: "2026-05-18T09:15:00.000Z",
  },
  {
    id: "job-4",
    company: "Meta",
    role: "Product Engineer",
    status: "Rejected",
    salary: "$170,000 - $205,000",
    location: "Seattle, WA",
    notes: "Got rejected after the onsite loop. Feedback: coding round was strong, but system design round lacked depth on scalability aspects.",
    tags: ["React", "GraphQL", "Product"],
    priority: "High",
    dateApplied: "2026-03-25",
    jobLink: "https://meta.com/careers/jobs/88888",
    updatedAt: "2026-05-15T16:45:00.000Z",
  },
  {
    id: "job-5",
    company: "Linear",
    role: "Frontend Engineer (Design Engineer)",
    status: "Saved",
    salary: "$140,000 - $175,000",
    location: "Remote (Global)",
    notes: "Beautiful application. Love their UX style. Preparing a custom portfolio piece before applying.",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    priority: "High",
    dateApplied: "",
    jobLink: "https://linear.app/careers/frontend",
    updatedAt: "2026-05-24T08:00:00.000Z",
  },
  {
    id: "job-6",
    company: "Airbnb",
    role: "Software Engineer II",
    status: "Interview",
    salary: "$150,000 - $180,000",
    location: "San Francisco, CA (Hybrid)",
    notes: "Recruiter screen completed. Coding test scheduled on CodeSignal.",
    tags: ["TypeScript", "React", "GraphQL"],
    priority: "Medium",
    dateApplied: "2026-05-10",
    jobLink: "https://careers.airbnb.com/jobs/77777",
    updatedAt: "2026-05-20T11:20:00.000Z",
  },
  {
    id: "job-7",
    company: "Slack",
    role: "Senior Frontend Engineer",
    status: "Applied",
    salary: "$165,000 - $195,000",
    location: "Remote (US)",
    notes: "Applied online with tailored cover letter highlighting Slack app integrations built previously.",
    tags: ["React", "Redux", "WebSockets"],
    priority: "Low",
    dateApplied: "2026-05-14",
    jobLink: "https://slack.com/careers",
    updatedAt: "2026-05-14T10:00:00.000Z",
  },
  {
    id: "job-8",
    company: "Vercel",
    role: "Next.js Framework Engineer",
    status: "Saved",
    salary: "$150,000 - $200,000",
    location: "Remote",
    notes: "Opportunity to work on core Next.js packages. Will apply next week.",
    tags: ["Next.js", "React", "Rust"],
    priority: "High",
    dateApplied: "",
    jobLink: "https://vercel.com/careers/nextjs",
    updatedAt: "2026-05-23T18:00:00.000Z",
  },
  {
    id: "job-9",
    company: "Figma",
    role: "UI Engineer (Canvas Team)",
    status: "Rejected",
    salary: "$180,000 - $210,000",
    location: "San Francisco, CA",
    notes: "Resume screen rejection. Might need to highlight canvas/WebGL experience more explicitly.",
    tags: ["React", "WebGL", "Canvas"],
    priority: "High",
    dateApplied: "2026-04-05",
    jobLink: "https://figma.com/careers",
    updatedAt: "2026-04-12T15:00:00.000Z",
  },
  {
    id: "job-10",
    company: "Discord",
    role: "Frontend Engineer (Voice & Video)",
    status: "Offer",
    salary: "$170,000 - $195,000",
    location: "San Francisco, CA (Hybrid)",
    notes: "Received offer! $175k base + equity + bonus. Discussion on relocation underway.",
    tags: ["React", "WebRTC", "TypeScript"],
    priority: "High",
    dateApplied: "2026-04-12",
    jobLink: "https://discord.com/jobs",
    updatedAt: "2026-05-24T11:00:00.000Z",
  },
  {
    id: "job-11",
    company: "Dropbox",
    role: "Frontend Product Software Engineer",
    status: "Saved",
    salary: "Not specified",
    location: "Remote (Mexico)",
    notes: "Focus on Design systems, UI infrastructure, and AI-native development workflows.",
    tags: ["React", "TypeScript", "Design Systems"],
    priority: "Medium",
    dateApplied: "",
    jobLink: "https://www.dropbox.com/jobs",
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    type: "offer",
    message: "Received an official offer from Google!",
    timestamp: "2026-05-24T10:00:00.000Z",
    jobId: "job-1",
  },
  {
    id: "act-2",
    type: "offer",
    message: "Received an official offer from Discord!",
    timestamp: "2026-05-24T11:00:00.000Z",
    jobId: "job-10",
  },
  {
    id: "act-3",
    type: "interview",
    message: "Onsite interview scheduled with Stripe.",
    timestamp: "2026-05-22T14:30:00.000Z",
    jobId: "job-2",
  },
  {
    id: "act-4",
    type: "saved",
    message: "Saved a new job description: Vercel Framework Engineer.",
    timestamp: "2026-05-23T18:00:00.000Z",
    jobId: "job-8",
  },
  {
    id: "act-5",
    type: "applied",
    message: "Applied to Netflix for the UI Engineer role.",
    timestamp: "2026-05-18T09:15:00.000Z",
    jobId: "job-3",
  },
  {
    id: "act-6",
    type: "rejected",
    message: "Application at Meta updated to Rejected.",
    timestamp: "2026-05-15T16:45:00.000Z",
    jobId: "job-4",
  }
];

export const INITIAL_INTERVIEWS: InterviewEvent[] = [
  {
    id: "int-1",
    jobId: "job-2",
    company: "Stripe",
    role: "Fullstack Engineer",
    title: "Virtual Onsite Loop",
    date: "2026-05-27",
    time: "10:00",
    type: "Technical",
    notes: "4 rounds: React performance, System design, API spec design, Behavioral review.",
  },
  {
    id: "int-2",
    jobId: "job-6",
    company: "Airbnb",
    role: "Software Engineer II",
    title: "Technical Interview (Data Structures)",
    date: "2026-05-29",
    time: "14:00",
    type: "Technical",
    notes: "Review algorithms, arrays, graphs, and system modeling.",
  }
];
