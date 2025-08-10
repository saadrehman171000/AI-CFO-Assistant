"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Zap,
  BarChart3,
  TrendingUp,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Check,
  Menu,
  X,
  Star,
  ChevronRight,
  Brain,
  Target,
  Lightbulb,
  Rocket,
  Globe,
  PlayCircle,
  MessageSquare,
  Twitter,
  Linkedin,
  Github,
  Sparkles,
  TrendingDown,
  DollarSign,
  PieChart,
  Building,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Advanced machine learning algorithms analyze your financial data to provide actionable insights and recommendations.",
    gradient: "gradient-bg",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description:
      "Forecast future cash flows, revenue trends, and financial performance with 95% accuracy using our AI models.",
    gradient: "gradient-bg-2",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-level encryption, SOC 2 compliance, and advanced security measures protect your sensitive financial data.",
    gradient: "gradient-bg-3",
  },
  {
    icon: Clock,
    title: "Real-Time Processing",
    description: "Get instant updates and real-time financial insights as your data changes throughout the day.",
    gradient: "gradient-bg-4",
  },
  {
    icon: Target,
    title: "Smart Automation",
    description: "Automate repetitive financial tasks, report generation, and data entry to save hours every week.",
    gradient: "gradient-bg",
  },
  {
    icon: Lightbulb,
    title: "Strategic Recommendations",
    description: "Receive personalized recommendations for cost optimization, revenue growth, and financial planning.",
    gradient: "gradient-bg-2",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CFO, TechStart Inc.",
    company: "TechStart Inc.",
    content:
      "AI CFO Assistant transformed how we handle financial planning. The insights are incredibly accurate and have helped us increase profitability by 23%.",
    rating: 5,
    avatar: "/professional-woman-diverse.png",
  },
  {
    name: "Michael Chen",
    role: "Finance Director, GrowthCorp",
    company: "GrowthCorp",
    content:
      "The forecasting features helped us secure our Series B funding. The AI predictions were spot-on, and investors were impressed with our financial projections.",
    rating: 5,
    avatar: "/professional-man.png",
  },
  {
    name: "Emily Rodriguez",
    role: "CEO, InnovateLab",
    company: "InnovateLab",
    content:
      "Finally, a financial tool that speaks our language. The AI insights are actionable, and the interface is intuitive. Our team loves it!",
    rating: 5,
    avatar: "/professional-woman-ceo.png",
  },
  {
    name: "David Kim",
    role: "VP Finance, ScaleUp",
    company: "ScaleUp",
    content:
      "We've reduced our financial reporting time by 80% and improved accuracy significantly. The ROI has been incredible.",
    rating: 5,
    avatar: "/professional-man-finance.png",
  },
]

const stats = [
  { number: "10,000+", label: "Active Users", icon: Users },
  { number: "99.9%", label: "Uptime", icon: Shield },
  { number: "$2.5B+", label: "Analyzed", icon: DollarSign },
  { number: "150+", label: "Countries", icon: Globe },
]

const integrations = [
  { name: "QuickBooks", logo: "/generic-accounting-software-logo.png" },
  { name: "Xero", logo: "/xero-logo.png" },
  { name: "Stripe", logo: "/stripe-logo.png" },
  { name: "PayPal", logo: "/paypal-logo.png" },
  { name: "Salesforce", logo: "/salesforce-logo.png" },
  { name: "HubSpot", logo: "/hubspot-logo.png" },
]

const useCases = [
  {
    title: "Startups & SMBs",
    description: "Get professional-grade financial insights without hiring a full-time CFO",
    icon: Rocket,
    features: ["Cash flow forecasting", "Investor reporting", "Budget planning", "Growth metrics"],
  },
  {
    title: "Growing Companies",
    description: "Scale your financial operations with AI-powered automation and insights",
    icon: TrendingUp,
    features: ["Multi-entity reporting", "Advanced analytics", "Team collaboration", "Custom dashboards"],
  },
  {
    title: "Enterprise",
    description: "Enterprise-grade financial intelligence for complex organizations",
    icon: Building,
    features: ["Custom integrations", "Advanced security", "Dedicated support", "White-label options"],
  },
]

const blogPosts = [
  {
    title: "How AI is Revolutionizing Financial Planning",
    excerpt:
      "Discover how artificial intelligence is transforming the way businesses approach financial planning and analysis.",
    date: "Dec 15, 2024",
    readTime: "5 min read",
    image: "/ai-finance.png",
  },
  {
    title: "5 Key Metrics Every CFO Should Track",
    excerpt:
      "Learn about the essential financial metrics that drive business success and how to monitor them effectively.",
    date: "Dec 12, 2024",
    readTime: "7 min read",
    image: "/placeholder-qdlda.png",
  },
  {
    title: "The Future of Financial Automation",
    excerpt: "Explore upcoming trends in financial automation and how they'll impact your business operations.",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    image: "/automation-future.png",
  },
]

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AI CFO Assistant</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Testimonials
              </Link>
              <Link href="#resources" className="text-gray-600 hover:text-gray-900 transition-colors">
                Resources
              </Link>
              <Button variant="outline" className="border-gray-300 bg-transparent">
                Sign In
              </Button>
              <Button className="gradient-bg text-white hover:opacity-90">Start Free Trial</Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-gray-600 hover:text-gray-900">
                  Features
                </Link>
                <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="#testimonials" className="text-gray-600 hover:text-gray-900">
                  Testimonials
                </Link>
                <Link href="#resources" className="text-gray-600 hover:text-gray-900">
                  Resources
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Button variant="outline" className="border-gray-300 bg-transparent">
                    Sign In
                  </Button>
                  <Button className="gradient-bg text-white hover:opacity-90">Start Free Trial</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 glass text-white mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Powered by Advanced AI Technology</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6">
              Your AI-Powered
              <span className="block">Financial Co-Pilot</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Transform your financial management with intelligent insights, automated reporting, and predictive
              analytics. Make smarter decisions with AI-driven recommendations that grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-white/80 mt-4">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl transform rotate-1"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                      {
                        title: "Revenue",
                        value: "$125,430",
                        change: "+12.5%",
                        color: "text-green-600",
                        icon: TrendingUp,
                      },
                      {
                        title: "Expenses",
                        value: "$89,240",
                        change: "-3.2%",
                        color: "text-green-600",
                        icon: TrendingDown,
                      },
                      {
                        title: "Profit",
                        value: "$36,190",
                        change: "+18.7%",
                        color: "text-green-600",
                        icon: DollarSign,
                      },
                      {
                        title: "Cash Flow",
                        value: "$42,850",
                        change: "+5.4%",
                        color: "text-green-600",
                        icon: PieChart,
                      },
                    ].map((kpi, index) => (
                      <div
                        key={index}
                        className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">{kpi.title}</p>
                          <kpi.icon className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                        <p className={`text-sm ${kpi.color} flex items-center`}>
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {kpi.change}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="h-64 gradient-bg rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-semibold">Interactive AI Dashboard</p>
                      <p className="text-white/80">Real-time insights and predictions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 gradient-bg rounded-xl mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold gradient-text mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <span className="gradient-text block">manage finances intelligently</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI-driven features designed to streamline your financial operations and provide actionable
              insights that drive growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-8">
                  <div className={`w-14 h-14 ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect for every business size</h2>
            <p className="text-xl text-gray-600">From startups to enterprises, we've got you covered</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="gradient-bg w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <useCase.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                  <p className="text-gray-600 mb-6">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by finance teams worldwide</h2>
            <p className="text-xl text-white/90">See what our customers are saying about AI CFO Assistant</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 glass text-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-white/90 mb-6 text-sm leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                      <p className="text-white/70 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Seamless integrations</h2>
            <p className="text-xl text-gray-600">Connect with your favorite financial tools and platforms</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={integration.logo || "/placeholder.svg"}
                  alt={integration.name}
                  className="max-h-8 w-auto opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Basic",
                price: "$29",
                description: "Perfect for small businesses and startups",
                features: [
                  "Up to 3 financial reports per month",
                  "Basic AI insights and recommendations",
                  "CSV file uploads",
                  "Email support",
                  "Dashboard analytics",
                  "Mobile app access",
                ],
                popular: false,
              },
              {
                name: "Pro",
                price: "$79",
                description: "Ideal for growing businesses with advanced needs",
                features: [
                  "Unlimited financial reports",
                  "Advanced AI insights & forecasting",
                  "CSV & PDF file uploads",
                  "Priority support",
                  "Custom dashboards",
                  "API access",
                  "Scenario planning",
                  "Team collaboration",
                  "Advanced integrations",
                ],
                popular: true,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`border-0 shadow-lg relative ${plan.popular ? "gradient-bg text-white scale-105" : "bg-white"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-purple-600 px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}>
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                        {plan.price}
                      </span>
                      <span className={`${plan.popular ? "text-white/80" : "text-gray-600"}`}>/month</span>
                    </div>
                    <p className={`${plan.popular ? "text-white/90" : "text-gray-600"}`}>{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className={`h-5 w-5 mr-3 ${plan.popular ? "text-white" : "text-green-500"}`} />
                        <span className={`${plan.popular ? "text-white" : "text-gray-700"}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/subscription">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-white text-purple-600 hover:bg-gray-100"
                          : "gradient-bg text-white hover:opacity-90"
                      }`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources/Blog Section */}
      <section id="resources" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest insights and resources</h2>
            <p className="text-xl text-gray-600">Stay updated with the latest trends in AI and finance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Button variant="outline" className="border-gray-300 bg-transparent">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about AI CFO Assistant</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How accurate are the AI predictions?",
                answer:
                  "Our AI models achieve 95% accuracy in financial forecasting by analyzing historical data, market trends, and business patterns. The accuracy improves over time as the system learns from your specific business data.",
              },
              {
                question: "Can I integrate with my existing accounting software?",
                answer:
                  "Yes! We support integrations with QuickBooks, Xero, Stripe, PayPal, and many other popular financial platforms. Our API also allows for custom integrations.",
              },
              {
                question: "Is my financial data secure?",
                answer:
                  "Absolutely. We use bank-level encryption, SOC 2 compliance, and advanced security measures. Your data is encrypted both in transit and at rest, and we never share your information with third parties.",
              },
              {
                question: "Can I cancel my subscription at any time?",
                answer:
                  "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. You'll continue to have access until the end of your current billing period.",
              },
              {
                question: "Do you offer customer support?",
                answer:
                  "We provide email support for Basic plans and priority support for Pro plans. Our support team typically responds within 24 hours for Basic and 4 hours for Pro customers.",
              },
              {
                question: "Is there a free trial available?",
                answer:
                  "Yes! We offer a 14-day free trial for all plans. No credit card required to get started. You can explore all features and see how AI CFO Assistant works for your business.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">{faq.question}</h4>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to transform your financial management?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using AI CFO Assistant to make smarter financial decisions and drive
            growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4">
                Start Your Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
          <p className="text-white/80 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">AI CFO Assistant</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering businesses with intelligent financial insights and automated reporting. Transform your
                financial management with AI.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Github className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#resources" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">&copy; 2024 AI CFO Assistant. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
