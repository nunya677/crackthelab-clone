import { useMyStats } from '../hooks/useMyStats';

export function LevelBadge() {
  const { level, title, pointsIntoLevel, pointsForNextLevel, progress, points } = useMyStats();

  return (
    <div className="flex items-center gap-2" title={`${points} pts total`}>
      <span className="rounded-full border border-cyan-500/50 bg-cyan-950/50 px-2 py-0.5 text-xs font-bold text-cyan-400">
        Lv.{level}
      </span>
      <div className="hidden sm:block">
        <div className="text-xs leading-none text-slate-300">{title}</div>
        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="mt-0.5 text-[10px] text-slate-500">
          {pointsIntoLevel}/{pointsForNextLevel} XP
        </div>
      </div>
    </div>
  );
}
