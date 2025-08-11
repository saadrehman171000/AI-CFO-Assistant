import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log('🔄 WEBHOOK RECEIVED:', { 
    hasBody: !!body, 
    hasSignature: !!signature,
    bodyLength: body.length 
  });

  if (!signature) {
    console.log('❌ Missing stripe signature');
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('✅ Webhook signature verified, event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    console.log('🎯 Processing relevant event:', event.type);
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          console.log('💳 Processing checkout.session.completed');
          const session = event.data.object as any;
          await handleCheckoutSessionCompleted(session);
          break;
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          console.log('📅 Processing subscription event:', event.type);
          const subscription = event.data.object as any;
          await handleSubscriptionUpdated(subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          console.log('🗑️ Processing subscription deleted');
          const subscription = event.data.object as any;
          await handleSubscriptionDeleted(subscription);
          break;
        }
        case 'invoice.payment_succeeded': {
          console.log('💰 Processing payment succeeded');
          const invoice = event.data.object as any;
          await handleInvoicePaymentSucceeded(invoice);
          break;
        }
        case 'invoice.payment_failed': {
          console.log('💸 Processing payment failed');
          const invoice = event.data.object as any;
          await handleInvoicePaymentFailed(invoice);
          break;
        }
        default:
          console.log(`❓ Unhandled relevant event: ${event.type}`);
      }
    } catch (error) {
      console.error('❌ Error handling webhook event:', error);
      return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
  } else {
    console.log('⏭️ Skipping irrelevant event:', event.type);
  }

  console.log('✅ Webhook processed successfully');
  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('💳 Checkout session completed for customer:', session.customer);
  console.log('💳 Session subscription ID:', session.subscription);
  
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  console.log('📅 Retrieved subscription:', subscription.id, 'status:', subscription.status);
  
  await handleSubscriptionUpdated(subscription);
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('📅 Processing subscription update for:', subscription.id);
  console.log('📅 Customer ID:', subscription.customer);
  console.log('📅 Status:', subscription.status);
  console.log('📅 Period start timestamp:', subscription.current_period_start);
  console.log('📅 Period end timestamp:', subscription.current_period_end);
  
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: subscription.customer }
  });

  if (!user) {
    console.error('❌ User not found for subscription:', subscription.id, 'customer:', subscription.customer);
    return;
  }

  console.log('✅ Found user:', user.id, user.email);

  // Fix date conversion - ensure valid timestamps
  const periodStart = subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date();
  const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  console.log('📅 Converted period start:', periodStart);
  console.log('📅 Converted period end:', periodEnd);

  try {
    const result = await prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      update: {
        status: subscription.status.toUpperCase(),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        stripePriceId: subscription.items?.data?.[0]?.price?.id || null,
      },
      create: {
        userId: user.id,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items?.data?.[0]?.price?.id || null,
        status: subscription.status.toUpperCase(),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      },
    });
    
    console.log('✅ Subscription upsert successful:', result.id, 'status:', result.status);
  } catch (error) {
    console.error('❌ Error upserting subscription:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'CANCELED' }
  });
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    await handleSubscriptionUpdated(subscription);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    await handleSubscriptionUpdated(subscription);
  }
}
