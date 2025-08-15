"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Target,
  Briefcase,
  TrendingUp,
  PieChart,
  Upload,
  Calculator,
  Construction,
  Sparkles,
} from "lucide-react"
import PortfolioAnalysis from "@/components/portfolio-analysis"

export default function DeepDiveSection() {
  const [activeTab, setActiveTab] = useState("portfolio")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Current Portfolio & Analysis</span>
            <span className="sm:hidden">Portfolio</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Active
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Goal & Projection Planner</span>
            <span className="sm:hidden">Goals</span>
            <Badge variant="outline" className="text-xs">
              Soon
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="advisory" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Fund Management / Advisory</span>
            <span className="sm:hidden">Advisory</span>
            <Badge variant="outline" className="text-xs">
              Soon
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Component 1: Current Financial Portfolio & Analysis - FULLY FUNCTIONAL */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Current Financial Portfolio & Analysis
                </CardTitle>
                <p className="text-gray-600">
                  Upload your investment statements or manually enter your financial data to get comprehensive insights
                </p>
              </CardHeader>
            </Card>

            <PortfolioAnalysis />
          </div>
        </TabsContent>

        {/* Component 2: Goal & Projection Planner - COMING SOON */}
        <TabsContent value="goals" className="space-y-6">
          <Card className="border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-orange-100 rounded-full p-4">
                  <Construction className="h-12 w-12 text-orange-600" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">🚧 Coming Soon: Goal & Projection Planner</h2>
                  <p className="text-lg text-gray-700 max-w-2xl">
                    Set your financial goals, risk preferences, and get a personalized investment roadmap!
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-200">
                    <Target className="h-8 w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Goal Setting</h3>
                    <p className="text-sm text-gray-600">
                      Define your financial objectives like home purchase, retirement, or education funding
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-200">
                    <Calculator className="h-8 w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Smart Projections</h3>
                    <p className="text-sm text-gray-600">
                      AI-powered calculations to show exactly how much to invest and when
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-200">
                    <PieChart className="h-8 w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Risk Assessment</h3>
                    <p className="text-sm text-gray-600">
                      Personalized risk profiling to match investments with your comfort level
                    </p>
                  </div>
                </div>

                <div className="bg-orange-100 rounded-lg p-4 mt-6">
                  <p className="text-sm text-orange-800">
                    <strong>Expected Launch:</strong> Q2 2024 •<strong> Features:</strong> Goal tracking, SIP
                    calculators, retirement planning, tax optimization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component 3: Fund Management / Advisory - COMING SOON */}
        <TabsContent value="advisory" className="space-y-6">
          <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-purple-100 rounded-full p-4">
                  <Sparkles className="h-12 w-12 text-purple-600" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">🚧 Coming Soon: Fund Management & Advisory</h2>
                  <p className="text-lg text-gray-700 max-w-2xl">
                    Unlock advanced fund management and personalized advisory services here!
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-8 max-w-4xl">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-200">
                    <Briefcase className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Portfolio Management</h3>
                    <p className="text-sm text-gray-600">
                      Professional portfolio rebalancing and optimization services
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-200">
                    <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Expert Advisory</h3>
                    <p className="text-sm text-gray-600">One-on-one consultations with certified financial advisors</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-200">
                    <Upload className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Automated Investing</h3>
                    <p className="text-sm text-gray-600">
                      Set-and-forget investment strategies with automatic rebalancing
                    </p>
                  </div>
                </div>

                <div className="bg-purple-100 rounded-lg p-4 mt-6">
                  <p className="text-sm text-purple-800">
                    <strong>Expected Launch:</strong> Q3 2024 •<strong> Features:</strong> Robo-advisory, tax-loss
                    harvesting, direct mutual fund investing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
