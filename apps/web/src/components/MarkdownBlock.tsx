import type { ReactNode } from 'react';

// Minimal renderer for the small set of markdown-ish patterns used in
// challenge descriptions and lesson content: ``` fenced code blocks,
// "- " bullet lists, and **bold** — not general markdown.
export function MarkdownBlock({ text }: { text: string }) {
  const parts = text.split(/```(?:\w*\n)?/);

  return (
    <div className="space-y-3 text-slate-200">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-lg border border-zinc-800 bg-black p-4 font-mono text-sm text-cyan-300"
          >
            {part.trim()}
          </pre>
        ) : (
          renderProse(part, i)
        ),
      )}
    </div>
  );
}

function renderProse(text: string, keyPrefix: number) {
  const blocks = text.split('\n\n').filter(Boolean);
  return blocks.map((block, j) => {
    const lines = block.split('\n').filter(Boolean);
    if (lines.every((line) => line.trimStart().startsWith('- '))) {
      return (
        <ul key={`${keyPrefix}-${j}`} className="list-disc space-y-1 pl-5">
          {lines.map((line, k) => (
            <li key={k}>{renderInline(line.replace(/^\s*-\s+/, ''))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={`${keyPrefix}-${j}`} className="whitespace-pre-wrap">
        {renderInline(block)}
      </p>
    );
  });
}

function renderInline(text: string): ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) =>
    seg.startsWith('**') && seg.endsWith('**') ? (
      <strong key={i} className="font-semibold text-slate-100">
        {seg.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{seg}</span>
    ),
  );
}
