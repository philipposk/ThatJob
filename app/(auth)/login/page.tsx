'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Double-submit protection: one sign-in at a time (ref ignores a fast second click); controls stay disabled with a
  // spinner until the browser navigates away. Released on error and on bfcache return (pageshow.persisted).
  const [oauthPending, setOauthPending] = useState<null | 'google' | 'github'>(null);
  const pendingRef = useRef(false);
  const busy = loading || oauthPending !== null;
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) { pendingRef.current = false; setOauthPending(null); setLoading(false); }
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      pendingRef.current = false;
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setOauthPending(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message ?? 'Sign-in failed');
      pendingRef.current = false;
      setOauthPending(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-foreground">Sign in to ThatJob</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-foreground"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-foreground"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            aria-busy={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={busy}
                aria-busy={oauthPending === 'google'}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {oauthPending === 'google' ? <><span aria-hidden="true" className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />Signing in…</> : 'Google'}
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('github')}
                disabled={busy}
                aria-busy={oauthPending === 'github'}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {oauthPending === 'github' ? <><span aria-hidden="true" className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />Signing in…</> : 'GitHub'}
              </button>
            </div>
          </div>
          <div className="text-center">
            <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              Don't have an account? Sign up
            </Link>
          </div>
          <div className="text-center">
            <Link href="/guest" className="text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Continue as guest
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
