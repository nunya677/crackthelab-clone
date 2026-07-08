import { useEffect, useRef } from 'react';

const CHARS = '01アイウエオカキクケコサシスセソ$#@&%';
const FONT_SIZE = 16;
const TICK_MS = 60;

// Each column is assigned one of these neon hues (leading char / trail color),
// so the rain reads as a multi-color neon mix rather than a single tint.
const NEON_HUES: { lead: string; trail: string }[] = [
  { lead: '#b0f5ff', trail: 'rgba(34, 211, 238, 0.55)' }, // cyan
  { lead: '#ffd0fb', trail: 'rgba(217, 70, 239, 0.55)' }, // fuchsia
  { lead: '#e0d0ff', trail: 'rgba(139, 92, 246, 0.55)' }, // violet
  { lead: '#c9ffb0', trail: 'rgba(74, 222, 128, 0.55)' }, // neon green
  { lead: '#ffd0e0', trail: 'rgba(244, 63, 94, 0.55)' }, // hot pink/rose
  { lead: '#fff7b0', trail: 'rgba(250, 204, 21, 0.55)' }, // neon yellow
  { lead: '#ffd8b0', trail: 'rgba(251, 146, 60, 0.55)' }, // neon orange
];

export function MatrixRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];
    let hues: number[] = [];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = canvas!.width = rect.width;
      height = canvas!.height = rect.height;
      columns = Math.max(1, Math.floor(width / FONT_SIZE));
      drops = new Array(columns).fill(0).map(() => Math.random() * -50);
      hues = new Array(columns).fill(0).map(() => Math.floor(Math.random() * NEON_HUES.length));
    }

    resize();
    window.addEventListener('resize', resize);

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(5, 6, 3, 0.15)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const y = drops[i] * FONT_SIZE;
        const hue = NEON_HUES[hues[i]];
        ctx.fillStyle = y < FONT_SIZE * 2 ? hue.lead : hue.trail;
        ctx.fillText(char, i * FONT_SIZE, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
          hues[i] = Math.floor(Math.random() * NEON_HUES.length);
        }
        drops[i]++;
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
