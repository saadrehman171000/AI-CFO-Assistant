"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "$29",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 3 financial reports per month",
      "Basic AI insights",
      "CSV file uploads",
      "Email support",
      "Dashboard analytics",
      "Mobile app access",
    ],
    buttonText: "Start Basic",
    popular: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
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
      "White-label options",
    ],
    buttonText: "Start Pro",
    popular: true,
  },
]

export function SubscriptionContent() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. Upgrade or downgrade at any time.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative border-0 shadow-lg ${
              plan.popular ? "gradient-bg text-white scale-105" : "bg-white hover:shadow-xl"
            } transition-all duration-200`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-purple-600 px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className={`text-2xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                <span className={`${plan.popular ? "text-white/80" : "text-gray-600"}`}>{plan.period}</span>
              </div>
              <p className={`${plan.popular ? "text-white/90" : "text-gray-600"} mt-2`}>{plan.description}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <Button
                className={`w-full mb-6 ${
                  plan.popular
                    ? "bg-white text-purple-600 hover:bg-gray-100"
                    : "gradient-bg text-white hover:opacity-90"
                }`}
              >
                {plan.buttonText}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check
                      className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${plan.popular ? "text-white" : "text-green-500"}`}
                    />
                    <span className={`${plan.popular ? "text-white" : "text-gray-700"}`}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <Card className="max-w-4xl mx-auto border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Features</th>
                  <th className="text-center py-3 px-4">Basic</th>
                  <th className="text-center py-3 px-4">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { feature: "Monthly Reports", basic: "3", pro: "Unlimited" },
                  { feature: "AI Insights", basic: "Basic", pro: "Advanced" },
                  { feature: "File Formats", basic: "CSV", pro: "CSV, PDF" },
                  { feature: "Support", basic: "Email", pro: "Priority" },
                  { feature: "API Access", basic: "✗", pro: "✓" },
                  { feature: "Team Collaboration", basic: "✗", pro: "✓" },
                  { feature: "Custom Dashboards", basic: "✗", pro: "✓" },
                  { feature: "Scenario Planning", basic: "✗", pro: "✓" },
                ].map((row, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{row.basic}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="max-w-4xl mx-auto border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                question: "Can I change my plan at any time?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                question: "Is there a free trial available?",
                answer: "We offer a 14-day free trial for all plans. No credit card required to get started.",
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.",
              },
              {
                question: "Is my financial data secure?",
                answer:
                  "Yes, we use bank-level encryption and security measures to protect your data. We are SOC 2 compliant.",
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee if you're not satisfied with our service.",
              },
            ].map((faq, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
