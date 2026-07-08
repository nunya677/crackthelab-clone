import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LessonCard } from '../components/LessonCard';
import { CountUp } from '../components/CountUp';
import { DecryptText } from '../components/DecryptText';
import { CardGridSkeleton, Skeleton } from '../components/Skeleton';
import { getCategoryMeta, sortByCategoryOrder } from '../lib/categories';

const TRACK_TITLES: Record<string, string> = {
  foundations: 'Foundations',
  crypto: 'Cryptography',
  forensics: 'Forensics',
  web: 'Web Exploitation',
  misc: 'Misc',
};

export function LearnPage() {
  const { data: lessons, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: api.getLessons,
  });
  const { data: challenges } = useQuery({ queryKey: ['challenges'], queryFn: api.getChallenges });

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="mb-8 h-32 w-full rounded-xl" />
        <CardGridSkeleton />
      </div>
    );
  }
  if (error) return <p className="p-6 text-rose-400">{(error as Error).message}</p>;

  const grouped = new Map<string, typeof lessons>();
  for (const l of lessons ?? []) {
    const list = grouped.get(l.categorySlug) ?? [];
    list.push(l);
    grouped.set(l.categorySlug, list);
  }

  const tracksInOrder = sortByCategoryOrder([...grouped.entries()]);
  const totalLessons = lessons?.length ?? 0;
  const totalSolved = challenges?.filter((c) => c.solved).length ?? 0;
  const totalChallenges = challenges?.length ?? 0;

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
              <span className="rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-400">
                🎓 ExploitYard Academy
              </span>
              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Read First, Hack Second
              </span>
            </div>
            <h1 className="text-3xl font-extrabold">
              <DecryptText text="Academy" />
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              A structured curriculum, not just a pile of write-ups: start with Foundations, then
              work through each track's lessons — every one links to the challenge where you put it
              into practice.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-lg border border-zinc-800 bg-black/40 px-5 py-3 text-center">
              <div className="text-xl font-extrabold text-cyan-400">
                <CountUp value={totalLessons} />
              </div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Lessons</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-black/40 px-5 py-3 text-center">
              <div className="text-xl font-extrabold text-cyan-400">
                <CountUp value={totalSolved} />
                <span className="text-sm font-medium text-zinc-500">/{totalChallenges}</span>
              </div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Mastered</div>
            </div>
          </div>
        </div>
      </div>

      {tracksInOrder.map(([categorySlug, trackLessons], trackIndex) => {
        const meta = getCategoryMeta(categorySlug);
        const trackChallenges = challenges?.filter((c) => c.categorySlug === categorySlug) ?? [];
        const trackSolved = trackChallenges.filter((c) => c.solved).length;
        const hasChallenges = trackChallenges.length > 0;

        return (
          <div key={categorySlug} className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${meta.color}`}>
                <span className="text-base">{meta.icon}</span>
                Track {trackIndex + 1}: {TRACK_TITLES[categorySlug] ?? categorySlug}
              </h2>
              {hasChallenges ? (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="animate-bar-fill-in h-full rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                      style={{ width: `${(trackSolved / trackChallenges.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">
                    {trackSolved}/{trackChallenges.length} solved
                  </span>
                </div>
              ) : (
                <span className="text-xs text-zinc-500">
                  {trackLessons?.length} lesson{trackLessons?.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trackLessons?.map((l, i) => <LessonCard key={l.id} lesson={l} index={i} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
