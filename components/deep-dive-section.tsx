"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, PieChart, Target, Calendar, FileText, Upload, ArrowRight, Sparkles } from "lucide-react"
import PortfolioAnalysis from "./portfolio-analysis"
import type { PortfolioEntry, PortfolioSummary } from "@/app/actions/portfolio-actions"

export default function DeepDiveSection() {
  const [activeComponent, setActiveComponent] = useState<"coming-soon" | "portfolio">("portfolio")
  const [portfolioData, setPortfolioData] = useState<{
    entries: PortfolioEntry[]
    summary: PortfolioSummary | null
  }>({
    entries: [],
    summary: null,
  })

  const handlePortfolioDataUpdate = (entries: PortfolioEntry[], summary: PortfolioSummary) => {
    setPortfolioData({ entries, summary })
  }

  const components = [
    {
      id: "portfolio" as const,
      title: "Portfolio Analysis",
      description: "Upload and analyze your investment portfolio with real-time insights",
      icon: <BarChart3 className="h-6 w-6" />,
      status: "available",
      features: ["Real file parsing", "Multi-broker support", "Performance analytics", "Risk assessment"],
    },
    {
      id: "coming-soon" as const,
      title: "Advanced Analytics",
      description: "AI-powered investment recommendations and portfolio optimization",
      icon: <Sparkles className="h-6 w-6" />,
      status: "coming-soon",
      features: ["AI recommendations", "Risk optimization", "Tax planning", "Goal tracking"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Deep Dive Analytics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive portfolio analysis and investment insights powered by advanced data processing
          </p>
        </div>

        {/* Component Selection */}
        <div className="mb-8">
          <Tabs value={activeComponent} onValueChange={(value) => setActiveComponent(value as typeof activeComponent)}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                {components.map((component) => (
                  <TabsTrigger
                    key={component.id}
                    value={component.id}
                    className="flex items-center gap-2 text-sm font-medium"
                    disabled={component.status === "coming-soon"}
                  >
                    {component.icon}
                    <span className="hidden sm:inline">{component.title}</span>
                    <span className="sm:hidden">{component.id === "portfolio" ? "Portfolio" : "Advanced"}</span>
                    {component.status === "coming-soon" && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Soon
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Component Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {components.map((component) => (
                <Card
                  key={component.id}
                  className={`transition-all duration-200 ${
                    activeComponent === component.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : component.status === "coming-soon"
                        ? "opacity-60"
                        : "hover:shadow-md"
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {component.icon}
                      <div>
                        <div className="flex items-center gap-2">
                          {component.title}
                          {component.status === "coming-soon" && (
                            <Badge variant="outline" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-normal text-gray-600 mt-1">{component.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {component.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    {component.status === "available" && activeComponent !== component.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full bg-transparent"
                        onClick={() => setActiveComponent(component.id)}
                      >
                        Try Now <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Component Content */}
            <TabsContent value="portfolio" className="space-y-6">
              <PortfolioAnalysis onDataUpdate={handlePortfolioDataUpdate} />
            </TabsContent>

            <TabsContent value="coming-soon" className="space-y-6">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto">
                      <Sparkles className="h-12 w-12 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Advanced Analytics Coming Soon</h3>
                      <p className="text-gray-600 mt-2 max-w-md mx-auto">
                        We're building powerful AI-driven analytics to provide personalized investment recommendations
                        and portfolio optimization strategies.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-lg mx-auto">
                      <div className="bg-white border rounded-lg p-4">
                        <Target className="h-8 w-8 text-blue-600 mb-2" />
                        <h4 className="font-medium">Smart Recommendations</h4>
                        <p className="text-sm text-gray-600">AI-powered investment suggestions</p>
                      </div>
                      <div className="bg-white border rounded-lg p-4">
                        <PieChart className="h-8 w-8 text-green-600 mb-2" />
                        <h4 className="font-medium">Risk Optimization</h4>
                        <p className="text-sm text-gray-600">Automated portfolio balancing</p>
                      </div>
                      <div className="bg-white border rounded-lg p-4">
                        <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                        <h4 className="font-medium">Goal Planning</h4>
                        <p className="text-sm text-gray-600">Timeline-based investment strategies</p>
                      </div>
                      <div className="bg-white border rounded-lg p-4">
                        <FileText className="h-8 w-8 text-orange-600 mb-2" />
                        <h4 className="font-medium">Tax Optimization</h4>
                        <p className="text-sm text-gray-600">Smart tax-saving recommendations</p>
                      </div>
                    </div>
                    <div className="pt-6">
                      <Button onClick={() => setActiveComponent("portfolio")} className="bg-blue-600 hover:bg-blue-700">
                        <Upload className="h-4 w-4 mr-2" />
                        Try Portfolio Analysis Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Portfolio Summary (if data exists) */}
        {portfolioData.summary && portfolioData.entries.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Your Portfolio at a Glance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{portfolioData.entries.length}</div>
                  <div className="text-sm text-green-600">Total Investments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    ₹{(portfolioData.summary.totalValue / 100000).toFixed(1)}L
                  </div>
                  <div className="text-sm text-blue-600">Portfolio Value</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      portfolioData.summary.totalGainLoss >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {portfolioData.summary.totalGainLoss >= 0 ? "+" : ""}
                    {portfolioData.summary.totalGainLossPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">
                    {Object.keys(portfolioData.summary.byBroker).length}
                  </div>
                  <div className="text-sm text-purple-600">Platforms</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
