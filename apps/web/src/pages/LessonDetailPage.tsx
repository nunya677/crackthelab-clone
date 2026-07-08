import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { MarkdownBlock } from '../components/MarkdownBlock';
import { DetailPageSkeleton } from '../components/Skeleton';
import { getCategoryMeta } from '../lib/categories';

const difficultyStyle: Record<string, string> = {
  EASY: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/60',
  MEDIUM: 'text-amber-400 bg-amber-950/50 border-amber-800/60',
  HARD: 'text-rose-400 bg-rose-950/50 border-rose-800/60',
};

export function LessonDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', slug],
    queryFn: () => api.getLesson(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <DetailPageSkeleton />;
  if (!lesson) return <p className="p-6 text-rose-400">Lesson not found.</p>;

  const category = getCategoryMeta(lesson.categorySlug);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/learn" className="text-sm text-slate-400 hover:text-white">
        ← Back to Learn
      </Link>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-black text-xl">
            📘
          </span>
          {lesson.title}
        </h1>
        <span
          className={`mt-3 inline-block rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${category.color}`}
        >
          {lesson.categorySlug}
        </span>

        <div className="mt-6">
          <MarkdownBlock text={lesson.content} />
        </div>
      </div>

      {lesson.relatedChallenges.length > 0 && (
        <div className="mt-6 rounded-xl border border-cyan-800/40 bg-cyan-950/10 p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-cyan-400">
            Try it yourself
          </h2>
          <div className="space-y-2">
            {lesson.relatedChallenges.map((c) => (
              <Link
                key={c.id}
                to={`/challenges/${c.slug}`}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/40 px-4 py-3 transition-colors hover:border-zinc-600"
              >
                <span className="font-medium">{c.title}</span>
                <span className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-full border px-2 py-0.5 font-semibold ${difficultyStyle[c.difficulty]}`}
                  >
                    {c.difficulty}
                  </span>
                  <span className="font-bold text-cyan-400">{c.points} pts</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
