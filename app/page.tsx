import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, ChartColumnBig, ShieldCheck, Sparkles } from 'lucide-react';

const highlights = [
  {
    icon: BriefcaseBusiness,
    title: 'Track every application',
    text: 'Store company, role, link, salary, location, notes, tags, and priority in one place.',
  },
  {
    icon: ChartColumnBig,
    title: 'See the pipeline',
    text: 'Monitor applications, interviews, offers, and rejections with a compact dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Keep access private',
    text: 'JWT auth and protected routes keep each user’s workspace isolated.',
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Job Tracker</p>
          <h1 className="text-lg font-semibold text-white">Portfolio-grade application tracker</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="grid flex-1 gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="max-w-3xl space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            <Sparkles className="h-4 w-4" />
            Fullstack job tracking workflow
          </span>
          <div className="space-y-5">
            <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Organize applications, interviews, and offers without the spreadsheet chaos.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              This app pairs a Next.js frontend with a Prisma-backed Express API so you can ship a clean, internship-ready product and keep iterating on the core workflow.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/5"
            >
              View dashboard shell
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          {highlights.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
