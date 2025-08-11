import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { getOrCreateUser } from '@/lib/db';
import { prisma } from '@/lib/db';

// COMPLETELY REWRITTEN - Using dynamic pricing instead of hardcoded price IDs
export async function POST(request: NextRequest) {
  console.log('🔄 CHECKOUT SESSION API CALLED - VERSION: DYNAMIC PRICING');
  
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkUser);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'TRIALING']
        }
      }
    });

    if (existingSubscription) {
      return NextResponse.json({ error: 'User already has an active subscription' }, { status: 400 });
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          clerkId: user.clerkId
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
      });
    }

    console.log('✅ Creating checkout session with DYNAMIC PRICING');
    
    // Create Stripe checkout session with DYNAMIC PRICING
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pro Plan - AI CFO Assistant',
              description: 'Premium access to AI CFO Assistant features',
            },
            unit_amount: 2900, // $29.00 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-cfo-assistant.vercel.app'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-cfo-assistant.vercel.app'}/subscription?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    console.log('✅ Checkout session created successfully with dynamic pricing');
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
