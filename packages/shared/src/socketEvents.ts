import type { LeaderboardEntry } from './schemas/leaderboard.js';
import type { Instance } from './schemas/instance.js';

export const SocketEvent = {
  LEADERBOARD_UPDATED: 'leaderboard:updated',
  INSTANCE_UPDATED: 'instance:updated',
} as const;

export interface ServerToClientEvents {
  [SocketEvent.LEADERBOARD_UPDATED]: (entries: LeaderboardEntry[]) => void;
  [SocketEvent.INSTANCE_UPDATED]: (instance: Instance) => void;
}
