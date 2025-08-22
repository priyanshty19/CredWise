"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Settings, AlertCircle, CheckCircle } from "lucide-react"
import { PortfolioAnalysis } from "./portfolio-analysis"

function DeepDiveSection() {
  const [activeTab, setActiveTab] = useState("portfolio")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Deep Dive Financial Analysis</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive analysis tools for your investment portfolio, financial goals, and fund management
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Portfolio Analysis
              <Badge variant="default" className="ml-2">
                Active
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2" disabled>
              <Target className="h-4 w-4" />
              Goal Planner
              <Badge variant="secondary" className="ml-2">
                Soon
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="funds" className="flex items-center gap-2" disabled>
              <Settings className="h-4 w-4" />
              Fund Management
              <Badge variant="secondary" className="ml-2">
                Soon
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Analysis Tab - ACTIVE */}
          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioAnalysis />
          </TabsContent>

          {/* Goal Planner Tab - COMING SOON */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="border-dashed border-2 border-gray-300">
              <CardHeader className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Goal Planner</CardTitle>
                <CardDescription className="text-lg max-w-md mx-auto">
                  Set and track your financial goals with personalized investment strategies and timeline planning.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-12">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    Coming Soon
                  </div>
                  <p className="text-sm text-gray-500 max-w-lg mx-auto">
                    We're working on advanced goal planning features including SIP calculators, retirement planning, and
                    milestone tracking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fund Management Tab - COMING SOON */}
          <TabsContent value="funds" className="space-y-6">
            <Card className="border-dashed border-2 border-gray-300">
              <CardHeader className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Fund Management</CardTitle>
                <CardDescription className="text-lg max-w-md mx-auto">
                  Advanced portfolio rebalancing, tax optimization, and fund selection tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-12">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    Coming Soon
                  </div>
                  <p className="text-sm text-gray-500 max-w-lg mx-auto">
                    Professional-grade fund management tools including portfolio rebalancing, tax-loss harvesting, and
                    performance attribution analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Preview Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Portfolio Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Universal statement parser</li>
                <li>• Multi-platform support</li>
                <li>• Real-time P&L tracking</li>
                <li>• Asset allocation insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Goal Planning</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• SIP calculators</li>
                <li>• Retirement planning</li>
                <li>• Goal-based investing</li>
                <li>• Timeline optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Fund Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Portfolio rebalancing</li>
                <li>• Tax optimization</li>
                <li>• Performance analysis</li>
                <li>• Risk assessment</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DeepDiveSection
