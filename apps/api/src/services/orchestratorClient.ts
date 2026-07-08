import { env } from '../env.js';
import { HttpError } from '../middleware/errorHandler.js';
import type { Instance } from '@crackthelab/shared';

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${env.orchestratorUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.orchestratorInternalToken}`,
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new HttpError(res.status, body.error ?? 'Orchestrator request failed');
  }
  return res.json() as Promise<T>;
}

export function createInstance(userId: string, challengeId: string, dockerImage: string) {
  return call<Instance>('/internal/instances', {
    method: 'POST',
    body: JSON.stringify({ userId, challengeId, dockerImage }),
  });
}

export function stopInstance(instanceId: string) {
  return call<Instance>(`/internal/instances/${instanceId}/stop`, { method: 'POST' });
}
