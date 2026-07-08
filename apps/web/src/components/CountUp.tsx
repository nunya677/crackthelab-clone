import { useEffect, useState } from 'react';

const TICK_MS = 30;

export function CountUp({ value, durationMs = 900 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // setInterval instead of requestAnimationFrame: rAF can be throttled or
    // never fire at all for a backgrounded/non-composited tab (e.g. a
    // landing page opened in a background tab), which would otherwise leave
    // this stuck at its starting value forever. A hard snap-to-value once
    // durationMs elapses guarantees the correct number is shown regardless.
    const start = Date.now();
    const interval = setInterval(() => {
      const progress = Math.min((Date.now() - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress >= 1) clearInterval(interval);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [value, durationMs]);

  return <>{display}</>;
}
