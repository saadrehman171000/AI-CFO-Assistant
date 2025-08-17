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
  Crown,
  Quote,
  Building2,
  Target,
  Clock,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  DollarSign,
  Wallet,
  Globe,
  Lightbulb,
  Activity,
} from "lucide-react"

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscription: any
}

export function LandingPage() {
  const { isSignedIn } = useUser()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  useEffect(() => {
    if (isSignedIn) {
      checkSubscriptionStatus()
    }
  }, [isSignedIn])

  const checkSubscriptionStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const response = await fetch("/api/subscription/status")
      if (response.ok) {
        const data = await response.json()
        setSubscriptionStatus(data)
      }
    } catch (error) {
      console.error("Error checking subscription status:", error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const stats = [
    { number: "500+", label: "Companies Trust Us", icon: Building2, color: "text-blue-600" },
    { number: "98%", label: "Customer Satisfaction", icon: Star, color: "text-green-600" },
    { number: "24/7", label: "AI Analysis", icon: Clock, color: "text-purple-600" },
    { number: "50%", label: "Time Saved on Reports", icon: Target, color: "text-orange-600" },
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Upload Your Data",
      description: "Simply drag and drop your financial documents - we support Excel, CSV, and PDF formats",
      icon: Upload,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Our advanced AI processes your data and generates comprehensive financial insights",
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      step: "03",
      title: "Get Insights",
      description: "Access interactive dashboards, reports, and actionable recommendations",
      icon: BarChart3,
      gradient: "from-green-500 to-emerald-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CFO at TechFlow Inc.",
      company: "TechFlow Inc.",
      content:
        "AI CFO Assistant transformed our financial reporting from a monthly headache to real-time insights. The AI analysis caught anomalies we would have missed.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Michael Rodriguez",
      role: "Financial Controller",
      company: "Green Energy Solutions",
      content:
        "The predictive analytics helped us optimize our cash flow management. We've seen a 23% improvement in working capital efficiency.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Jennifer Park",
      role: "VP of Finance",
      company: "InnovateCorp",
      content:
        "Finally, a tool that makes financial data accessible to non-finance stakeholders. The dashboards are intuitive and actionable.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  ]

  const faqs = [
    {
      question: "How secure is my financial data?",
      answer:
        "We use bank-level encryption (256-bit AES) and comply with SOC 2 Type II, GDPR, and other industry standards. Your data is encrypted both in transit and at rest, and we never store your banking credentials.",
    },
    {
      question: "What file formats do you support?",
      answer:
        "We support Excel (.xlsx, .xls), CSV, and PDF files. Our AI can automatically detect and parse financial data from various formats and layouts commonly used in accounting software.",
    },
    {
      question: "How accurate is the AI analysis?",
      answer:
        "Our AI achieves 95%+ accuracy in financial data classification and analysis. It's trained on millions of financial documents and continuously improves through machine learning.",
    },
    {
      question: "Can I integrate with my existing accounting software?",
      answer:
        "Yes! We integrate with QuickBooks, Xero, Sage, and other major accounting platforms. You can also use our API to build custom integrations with your existing systems.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "Pro users get priority support with response times under 2 hours. We offer email, chat, and video call support, plus comprehensive documentation and video tutorials.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes! You can start with a 14-day free trial of our Pro plan. No credit card required, and you can cancel anytime. The trial includes all features with sample data limits.",
    },
  ]

  const integrations = [
    { name: "Xero", logo: Building, color: "text-blue-600" },
    { name: "QuickBooks", logo: CreditCard, color: "text-green-600" },
    { name: "Stripe", logo: DollarSign, color: "text-purple-600" },
    { name: "PayPal", logo: Wallet, color: "text-blue-500" },
    { name: "HubSpot", logo: Globe, color: "text-orange-500" },
    { name: "Salesforce", logo: Globe, color: "text-blue-700" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 group cursor-pointer transition-transform duration-300 hover:scale-105">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                AI CFO Assistant
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                isCheckingStatus ? (
                  <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
                ) : subscriptionStatus?.hasActiveSubscription ? (
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/subscription">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Crown className="w-4 h-4 mr-2" />
                      Get Pro Access
                    </Button>
                  </Link>
                )
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button
                      variant="ghost"
                      className="hover:bg-gray-100 hover:text-blue-600 transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
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
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-all duration-300 transform hover:scale-105"
          >
            🚀 AI-Powered Financial Management
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Transform Your
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}
              Financial Operations
            </span>
          </h1>
          {isSignedIn && subscriptionStatus?.hasActiveSubscription && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg inline-flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Welcome back! You have active Pro access.</span>
            </div>
          )}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Leverage advanced AI to automate financial reporting, gain predictive insights, and make data-driven
            decisions that drive business growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              isCheckingStatus ? (
                <div className="animate-pulse bg-gray-200 h-14 w-48 rounded"></div>
              ) : subscriptionStatus?.hasActiveSubscription ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Access Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/subscription">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Pro
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )
            ) : (
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            {!isSignedIn || !subscriptionStatus?.hasActiveSubscription ? (
              <Link href="/subscription">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 border-2 hover:bg-gray-50 hover:border-blue-300 transition-all duration-300 bg-transparent"
                >
                  View Pricing
                </Button>
              </Link>
            ) : null}
          </div>

          {/* Hero Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative group">
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-blue-50">
                  <CardHeader className="text-center">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300`}
                      >
                        {step.step}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <step.icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Financial Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive suite of AI-powered tools helps you manage, analyze, and optimize your financial
              performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-blue-50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="group-hover:text-blue-600 transition-colors duration-300">
                  AI-Powered Analysis
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Advanced machine learning algorithms provide deep insights into your financial data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-green-50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="group-hover:text-green-600 transition-colors duration-300">
                  Smart Dashboards
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Interactive visualizations and real-time metrics for better decision making
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-purple-50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="group-hover:text-purple-600 transition-colors duration-300">
                  Automated Reporting
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Generate comprehensive financial reports with just a few clicks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-orange-50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="group-hover:text-orange-600 transition-colors duration-300">
                  Easy Data Import
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Support for multiple file formats including CSV, PDF, and Excel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-red-50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="group-hover:text-red-600 transition-colors duration-300">
                  Enterprise Security
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Bank-level encryption and compliance with industry standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-indigo-50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="group-hover:text-indigo-600 transition-colors duration-300">
                  Real-time Updates
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Get instant notifications and live financial dashboards
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Model Performance & Predictive Analytics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced AI That Delivers Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our cutting-edge AI models are trained on millions of financial documents, delivering unprecedented accuracy and predictive insights
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* AI Model Performance */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">AI Model Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">Data Classification Accuracy</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">98.7%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">Financial Pattern Recognition</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">96.3%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">Anomaly Detection</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">94.8%</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Trained on 2M+ financial documents</p>
                  <p>• Updated monthly with new data</p>
                  <p>• Industry-specific model variants</p>
                </div>
              </div>
            </div>

            {/* Visual Representation */}
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-12 h-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-32 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto"></div>
                    <div className="w-28 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto"></div>
                    <div className="w-36 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mx-auto"></div>
                  </div>
                  <p className="text-gray-600 font-medium">AI Model Training Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Analytics Features */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-green-600 transition-colors duration-300">
                  Cash Flow Forecasting
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Predict cash flow 12 months ahead with 92% accuracy using machine learning algorithms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors duration-300">
                  Risk Assessment
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  AI-powered risk scoring identifies potential financial threats before they impact your business
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-purple-600 transition-colors duration-300">
                  Trend Prediction
                </CardTitle>
                <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">
                  Identify emerging financial trends and market opportunities with predictive analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-16 p-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Coming Soon</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Natural Language Queries</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ask your financial data questions in plain English. "What's our cash burn rate?" or "Show me expenses above $10K this quarter" - 
                get instant answers powered by advanced NLP and AI.
              </p>
              <div className="flex justify-center space-x-4 text-sm text-gray-500">
                <span>• Conversational AI Interface</span>
                <span>• Multi-language Support</span>
                <span>• Context-Aware Responses</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Backup & Recovery + Compliance & Audit Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your financial data is protected by industry-leading security measures and compliance standards
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Backup & Recovery */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Backup & Recovery</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive data protection ensures your financial information is always safe and recoverable
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Automated Daily Backups</h4>
                    <p className="text-sm text-gray-600">Real-time replication across multiple secure data centers</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">99.99% Uptime Guarantee</h4>
                    <p className="text-sm text-gray-600">Business continuity with redundant infrastructure</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Instant Recovery</h4>
                    <p className="text-sm text-gray-600">Point-in-time restoration with zero data loss</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Disaster Recovery</h4>
                    <p className="text-sm text-gray-600">Geographic redundancy with 15-minute RTO</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance & Audit */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Compliance & Audit</h3>
                <p className="text-gray-600 mb-6">
                  Meet the highest standards of financial compliance and regulatory requirements
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">SOC 2 Type II Certified</h4>
                    <p className="text-sm text-gray-600">Annual third-party security audits and compliance</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">GDPR Compliant</h4>
                    <p className="text-sm text-gray-600">Full data privacy and user rights protection</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Financial Regulations</h4>
                    <p className="text-sm text-gray-600">SOX, PCI DSS, and industry-specific compliance</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Audit Trail</h4>
                    <p className="text-sm text-gray-600">Complete activity logging and compliance reporting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center group hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">256-bit AES Encryption</h4>
              <p className="text-sm text-gray-600">Bank-level encryption for data in transit and at rest</p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center group hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Role-Based Access Control</h4>
              <p className="text-sm text-gray-600">Granular permissions and user management</p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center group hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Monitoring</h4>
              <p className="text-sm text-gray-600">24/7 security monitoring and threat detection</p>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="mt-12 text-center">
            <h4 className="text-lg font-semibold text-gray-700 mb-6">Certifications & Compliance</h4>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>SOX Ready</span>
              </div>
              <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>PCI DSS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Finance Leaders</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers say about transforming their financial operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:-translate-y-2 group"
              >
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Quote className="w-12 h-12 text-blue-400 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-white text-lg font-bold">${testimonial.name.split(' ').map(n => n[0]).join('')}</span>`;
                          }
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                  <div className="flex mt-4 space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Works with your existing tools</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            {integrations.map((integration) => (
              <div key={integration.name} className="flex flex-col items-center space-y-2 group">
                <div
                  className={`w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300`}
                >
                  <integration.logo
                    className={`h-8 w-8 ${integration.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                </div>
                <span className="text-sm text-gray-600 font-medium">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about AI CFO Assistant
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  {openFAQ === index && <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>}
                </button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start with our Pro plan and unlock unlimited access to all features
          </p>

          <Card className="max-w-md mx-auto border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 group hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
              <CardDescription>Perfect for businesses and financial professionals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold">
                  $29
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
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
                  <Button className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
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
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            {!isSignedIn && (
              <Link href="/sign-in">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                >
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
              <p className="text-gray-400">Empowering businesses with AI-driven financial intelligence.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/subscription" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/subscription" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/subscription" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/subscription" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
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
