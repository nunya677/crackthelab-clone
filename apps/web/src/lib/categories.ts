interface CategoryMeta {
  icon: string;
  color: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  foundations: { icon: '🎓', color: 'text-teal-400' },
  crypto: { icon: '🔐', color: 'text-purple-400' },
  forensics: { icon: '🔍', color: 'text-sky-400' },
  web: { icon: '🌐', color: 'text-rose-400' },
  misc: { icon: '🎲', color: 'text-amber-400' },
};

const DEFAULT_META: CategoryMeta = { icon: '🏴', color: 'text-slate-400' };

export function getCategoryMeta(slug: string): CategoryMeta {
  return CATEGORY_META[slug] ?? DEFAULT_META;
}

// Explicit curriculum order — "foundations" leads every track regardless of
// alphabetical category name, since it's meant to be read first.
export const CATEGORY_ORDER = ['foundations', 'crypto', 'forensics', 'web', 'misc'];

export function sortByCategoryOrder<T>(entries: [string, T][]): [string, T][] {
  return [...entries].sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
}
