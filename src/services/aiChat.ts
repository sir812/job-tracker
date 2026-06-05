import { aiApiInstance } from "./api";

interface AskAiResponse {
  response?: string;
  generated_text?: string;
}

interface CoverLetterResponse {
  cover_letter?: string;
}

interface ResumeBulletResponse {
  bullet?: string;
}

interface JobFitResponse {
  assessment?: string;
}

interface InterviewPrepResponse {
  questions?: string;
}

export const askAi = async (prompt: string): Promise<string> => {
  const { data } = await aiApiInstance.post<AskAiResponse>("/ai/ask", { prompt });
  return data.response?.trim() || data.generated_text?.trim() || "";
};

export const generateCoverLetter = async (jobDescription: string, userSkills: string): Promise<string> => {
  const { data } = await aiApiInstance.post<CoverLetterResponse>("/ai/cover-letter", {
    job_description: jobDescription,
    user_skills: userSkills,
  });

  return data.cover_letter?.trim() || "";
};

export const improveResumeBullet = async (bullet: string): Promise<string> => {
  const { data } = await aiApiInstance.post<ResumeBulletResponse>("/ai/resume-bullet", {
    bullet,
  });

  return data.bullet?.trim() || "";
};

export const assessJobFit = async (jobDescription: string, profile: string): Promise<string> => {
  const { data } = await aiApiInstance.post<JobFitResponse>("/ai/job-fit", {
    job_description: jobDescription,
    profile,
  });

  return data.assessment?.trim() || "";
};

export const prepareInterviewQuestions = async (jobTitle: string, company: string): Promise<string> => {
  const { data } = await aiApiInstance.post<InterviewPrepResponse>("/ai/interview-prep", {
    job_title: jobTitle,
    company,
  });

  return data.questions?.trim() || "";
};

interface ApplyPreviewResponse {
  preview: string;
}

export const previewApplication = async (
  jobId: string,
  coverLetter?: string,
  resumeBullet?: string
): Promise<string> => {
  const { data } = await aiApiInstance.post<ApplyPreviewResponse>("/ai/apply-preview", {
    job_id: jobId,
    cover_letter: coverLetter,
    resume_bullet: resumeBullet,
  });

  return data.preview?.trim() || "";
};

interface ApplyExecuteResponse {
  status: string;
  message: string;
}

export const executeApplication = async (
  jobId: string,
  confirm = true,
  coverLetter?: string,
  resumeBullet?: string
): Promise<ApplyExecuteResponse> => {
  const { data } = await aiApiInstance.post<ApplyExecuteResponse>("/ai/apply-execute", {
    job_id: jobId,
    confirm,
    cover_letter: coverLetter,
    resume_bullet: resumeBullet,
  });

  return data;
};

// ─── Scraper-powered job discovery ───────────────────────────────────────────

interface FindJobsResponse {
  matches: string;
  count: number;
  message?: string;
  scraped?: { count: number; sources: Record<string, number>; scrapedAt: string };
}

/**
 * Asks the AI to match the user's query/profile against already-cached scraped jobs.
 * Fast — no new scrape is triggered.
 */
export const findJobs = async (query: string, profile?: string): Promise<FindJobsResponse> => {
  const token = localStorage.getItem("jt_token");
  const { data } = await aiApiInstance.post<FindJobsResponse>(
    "/ai/find-jobs",
    { query, profile, limit: 40 },
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );
  return data;
};

/**
 * Triggers a fresh scrape (RemoteOK + Remotive) THEN runs AI job matching.
 * Use this for the "Pull & Search" action so results are always up to date.
 */
export const scrapeAndFindJobs = async (
  query: string,
  profile?: string
): Promise<FindJobsResponse> => {
  const token = localStorage.getItem("jt_token");
  const { data } = await aiApiInstance.post<FindJobsResponse>(
    "/ai/scrape-and-find",
    { query, profile, limit: 40 },
    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  );
  return data;
};