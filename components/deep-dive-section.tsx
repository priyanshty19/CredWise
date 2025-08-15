"use client"

import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
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
        {/* Custom TabsList with proper responsive layout */}
        <div className="w-full mb-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 bg-muted p-1 rounded-lg">
            {/* Portfolio Tab */}
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`
                flex-1 min-w-0 relative flex items-center justify-between
                px-3 py-3 sm:px-4 sm:py-2.5 rounded-md text-sm font-medium
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                ${
                  activeTab === "portfolio"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <BarChart3 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  <span className="sm:hidden">Portfolio</span>
                  <span className="hidden sm:inline lg:hidden">Current Portfolio</span>
                  <span className="hidden lg:inline">Current Portfolio & Analysis</span>
                </span>
              </div>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 flex-shrink-0">
                Active
              </Badge>
            </button>

            {/* Goals Tab */}
            <button
              onClick={() => setActiveTab("goals")}
              className={`
                flex-1 min-w-0 relative flex items-center justify-between
                px-3 py-3 sm:px-4 sm:py-2.5 rounded-md text-sm font-medium
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                ${
                  activeTab === "goals"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  <span className="sm:hidden">Goals</span>
                  <span className="hidden sm:inline lg:hidden">Goal Planner</span>
                  <span className="hidden lg:inline">Goal & Projection Planner</span>
                </span>
              </div>
              <Badge variant="outline" className="ml-2 text-xs px-2 py-0.5 flex-shrink-0 border-muted-foreground/30">
                Soon
              </Badge>
            </button>

            {/* Advisory Tab */}
            <button
              onClick={() => setActiveTab("advisory")}
              className={`
                flex-1 min-w-0 relative flex items-center justify-between
                px-3 py-3 sm:px-4 sm:py-2.5 rounded-md text-sm font-medium
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                ${
                  activeTab === "advisory"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Briefcase className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  <span className="sm:hidden">Advisory</span>
                  <span className="hidden sm:inline lg:hidden">Fund Management</span>
                  <span className="hidden lg:inline">Fund Management / Advisory</span>
                </span>
              </div>
              <Badge variant="outline" className="ml-2 text-xs px-2 py-0.5 flex-shrink-0 border-muted-foreground/30">
                Soon
              </Badge>
            </button>
          </div>
        </div>

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
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-orange-100 rounded-full p-4">
                  <Construction className="h-12 w-12 text-orange-600" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    🚧 Coming Soon: Goal & Projection Planner
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 max-w-2xl">
                    Set your financial goals, risk preferences, and get a personalized investment roadmap!
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 w-full max-w-4xl">
                  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-orange-200">
                    <Target className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Goal Setting</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Define your financial objectives like home purchase, retirement, or education funding
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-orange-200">
                    <Calculator className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Smart Projections</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      AI-powered calculations to show exactly how much to invest and when
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-orange-200 sm:col-span-2 lg:col-span-1">
                    <PieChart className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Risk Assessment</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Personalized risk profiling to match investments with your comfort level
                    </p>
                  </div>
                </div>

                <div className="bg-orange-100 rounded-lg p-3 sm:p-4 mt-6 w-full max-w-3xl">
                  <p className="text-xs sm:text-sm text-orange-800">
                    <strong>Expected Launch:</strong> Q2 2024 • <strong>Features:</strong> Goal tracking, SIP
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
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-purple-100 rounded-full p-4">
                  <Sparkles className="h-12 w-12 text-purple-600" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    🚧 Coming Soon: Fund Management & Advisory
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 max-w-2xl">
                    Unlock advanced fund management and personalized advisory services here!
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 w-full max-w-4xl">
                  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-purple-200">
                    <Briefcase className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Portfolio Management</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Professional portfolio rebalancing and optimization services
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-purple-200">
                    <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Expert Advisory</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      One-on-one consultations with certified financial advisors
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-purple-200 sm:col-span-2 lg:col-span-1">
                    <Upload className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Automated Investing</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Set-and-forget investment strategies with automatic rebalancing
                    </p>
                  </div>
                </div>

                <div className="bg-purple-100 rounded-lg p-3 sm:p-4 mt-6 w-full max-w-3xl">
                  <p className="text-xs sm:text-sm text-purple-800">
                    <strong>Expected Launch:</strong> Q3 2024 • <strong>Features:</strong> Robo-advisory, tax-loss
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
