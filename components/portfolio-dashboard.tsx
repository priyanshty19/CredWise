"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface PortfolioData {
  totalValue: number
  monthlyChange: number
  yearlyChange: number
  assets: Array<{
    name: string
    value: number
    percentage: number
    change: number
  }>
  goals: Array<{
    name: string
    target: number
    current: number
    deadline: string
  }>
  recommendations: Array<{
    type: string
    title: string
    description: string
    priority: "high" | "medium" | "low"
  }>
}

interface PortfolioDashboardProps {
  data?: PortfolioData | null
}

export default function PortfolioDashboard({ data }: PortfolioDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Handle empty or null data
  if (!data) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Data</h3>
          <p className="text-gray-600">Upload your financial documents to see your portfolio analysis here.</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalValue || 0)}</div>
            <div
              className={`flex items-center text-xs ${(data.monthlyChange || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {(data.monthlyChange || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatPercentage(data.monthlyChange || 0)} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data.monthlyChange || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPercentage(data.monthlyChange || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Compared to previous month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data.yearlyChange || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPercentage(data.yearlyChange || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Year-to-date performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Asset Overview</TabsTrigger>
          <TabsTrigger value="goals">Financial Goals</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.assets || []).map((asset, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{asset.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(asset.value)} ({asset.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={asset.percentage} className="h-2" />
                    </div>
                    <div className={`ml-4 text-sm ${asset.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatPercentage(asset.change)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(data.goals || []).map((goal, index) => {
                  const progress = Math.min((goal.current / goal.target) * 100, 100)
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{goal.name}</span>
                        </div>
                        <Badge variant="outline">{goal.deadline}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                        </span>
                        <span>{progress.toFixed(1)}% complete</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {(data.recommendations || []).map((rec, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        rec.priority === "high"
                          ? "bg-red-100"
                          : rec.priority === "medium"
                            ? "bg-yellow-100"
                            : "bg-green-100"
                      }`}
                    >
                      {rec.priority === "high" ? (
                        <AlertTriangle
                          className={`h-4 w-4 ${rec.priority === "high" ? "text-red-600" : "text-yellow-600"}`}
                        />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge
                          variant={
                            rec.priority === "high"
                              ? "destructive"
                              : rec.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
