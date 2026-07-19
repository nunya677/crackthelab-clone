import Docker from 'dockerode';
import { env } from './env.js';

// dockerode auto-detects the right default (Windows named pipe vs Unix
// socket) when no socketPath is passed, but allow overriding via env.
export const docker = new Docker(env.dockerSocket ? { socketPath: env.dockerSocket } : undefined);

export async function pullImageIfMissing(image: string): Promise<void> {
  try {
    await docker.getImage(image).inspect();
    return;
  } catch {
    // not present locally, fall through to pull
  }

  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err2: Error | null) => (err2 ? reject(err2) : resolve()));
    });
  });
}
