'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSessionUser, clearSession } from '@/lib/session';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(() => (typeof window !== 'undefined' ? getSessionUser() : null));

  useEffect(() => {
    if (typeof window !== 'undefined') setUser(getSessionUser());
  }, []);

  const signOut = () => {
    clearSession();
    router.push('/auth/login');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3">
      <div>
        <Link href="/" className="text-sm font-semibold text-white">Job Tracker</Link>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-slate-200">{user.name ?? user.email}</span>
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-950">
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <Link href="/auth/login" className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
