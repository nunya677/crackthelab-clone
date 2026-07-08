import type { Server } from 'socket.io';
import { SocketEvent, type LeaderboardEntry, type Instance } from '@crackthelab/shared';

let io: Server | undefined;

export function setSocketServer(server: Server) {
  io = server;
}

export function emitLeaderboardUpdated(entries: LeaderboardEntry[]) {
  io?.emit(SocketEvent.LEADERBOARD_UPDATED, entries);
}

export function emitInstanceUpdated(userId: string, instance: Instance) {
  io?.to(`user:${userId}`).emit(SocketEvent.INSTANCE_UPDATED, instance);
}
