import { useAuth } from '../context/AuthContext';
import { useLeaderboard } from './useLeaderboard';
import { getLevelInfo } from '../lib/gamification';

export function useMyStats() {
  const { user } = useAuth();
  const { data: leaderboard } = useLeaderboard();

  const entry = leaderboard?.find((e) => e.userId === user?.id);
  const points = entry?.points ?? 0;

  return {
    points,
    rank: entry?.rank,
    solves: entry?.solves ?? 0,
    ...getLevelInfo(points),
  };
}
