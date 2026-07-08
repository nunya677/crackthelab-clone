import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.ORCHESTRATOR_PORT ?? 4100),
  internalToken: required('ORCHESTRATOR_INTERNAL_TOKEN'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  dockerSocket: process.env.DOCKER_SOCKET,
  instanceTtlMinutes: Number(process.env.INSTANCE_TTL_MINUTES ?? 45),
  instanceMemoryMb: Number(process.env.INSTANCE_MEMORY_MB ?? 256),
  instanceCpuQuota: Number(process.env.INSTANCE_CPU_QUOTA ?? 0.5),
  instancePidsLimit: Number(process.env.INSTANCE_PIDS_LIMIT ?? 64),
  maxLiveInstancesPerUser: Number(process.env.MAX_LIVE_INSTANCES_PER_USER ?? 1),
  // PRO accounts get maxLiveInstancesPerUser * this multiplier concurrently.
  proInstanceMultiplier: Number(process.env.PRO_INSTANCE_MULTIPLIER ?? 3),
  // Standardized port every challenge container must listen on internally.
  containerPort: 5000,
  // The host players' browsers actually connect to for a live instance's
  // published port — the VM's public IP/domain in production, "localhost"
  // for local dev. Getting this wrong means instance URLs point back at the
  // server itself instead of somewhere a player's browser can reach.
  publicHost: process.env.PUBLIC_HOST ?? 'localhost',
};
