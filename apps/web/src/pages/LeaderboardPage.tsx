import type { LeaderboardEntry } from '@crackthelab/shared';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { getLevelInfo } from '../lib/gamification';
import { avatarColor, avatarInitials } from '../lib/avatar';
import { LeaderboardSkeleton } from '../components/Skeleton';
import { DecryptText } from '../components/DecryptText';

const PODIUM_STYLE: Record<number, { ring: string; glow: string; size: string; lift: string }> = {
  1: { ring: 'ring-cyan-400', glow: 'shadow-[0_0_40px_rgba(34,211,238,0.45)]', size: 'h-24 w-24 text-2xl', lift: '' },
  2: { ring: 'ring-zinc-400', glow: 'shadow-[0_0_24px_rgba(212,212,216,0.3)]', size: 'h-16 w-16 text-lg', lift: 'mt-8' },
  3: { ring: 'ring-amber-600', glow: 'shadow-[0_0_24px_rgba(217,119,6,0.3)]', size: 'h-16 w-16 text-lg', lift: 'mt-8' },
};

function PodiumSpot({ entry }: { entry: LeaderboardEntry }) {
  const style = PODIUM_STYLE[entry.rank];
  const { level, title } = getLevelInfo(entry.points);

  return (
    <div className={`flex flex-col items-center ${style.lift}`}>
      {entry.rank === 1 && (
        <span className="animate-crown-bounce mb-1 inline-block text-2xl">👑</span>
      )}
      <div className="relative">
        {entry.rank === 1 && (
          <span className="animate-sparkle-spin pointer-events-none absolute -inset-3 text-cyan-300/70">
            <span className="absolute left-1/2 top-0 -translate-x-1/2">✦</span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2">✦</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2">✦</span>
            <span className="absolute left-0 top-1/2 -translate-y-1/2">✦</span>
          </span>
        )}
        <div
          className={`relative flex items-center justify-center rounded-full font-extrabold text-black ring-4 ${style.ring} ${style.glow} ${style.size} ${avatarColor(entry.username)}`}
        >
          {avatarInitials(entry.username)}
        </div>
        <span className="absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-black bg-zinc-900 text-xs font-bold">
          {entry.rank}
        </span>
      </div>
      <div className="mt-3 text-center">
        <div className="font-bold">{entry.username}</div>
        <div className="text-xs text-zinc-500">
          Lv.{level} · {title}
        </div>
        <div className="mt-1 rounded-full bg-cyan-400 px-3 py-0.5 text-xs font-bold text-black">
          {entry.points} pts
        </div>
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  const { data: entries, isLoading } = useLeaderboard();

  if (isLoading) return <LeaderboardSkeleton />;

  const top3 = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3) ?? [];
  // Visual podium order: 2nd left, 1st center (raised), 3rd right.
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as LeaderboardEntry[];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-10 text-center">
        <span className="mb-3 inline-block rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-400">
          🏆 Global Rankings
        </span>
        <h1 className="text-3xl font-extrabold">
          <DecryptText text="Elite Hackers" />
        </h1>
        <p className="mt-1 text-sm text-slate-400">Compete with every player and climb the ranks.</p>
      </div>

      {podiumOrder.length > 0 && (
        <div className="mb-10 flex items-end justify-center gap-8">
          {podiumOrder.map((entry) => (
            <PodiumSpot key={entry.userId} entry={entry} />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-950 text-zinc-500">
                <th className="py-3 pl-4">Rank</th>
                <th className="py-3">Player</th>
                <th className="py-3">Level</th>
                <th className="py-3">Solves</th>
                <th className="py-3 pr-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((e) => {
                const { level, title } = getLevelInfo(e.points);
                return (
                  <tr key={e.userId} className="border-t border-zinc-900 bg-zinc-950/60">
                    <td className="py-3 pl-4 font-mono text-zinc-500">#{e.rank}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-black ${avatarColor(e.username)}`}
                        >
                          {avatarInitials(e.username)}
                        </div>
                        <span className="font-medium">{e.username}</span>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-400">
                      Lv.{level} <span className="text-xs">{title}</span>
                    </td>
                    <td className="py-3 text-zinc-400">{e.solves}</td>
                    <td className="py-3 pr-4 text-right font-bold text-cyan-400">{e.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {entries?.length === 0 && <p className="text-center text-slate-500">No solves yet. Be the first!</p>}
    </div>
  );
}
