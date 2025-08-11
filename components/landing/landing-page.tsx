"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Upload, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Crown
} from "lucide-react"

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any;
}

export function LandingPage() {
  const { isSignedIn } = useUser()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  useEffect(() => {
    if (isSignedIn) {
      checkSubscriptionStatus()
    }
  }, [isSignedIn])

  const checkSubscriptionStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionStatus(data)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI CFO Assistant</span>
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                isCheckingStatus ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
                ) : subscriptionStatus?.hasActiveSubscription ? (
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/subscription">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Crown className="w-4 h-4 mr-2" />
                      Get Pro Access
                    </Button>
                  </Link>
                )
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            🚀 AI-Powered Financial Management
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Financial Operations
            </span>
          </h1>
          {isSignedIn && subscriptionStatus?.hasActiveSubscription && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg inline-flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Welcome back! You have active Pro access.</span>
            </div>
          )}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Leverage advanced AI to automate financial reporting, gain predictive insights, 
            and make data-driven decisions that drive business growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              isCheckingStatus ? (
                <div className="animate-pulse bg-gray-200 h-14 w-48 rounded"></div>
              ) : subscriptionStatus?.hasActiveSubscription ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8 py-4">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Access Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/subscription">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Pro
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )
            ) : (
              <Link href="/sign-up">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            {!isSignedIn || !subscriptionStatus?.hasActiveSubscription ? (
              <Link href="/subscription">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  View Pricing
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Financial Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive suite of AI-powered tools helps you manage, analyze, and 
              optimize your financial performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Advanced machine learning algorithms provide deep insights into your financial data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Smart Dashboards</CardTitle>
                <CardDescription>
                  Interactive visualizations and real-time metrics for better decision making
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Automated Reporting</CardTitle>
                <CardDescription>
                  Generate comprehensive financial reports with just a few clicks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Easy Data Import</CardTitle>
                <CardDescription>
                  Support for multiple file formats including CSV, PDF, and Excel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level encryption and compliance with industry standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Get instant notifications and live financial dashboards
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start with our Pro plan and unlock unlimited access to all features
          </p>
          
          <Card className="max-w-md mx-auto border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
              <CardDescription>
                Perfect for businesses and financial professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  $29
                  <span className="text-lg font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg">What&apos;s included:</h4>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Unlimited financial reports</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Advanced AI analysis</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Financial forecasting</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Custom dashboards</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Link href="/subscription">
                  <Button className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Crown className="w-5 h-5 mr-2" />
                    Get Started with Pro
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Secure payment powered by Stripe</p>
                <p>Cancel anytime • No setup fees</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Financial Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using AI CFO Assistant to drive growth and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Link href="/subscription">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            {!isSignedIn && (
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">AI CFO Assistant</span>
              </div>
              <p className="text-gray-400">
                Empowering businesses with AI-driven financial intelligence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/subscription" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/subscription" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/subscription" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/subscription" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI CFO Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
