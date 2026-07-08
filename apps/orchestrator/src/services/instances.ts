import { prisma } from '@crackthelab/db';
import { docker, pullImageIfMissing } from '../docker.js';
import { env } from '../env.js';
import { cancelExpiry, scheduleExpiry } from '../lib/queue.js';

export class OrchestratorError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function networkName(instanceId: string) {
  return `ctl-instance-${instanceId}`;
}

export async function startInstance(userId: string, challengeId: string, dockerImage: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const maxAllowed =
    user?.plan === 'PRO' ? env.maxLiveInstancesPerUser * env.proInstanceMultiplier : env.maxLiveInstancesPerUser;

  const activeCount = await prisma.instance.count({
    where: { userId, status: { in: ['STARTING', 'RUNNING'] } },
  });
  if (activeCount >= maxAllowed) {
    throw new OrchestratorError(
      429,
      user?.plan === 'PRO'
        ? 'You already have the maximum number of active instances running'
        : 'Free plan is limited to 1 active instance — upgrade to PRO to run more at once',
    );
  }

  const expiresAt = new Date(Date.now() + env.instanceTtlMinutes * 60_000);
  const instance = await prisma.instance.create({
    data: { userId, challengeId, status: 'STARTING', expiresAt },
  });

  try {
    await pullImageIfMissing(dockerImage);

    // Isolated per-instance network: Docker does not route traffic between
    // containers on different user-defined networks, so this container can't
    // reach any other instance's container even though both are reachable
    // from the host via their own published ports. NOTE: `Internal: true`
    // would block that lateral-movement path even harder, but it also blocks
    // Docker's host->container port publishing entirely (verified: an
    // internal network never gets a HostPort binding), which would make the
    // instance unreachable by the player, so it's not used here.
    const network = await docker.createNetwork({
      Name: networkName(instance.id),
    });

    const container = await docker.createContainer({
      Image: dockerImage,
      ExposedPorts: { [`${env.containerPort}/tcp`]: {} },
      HostConfig: {
        NetworkMode: network.id,
        PortBindings: { [`${env.containerPort}/tcp`]: [{ HostPort: '' }] },
        Memory: env.instanceMemoryMb * 1024 * 1024,
        MemorySwap: env.instanceMemoryMb * 1024 * 1024, // = Memory, so swap is fully disabled
        NanoCpus: Math.round(env.instanceCpuQuota * 1e9),
        PidsLimit: env.instancePidsLimit,
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges'],
        Privileged: false,
        AutoRemove: false,
        // Root filesystem is the challenge's shipped image, frozen at start —
        // an exploit can't `touch` a webshell or edit app source to persist
        // past a restart. Anything a challenge legitimately needs to write
        // (e.g. sqli-101's sqlite file) goes in /tmp, backed by tmpfs so it
        // never lands on the image layer either.
        ReadonlyRootfs: true,
        Tmpfs: { '/tmp': 'rw,noexec,nosuid,size=32m' },
        // Container gets its own loopback + the isolated per-instance bridge
        // above; nothing else. No host device access, no extra host mounts.
        Ulimits: [{ Name: 'nofile', Soft: 1024, Hard: 2048 }],
      },
      Labels: { 'crackthelab.instanceId': instance.id },
    });

    await container.start();
    const inspected = await container.inspect();
    const hostPort = Number(
      inspected.NetworkSettings.Ports[`${env.containerPort}/tcp`]?.[0]?.HostPort,
    );
    const url = `http://${env.publicHost}:${hostPort}`;

    const updated = await prisma.instance.update({
      where: { id: instance.id },
      data: { status: 'RUNNING', containerId: container.id, hostPort, url },
    });

    await scheduleExpiry(instance.id, env.instanceTtlMinutes * 60_000);
    return updated;
  } catch (err) {
    await prisma.instance
      .update({ where: { id: instance.id }, data: { status: 'EXPIRED' } })
      .catch(() => {});
    await teardownContainer(instance.id).catch(() => {});
    throw err;
  }
}

async function teardownContainer(instanceId: string) {
  const instance = await prisma.instance.findUnique({ where: { id: instanceId } });
  if (instance?.containerId) {
    const container = docker.getContainer(instance.containerId);
    await container.stop({ t: 5 }).catch(() => {});
    await container.remove({ force: true }).catch(() => {});
  }
  await docker
    .getNetwork(networkName(instanceId))
    .remove()
    .catch(() => {});
}

export async function stopInstance(instanceId: string) {
  const instance = await prisma.instance.findUnique({ where: { id: instanceId } });
  if (!instance) throw new OrchestratorError(404, 'Instance not found');

  await teardownContainer(instanceId);
  await cancelExpiry(instanceId);

  return prisma.instance.update({ where: { id: instanceId }, data: { status: 'STOPPED' } });
}

export async function expireInstance(instanceId: string) {
  const instance = await prisma.instance.findUnique({ where: { id: instanceId } });
  if (!instance || instance.status !== 'RUNNING') return;

  await teardownContainer(instanceId);
  await prisma.instance.update({ where: { id: instanceId }, data: { status: 'EXPIRED' } });
}
