import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl border border-zinc-800 bg-zinc-950/80 p-8">
      <h1 className="mb-6 text-2xl font-extrabold">
        Log <span className="text-cyan-400">in</span>
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-full border border-zinc-700 bg-black px-4 py-2 text-sm focus:border-cyan-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-full border border-zinc-700 bg-black px-4 py-2 text-sm focus:border-cyan-500 focus:outline-none"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-cyan-400 px-3 py-2 text-sm font-bold text-black hover:bg-cyan-300 disabled:opacity-50"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        No account?{' '}
        <Link to="/register" className="font-medium text-cyan-400">
          Sign up
        </Link>
      </p>
    </div>
  );
}
