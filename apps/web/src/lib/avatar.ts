const PALETTE = [
  'bg-emerald-500', 'bg-sky-500', 'bg-rose-500', 'bg-amber-500',
  'bg-purple-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-orange-500',
];

export function avatarInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
