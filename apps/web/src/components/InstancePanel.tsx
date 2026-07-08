import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

const BOOT_LOG = [
  'Allocating 256MB memory / 0.5 vCPU...',
  'Creating isolated bridge network...',
  'Mounting read-only root filesystem (rw tmpfs: /tmp)...',
  'Dropping all capabilities, enabling no-new-privileges...',
  'Starting target service on internal port 5000...',
  'Waiting for health check...',
];

function BootLog() {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => Math.min(v + 1, BOOT_LOG.length));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-1 font-mono text-xs text-cyan-400">
      {BOOT_LOG.slice(0, visible).map((line, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-zinc-600">[{String(i + 1).padStart(2, '0')}]</span>
          <span>{line}</span>
          {i === visible - 1 && visible < BOOT_LOG.length && (
            <span className="animate-blink">▋</span>
          )}
        </div>
      ))}
    </div>
  );
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(new Date(expiresAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const clamped = Math.max(remainingMs, 0);
  const mins = Math.floor(clamped / 60_000);
  const secs = Math.floor((clamped % 60_000) / 1000);

  return (
    <span className={clamped < 60_000 ? 'text-rose-400' : 'text-zinc-300'}>
      {mins}:{String(secs).padStart(2, '0')}
    </span>
  );
}

export function InstancePanel({ challengeId }: { challengeId: string }) {
  const queryClient = useQueryClient();

  const { data: instances, isLoading } = useQuery({
    queryKey: ['instances', 'mine'],
    queryFn: api.getMyInstances,
    refetchInterval: (query) =>
      query.state.data?.some((i) => i.status === 'STARTING') ? 2000 : 15000,
  });

  const myInstance = instances?.find((i) => i.challengeId === challengeId);

  const start = useMutation({
    mutationFn: () => api.startInstance(challengeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instances', 'mine'] }),
  });

  const stop = useMutation({
    mutationFn: (id: string) => api.stopInstance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instances', 'mine'] }),
  });

  if (isLoading) return null;

  const status = myInstance?.status;
  const isOn = status === 'RUNNING' || status === 'STARTING';

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-[0_0_40px_rgba(56,189,248,0.12)]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 bg-zinc-950 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
        <span className="ml-2 font-mono text-xs text-zinc-500">
          root@target-vm:~
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isOn ? 'animate-pulse bg-sky-400' : 'bg-zinc-700'}`}
          />
          <span className={isOn ? 'text-sky-400' : 'text-zinc-600'}>
            {isOn ? status : 'Offline'}
          </span>
        </span>
      </div>

      {/* Screen */}
      <div
        className="relative min-h-[9rem] p-4"
        style={{
          backgroundImage:
            'repeating-linear-gradient(rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
        }}
      >
        {!myInstance && (
          <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
            <p className="font-mono text-xs text-zinc-600">[ machine powered off ]</p>
            <button
              onClick={() => start.mutate()}
              disabled={start.isPending}
              className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-sky-400 disabled:opacity-50"
            >
              {start.isPending ? 'Booting…' : '▶ Boot instance'}
            </button>
          </div>
        )}

        {myInstance?.status === 'STARTING' && <BootLog />}

        {myInstance?.status === 'RUNNING' && (
          <div className="space-y-4">
            {myInstance.url && (
              <div className="rounded-lg border-[6px] border-zinc-800 bg-zinc-950 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-1.5 border-b border-zinc-800 bg-zinc-900 px-2 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.9)]" />
                  <span className="font-mono text-[0.65rem] text-zinc-500">
                    display0 · 1024×768 · {new URL(myInstance.url).host}
                  </span>
                  <a
                    href={myInstance.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-[0.65rem] font-bold text-sky-400 hover:text-sky-300"
                  >
                    Open in new tab ↗
                  </a>
                </div>
                <iframe
                  src={myInstance.url}
                  title="Live target machine"
                  className="h-64 w-full bg-white"
                  sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
              <span>RAM 256MB</span>
              <span>vCPU 0.5</span>
              <span>net: isolated</span>
              <span>fs: read-only</span>
              <span>
                expires in <Countdown expiresAt={myInstance.expiresAt} />
              </span>
            </div>

            <button
              onClick={() => stop.mutate(myInstance.id)}
              disabled={stop.isPending}
              className="rounded-full border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800 disabled:opacity-50"
            >
              {stop.isPending ? 'Stopping…' : '⏻ Power off'}
            </button>
          </div>
        )}

        {(myInstance?.status === 'STOPPED' || myInstance?.status === 'EXPIRED') && (
          <p className="py-4 text-center font-mono text-xs text-zinc-600">
            [ machine {myInstance.status.toLowerCase()} ]
          </p>
        )}
      </div>

      {start.isError && (
        <p className="border-t border-zinc-900 px-4 py-2 text-sm text-rose-400">
          {(start.error as Error).message}
        </p>
      )}
    </div>
  );
}
