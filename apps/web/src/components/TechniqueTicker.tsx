const TECHNIQUES = [
  'SQL Injection',
  'IDOR',
  'JWT Forgery',
  'CORS Misconfiguration',
  'RSA Factoring',
  'XOR Ciphers',
  'Vigenère Ciphers',
  'EXIF Forensics',
  'Log Analysis',
  'Password Hashing',
];

export function TechniqueTicker() {
  const items = [...TECHNIQUES, ...TECHNIQUES];

  return (
    <div className="overflow-hidden border-y border-zinc-900 bg-zinc-950/60 py-3">
      <div className="animate-ticker flex w-max gap-8">
        {items.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-zinc-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
