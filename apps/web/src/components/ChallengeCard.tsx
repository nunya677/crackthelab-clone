import { Link } from 'react-router-dom';
import type { ChallengeSummary } from '@crackthelab/shared';
import { getCategoryMeta } from '../lib/categories';
import { useTilt } from '../hooks/useTilt';

const difficultyStyle: Record<string, string> = {
  EASY: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/60',
  MEDIUM: 'text-amber-400 bg-amber-950/50 border-amber-800/60',
  HARD: 'text-rose-400 bg-rose-950/50 border-rose-800/60',
};

export function ChallengeCard({ challenge }: { challenge: ChallengeSummary }) {
  const category = getCategoryMeta(challenge.categorySlug);
  const tilt = useTilt<HTMLAnchorElement>();

  return (
    <Link
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      to={`/challenges/${challenge.slug}`}
      style={{ transition: 'transform 150ms ease-out' }}
      className={`group relative flex flex-col overflow-hidden rounded-xl border p-4 transition-shadow duration-200 will-change-transform ${
        challenge.type === 'LIVE' ? 'live-card-border' : ''
      } ${
        challenge.solved
          ? 'border-cyan-700/60 bg-cyan-950/10 hover:shadow-lg hover:shadow-cyan-900/30'
          : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/40'
      }`}
    >
      <span className="group-scan-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />

      {/* HUD corner brackets — locks on like a reticle when the card is hovered */}
      <span className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l-2 border-t-2 border-cyan-400/0 transition-all duration-200 group-hover:left-0.5 group-hover:top-0.5 group-hover:border-cyan-400/70" />
      <span className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 border-r-2 border-t-2 border-cyan-400/0 transition-all duration-200 group-hover:right-0.5 group-hover:top-0.5 group-hover:border-cyan-400/70" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 border-b-2 border-l-2 border-cyan-400/0 transition-all duration-200 group-hover:bottom-0.5 group-hover:left-0.5 group-hover:border-cyan-400/70" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b-2 border-r-2 border-cyan-400/0 transition-all duration-200 group-hover:bottom-0.5 group-hover:right-0.5 group-hover:border-cyan-400/70" />

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-black text-xl">
          {category.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-slate-100">{challenge.title}</h3>
          <span className={`text-xs uppercase tracking-wide ${category.color}`}>
            {challenge.categorySlug}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span
          className={`rounded-full border px-2 py-0.5 font-semibold ${difficultyStyle[challenge.difficulty]}`}
        >
          {challenge.difficulty}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 font-medium ${
            challenge.solved
              ? 'border-cyan-800/60 bg-cyan-950/50 text-cyan-400'
              : 'border-zinc-700 bg-zinc-900 text-zinc-400'
          }`}
        >
          {challenge.solved ? '✓ Solved' : 'Not started'}
        </span>
        {challenge.type === 'LIVE' && (
          <span className="flex items-center gap-1 rounded-full border border-sky-800/60 bg-sky-950/50 px-2 py-0.5 font-medium text-sky-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
            LIVE
          </span>
        )}
        {challenge.locked && (
          <span className="flex items-center gap-1 rounded-full border border-amber-800/60 bg-amber-950/50 px-2 py-0.5 font-medium text-amber-400">
            🔒 PRO
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-zinc-500">
        <span className="font-semibold text-cyan-400">{challenge.points} pts</span>
        <span>{challenge.solveCount} solves</span>
      </div>

      <div
        className={`mt-4 rounded-full py-2 text-center text-sm font-bold transition-colors ${
          challenge.locked
            ? 'bg-amber-950/40 text-amber-400 group-hover:bg-amber-950/70'
            : challenge.solved
              ? 'bg-zinc-900 text-cyan-400 group-hover:bg-zinc-800'
              : 'bg-cyan-400 text-black group-hover:bg-cyan-300'
        }`}
      >
        {challenge.locked ? '🔒 Unlock with PRO' : challenge.solved ? 'View Challenge' : 'Start Challenge'}
      </div>
    </Link>
  );
}
