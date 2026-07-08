import express from 'express';
import { env } from './env.js';
import { requireInternalToken } from './middleware/internalAuth.js';
import { startInstance, stopInstance, expireInstance, OrchestratorError } from './services/instances.js';
import { createExpiryWorker } from './lib/queue.js';

function toInstanceDto(i: {
  id: string;
  challengeId: string;
  status: string;
  url: string | null;
  startedAt: Date;
  expiresAt: Date;
}) {
  return {
    id: i.id,
    challengeId: i.challengeId,
    status: i.status,
    url: i.url,
    startedAt: i.startedAt.toISOString(),
    expiresAt: i.expiresAt.toISOString(),
  };
}

const app = express();
app.use(express.json());
app.use(requireInternalToken);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/internal/instances', async (req, res, next) => {
  try {
    const { userId, challengeId, dockerImage } = req.body ?? {};
    if (!userId || !challengeId || !dockerImage) {
      res.status(400).json({ error: 'userId, challengeId and dockerImage are required' });
      return;
    }
    const instance = await startInstance(userId, challengeId, dockerImage);
    res.status(201).json(toInstanceDto(instance));
  } catch (err) {
    next(err);
  }
});

app.post('/internal/instances/:id/stop', async (req, res, next) => {
  try {
    const instance = await stopInstance(req.params.id);
    res.json(toInstanceDto(instance));
  } catch (err) {
    next(err);
  }
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof OrchestratorError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal orchestrator error' });
});

createExpiryWorker(expireInstance);

app.listen(env.port, () => {
  console.log(`orchestrator listening on http://localhost:${env.port}`);
});
