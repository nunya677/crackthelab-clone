import { useEffect, useRef } from 'react';

interface Dot {
  el: HTMLSpanElement;
  life: number;
}

const MAX_DOTS = 14;
const SPAWN_EVERY_MS = 30;
const NEON_COLORS = ['#22d3ee', '#d946ef', '#8b5cf6'];

export function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dots: Dot[] = [];
    let lastSpawn = 0;
    let lastX = 0;
    let lastY = 0;
    let colorIndex = 0;

    function onMove(e: MouseEvent) {
      lastX = e.clientX;
      lastY = e.clientY;
    }
    window.addEventListener('mousemove', onMove);

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSpawn >= SPAWN_EVERY_MS && (lastX || lastY)) {
        lastSpawn = now;
        const color = NEON_COLORS[colorIndex % NEON_COLORS.length];
        colorIndex++;
        const span = document.createElement('span');
        span.style.cssText = `
          position: fixed;
          left: ${lastX}px;
          top: ${lastY}px;
          width: 5px;
          height: 5px;
          margin: -2.5px;
          border-radius: 9999px;
          background: ${color};
          box-shadow: 0 0 6px ${color};
          pointer-events: none;
          z-index: 9999;
          transition: opacity 500ms linear, transform 500ms linear;
        `;
        container!.appendChild(span);
        dots.push({ el: span, life: 0 });
        if (dots.length > MAX_DOTS) {
          const stale = dots.shift();
          stale?.el.remove();
        }
      }

      for (const dot of dots) {
        dot.life++;
        dot.el.style.opacity = String(Math.max(0, 1 - dot.life / 16));
        dot.el.style.transform = `scale(${Math.max(0, 1 - dot.life / 16)})`;
      }
    }, 16);

    return () => {
      window.removeEventListener('mousemove', onMove);
      clearInterval(interval);
      dots.forEach((d) => d.el.remove());
    };
  }, []);

  return <div ref={containerRef} />;
}
