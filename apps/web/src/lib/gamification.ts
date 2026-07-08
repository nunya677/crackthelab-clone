export interface LevelInfo {
  level: number;
  title: string;
  pointsIntoLevel: number;
  pointsForNextLevel: number;
  progress: number; // 0..1
}

const POINTS_PER_LEVEL = 100;

const TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: 'Script Kiddie' },
  { minLevel: 3, title: 'Packet Sniffer' },
  { minLevel: 5, title: 'Exploit Dev' },
  { minLevel: 7, title: 'Red Teamer' },
  { minLevel: 10, title: 'Elite Hacker' },
];

export function getLevelInfo(points: number): LevelInfo {
  const level = Math.floor(points / POINTS_PER_LEVEL) + 1;
  const pointsIntoLevel = points % POINTS_PER_LEVEL;
  const title = [...TITLES].reverse().find((t) => level >= t.minLevel)!.title;

  return {
    level,
    title,
    pointsIntoLevel,
    pointsForNextLevel: POINTS_PER_LEVEL,
    progress: pointsIntoLevel / POINTS_PER_LEVEL,
  };
}

export function rankMedal(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}
