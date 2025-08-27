'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, AlertTriangle } from 'lucide-react';

interface CompanyGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface CompanyData {
  company: {
    id: string;
    name: string;
    branches: any[];
  } | null;
  isCompanyAdmin: boolean;
}

export default function CompanyGuard({ children, fallback }: CompanyGuardProps) {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkCompanyAccess();
  }, []);

  const checkCompanyAccess = async () => {
    try {
      const response = await fetch('/api/company');
      if (response.ok) {
        const data = await response.json();
        setCompanyData(data);
      } else {
        // User doesn't have company access
        setCompanyData({ company: null, isCompanyAdmin: false });
      }
    } catch (error) {
      console.error('Error checking company access:', error);
      setCompanyData({ company: null, isCompanyAdmin: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupCompany = () => {
    router.push('/company-setup');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have a company, show access denied
  if (!companyData?.company) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Company Features Only</CardTitle>
            <CardDescription>
              This feature is only available for company accounts with multiple branches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To access branch management and comparison features, you need to set up 
              a company profile with multiple locations.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleSetupCompany} className="w-full">
                <Building2 className="w-4 h-4 mr-2" />
                Set Up Company Profile
              </Button>
              <Button variant="outline" onClick={handleGoToDashboard} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
