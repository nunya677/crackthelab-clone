const COLORS = ['#22d3ee', '#38bdf8', '#f472b6', '#facc15', '#f87171'];
const PARTICLE_COUNT = 16;

export function ConfettiBurst() {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 40 + Math.random() * 40;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    return { dx, dy, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-particle-burst absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
          style={
            {
              backgroundColor: p.color,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
