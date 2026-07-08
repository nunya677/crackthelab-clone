import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
const PAYPAL_PLAN_ID = import.meta.env.VITE_PAYPAL_PLAN_ID as string | undefined;

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: Record<string, string>;
        createSubscription: (data: unknown, actions: PaypalActions) => Promise<string>;
        onApprove: (data: { subscriptionID?: string }) => void;
        onError: (err: unknown) => void;
      }) => { render: (selector: string) => void };
    };
  }
}

interface PaypalActions {
  subscription: { create: (options: { plan_id: string }) => Promise<string> };
}

function usePaypalScript() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.paypal) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&intent=subscription&vault=true`;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return loaded;
}

export function UpgradePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const paypalLoaded = usePaypalScript();
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!paypalLoaded || !window.paypal || !buttonsRef.current || user?.plan === 'PRO') return;

    window.paypal.Buttons({
      style: { color: 'black', shape: 'pill', label: 'subscribe' },
      createSubscription: (_data, actions) =>
        actions.subscription.create({ plan_id: PAYPAL_PLAN_ID! }),
      onApprove: async (data) => {
        if (!data.subscriptionID) return;
        setConfirming(true);
        setError(null);
        try {
          await api.confirmSubscription(data.subscriptionID);
          await refreshUser();
          navigate('/');
        } catch (err) {
          setError((err as Error).message || 'Could not confirm the subscription — try again.');
        } finally {
          setConfirming(false);
        }
      },
      onError: () => {
        setError('PayPal ran into a problem starting checkout — try again in a moment.');
      },
    }).render('#paypal-buttons');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paypalLoaded, user?.plan]);

  if (user?.plan === 'PRO') {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl border border-cyan-700/60 bg-cyan-950/10 p-8 text-center">
        <div className="text-3xl">✓</div>
        <h1 className="mt-2 text-2xl font-extrabold">You're already PRO</h1>
        <p className="mt-2 text-sm text-slate-400">
          Every challenge is unlocked, and you can run more live instances at once.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-zinc-800 bg-zinc-950/80 p-8">
      <span className="mb-3 inline-block rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-400">
        ⚡ Upgrade
      </span>
      <h1 className="text-2xl font-extrabold">
        Go <span className="text-cyan-400">PRO</span>
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Unlock every challenge — including the live Docker sandboxes — and run more instances at
        once.
      </p>

      <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
        <li>✓ All 20 challenges, including live sandboxes</li>
        <li>✓ Up to {3}x concurrent live instances</li>
        <li>✓ Support future content and infrastructure</li>
      </ul>

      <div className="mt-6">
        {!PAYPAL_CLIENT_ID || !PAYPAL_PLAN_ID ? (
          <p className="rounded-lg border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-400">
            Billing isn't configured yet — set VITE_PAYPAL_CLIENT_ID and VITE_PAYPAL_PLAN_ID.
          </p>
        ) : (
          <div id="paypal-buttons" ref={buttonsRef} />
        )}
        {confirming && <p className="mt-2 text-sm text-zinc-400">Confirming your subscription…</p>}
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      </div>
    </div>
  );
}
