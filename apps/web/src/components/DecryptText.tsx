import { useEffect, useState } from 'react';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01アイウエオ';
const FRAME_MS = 35;
const REVEAL_EVERY = 2;

export function DecryptText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let frame = 0;
    let revealed = 0;

    const interval = setInterval(() => {
      frame++;
      if (frame % REVEAL_EVERY === 0 && revealed < text.length) revealed++;

      let next = '';
      for (let i = 0; i < text.length; i++) {
        if (i < revealed || text[i] === ' ') {
          next += text[i];
        } else {
          next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplay(next);

      if (revealed >= text.length) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, FRAME_MS);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{display}</span>;
}
