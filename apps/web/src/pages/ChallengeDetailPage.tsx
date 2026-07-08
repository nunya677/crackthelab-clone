import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { InstancePanel } from '../components/InstancePanel';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { LevelUpBanner } from '../components/LevelUpBanner';
import { MarkdownBlock } from '../components/MarkdownBlock';
import { DetailPageSkeleton } from '../components/Skeleton';
import { getCategoryMeta } from '../lib/categories';
import { getLevelInfo } from '../lib/gamification';
import { useMyStats } from '../hooks/useMyStats';
import type { SubmitFlagResult } from '@crackthelab/shared';

const LEVEL_UP_DURATION_MS = 3200;

export function ChallengeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [flag, setFlag] = useState('');
  const [result, setResult] = useState<SubmitFlagResult | null>(null);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<{ key: number; level: number; title: string } | null>(
    null,
  );

  const { points } = useMyStats();
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', slug],
    queryFn: () => api.getChallenge(slug!),
    enabled: !!slug,
  });

  const { data: lesson } = useQuery({
    queryKey: ['lesson', challenge?.lessonSlug],
    queryFn: () => api.getLesson(challenge!.lessonSlug!),
    enabled: !!challenge?.lessonSlug,
  });

  const submit = useMutation({
    mutationFn: (flagValue: string) => api.submitFlag(challenge!.id, flagValue),
    onSuccess: (data) => {
      setSubmitError(null);
      setResult(data);
      if (data.correct) {
        queryClient.invalidateQueries({ queryKey: ['challenges'] });
        queryClient.invalidateQueries({ queryKey: ['challenge', slug] });
        if (!data.alreadySolved) {
          setCelebrationKey((k) => k + 1);

          const before = getLevelInfo(pointsRef.current).level;
          const after = getLevelInfo(pointsRef.current + data.pointsAwarded);
          if (after.level > before) {
            setLevelUp({ key: Date.now(), level: after.level, title: after.title });
            setTimeout(() => setLevelUp(null), LEVEL_UP_DURATION_MS);
          }
        }
      }
    },
    onError: (err) => {
      setResult(null);
      setSubmitError(
        (err as Error).message || 'Something went wrong submitting your flag — try again.',
      );
    },
  });

  if (isLoading) return <DetailPageSkeleton />;
  if (!challenge) return <p className="p-6 text-rose-400">Challenge not found.</p>;

  const category = getCategoryMeta(challenge.categorySlug);
  const justWon = result?.correct && !result.alreadySolved;

  return (
    <div className="mx-auto max-w-2xl p-6">
      {levelUp && <LevelUpBanner key={levelUp.key} level={levelUp.level} title={levelUp.title} />}

      <Link to="/" className="text-sm text-slate-400 hover:text-white">
        ← Back to challenges
      </Link>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-black text-xl">
            {category.icon}
          </span>
          {challenge.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span
            className={`rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-semibold uppercase tracking-wide ${category.color}`}
          >
            {challenge.categorySlug}
          </span>
          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-semibold text-zinc-300">
            {challenge.difficulty}
          </span>
          <span className="rounded-full border border-cyan-800/60 bg-cyan-950/50 px-2 py-0.5 font-bold text-cyan-400">
            {challenge.points} pts
          </span>
        </div>

        <div className="mt-6">
          <MarkdownBlock text={challenge.description} />
        </div>
      </div>

      {lesson && (
        <Link
          to={`/learn/${lesson.slug}`}
          className="mt-4 flex items-center justify-between rounded-xl border border-sky-800/50 bg-sky-950/10 px-4 py-3 transition-colors hover:border-sky-600"
        >
          <span className="flex items-center gap-2 text-sm">
            <span>📘</span>
            Not sure where to start? Read <span className="font-semibold">{lesson.title}</span>{' '}
            first.
          </span>
          <span className="text-sm font-bold text-sky-400">Learn →</span>
        </Link>
      )}

      {challenge.locked ? (
        <div className="mt-6 rounded-xl border border-amber-800/60 bg-amber-950/10 p-6 text-center">
          <div className="text-2xl">🔒</div>
          <h2 className="mt-2 text-lg font-bold text-amber-400">This challenge requires PRO</h2>
          <p className="mt-1 text-sm text-slate-400">
            Upgrade to unlock every challenge, including live Docker sandboxes.
          </p>
          <Link
            to="/upgrade"
            className="mt-4 inline-block rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-black hover:bg-amber-300"
          >
            Upgrade to PRO
          </Link>
        </div>
      ) : (
        <>
          {challenge.type === 'LIVE' && (
            <div className="mt-6">
              <InstancePanel challengeId={challenge.id} />
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitError(null);
              submit.mutate(flag);
            }}
            className={`relative mt-6 flex gap-2 rounded-lg ${justWon ? 'animate-glow-flash' : ''}`}
          >
            <input
              type="text"
              placeholder="flag{...}"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              className="flex-1 rounded-full border border-zinc-700 bg-black px-4 py-2 font-mono text-sm focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submit.isPending || !flag}
              className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-black hover:bg-cyan-300 disabled:opacity-40"
            >
              Submit
            </button>

            {justWon && (
              <>
                <span
                  key={celebrationKey}
                  className="animate-float-up-fade pointer-events-none absolute right-4 -top-2 text-lg font-bold text-cyan-400"
                >
                  +{result!.pointsAwarded} XP
                </span>
                <ConfettiBurst key={`confetti-${celebrationKey}`} />
              </>
            )}
          </form>

          {submitError && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-amber-400">
              ⚠ {submitError}
            </p>
          )}

          {result && (
            <p
              className={`mt-3 flex items-center gap-1.5 text-sm ${
                result.correct ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {result.alreadySolved
                ? 'Already solved — no additional points awarded.'
                : result.correct
                  ? `Correct! +${result.pointsAwarded} points.`
                  : '✗ Incorrect flag, try again.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
