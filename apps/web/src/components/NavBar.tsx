import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LevelBadge } from './LevelBadge';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${isActive ? 'text-cyan-400 font-medium' : 'text-slate-300 hover:text-white'}`;

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-500/10 bg-black/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 text-3xl font-black tracking-tight">
          <span className="drop-shadow-[0_0_8px_rgba(217,70,239,0.7)]">🔓</span>
          <span className="text-neon">ExploitYard</span>
          <sup className="ml-0.5 text-[0.9rem] font-bold text-fuchsia-300">™</sup>
        </Link>
        {user && (
          <NavLink to="/" end className={navLinkClass}>
            Challenges
          </NavLink>
        )}
        <NavLink to="/learn" className={navLinkClass}>
          Learn
        </NavLink>
        <NavLink to="/leaderboard" className={navLinkClass}>
          Leaderboard
        </NavLink>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <LevelBadge />
            {user.plan === 'PRO' ? (
              <span className="rounded-full border border-cyan-800/60 bg-cyan-950/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-cyan-400">
                Pro
              </span>
            ) : (
              <Link
                to="/upgrade"
                className="rounded-full border border-amber-800/60 bg-amber-950/30 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-400 hover:bg-amber-950/60"
              >
                ⚡ Upgrade
              </Link>
            )}
            <span className="text-sm text-slate-400">{user.username}</span>
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-sm hover:border-slate-500 hover:bg-slate-900"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link
              to="/register"
              className="animate-neon-pulse rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 px-4 py-1.5 text-sm font-bold text-black hover:brightness-110"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
