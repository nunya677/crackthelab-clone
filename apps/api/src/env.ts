import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.resolve(process.cwd(), '../../.env'),
});

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

// Comma-separated list of extra allowed CORS origins beyond webOrigin — e.g.
// an ngrok tunnel URL for testing on a phone, or a second preview domain.
// Set via EXTRA_CORS_ORIGINS in .env, not hardcoded, since ngrok URLs churn
// every time the tunnel restarts.
const extraOrigins = (process.env.EXTRA_CORS_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.API_PORT ?? process.env.PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
  corsOrigins: [process.env.WEB_ORIGIN ?? 'http://localhost:5173', ...extraOrigins],
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  orchestratorUrl: process.env.ORCHESTRATOR_URL ?? 'http://localhost:4100',
  orchestratorInternalToken: required('ORCHESTRATOR_INTERNAL_TOKEN'),
    // PayPal billing (sandbox by default — see apps/api/src/lib/paypal.ts).
  // Left optional so the rest of the app still boots without billing set up.
  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? '',
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? '',
  paypalApiBase: process.env.PAYPAL_API_BASE ?? 'https://api-m.sandbox.paypal.com',
  paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID ?? '',
  paypalPremiumPlanId: process.env.PAYPAL_PREMIUM_PLAN_ID ?? '',
};
