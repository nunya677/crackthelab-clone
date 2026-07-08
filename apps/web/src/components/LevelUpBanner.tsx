export function LevelUpBanner({ level, title }: { level: number; title: string }) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2">
      <div className="animate-level-up-in rounded-xl border border-cyan-500/60 bg-black/95 px-6 py-3 text-center shadow-[0_0_50px_rgba(34,211,238,0.5)]">
        <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">Level Up</div>
        <div className="mt-1 text-xl font-extrabold text-white">
          Lv.{level} <span className="text-cyan-400">{title}</span>
        </div>
      </div>
    </div>
  );
}
