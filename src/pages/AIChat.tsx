import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  BrainCircuit,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Wand2,
  User2,
  BriefcaseBusiness,
  FileText,
  ScanSearch,
  Presentation,
  Zap,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { useJobs } from "../context/JobContext";
import { useToasts } from "../context/ToastContext";
import {
  askAi,
  assessJobFit,
  generateCoverLetter,
  improveResumeBullet,
  prepareInterviewQuestions,
  previewApplication,
  executeApplication,
  findJobs,
  scrapeAndFindJobs,
} from "../services/aiChat";
import type { Job } from "../types/job";

type ChatRole = "assistant" | "user";
type ChatMode = "general" | "cover-letter" | "resume-bullet" | "job-fit" | "interview-prep" | "find-jobs";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  tag?: string;
}

const STORAGE_KEY = "jt_ai_chat_history_v2";

const modeOptions: Array<{ value: ChatMode; label: string; description: string; icon: React.ReactNode }> = [
  { value: "general", label: "General Chat", description: "Ask anything", icon: <Sparkles className="w-4 h-4" /> },
  {
    value: "cover-letter",
    label: "Cover Letter",
    description: "Use job + skills",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    value: "resume-bullet",
    label: "Resume Bullet",
    description: "Rewrite for impact",
    icon: <Wand2 className="w-4 h-4" />,
  },
  { value: "job-fit", label: "Job Fit", description: "Compare profile to role", icon: <ScanSearch className="w-4 h-4" /> },
  { value: "interview-prep", label: "Interview Prep", description: "Questions and prep", icon: <Presentation className="w-4 h-4" /> },
  { value: "find-jobs", label: "Find Jobs", description: "AI pulls live listings", icon: <Search className="w-4 h-4" /> },
];

const createWelcomeMessage = (name?: string): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  content: `Hi ${name ?? "there"}. I can help you write cover letters, improve resume bullets, prep for interviews, or analyze a job description. Pick a mode, choose a job, or ask me anything.`,
  timestamp: new Date().toISOString(),
});

const loadInitialMessages = (name?: string): ChatMessage[] => {
  if (typeof window === "undefined") {
    return [createWelcomeMessage(name)];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [createWelcomeMessage(name)];
  }

  try {
    const parsed = JSON.parse(stored) as ChatMessage[];
    return parsed.length > 0 ? parsed : [createWelcomeMessage(name)];
  } catch {
    return [createWelcomeMessage(name)];
  }
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatJobContext = (job: Job) => {
  const notes = job.notes?.trim() || "No notes available.";
  const tags = job.tags?.length ? job.tags.join(", ") : "No tags";

  return [
    `Company: ${job.company}`,
    `Role: ${job.role}`,
    `Location: ${job.location}`,
    `Status: ${job.status}`,
    `Priority: ${job.priority}`,
    `Tags: ${tags}`,
    `Notes: ${notes}`,
  ].join("\n");
};

export const AIChat: React.FC = () => {
  const { user } = useAuth();
  const { jobs, updateJob } = useJobs();
  const { error: showError, info: showInfo, success } = useToasts();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadInitialMessages(user?.name));
  const [prompt, setPrompt] = useState("");
  const [resumeBullet, setResumeBullet] = useState("");
  const [userSkills, setUserSkills] = useState("React, TypeScript, API integration, testing, performance tuning");
  const [profileSummary, setProfileSummary] = useState("Frontend engineer with experience shipping UI components, APIs, and responsive layouts.");
  const [mode, setMode] = useState<ChatMode>("general");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyPreviewText, setApplyPreviewText] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [lastScrapeInfo, setLastScrapeInfo] = useState<{ count: number; sources: Record<string, number>; scrapedAt: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  const recentJobs = useMemo(() => jobs.slice(0, 8), [jobs]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const appendAssistantMessage = (content: string, tag?: string) => {
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
      tag,
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  const appendUserMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  const sendPrompt = async (rawPrompt?: string) => {
    const nextPrompt = (rawPrompt ?? prompt).trim();

    if (!nextPrompt || loading) {
      return;
    }

    appendUserMessage(nextPrompt);
    setPrompt("");
    setLoading(true);

    try {
      const responseText = await askAi(nextPrompt);
      appendAssistantMessage(
        responseText || "The AI service returned no text. Check the backend logs or try another prompt.",
        "General"
      );
    } catch {
      showError("Could not reach the AI endpoint. Make sure the backend is running.", "AI request failed");
      appendAssistantMessage(
        "I could not reach the Groq-backed endpoint. Check your backend, network access, or enable mock mode for local testing.",
        "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const sendSmartAction = async () => {
    if (loading) {
      return;
    }

    const contextTag = modeOptions.find((item) => item.value === mode)?.label ?? "Smart Action";
    setLoading(true);

    try {
      if (mode === "resume-bullet") {
        if (!resumeBullet.trim()) {
          showError("Add a bullet to improve first.", "Missing bullet");
          return;
        }

        appendUserMessage(`Improve this resume bullet:\n${resumeBullet}`);
        const result = await improveResumeBullet(resumeBullet);
        appendAssistantMessage(result || "No rewritten bullet was returned.", contextTag);
        success("Resume bullet improved", "AI Chat");
        return;
      }

      if (mode === "cover-letter") {
        const jobContext = selectedJob ? formatJobContext(selectedJob) : prompt.trim();
        if (!jobContext || !userSkills.trim()) {
          showError("Choose a job or add job context, and include your skills.", "Missing inputs");
          return;
        }

        appendUserMessage(`Generate a cover letter using this job context:\n${jobContext}\n\nSkills: ${userSkills}`);
        const result = await generateCoverLetter(jobContext, userSkills);
        appendAssistantMessage(result || "No cover letter was returned.", contextTag);
        success("Cover letter drafted", "AI Chat");
        return;
      }

      if (mode === "job-fit") {
        const jobContext = selectedJob ? formatJobContext(selectedJob) : prompt.trim();
        if (!jobContext || !profileSummary.trim()) {
          showError("Choose a job or add job context, and include your profile summary.", "Missing inputs");
          return;
        }

        appendUserMessage(`Assess fit against this role:\n${jobContext}\n\nProfile: ${profileSummary}`);
        const result = await assessJobFit(jobContext, profileSummary);
        appendAssistantMessage(result || "No assessment was returned.", contextTag);
        success("Job fit analyzed", "AI Chat");
        return;
      }

      if (mode === "interview-prep") {
        const jobTitle = selectedJob?.role?.trim() || prompt.trim();
        const company = selectedJob?.company?.trim() || user?.name || "Company";
        if (!jobTitle) {
          showError("Choose a job or enter a role title first.", "Missing role");
          return;
        }

        appendUserMessage(`Prepare interview questions for ${jobTitle} at ${company}`);
        const result = await prepareInterviewQuestions(jobTitle, company);
        appendAssistantMessage(result || "No interview questions were returned.", contextTag);
        success("Interview prep generated", "AI Chat");
        return;
      }

      await sendPrompt();
    } catch {
      showError("Could not generate the smart response. Check the backend or mock mode.", "AI request failed");
      appendAssistantMessage(
        "I could not complete the smart action. Check your backend, network access, or enable mock mode.",
        "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const sendFindJobs = async (pullFresh: boolean) => {
    const query = prompt.trim() || `Find remote ${mode === "find-jobs" ? "" : ""}jobs matching my profile`;
    appendUserMessage(pullFresh ? `[Pulling fresh listings...] ${query}` : query);
    setPrompt("");
    setScrapeLoading(pullFresh);
    setLoading(true);
    try {
      const result = pullFresh
        ? await scrapeAndFindJobs(query, profileSummary)
        : await findJobs(query, profileSummary);

      if (result.scraped) setLastScrapeInfo(result.scraped);

      const header = result.scraped
        ? `✅ Scraped ${result.scraped.count} jobs (RemoteOK: ${result.scraped.sources.remoteok ?? 0}, Remotive: ${result.scraped.sources.remotive ?? 0})\n\n`
        : `📋 Searching across ${result.count} cached listings...\n\n`;

      appendAssistantMessage(
        result.matches
          ? `${header}${result.matches}`
          : result.message ?? "No matching jobs found.",
        "Find Jobs"
      );
      success(pullFresh ? "Fresh listings pulled & matched" : "Job search complete", "Find Jobs");
    } catch {
      showError("Could not reach the job finder. Make sure both backend servers are running.", "Find Jobs");
      appendAssistantMessage(
        "I could not pull job listings. Ensure the Express backend (port 4000) and Python AI server (port 8000) are running.",
        "Error"
      );
    } finally {
      setLoading(false);
      setScrapeLoading(false);
    }
  };

  const onAutoApply = async () => {
    if (!selectedJob) {
      showInfo("Pick a job to auto-apply.", "Auto-apply");
      return;
    }

    setLoading(true);
    try {
      // Generate a cover letter based on the selected job and user skills
      const jobContext = formatJobContext(selectedJob);
      const cover = await generateCoverLetter(jobContext, userSkills);
      setGeneratedCoverLetter(cover);

      // Get a preview of what would be submitted
      const preview = await previewApplication(selectedJob.id, cover, undefined);
      setApplyPreviewText(preview || "(No preview returned)");
      setApplyModalOpen(true);
    } catch (e) {
      showError("Could not prepare application preview.", "Auto-apply failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      const res = await executeApplication(selectedJob.id, true, generatedCoverLetter ?? undefined);
      if (res.status === "ok") {
        // update job to Applied
        await updateJob(selectedJob.id, { status: "Applied", dateApplied: new Date().toISOString().split("T")[0] });
        setApplyModalOpen(false);
        setApplyPreviewText("");
        setGeneratedCoverLetter(null);
        success("Application recorded (mock)", "Auto-apply");
      } else {
        showError(res.message || "Apply action failed", "Auto-apply");
      }
    } catch (e: any) {
      showError(e?.message || "Apply execution failed", "Auto-apply");
    } finally {
      setApplying(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendPrompt();
    }
  };

  const clearConversation = () => {
    const nextMessages = [createWelcomeMessage(user?.name)];
    setMessages(nextMessages);
    setPrompt("");
    setResumeBullet("");
    setSelectedJobId("");
    showInfo("Conversation cleared", "AI Chat");
    textareaRef.current?.focus();
  };

  const selectedMode = modeOptions.find((item) => item.value === mode);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-[0.24em]">
          <Sparkles className="w-4 h-4" />
          <span>AI Assistant</span>
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 dark:text-white light:text-slate-900">Smarter AI Chatbot</h2>
            <p className="text-xs text-black dark:text-white mt-1">
              Use job context, resume bullets, and targeted modes for stronger prompts and cleaner outputs.
            </p>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors light:text-cyan-600 light:hover:text-cyan-500">
            Pull from your jobs
          </Link>
        </div>
        {/* Apply preview/confirm modal */}
        <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="Application preview" size="lg">
          <div className="space-y-4">
            <div className="text-sm text-black dark:text-white">
              <p className="font-semibold text-slate-100 dark:text-white light:text-slate-900">Preview</p>
              <pre className="whitespace-pre-wrap text-xs bg-black/70 p-3 rounded-md border border-neutral-800 mt-2 light:bg-slate-50 light:border-slate-200 light:text-slate-800">{applyPreviewText}</pre>
            </div>

            {generatedCoverLetter ? (
              <div className="text-sm text-black dark:text-white">
                <p className="font-semibold text-slate-100 dark:text-white light:text-slate-900">Generated Cover Letter</p>
                <pre className="whitespace-pre-wrap text-xs bg-black/70 p-3 rounded-md border border-neutral-800 mt-2">{generatedCoverLetter}</pre>
              </div>
            ) : null}

            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" onClick={() => setApplyModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={confirmApply} loading={applying}>Confirm & Apply</Button>
            </div>
          </div>
        </Modal>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] items-start">
        <Card className="p-0 overflow-hidden flex flex-col min-h-[74vh] border-neutral-800 bg-gradient-to-br from-black via-black to-neutral-950 light:bg-white light:bg-none light:border-slate-200">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-neutral-800 bg-black/70 backdrop-blur-sm light:border-slate-200 light:bg-slate-50/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-black border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 light:bg-slate-100 light:border-cyan-200 light:text-cyan-600">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-100 dark:text-white truncate light:text-slate-900">Job Tracker AI</h3>
                <p className="text-[11px] text-black dark:text-white truncate light:text-slate-500">Connected to backend AI routes with smart job context</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={clearConversation}>
              Clear
            </Button>
          </div>

          <div className="px-4 md:px-5 pt-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {modeOptions.map((item) => {
                const active = item.value === mode;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMode(item.value)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all text-left ${
                      active
                        ? "bg-cyan-500/10 border-cyan-400/30 text-slate-100 shadow-lg shadow-black/20 light:bg-cyan-50 light:border-cyan-200 light:text-cyan-950 light:shadow-none"
                        : "bg-black/70 border-neutral-800 hover:bg-black hover:border-neutral-700 text-black light:bg-slate-50 light:border-slate-200 light:hover:bg-slate-100 light:text-slate-700"
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${active ? "text-cyan-300 light:text-cyan-600" : "text-black light:text-slate-400"}`}>{item.icon}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider">{item.label}</p>
                      <p className="text-[11px] mt-1 text-black dark:text-white leading-relaxed light:text-slate-500">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-black dark:text-white">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>
                Active mode: <span className="text-cyan-300 font-semibold">{selectedMode?.label ?? "General Chat"}</span>
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-5 py-5 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-3xl px-4 py-3 border shadow-lg backdrop-blur-sm ${
                    message.role === "user"
                        ? "bg-cyan-500/15 border-cyan-400/20 text-slate-100 light:bg-cyan-50 light:border-cyan-200 light:text-slate-800"
                        : "bg-black/70 border-neutral-800 text-slate-100 light:bg-slate-100 light:border-slate-200 light:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                    {message.role === "user" ? (
                      <>
                        <User2 className="w-3.5 h-3.5 text-cyan-400 light:text-cyan-600" />
                        <span className="text-cyan-300 light:text-cyan-700">You</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-cyan-400 light:text-cyan-600" />
                        <span className="text-cyan-300 light:text-cyan-700">Assistant</span>
                        {message.tag ? <span className="text-black light:text-slate-500">/ {message.tag}</span> : null}
                      </>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-100 light:text-slate-850">{message.content}</p>
                  <span className="mt-2 block text-[10px] font-medium text-black light:text-slate-400">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-3xl px-4 py-3 bg-black/70 border border-neutral-800 text-black max-w-[88%] light:bg-slate-100 light:border-slate-200 light:text-slate-850">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
                    <Bot className="w-3.5 h-3.5 text-cyan-400 light:text-cyan-600" />
                    <span className="text-cyan-300 light:text-cyan-700">Assistant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:120ms]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:240ms]" />
                    <span className="text-black ml-2 light:text-slate-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-neutral-800 bg-black/80 backdrop-blur-sm p-4 md:p-5 space-y-4 light:border-slate-200 light:bg-slate-50/80">
            {mode === "cover-letter" || mode === "job-fit" || mode === "interview-prep" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Context job"
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  options={[
                    { label: "Select a job", value: "" },
                    ...recentJobs.map((job) => ({
                      label: `${job.company} - ${job.role}`,
                      value: job.id,
                    })),
                  ]}
                />
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      if (!selectedJob) {
                        showInfo("Pick a job to auto-fill its context.", "AI Chat");
                        return;
                      }

                      setPrompt(formatJobContext(selectedJob));
                      textareaRef.current?.focus();
                      showInfo(`Loaded context for ${selectedJob.company}`, "AI Chat");
                    }}
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    Load job context
                  </Button>
                </div>
              </div>
            ) : null}

            {mode === "resume-bullet" ? (
              <Input
                label="Resume bullet"
                placeholder="Built backend features"
                value={resumeBullet}
                onChange={(event) => setResumeBullet(event.target.value)}
              />
            ) : null}

            {mode === "cover-letter" ? (
              <Input
                label="Skills to highlight"
                placeholder="React, TypeScript, GraphQL, CI/CD"
                value={userSkills}
                onChange={(event) => setUserSkills(event.target.value)}
              />
            ) : null}

            {mode === "job-fit" ? (
              <Textarea
                label="Profile summary"
                placeholder="Frontend engineer with experience in React, design systems, APIs, and product collaboration."
                value={profileSummary}
                onChange={(event) => setProfileSummary(event.target.value)}
                charLimit={700}
                className="min-h-[110px]"
              />
            ) : null}

            {mode === "find-jobs" ? (
              <div className="flex flex-col gap-3">
                <Textarea
                  label="Your profile / skills (used to match jobs)"
                  placeholder="e.g. Frontend engineer with 3 years React, TypeScript, Node.js. Open to remote roles."
                  value={profileSummary}
                  onChange={(event) => setProfileSummary(event.target.value)}
                  charLimit={500}
                  className="min-h-[90px]"
                />
                {lastScrapeInfo && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-300">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Last scrape: <strong>{lastScrapeInfo.count} jobs</strong> ·{" "}
                      {new Date(lastScrapeInfo.scrapedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            <Textarea
              ref={textareaRef}
              label={mode === "general" ? "Message" : "Additional context / notes"}
              placeholder={
                mode === "general"
                  ? "Ask the AI to write, rewrite, explain, or plan something for your job search..."
                  : "Add extra details, job notes, or anything the model should know..."
              }
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handleKeyDown}
              charLimit={1400}
              className="min-h-[120px]"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-black dark:text-white flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Smart modes combine your job data with the AI prompt for better results.
              </p>

              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" type="button" onClick={() => setPrompt("")}>Reset notes</Button>
                {mode === "cover-letter" && selectedJob ? (
                  <Button variant="secondary" type="button" onClick={onAutoApply} loading={loading} icon={<Send className="w-4 h-4" />}>
                    Auto-apply
                  </Button>
                ) : null}
                {mode === "find-jobs" ? (
                  <>
                    <Button
                      variant="secondary"
                      type="button"
                      loading={scrapeLoading}
                      disabled={loading}
                      icon={<Zap className="w-4 h-4" />}
                      onClick={() => void sendFindJobs(true)}
                    >
                      Pull &amp; Search
                    </Button>
                    <Button
                      type="button"
                      icon={<Search className="w-4 h-4" />}
                      loading={loading && !scrapeLoading}
                      disabled={loading}
                      onClick={() => void sendFindJobs(false)}
                    >
                      Search Cached
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    icon={<Send className="w-4 h-4" />}
                    loading={loading}
                    onClick={() => {
                      if (mode === "general") {
                        void sendPrompt();
                        return;
                      }
                      void sendSmartAction();
                    }}
                  >
                    {mode === "general" ? "Send" : "Generate"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-6 sticky top-6">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 light:border-slate-200">
              <BriefcaseBusiness className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Recent Jobs</h3>
            </div>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {recentJobs.length === 0 ? (
                <p className="text-xs text-black dark:text-white py-4 text-center">No jobs available</p>
              ) : (
                recentJobs.map((job) => {
                  const active = job.id === selectedJobId;

                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => {
                        setSelectedJobId(job.id);
                        if (mode !== "general") {
                          setPrompt(formatJobContext(job));
                        }
                        showInfo(`Selected ${job.company}`, "AI Chat");
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        active
                          ? "bg-cyan-500/10 border-cyan-400/30 light:bg-cyan-50 light:border-cyan-200"
                            : "bg-black/70 border-neutral-800 hover:bg-black hover:border-neutral-700 light:bg-slate-50 light:border-slate-200 light:hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-100 dark:text-white truncate light:text-slate-900">{job.company}</h4>
                          <p className="text-xs text-black dark:text-white mt-1 truncate light:text-slate-600">{job.role}</p>
                          <p className="text-[11px] text-black dark:text-white mt-2 truncate light:text-slate-500">{job.location}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-black border border-cyan-500/20 px-2 py-1 rounded-full light:bg-cyan-50 light:border-cyan-200 light:text-cyan-700">
                          {job.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 light:border-slate-200">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">How It Works</h3>
            </div>
            <div className="space-y-3 text-sm text-black dark:text-white">
              <div className="p-3 rounded-xl bg-black/70 border border-neutral-800 light:bg-slate-50 light:border-slate-200">
                <p className="font-semibold text-slate-100 dark:text-white light:text-slate-900">1. Pick a mode</p>
                <p className="text-xs text-black dark:text-white mt-1 light:text-slate-500">General chat, cover letter, bullet rewrite, job fit, or interview prep.</p>
              </div>
              <div className="p-3 rounded-xl bg-black/70 border border-neutral-800 light:bg-slate-50 light:border-slate-200">
                <p className="font-semibold text-slate-100 dark:text-white light:text-slate-900">2. Add job context</p>
                <p className="text-xs text-black dark:text-white mt-1 light:text-slate-500">Select a recent job to auto-fill company, role, status, notes, and tags.</p>
              </div>
              <div className="p-3 rounded-xl bg-black/70 border border-neutral-800 light:bg-slate-50 light:border-slate-200">
                <p className="font-semibold text-slate-100 dark:text-white light:text-slate-900">3. Generate smarter output</p>
                <p className="text-xs text-black dark:text-white mt-1 light:text-slate-500">The frontend calls a specialized endpoint based on your mode.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

  {/* Apply preview/confirm modal */}

