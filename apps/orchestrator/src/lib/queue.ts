import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { env } from '../env.js';

const connection: ConnectionOptions = { url: env.redisUrl };

export const EXPIRE_QUEUE_NAME = 'instance-expiry';

export const expireQueue = new Queue(EXPIRE_QUEUE_NAME, { connection });

export function scheduleExpiry(instanceId: string, delayMs: number) {
  return expireQueue.add(
    'expire',
    { instanceId },
    { jobId: instanceId, delay: delayMs, removeOnComplete: true, removeOnFail: true },
  );
}

export async function cancelExpiry(instanceId: string) {
  const job = await expireQueue.getJob(instanceId);
  if (job) await job.remove();
}

export function createExpiryWorker(processor: (instanceId: string) => Promise<void>) {
  return new Worker(
    EXPIRE_QUEUE_NAME,
    async (job) => {
      await processor(job.data.instanceId);
    },
    { connection },
  );
}
