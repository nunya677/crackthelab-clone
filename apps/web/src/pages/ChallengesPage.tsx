import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ChallengeCard } from '../components/ChallengeCard';
import { CardGridSkeleton, Skeleton } from '../components/Skeleton';
import { getCategoryMeta } from '../lib/categories';
import { useMyStats } from '../hooks/useMyStats';
import { TerminalAnimation } from '../components/TerminalAnimation';
import { CountUp } from '../components/CountUp';
import { DecryptText } from '../components/DecryptText';

type Filter = 'all' | 'live';

export function ChallengesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['challenges'],
    queryFn: api.getChallenges,
  });
  const { points, solves, level, title } = useMyStats();
  const [filter, setFilter] = useState<Filter>('all');

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="mb-8 h-32 w-full rounded-xl" />
        <CardGridSkeleton />
      </div>
    );
  }
  if (error) return <p className="p-6 text-rose-400">{(error as Error).message}</p>;

  const total = data?.length ?? 0;
  const filtered = filter === 'live' ? (data ?? []).filter((c) => c.type === 'LIVE') : (data ?? []);
  const grouped = new Map<string, typeof data>();
  for (const c of filtered) {
    const list = grouped.get(c.categorySlug) ?? [];
    list.push(c);
    grouped.set(c.categorySlug, list);
  }

  return (
    <div className="p-6">
      <div className="relative mb-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 p-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(34,211,238,0.12), transparent 45%)',
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                aria-pressed={filter === 'all'}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  filter === 'all'
                    ? 'border-cyan-800/60 bg-cyan-950/40 text-cyan-400'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                Challenges Arena
              </button>
              <button
                type="button"
                onClick={() => setFilter(filter === 'live' ? 'all' : 'live')}
                aria-pressed={filter === 'live'}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  filter === 'live'
                    ? 'border-sky-800/60 bg-sky-950/40 text-sky-400'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                Hands-on Practice
              </button>
            </div>
            <h1 className="text-3xl font-extrabold">
              <DecryptText text="Challenges" />
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Level {level} · {title}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-lg border border-zinc-800 bg-black/40 px-5 py-3 text-center">
              <div className="text-xl font-extrabold text-cyan-400">
                <CountUp value={solves} />
                <span className="text-sm font-medium text-zinc-500">/{total}</span>
              </div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Solved</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-black/40 px-5 py-3 text-center">
              <div className="text-xl font-extrabold text-cyan-400">
                <CountUp value={points} />
              </div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Points</div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 max-w-md">
          <TerminalAnimation />
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-slate-500">No hands-on (live) challenges right now.</p>
      )}

      {[...grouped.entries()].map(([categorySlug, challenges]) => {
        const meta = getCategoryMeta(categorySlug);
        return (
          <div key={categorySlug} className="mb-8">
            <h2
              className={`mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${meta.color}`}
            >
              <span className="text-base">{meta.icon}</span>
              {categorySlug}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {challenges?.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
