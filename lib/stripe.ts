import Stripe from 'stripe';

// Server-side only - Stripe client with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

// Server-side only - Subscription status helper
export const isSubscriptionActive = (status: string): boolean => {
  return ['active', 'trialing'].includes(status.toLowerCase());
};
