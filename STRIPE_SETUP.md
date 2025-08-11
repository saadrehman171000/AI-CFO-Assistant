# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for the AI CFO Assistant application.

## Prerequisites

1. A Stripe account (create one at [stripe.com](https://stripe.com))
2. The application already configured with Clerk authentication
3. PostgreSQL database set up

## Step 1: Stripe Dashboard Configuration

### 1.1 Create a Product and Price

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Products** → **Add Product**
3. Create a product with these details:
   - **Name**: Pro Plan
   - **Description**: AI CFO Assistant Pro Subscription
   - **Pricing**: $29/month (recurring)
   - **Billing**: Monthly

4. Copy the **Price ID** (starts with `price_`) - you'll need this for the configuration

### 1.2 Configure Webhooks

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Webhook Signing Secret** (starts with `whsec_`) - you'll need this for the configuration

## Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Update the price ID in lib/stripe.ts to match your Stripe price ID
```

## Step 3: Update Price ID

In `lib/stripe.ts`, update the `priceId` in the `STRIPE_PLANS.PRO` object to match your Stripe price ID:

```typescript
export const STRIPE_PLANS = {
  PRO: {
    name: 'Pro Plan',
    priceId: 'price_your_actual_price_id_here', // Update this
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
```

## Step 4: Database Migration

Run the database migration to create the subscription tables:

```bash
npx prisma db push
```

## Step 5: Test the Integration

### 5.1 Test Checkout Flow

1. Start your development server: `npm run dev`
2. Sign in to your application
3. Navigate to `/subscription`
4. Click "Get Started with Pro"
5. You should be redirected to Stripe Checkout
6. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits

### 5.2 Test Webhook

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Find your webhook endpoint
3. Click on it and go to **Events** tab
4. You should see webhook events being sent when you complete a test payment

## Step 6: Production Deployment

### 6.1 Update Environment Variables

When deploying to production:

1. Switch to your live Stripe keys (remove `_test_` from the keys)
2. Update the webhook URL to your production domain
3. Update the success/cancel URLs in the checkout session creation

### 6.2 Update Webhook URLs

In `app/api/stripe/create-checkout-session/route.ts`, update the success and cancel URLs:

```typescript
success_url: `${request.nextUrl.origin}/dashboard?success=true`,
cancel_url: `${request.nextUrl.origin}/subscription?canceled=true`,
```

## Features Implemented

### ✅ Subscription Management
- Stripe Checkout integration
- Subscription status checking
- Customer portal access
- Subscription cancellation

### ✅ Route Protection
- Dashboard requires active subscription
- Upload requires active subscription
- Reports requires active subscription
- Analytics requires active subscription
- Forecasting requires active subscription

### ✅ UI Components
- Subscription status display in sidebar
- Locked/unlocked navigation items
- Subscription management page
- Payment flow integration

### ✅ API Endpoints
- `/api/stripe/create-checkout-session` - Create payment session
- `/api/stripe/webhook` - Handle Stripe events
- `/api/subscription/status` - Check subscription status
- `/api/subscription/cancel` - Cancel subscription
- `/api/stripe/create-portal-session` - Customer portal access

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook endpoint URL is correct
   - Verify webhook secret is correct
   - Check server logs for errors

2. **Checkout session not working**
   - Verify Stripe keys are correct
   - Check price ID matches your Stripe product
   - Ensure environment variables are loaded

3. **Subscription status not updating**
   - Check webhook events are being received
   - Verify database schema is updated
   - Check Prisma client is generated

### Testing Stripe Webhooks Locally

For local development, you can use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This will give you a webhook secret to use locally
```

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** using the webhook secret
3. **Use environment variables** for sensitive configuration
4. **Implement proper error handling** for failed payments
5. **Validate user permissions** before allowing subscription management

## Support

If you encounter issues:

1. Check the Stripe Dashboard for webhook delivery status
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure database migrations have been applied
5. Check that Prisma client is up to date

## Next Steps

After successful integration:

1. **Customize the pricing** - Add more plans or modify existing ones
2. **Implement usage tracking** - Track feature usage for billing
3. **Add analytics** - Monitor subscription metrics and conversions
4. **Implement dunning management** - Handle failed payments gracefully
5. **Add team management** - Allow multiple users under one subscription
