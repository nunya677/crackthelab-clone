import { Router } from 'express';
import { prisma } from '@crackthelab/db';
import { asyncHandler } from '../lib/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../env.js';
import {
  getSubscription,
  verifyWebhookSignature,
  paypalFetch,
} from '../lib/paypal.js';

export const billingRouter = Router();


/**
 * TEMPORARY PAYPAL CONNECTION TEST
 */
billingRouter.get(
  '/test-paypal',
  asyncHandler(async (_req, res) => {
    const response = await paypalFetch(
      '/v1/billing/subscriptions/test',
    );

    res.json({
      paypalReached: true,
      status: response.status,
      ok: response.ok,
    });
  }),
);


/**
 * Create PayPal subscription
 */
billingRouter.post(
  '/create-subscription',
  requireAuth,
  asyncHandler(async (_req, res) => {

    if (!env.paypalPremiumPlanId) {
      throw new HttpError(
        500,
        'PayPal premium plan ID is not configured',
      );
    }


    const response = await paypalFetch(
      '/v1/billing/subscriptions',
      {
        method: 'POST',
        body: JSON.stringify({
          plan_id: env.paypalPremiumPlanId,

          application_context: {
            brand_name: 'CrackTheLab',
            user_action: 'SUBSCRIBE_NOW',

            return_url:
              'http://localhost:5173/subscription/success',

            cancel_url:
              'http://localhost:5173/subscription/cancel',
          },
        }),
      },
    );


    if (!response.ok) {
      throw new HttpError(
        response.status,
        await response.text(),
      );
    }


    const data = await response.json();


    res.json({
      subscriptionId: data.id,

      approvalUrl: data.links?.find(
        (link: {
          rel: string;
          href: string;
        }) => link.rel === 'approve',
      )?.href,
    });
  }),
);



/**
 * Confirm PayPal subscription after approval
 */
billingRouter.post(
  '/confirm',
  requireAuth,
  asyncHandler(async (req, res) => {

    console.log('========== PAYPAL CONFIRM ==========');
    console.log('BODY:', req.body);
    console.log('USER:', req.user);


    const subscriptionId = String(
      req.body?.subscriptionId ?? '',
    );


    if (!subscriptionId) {
      throw new HttpError(
        400,
        'Missing subscriptionId',
      );
    }


    const subscription =
      await getSubscription(subscriptionId);


    console.log(
      'PAYPAL SUBSCRIPTION:',
      subscription,
    );


    /*
      Sandbox can return APPROVED immediately after checkout.
      Production normally becomes ACTIVE after billing activation.
    */
    if (
      subscription.status !== 'ACTIVE' &&
      subscription.status !== 'APPROVED'
    ) {
      throw new HttpError(
        400,
        `Subscription is not active yet (status: ${subscription.status})`,
      );
    }


    const existingOwner =
      await prisma.user.findUnique({
        where: {
          paypalSubscriptionId: subscriptionId,
        },
      });


    if (
      existingOwner &&
      existingOwner.id !== req.user!.sub
    ) {
      throw new HttpError(
        409,
        'This subscription is already linked to another account',
      );
    }


    const user =
      await prisma.user.update({
        where: {
          id: req.user!.sub,
        },

        data: {
          plan: 'PRO',

          paypalSubscriptionId: subscriptionId,

          planRenewsAt:
            subscription.billing_info?.next_billing_time
              ? new Date(
                  subscription.billing_info.next_billing_time,
                )
              : null,
        },
      });


    res.json({
      plan: user.plan,
      planRenewsAt: user.planRenewsAt,
    });

  }),
);



/**
 * PayPal webhook events that downgrade users
 */
const DOWNGRADE_EVENTS = new Set([
  'BILLING.SUBSCRIPTION.CANCELLED',
  'BILLING.SUBSCRIPTION.EXPIRED',
  'BILLING.SUBSCRIPTION.SUSPENDED',
]);



/**
 * PayPal webhook receiver
 */
billingRouter.post(
  '/webhook',
  asyncHandler(async (req, res) => {

    const verified =
      await verifyWebhookSignature(
        req.headers as Record<string, string | undefined>,
        req.body,
      );


    if (!verified) {
      throw new HttpError(
        400,
        'Webhook signature verification failed',
      );
    }


    const event = req.body as {
      event_type?: string;

      resource?: {
        id?: string;
      };
    };


    const subscriptionId =
      event.resource?.id;


    if (
      event.event_type &&
      DOWNGRADE_EVENTS.has(event.event_type) &&
      subscriptionId
    ) {

      await prisma.user.updateMany({
        where: {
          paypalSubscriptionId: subscriptionId,
        },

        data: {
          plan: 'FREE',
          planRenewsAt: null,
        },
      });

    }


    res.status(204).send();

  }),
);