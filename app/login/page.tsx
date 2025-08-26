'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { KeyRound, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push('/dashboard');
  };

  const signup = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push('/dashboard');
  };

  return (
    <div className="mx-auto grid max-w-md gap-6">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center text-2xl font-bold"
      >
        Login to manage orders
      </motion.h1>

      <form onSubmit={login} className="card grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Email</span>
          <div className="flex items-center gap-2 rounded-xl border px-3">
            <Mail size={16} className="text-gray-500" />
            <input
              className="w-full bg-transparent py-2 outline-none"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Password</span>
          <div className="flex items-center gap-2 rounded-xl border px-3">
            <KeyRound size={16} className="text-gray-500" />
            <input
              className="w-full bg-transparent py-2 outline-none"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between">
          <button disabled={loading} className="btn btn-primary disabled:opacity-50">
            {loading ? 'Loading...' : 'Login'}
          </button>
          <button onClick={signup} disabled={loading} className="btn btn-outline">
            {loading ? '...' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}
