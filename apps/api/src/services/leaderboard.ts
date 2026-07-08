import { prisma } from '@crackthelab/db';
import type { LeaderboardEntry } from '@crackthelab/shared';

export async function getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const grouped = await prisma.solve.groupBy({
    by: ['userId'],
    _sum: { points: true },
    _count: { _all: true },
    orderBy: { _sum: { points: 'desc' } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, username: true },
  });
  const usernameById = new Map(users.map((u) => [u.id, u.username]));

  return grouped.map((g, i) => ({
    userId: g.userId,
    username: usernameById.get(g.userId) ?? 'unknown',
    points: g._sum.points ?? 0,
    solves: g._count._all,
    rank: i + 1,
  }));
}
