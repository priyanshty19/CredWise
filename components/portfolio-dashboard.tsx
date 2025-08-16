"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, IndianRupee, PieChart, BarChart3, Target, Building2, FileText } from "lucide-react"
import type { PortfolioEntry, PortfolioSummary } from "@/app/actions/portfolio-actions"

interface PortfolioDashboardProps {
  portfolioEntries: PortfolioEntry[]
  summary: PortfolioSummary
}

export default function PortfolioDashboard({ portfolioEntries, summary }: PortfolioDashboardProps) {
  const formatCurrency = (amount: number) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "₹0"
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    if (typeof percentage !== "number" || isNaN(percentage)) {
      return "0.00%"
    }
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  const getPerformanceColor = (percentage: number) => {
    if (typeof percentage !== "number" || isNaN(percentage)) {
      return "text-gray-500"
    }
    return percentage >= 0 ? "text-green-600" : "text-red-600"
  }

  const getPerformanceIcon = (percentage: number) => {
    if (typeof percentage !== "number" || isNaN(percentage)) {
      return <IndianRupee className="h-4 w-4" />
    }
    return percentage >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  // Calculate top performers and losers
  const sortedByPerformance = [...portfolioEntries].sort((a, b) => {
    const aPerf = typeof a.gainLossPercentage === "number" ? a.gainLossPercentage : 0
    const bPerf = typeof b.gainLossPercentage === "number" ? b.gainLossPercentage : 0
    return bPerf - aPerf
  })

  const topPerformers = sortedByPerformance.slice(0, 5)
  const topLosers = sortedByPerformance.slice(-5).reverse()

  // Calculate allocation percentages with null checks
  const typeAllocations = Object.entries(summary?.byType || {}).map(([type, data]) => ({
    type,
    percentage: summary?.totalValue > 0 ? (data.value / summary.totalValue) * 100 : 0,
    ...data,
  }))

  const brokerAllocations = Object.entries(summary?.byBroker || {}).map(([broker, data]) => ({
    broker,
    percentage: summary?.totalValue > 0 ? (data.value / summary.totalValue) * 100 : 0,
    ...data,
  }))

  // Handle case where summary might be null
  if (!summary) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <PieChart className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Portfolio Data</h3>
          <p className="text-gray-500 text-center max-w-md">
            Unable to generate portfolio summary. Please check your data and try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real Data Confirmation */}
      <div className="text-xs text-green-700 bg-green-50 p-3 rounded border border-green-200">
        ✅ <strong>Real Data Analysis:</strong> Showing analysis of {portfolioEntries.length} actual investments from
        your uploaded files and manual entries
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">{summary.totalEntries} investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">Principal amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {getPerformanceIcon(summary.totalGainLossPercentage)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(summary.totalGainLossPercentage)}`}>
              {formatCurrency(summary.totalGainLoss)}
            </div>
            <p className={`text-xs ${getPerformanceColor(summary.totalGainLossPercentage)}`}>
              {formatPercentage(summary.totalGainLossPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalGainLossPercentage >= 0 ? "Good" : "Needs Attention"}
            </div>
            <p className="text-xs text-muted-foreground">Based on overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Asset Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {typeAllocations.map((allocation) => (
                  <div key={allocation.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{allocation.type.replace("_", " ")}</span>
                      <span className="text-sm text-muted-foreground">{allocation.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={allocation.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(allocation.value)}</span>
                      <span className={getPerformanceColor(allocation.gainLoss)}>
                        {formatCurrency(allocation.gainLoss)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Broker Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Broker Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brokerAllocations.map((allocation) => (
                  <div key={allocation.broker} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{allocation.broker}</span>
                      <span className="text-sm text-muted-foreground">{allocation.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={allocation.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{allocation.count} investments</span>
                      <span className={getPerformanceColor(allocation.gainLoss)}>
                        {formatCurrency(allocation.gainLoss)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typeAllocations.map((allocation) => (
                    <div key={allocation.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{allocation.type.replace("_", " ")}</div>
                        <div className="text-sm text-muted-foreground">{allocation.count} investments</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(allocation.value)}</div>
                        <div className="text-sm text-muted-foreground">{allocation.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {brokerAllocations.map((allocation) => (
                    <div key={allocation.broker} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{allocation.broker}</div>
                        <div className="text-sm text-muted-foreground">{allocation.count} investments</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(allocation.value)}</div>
                        <div className={`text-sm ${getPerformanceColor(allocation.gainLoss)}`}>
                          {formatCurrency(allocation.gainLoss)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{entry.name}</div>
                        <div className="text-sm text-muted-foreground">{entry.broker || "Manual Entry"}</div>
                      </div>
                      <div className="text-right ml-2">
                        <div className={`font-medium ${getPerformanceColor(entry.gainLossPercentage)}`}>
                          {formatPercentage(entry.gainLossPercentage)}
                        </div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(entry.gainLoss)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLosers.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{entry.name}</div>
                        <div className="text-sm text-muted-foreground">{entry.broker || "Manual Entry"}</div>
                      </div>
                      <div className="text-right ml-2">
                        <div className={`font-medium ${getPerformanceColor(entry.gainLossPercentage)}`}>
                          {formatPercentage(entry.gainLossPercentage)}
                        </div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(entry.gainLoss)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Holdings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {portfolioEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate">{entry.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {entry.type.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.quantity} units • {entry.broker || "Manual Entry"}
                        {entry.source === "upload" && entry.fileName && (
                          <span className="ml-2">• {entry.fileName}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-medium">{formatCurrency(entry.currentValue)}</div>
                      <div className={`text-sm ${getPerformanceColor(entry.gainLossPercentage)}`}>
                        {formatPercentage(entry.gainLossPercentage)} ({formatCurrency(entry.gainLoss)})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
