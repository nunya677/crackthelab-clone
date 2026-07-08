import { useEffect, useState } from 'react';

interface ScriptLine {
  text: string;
  prompt?: boolean;
}

const SCRIPT: ScriptLine[] = [
  { text: 'whoami', prompt: true },
  { text: 'guest' },
  { text: 'curl target/api/secret -H "Origin: https://evil.example.com"', prompt: true },
  { text: '{"flag":"flag{cor5_credent1als_leak}"}' },
  { text: "curl -X POST target/ -d 'user=admin&pass=x OR 1=1--'", prompt: true },
  { text: '200 OK — welcome back, admin' },
  { text: 'python3 forge_jwt.py --alg none --role admin', prompt: true },
  { text: '[+] token forged, signature: (none)' },
  { text: 'nc -lvnp 4444', prompt: true },
  { text: 'connection received from 10.0.0.12' },
  { text: '[+] access granted' },
];

const TYPE_SPEED_CMD = 45;
const TYPE_SPEED_OUTPUT = 14;
const PAUSE_AFTER_CMD = 450;
const PAUSE_AFTER_OUTPUT = 350;
const PAUSE_AFTER_SCRIPT = 2200;
const MAX_VISIBLE_LINES = 8;

export function TerminalAnimation() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeNext() {
      if (cancelled) return;
      const line = SCRIPT[lineIndex];
      const full = (line.prompt ? '$ ' : '') + line.text;
      charIndex++;
      setCurrentText(full.slice(0, charIndex));

      if (charIndex < full.length) {
        timeoutId = setTimeout(typeNext, line.prompt ? TYPE_SPEED_CMD : TYPE_SPEED_OUTPUT);
        return;
      }

      timeoutId = setTimeout(
        () => {
          setLines((prev) => [...prev, full].slice(-MAX_VISIBLE_LINES));
          setCurrentText('');
          charIndex = 0;
          lineIndex++;

          if (lineIndex >= SCRIPT.length) {
            timeoutId = setTimeout(() => {
              if (cancelled) return;
              setLines([]);
              lineIndex = 0;
              typeNext();
            }, PAUSE_AFTER_SCRIPT);
          } else {
            typeNext();
          }
        },
        line.prompt ? PAUSE_AFTER_CMD : PAUSE_AFTER_OUTPUT,
      );
    }

    timeoutId = setTimeout(typeNext, 400);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-[0_0_40px_rgba(34,211,238,0.15)]">
      <div className="flex items-center gap-1.5 border-b border-zinc-800 bg-zinc-950 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
        <span className="ml-2 text-xs text-zinc-500">guest@exploityard:~</span>
      </div>
      <div className="h-44 overflow-hidden p-4 text-left font-mono text-sm text-cyan-400">
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap break-all leading-relaxed">
            {l}
          </div>
        ))}
        <div className="whitespace-pre-wrap break-all leading-relaxed">
          {currentText}
          <span className="animate-blink">▋</span>
        </div>
      </div>
    </div>
  );
}
