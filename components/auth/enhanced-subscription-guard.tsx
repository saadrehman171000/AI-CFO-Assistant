'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, Building2 } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any;
}

interface UserSetupStatus {
  hasCompletedSetup: boolean;
  companyId: string | null;
}

export default function EnhancedSubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [userSetupStatus, setUserSetupStatus] = useState<UserSetupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const startTime = Date.now();
      
      // Check both subscription and setup status
      const [subscriptionResponse, setupResponse] = await Promise.all([
        fetch('/api/subscription/status'),
        fetch('/api/user/setup-status')
      ]);

      if (subscriptionResponse.ok) {
        const subData = await subscriptionResponse.json();
        setSubscriptionStatus(subData);
      }

      if (setupResponse.ok) {
        const setupData = await setupResponse.json();
        setUserSetupStatus(setupData);
      }
      
      // Ensure minimum loading time to prevent flashing
      const elapsed = Date.now() - startTime;
      const minLoadingTime = 500;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  const handleCompleteSetup = () => {
    router.push('/company-setup');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // Check subscription first
  if (!subscriptionStatus?.hasActiveSubscription) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Premium Feature</CardTitle>
            <CardDescription>
              This feature requires an active Pro subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro to unlock unlimited financial reports, advanced AI insights, 
              and comprehensive dashboards.
            </p>
            <Button onClick={handleUpgrade} className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user needs to complete company setup
  if (subscriptionStatus?.hasActiveSubscription && !userSetupStatus?.hasCompletedSetup) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Complete Your Setup</CardTitle>
            <CardDescription>
              Let's set up your company profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Welcome to AI CFO Pro! Let's set up your company profile and branches 
              to unlock the full power of multi-branch financial management.
            </p>
            <Button onClick={handleCompleteSetup} className="w-full">
              <Building2 className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
