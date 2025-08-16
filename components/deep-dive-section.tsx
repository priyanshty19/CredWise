"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Target, Users, Clock } from "lucide-react"
import PortfolioAnalysis from "./portfolio-analysis"
import type { PortfolioEntry, PortfolioSummary } from "@/app/actions/portfolio-actions"

export default function DeepDiveSection() {
  const [portfolioData, setPortfolioData] = useState<{
    entries: PortfolioEntry[]
    summary: PortfolioSummary | null
  }>({
    entries: [],
    summary: null,
  })

  const handlePortfolioUpdate = (entries: PortfolioEntry[], summary: PortfolioSummary) => {
    setPortfolioData({ entries, summary })
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Deep Dive Analysis</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive financial analysis tools to understand your portfolio, plan your goals, and get expert
            guidance
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger
              value="portfolio"
              className="flex flex-col sm:flex-row items-center gap-2 p-3 text-xs sm:text-sm"
            >
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <div className="text-center sm:text-left">
                <div className="font-medium">Portfolio Analysis</div>
                <div className="text-xs text-muted-foreground hidden sm:block">Current holdings & performance</div>
              </div>
              {portfolioData.entries.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {portfolioData.entries.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="planner"
              className="flex flex-col sm:flex-row items-center gap-2 p-3 text-xs sm:text-sm"
            >
              <Target className="h-4 w-4 flex-shrink-0" />
              <div className="text-center sm:text-left">
                <div className="font-medium">Planner</div>
                <div className="text-xs text-muted-foreground hidden sm:block">Financial planning & projections</div>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Soon
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="fund-management"
              className="flex flex-col sm:flex-row items-center gap-2 p-3 text-xs sm:text-sm"
            >
              <Users className="h-4 w-4 flex-shrink-0" />
              <div className="text-center sm:text-left">
                <div className="font-medium">Fund Management</div>
                <div className="text-xs text-muted-foreground hidden sm:block">Expert fund management</div>
              </div>
              <Badge variant="outline" className="ml-auto text-xs">
                Soon
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Analysis Tab */}
          <TabsContent value="portfolio" className="mt-6">
            <PortfolioAnalysis onDataUpdate={handlePortfolioUpdate} />
          </TabsContent>

          {/* Planner Tab */}
          <TabsContent value="planner" className="mt-6">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-orange-600" />
                  Financial Planner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 text-center">
                  <Clock className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-orange-900 mb-4">🚧 Coming Soon</h3>
                  <p className="text-lg text-orange-700 mb-6">
                    Set your financial goals, risk preferences, and get a personalized investment roadmap!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-800 max-w-2xl mx-auto">
                    <div className="space-y-2">
                      <div>• Retirement planning goals</div>
                      <div>• Children's education planning</div>
                      <div>• Home buying targets</div>
                    </div>
                    <div className="space-y-2">
                      <div>• SIP recommendations</div>
                      <div>• Goal progress tracking</div>
                      <div>• Dynamic strategy adjustments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fund Management Tab */}
          <TabsContent value="fund-management" className="mt-6">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Fund Management / Advisory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center">
                  <Clock className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-purple-900 mb-4">🚧 Coming Soon</h3>
                  <p className="text-lg text-purple-700 mb-6">
                    Unlock advanced fund management and personalized advisory services here!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800 max-w-2xl mx-auto">
                    <div className="space-y-2">
                      <div>• Personalized investment advice</div>
                      <div>• Portfolio rebalancing</div>
                      <div>• Tax optimization strategies</div>
                    </div>
                    <div className="space-y-2">
                      <div>• Risk assessment & management</div>
                      <div>• Regular portfolio reviews</div>
                      <div>• Expert fund recommendations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
