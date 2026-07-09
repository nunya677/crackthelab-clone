import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './env.js';
import { verifyAccessToken } from './lib/jwt.js';
import { setSocketServer } from './lib/socket.js';

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: env.corsOrigins, credentials: true },
});

// Client connects with { auth: { token } } (see apps/web/src/lib/socket.ts).
// A missing/invalid token just means no personal `user:<id>` room join —
// the leaderboard broadcast doesn't require auth, only per-user instance
// status updates do.
io.on('connection', (socket) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (token) {
    try {
      const { sub } = verifyAccessToken(token);
      socket.join(`user:${sub}`);
    } catch {
      // Invalid/expired token — leave the socket connected but unjoined
      // rather than rejecting the connection outright.
    }
  }
});

setSocketServer(io);

httpServer.listen(env.port, () => {
  console.log(`api listening on http://localhost:${env.port}`);
});
