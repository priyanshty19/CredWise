"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Target, Users, TrendingUp, Calendar, DollarSign, PieChart, Lightbulb } from "lucide-react"
import PortfolioAnalysis from "@/components/portfolio-analysis"

export default function DeepDiveSection() {
  const [activeTab, setActiveTab] = useState("portfolio")

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            Deep Dive Financial Analysis
          </CardTitle>
          <p className="text-gray-600">
            Comprehensive financial planning tools with portfolio analysis, goal planning, and fund management advisory
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Current Financial Portfolio & Analysis</span>
            <span className="sm:hidden">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Goal & Projection Planner</span>
            <span className="sm:hidden">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="advisory" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Fund Management / Advisory</span>
            <span className="sm:hidden">Advisory</span>
          </TabsTrigger>
        </TabsList>

        {/* Component 1: Portfolio Analysis */}
        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioAnalysis />
        </TabsContent>

        {/* Component 2: Goal & Projection Planner */}
        <TabsContent value="goals" className="space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Goal & Projection Planner
                <Badge variant="secondary" className="ml-2">
                  Coming Soon
                </Badge>
              </CardTitle>
              <p className="text-gray-600">
                Set financial goals, create investment projections, and track your progress towards achieving them
              </p>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Goal Planning</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Plan for retirement, children's education, home purchase, and other life goals with our
                    comprehensive projection tools.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Timeline Planning</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Set target dates and milestones for your financial goals
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Growth Projections</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Calculate future value based on different investment scenarios
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">SIP Calculator</h4>
                    <p className="text-sm text-gray-600 mt-1">Plan systematic investment amounts to reach your goals</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  This feature is under development and will be available soon with advanced goal tracking and
                  projection capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component 3: Fund Management / Advisory */}
        <TabsContent value="advisory" className="space-y-6">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Fund Management / Advisory
                <Badge variant="secondary" className="ml-2">
                  Coming Soon
                </Badge>
              </CardTitle>
              <p className="text-gray-600">
                Get personalized investment advice, fund recommendations, and professional portfolio management services
              </p>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Investment Advisory</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Connect with certified financial advisors and get personalized investment recommendations based on
                    your portfolio and goals.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Smart Recommendations</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      AI-powered fund suggestions based on your risk profile and goals
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Expert Advisory</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      One-on-one consultations with certified financial planners
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Portfolio Rebalancing</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Automated suggestions for maintaining optimal asset allocation
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  This feature will provide access to professional financial advisors and automated investment
                  recommendations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
