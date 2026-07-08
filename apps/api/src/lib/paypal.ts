import { env } from '../env.js';

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const basicAuth = Buffer.from(`${env.paypalClientId}:${env.paypalClientSecret}`).toString(
    'base64',
  );
  const res = await fetch(`${env.paypalApiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  // Refresh a minute early rather than exactly at expiry.
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

export async function paypalFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${env.paypalApiBase}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export interface PaypalSubscription {
  id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  billing_info?: { next_billing_time?: string };
}

export async function getSubscription(subscriptionId: string): Promise<PaypalSubscription> {
  const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`);
  if (!res.ok) throw new Error(`PayPal subscription lookup failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<PaypalSubscription>;
}

// Confirms a webhook actually came from PayPal rather than an attacker
// forging POST bodies. Requires PAYPAL_WEBHOOK_ID from the app's webhook
// config in the PayPal developer dashboard.
export async function verifyWebhookSignature(
  headers: Record<string, string | undefined>,
  body: unknown,
): Promise<boolean> {
  if (!env.paypalWebhookId) return false;

  const res = await paypalFetch('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: env.paypalWebhookId,
      webhook_event: body,
    }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status: string };
  return data.verification_status === 'SUCCESS';
}
