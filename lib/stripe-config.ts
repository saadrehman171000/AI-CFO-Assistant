// Client-side safe Stripe configuration
export const STRIPE_PLANS = {
  PRO: {
    name: 'Pro Plan',
    priceId: null, // We'll use custom amount instead of pre-created price
    price: 29,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited financial reports',
      'Advanced AI analysis',
      'Financial forecasting',
      'Custom dashboards',
      'Priority support'
    ]
  }
};
