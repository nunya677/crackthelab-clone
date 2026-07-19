import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.resolve(process.cwd(), '../../.env'),
});

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.ORCHESTRATOR_PORT ?? 4201),

  internalToken: required("ORCHESTRATOR_INTERNAL_TOKEN"),

  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",

  dockerSocket: process.env.DOCKER_SOCKET,

  instanceTtlMinutes: Number(
    process.env.INSTANCE_TTL_MINUTES ?? 45
  ),

  instanceMemoryMb: Number(
    process.env.INSTANCE_MEMORY_MB ?? 256
  ),

  instanceCpuQuota: Number(
    process.env.INSTANCE_CPU_QUOTA ?? 0.5
  ),

  instancePidsLimit: Number(
    process.env.INSTANCE_PIDS_LIMIT ?? 64
  ),

  maxLiveInstancesPerUser: Number(
    process.env.MAX_LIVE_INSTANCES_PER_USER ?? 1
  ),

  proInstanceMultiplier: Number(
    process.env.PRO_INSTANCE_MULTIPLIER ?? 3
  ),

  // Internal port used by challenge containers
  containerPort: 5000,

  // Host users connect to for live instances
  publicHost: process.env.PUBLIC_HOST ?? "localhost",
};