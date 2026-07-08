export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-800/80 ${className}`} />;
}

export function ChallengeCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-4 h-9 w-full rounded-full" />
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ChallengeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-10 flex flex-col items-center gap-3">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="mb-10 flex items-end justify-center gap-8">
        {['h-16 w-16', 'h-24 w-24', 'h-16 w-16'].map((sizeClass, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <Skeleton className={`rounded-full ${sizeClass}`} />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
