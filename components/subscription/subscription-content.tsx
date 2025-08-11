'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Settings, X } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe-config';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export default function SubscriptionContent() {
  const { user } = useUser();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create checkout session',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to open customer portal',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to open customer portal',
        variant: 'destructive',
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your current billing period.')) {
      return;
    }

    setIsCanceling(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your subscription will be canceled at the end of the current billing period.',
        });
        // Refresh subscription status
        await checkSubscriptionStatus();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to cancel subscription',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isCheckingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your financial analysis needs. Get access to advanced AI insights, 
          unlimited reports, and comprehensive dashboards.
        </p>
      </div>

      {subscriptionStatus?.hasActiveSubscription ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Active Subscription</CardTitle>
            <CardDescription>
              You currently have an active Pro subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-medium">Status:</span>
              <Badge variant="secondary" className="capitalize">
                {subscriptionStatus.subscription?.status.toLowerCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-medium">Current Period:</span>
              <span className="text-sm text-muted-foreground">
                {subscriptionStatus.subscription && 
                  `${formatDate(subscriptionStatus.subscription.currentPeriodStart)} - ${formatDate(subscriptionStatus.subscription.currentPeriodEnd)}`
                }
              </span>
            </div>
            {subscriptionStatus.subscription?.cancelAtPeriodEnd && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Your subscription will be canceled at the end of the current billing period.
                </p>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleManageSubscription} 
                variant="outline" 
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
              {!subscriptionStatus.subscription?.cancelAtPeriodEnd && (
                <Button 
                  onClick={handleCancelSubscription} 
                  variant="destructive" 
                  disabled={isCanceling}
                  className="flex-1"
                >
                  {isCanceling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-primary/20 to-transparent w-32 h-32 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="text-center relative z-10">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">{STRIPE_PLANS.PRO.name}</CardTitle>
              <CardDescription className="text-lg">
                Perfect for businesses and financial professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  ${STRIPE_PLANS.PRO.price}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{STRIPE_PLANS.PRO.interval}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg">What&apos;s included:</h4>
                <ul className="space-y-2">
                  {STRIPE_PLANS.PRO.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSubscribe} 
                  disabled={isLoading}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Get Started with Pro</span>
                    </div>
                  )}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Secure payment powered by Stripe</p>
                <p>Cancel anytime • No setup fees</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
