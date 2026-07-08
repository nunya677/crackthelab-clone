import { Link } from 'react-router-dom';
import type { LessonSummary } from '@crackthelab/shared';
import { getCategoryMeta } from '../lib/categories';
import { useTilt } from '../hooks/useTilt';

export function LessonCard({ lesson, index }: { lesson: LessonSummary; index?: number }) {
  const category = getCategoryMeta(lesson.categorySlug);
  const tilt = useTilt<HTMLAnchorElement>();

  return (
    <Link
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      to={`/learn/${lesson.slug}`}
      style={{ transition: 'transform 150ms ease-out' }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 transition-shadow duration-200 will-change-transform hover:border-zinc-600 hover:shadow-lg hover:shadow-black/40"
    >
      <span className="group-scan-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />

      <span className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l-2 border-t-2 border-cyan-400/0 transition-all duration-200 group-hover:left-0.5 group-hover:top-0.5 group-hover:border-cyan-400/70" />
      <span className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 border-r-2 border-t-2 border-cyan-400/0 transition-all duration-200 group-hover:right-0.5 group-hover:top-0.5 group-hover:border-cyan-400/70" />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 border-b-2 border-l-2 border-cyan-400/0 transition-all duration-200 group-hover:bottom-0.5 group-hover:left-0.5 group-hover:border-cyan-400/70" />
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b-2 border-r-2 border-cyan-400/0 transition-all duration-200 group-hover:bottom-0.5 group-hover:right-0.5 group-hover:border-cyan-400/70" />

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-black text-xl">
          {index !== undefined ? (
            <span className="font-mono text-sm font-bold text-cyan-400">
              {String(index + 1).padStart(2, '0')}
            </span>
          ) : (
            '📘'
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-100">{lesson.title}</h3>
          <span className={`text-xs uppercase tracking-wide ${category.color}`}>
            {lesson.categorySlug}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-zinc-400">{lesson.summary}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>
          {lesson.challengeSlugs.length} related challenge{lesson.challengeSlugs.length === 1 ? '' : 's'}
        </span>
        <span className="font-bold text-cyan-400 group-hover:underline">Read lesson →</span>
      </div>
    </Link>
  );
}
