import { Router } from 'express';
import { prisma } from '@crackthelab/db';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { getSubscription, verifyWebhookSignature } from '../lib/paypal.js';

export const billingRouter = Router();

// Called by the frontend right after the PayPal Buttons `onApprove` callback
// fires with a subscriptionID. We don't trust the client's word that the
// subscription is active — we look it up from PayPal directly before
// upgrading the account, since the client-side approval is just a UX
// signal, not proof of payment.
billingRouter.post(
  '/confirm',
  requireAuth,
  asyncHandler(async (req, res) => {
    const subscriptionId = String(req.body?.subscriptionId ?? '');
    if (!subscriptionId) throw new HttpError(400, 'Missing subscriptionId');

    const subscription = await getSubscription(subscriptionId);
    if (subscription.status !== 'ACTIVE') {
      throw new HttpError(400, `Subscription is not active yet (status: ${subscription.status})`);
    }

    const existingOwner = await prisma.user.findUnique({
      where: { paypalSubscriptionId: subscriptionId },
    });
    if (existingOwner && existingOwner.id !== req.user!.sub) {
      throw new HttpError(409, 'This subscription is already linked to a different account');
    }

    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        plan: 'PRO',
        paypalSubscriptionId: subscriptionId,
        planRenewsAt: subscription.billing_info?.next_billing_time
          ? new Date(subscription.billing_info.next_billing_time)
          : null,
      },
    });

    res.json({ plan: user.plan, planRenewsAt: user.planRenewsAt });
  }),
);

const DOWNGRADE_EVENTS = new Set([
  'BILLING.SUBSCRIPTION.CANCELLED',
  'BILLING.SUBSCRIPTION.EXPIRED',
  'BILLING.SUBSCRIPTION.SUSPENDED',
]);

billingRouter.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const verified = await verifyWebhookSignature(
      req.headers as Record<string, string | undefined>,
      req.body,
    );
    if (!verified) throw new HttpError(400, 'Webhook signature verification failed');

    const event = req.body as { event_type?: string; resource?: { id?: string } };
    const subscriptionId = event.resource?.id;

    if (event.event_type && DOWNGRADE_EVENTS.has(event.event_type) && subscriptionId) {
      await prisma.user.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: { plan: 'FREE', planRenewsAt: null },
      });
    }

    res.status(204).send();
  }),
);
