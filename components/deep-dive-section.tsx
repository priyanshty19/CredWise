"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Target, Users, TrendingUp, Calendar, Building2, ArrowRight, Clock, Star } from "lucide-react"
import PortfolioAnalysis from "./portfolio-analysis"
import type { PortfolioEntry, PortfolioSummary } from "@/app/actions/portfolio-actions"

export default function DeepDiveSection() {
  const [activeTab, setActiveTab] = useState("portfolio")
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

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Deep Dive Financial Analysis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive portfolio analysis, goal planning, and personalized investment advisory services
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 rounded-lg">
          <TabsTrigger
            value="portfolio"
            className="flex flex-col sm:flex-row items-center gap-2 p-3 sm:p-4 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <div className="font-medium whitespace-nowrap">
                <span className="hidden lg:inline">Current Financial Portfolio & Analysis</span>
                <span className="hidden sm:inline lg:hidden">Portfolio Analysis</span>
                <span className="sm:hidden">Portfolio</span>
              </div>
              {portfolioData.entries.length > 0 && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {portfolioData.entries.length} investments
                </Badge>
              )}
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="goals"
            className="flex flex-col sm:flex-row items-center gap-2 p-3 sm:p-4 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <Target className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <div className="font-medium whitespace-nowrap">
                <span className="hidden lg:inline">Goal & Projection Planner</span>
                <span className="hidden sm:inline lg:hidden">Goal Planner</span>
                <span className="sm:hidden">Goals</span>
              </div>
              <Badge variant="outline" className="mt-1 text-xs">
                Coming Soon
              </Badge>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="advisory"
            className="flex flex-col sm:flex-row items-center gap-2 p-3 sm:p-4 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <div className="font-medium whitespace-nowrap">
                <span className="hidden lg:inline">Fund Management / Advisory</span>
                <span className="hidden sm:inline lg:hidden">Advisory</span>
                <span className="sm:hidden">Advisory</span>
              </div>
              <Badge variant="outline" className="mt-1 text-xs">
                Coming Soon
              </Badge>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <div className="mt-6">
          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioAnalysis onDataUpdate={handlePortfolioDataUpdate} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="border-2 border-dashed border-gray-200">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Goal & Projection Planner</CardTitle>
                <p className="text-gray-600 max-w-md mx-auto">
                  Set financial goals, create investment projections, and track your progress towards achieving them
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-blue-900">Timeline Planning</div>
                      <div className="text-blue-700">Set target dates for goals</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-green-900">Growth Projections</div>
                      <div className="text-green-700">Forecast portfolio growth</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-purple-900">Asset Allocation</div>
                      <div className="text-purple-700">Optimize investment mix</div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Coming Soon</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    We're building advanced goal planning tools with Monte Carlo simulations, risk-adjusted projections,
                    and personalized recommendations.
                  </p>
                </div>

                <Button variant="outline" disabled className="mx-auto bg-transparent">
                  <Target className="h-4 w-4 mr-2" />
                  Set Financial Goals
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advisory" className="space-y-6">
            <Card className="border-2 border-dashed border-gray-200">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Fund Management / Advisory</CardTitle>
                <p className="text-gray-600 max-w-md mx-auto">
                  Professional investment advisory services and personalized fund management solutions
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <Star className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-green-900">Expert Advisory</div>
                      <div className="text-green-700">Professional guidance</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-blue-900">Portfolio Management</div>
                      <div className="text-blue-700">Active fund management</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-purple-900">Performance Tracking</div>
                      <div className="text-purple-700">Regular monitoring</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Coming Soon</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Professional advisory services with certified financial planners, personalized investment
                    strategies, and ongoing portfolio management.
                  </p>
                </div>

                <Button variant="outline" disabled className="mx-auto bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Connect with Advisor
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
