'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Plus, ShieldAlert, LogOut, Sparkles, Trash2, Pencil, Search, Filter, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { clearSession, getSessionUser } from '@/lib/session';
import JobForm from '../components/JobForm';
import type { AuthUser, Job, JobStatus } from '@/lib/types';

const statusLabels: JobStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected', 'Saved'];

const emptyJobForm = {
  title: '',
  company: '',
  role: '',
  status: 'Applied' as JobStatus,
  link: '',
  salary: '',
  location: '',
  notes: '',
  dateApplied: '',
  priority: 0,
  tags: '',
};

type JobFormState = typeof emptyJobForm;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All');
  const [sortByDate, setSortByDate] = useState<'newest' | 'oldest'>('newest');
  const [form, setForm] = useState<JobFormState>(emptyJobForm);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);

  useEffect(() => {
    const sessionUser = typeof window !== 'undefined' ? getSessionUser() : null;
    if (!sessionUser) {
      router.replace('/auth/login');
      return;
    }
    setUser(sessionUser);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const loadJobs = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{ jobs: Job[] }>('/api/jobs');
        setJobs(data.jobs);
      } catch {
        toast.error('Failed to load your jobs');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user]);

  const stats = useMemo(() => {
    const interviews = jobs.filter((job) => job.status === 'Interview').length;
    const offers = jobs.filter((job) => job.status === 'Offer').length;
    const rejections = jobs.filter((job) => job.status === 'Rejected').length;

    return [
      { label: 'Total applications', value: jobs.length, tone: 'cyan' },
      { label: 'Interviews', value: interviews, tone: 'sky' },
      { label: 'Offers', value: offers, tone: 'emerald' },
      { label: 'Rejections', value: rejections, tone: 'rose' },
    ];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = jobs.filter((job) => {
      const matchesQuery =
        !normalizedQuery ||
        [job.title, job.company, job.role ?? '', job.location ?? '', job.notes ?? '', ...(job.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return source.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return sortByDate === 'newest' ? bTime - aTime : aTime - bTime;
    });
  }, [jobs, query, statusFilter, sortByDate]);

  const resetForm = () => setForm(emptyJobForm);

  const handleSignOut = () => {
    clearSession();
    router.push('/auth/login');
  };

  const handleCreateJob = async (job: Job) => {
    setJobs((current) => [job, ...current]);
  };

  const handleUpdateJob = (job: Job) => {
    setJobs((current) => current.map((j) => (j.id === job.id ? job : j)));
    setEditing(null);
  };

  const handleDeleteJob = async (id: number) => {
    try {
      await api.delete(`/api/jobs/${id}`);
      setJobs((current) => current.filter((job) => job.id !== id));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-6 text-white shadow-2xl shadow-cyan-950/20">
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Dashboard</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                  Track your pipeline, filter by status, and update your job search without leaving the app.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
                  Home
                </Link>
                <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-300">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              </article>
            ))}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Saved jobs</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Application pipeline</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-200">
                  <Search className="h-4 w-4 text-cyan-200" />
                  <input
                    className="bg-transparent outline-none placeholder:text-slate-500"
                    placeholder="Search jobs"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-200">
                  <Filter className="h-4 w-4 text-cyan-200" />
                  <select
                    className="bg-transparent outline-none"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as JobStatus | 'All')}
                  >
                    <option value="All">All statuses</option>
                    {statusLabels.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-200"
                  onClick={() => setSortByDate((current) => (current === 'newest' ? 'oldest' : 'newest'))}
                >
                  <ArrowUpDown className="h-4 w-4 text-cyan-200" />
                  {sortByDate === 'newest' ? 'Newest first' : 'Oldest first'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-slate-300">
                  <BriefcaseBusiness className="mx-auto h-10 w-10 text-cyan-200" />
                  <p className="mt-4 text-lg font-medium text-white">No jobs yet</p>
                  <p className="mt-2 text-sm">Use the form on the right to create your first application.</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <article key={job.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                          <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">{job.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{job.company} {job.role ? `• ${job.role}` : ''}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {job.location ? `${job.location} • ` : ''}
                          {job.salary ? `${job.salary} • ` : ''}
                          {job.notes ?? 'No notes yet.'}
                        </p>
                        {job.tags?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {job.tags.map((tag) => (
                              <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{tag}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        {job.link ? (
                          <Link href={job.link} target="_blank" className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                            Open
                          </Link>
                        ) : null}
                        <button className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteJob(job.id)} className="rounded-full border border-white/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">New job</p>
                <h2 className="text-2xl font-semibold text-white">Add an application</h2>
              </div>
            </div>

            <div className="space-y-4">
              <JobForm
                initialData={editing ?? null}
                onSaved={(job) => {
                  if (editing) handleUpdateJob(job);
                  else handleCreateJob(job);
                }}
                onCancel={() => setEditing(null)}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-6 text-amber-50 backdrop-blur">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-1 h-5 w-5" />
              <div>
                <p className="font-semibold">Backend note</p>
                <p className="mt-2 text-sm leading-7 text-amber-50/85">
                  The API is wired for JWT auth and Prisma-backed CRUD. Set `NEXT_PUBLIC_API_URL` to your backend URL when you deploy.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-200">{label}</span>
      <input
        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}
