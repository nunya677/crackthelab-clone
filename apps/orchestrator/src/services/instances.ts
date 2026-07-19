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

async function waitForContainer(
  url: string,
  timeoutMs = 30000,
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // Container is still starting
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Container health check failed: ${url}`);
}

export async function startInstance(
  userId: string,
  challengeId: string,
  dockerImage: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const maxAllowed =
    user?.plan === 'PRO'
      ? env.maxLiveInstancesPerUser * env.proInstanceMultiplier
      : env.maxLiveInstancesPerUser;

  const activeCount = await prisma.instance.count({
    where: {
      userId,
      status: {
        in: ['STARTING', 'RUNNING'],
      },
    },
  });

  if (activeCount >= maxAllowed) {
    throw new OrchestratorError(
      429,
      user?.plan === 'PRO'
        ? 'You already have the maximum number of active instances running'
        : 'Free plan is limited to 1 active instance — upgrade to PRO to run more at once',
    );
  }

  const expiresAt = new Date(
    Date.now() + env.instanceTtlMinutes * 60_000,
  );

  const instance = await prisma.instance.create({
    data: {
      userId,
      challengeId,
      status: 'STARTING',
      expiresAt,
    },
  });

  try {
    await pullImageIfMissing(dockerImage);

    const network = await docker.createNetwork({
      Name: networkName(instance.id),
    });

    const container = await docker.createContainer({
      Image: dockerImage,
      ExposedPorts: {
        [`${env.containerPort}/tcp`]: {},
      },

      HostConfig: {
        NetworkMode: network.id,

        PortBindings: {
          [`${env.containerPort}/tcp`]: [
            {
              HostPort: '',
            },
          ],
        },

        Memory: env.instanceMemoryMb * 1024 * 1024,
        MemorySwap: env.instanceMemoryMb * 1024 * 1024,

        NanoCpus: Math.round(env.instanceCpuQuota * 1e9),

        PidsLimit: env.instancePidsLimit,

        CapDrop: ['ALL'],

        SecurityOpt: [
          'no-new-privileges',
        ],

        Privileged: false,

        AutoRemove: false,

        ReadonlyRootfs: true,

        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=32m',
        },

        Ulimits: [
          {
            Name: 'nofile',
            Soft: 1024,
            Hard: 2048,
          },
        ],
      },

      Labels: {
        'crackthelab.instanceId': instance.id,
      },
    });

    await container.start();

    const inspected = await container.inspect();

    const hostPort = Number(
      inspected.NetworkSettings.Ports[
        `${env.containerPort}/tcp`
      ]?.[0]?.HostPort,
    );

    const url = `http://${env.publicHost}:${hostPort}`;

    /*
      Wait until the challenge application is ready.
      This prevents the frontend iframe loading too early.
    */
    await waitForContainer(url);

    const updated = await prisma.instance.update({
      where: {
        id: instance.id,
      },

      data: {
        status: 'RUNNING',
        containerId: container.id,
        hostPort,
        url,
      },
    });

    await scheduleExpiry(
      instance.id,
      env.instanceTtlMinutes * 60_000,
    );

    return updated;

  } catch (err) {

    await prisma.instance
      .update({
        where: {
          id: instance.id,
        },

        data: {
          status: 'EXPIRED',
        },
      })
      .catch(() => {});

    await teardownContainer(instance.id)
      .catch(() => {});

    throw err;
  }
}


async function teardownContainer(instanceId: string) {

  const instance = await prisma.instance.findUnique({
    where: {
      id: instanceId,
    },
  });


  if (instance?.containerId) {

    const container = docker.getContainer(
      instance.containerId,
    );

    await container.stop({
      t: 5,
    }).catch(() => {});


    await container.remove({
      force: true,
    }).catch(() => {});
  }


  await docker
    .getNetwork(networkName(instanceId))
    .remove()
    .catch(() => {});
}



export async function stopInstance(instanceId: string) {

  const instance = await prisma.instance.findUnique({
    where: {
      id: instanceId,
    },
  });


  if (!instance) {
    throw new OrchestratorError(
      404,
      'Instance not found',
    );
  }


  await teardownContainer(instanceId);

  await cancelExpiry(instanceId);


  return prisma.instance.update({
    where: {
      id: instanceId,
    },

    data: {
      status: 'STOPPED',
    },
  });
}



export async function expireInstance(instanceId: string) {

  const instance = await prisma.instance.findUnique({
    where: {
      id: instanceId,
    },
  });


  if (
    !instance ||
    instance.status !== 'RUNNING'
  ) {
    return;
  }


  await teardownContainer(instanceId);


  await prisma.instance.update({
    where: {
      id: instanceId,
    },

    data: {
      status: 'EXPIRED',
    },
  });
}