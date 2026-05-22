'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { saveSession } from '@/lib/session';
import { AuthUser } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post<{ token: string; user: AuthUser }>("/api/auth/login", values);
      saveSession(data.token, data.user);
      toast.success('Welcome back');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <div className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Sign in</p>
          <h1 className="text-3xl font-semibold text-white">Return to your tracker</h1>
          <p className="text-sm text-slate-300">Use the same account you created for your job search workflow.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm text-slate-200" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email ? <p className="mt-1 text-sm text-rose-300">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password ? <p className="mt-1 text-sm text-rose-300">{errors.password.message}</p> : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-300">
          New here?{' '}
          <Link href="/auth/register" className="font-medium text-cyan-200 hover:text-cyan-100">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
