"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Target, Settings, BarChart3, PieChart, Calendar, DollarSign, Info } from "lucide-react"
import { PortfolioAnalysis } from "./portfolio-analysis"

interface DeepDiveSectionProps {
  className?: string
}

export default function DeepDiveSection({ className }: DeepDiveSectionProps) {
  const [activeTab, setActiveTab] = useState("portfolio")

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Deep Dive Financial Analysis</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive tools to analyze your investments, plan your goals, and manage your funds with AI-powered
          insights.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Portfolio Analysis
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2" disabled>
            <Target className="h-4 w-4" />
            Goal Planner
            <Badge variant="secondary" className="ml-2 text-xs">
              Soon
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="funds" className="flex items-center gap-2" disabled>
            <Settings className="h-4 w-4" />
            Fund Management
            <Badge variant="secondary" className="ml-2 text-xs">
              Soon
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Analysis Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Portfolio Analysis
              </CardTitle>
              <p className="text-gray-600">
                Upload your investment statements from any platform and get comprehensive analysis with AI-powered
                insights.
              </p>
            </CardHeader>
            <CardContent>
              <PortfolioAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goal Planner Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Goal Planner
                <Badge variant="secondary" className="ml-2">
                  Coming Soon
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Financial Goal Planning</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Set and track your financial goals with personalized investment strategies and timeline
                  recommendations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="p-4 border rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium">Timeline Planning</h4>
                    <p className="text-sm text-gray-600">Set target dates for your goals</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-medium">Investment Strategy</h4>
                    <p className="text-sm text-gray-600">Get personalized recommendations</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-medium">Progress Tracking</h4>
                    <p className="text-sm text-gray-600">Monitor your goal achievements</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fund Management Tab */}
        <TabsContent value="funds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Fund Management
                <Badge variant="secondary" className="ml-2">
                  Coming Soon
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Settings className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Advanced Fund Management</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Optimize your mutual fund portfolio with rebalancing suggestions and performance analytics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="p-4 border rounded-lg">
                    <PieChart className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium">Portfolio Rebalancing</h4>
                    <p className="text-sm text-gray-600">Optimize asset allocation</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-medium">Performance Analytics</h4>
                    <p className="text-sm text-gray-600">Detailed fund analysis</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-medium">Risk Assessment</h4>
                    <p className="text-sm text-gray-600">Evaluate portfolio risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Status */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Portfolio Analysis</strong> is now live with universal statement parsing support.
          <strong> Goal Planner</strong> and <strong>Fund Management</strong> features are coming soon with advanced AI
          capabilities.
        </AlertDescription>
      </Alert>
    </div>
  )
}
