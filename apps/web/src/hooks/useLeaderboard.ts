import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SocketEvent, type LeaderboardEntry } from '@crackthelab/shared';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

export const LEADERBOARD_QUERY_KEY = ['leaderboard'];

export function useLeaderboard() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: LEADERBOARD_QUERY_KEY, queryFn: api.getLeaderboard });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (entries: LeaderboardEntry[]) =>
      queryClient.setQueryData(LEADERBOARD_QUERY_KEY, entries);
    socket.on(SocketEvent.LEADERBOARD_UPDATED, handler);
    return () => {
      socket.off(SocketEvent.LEADERBOARD_UPDATED, handler);
    };
  }, [queryClient]);

  return query;
}
