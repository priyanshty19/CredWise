"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, IndianRupee, PieChart, BarChart3, Target, Building2 } from "lucide-react"
import type { PortfolioEntry, PortfolioSummary } from "@/app/actions/portfolio-actions"

interface PortfolioDashboardProps {
  portfolioEntries: PortfolioEntry[]
  summary: PortfolioSummary
}

export default function PortfolioDashboard({ portfolioEntries = [], summary }: PortfolioDashboardProps) {
  // Add safety checks for undefined/null values
  const safePortfolioEntries = portfolioEntries || []
  const safeSummary = summary || {
    totalValue: 0,
    totalInvested: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0,
    totalEntries: 0,
    byType: {},
    byBroker: {},
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatPercentage = (percentage: number) => {
    const safePercentage = percentage || 0
    return `${safePercentage >= 0 ? "+" : ""}${safePercentage.toFixed(2)}%`
  }

  // Get top performing investments with safety checks
  const topPerformers =
    safePortfolioEntries.length > 0
      ? [...safePortfolioEntries].sort((a, b) => (b.gainLossPercentage || 0) - (a.gainLossPercentage || 0)).slice(0, 5)
      : []

  // Get worst performing investments with safety checks
  const worstPerformers =
    safePortfolioEntries.length > 0
      ? [...safePortfolioEntries].sort((a, b) => (a.gainLossPercentage || 0) - (b.gainLossPercentage || 0)).slice(0, 5)
      : []

  return (
    <div className="space-y-6">
      {/* Real Data Confirmation */}
      <div className="text-xs text-green-700 bg-green-50 p-3 rounded border border-green-200">
        ✅ <strong>Universal Parser Analysis:</strong> Showing analysis of {safePortfolioEntries.length} actual
        investments parsed from your uploaded files and manual entries
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(safeSummary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Invested: {formatCurrency(safeSummary.totalInvested)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {safeSummary.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${safeSummary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(safeSummary.totalGainLoss)}
            </div>
            <p className={`text-xs ${safeSummary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPercentage(safeSummary.totalGainLossPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeSummary.totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              Across {Object.keys(safeSummary.byBroker || {}).length} platforms
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
              {safeSummary.totalGainLossPercentage >= 0 ? "Good" : "Needs Attention"}
            </div>
            <Progress
              value={Math.min(Math.max((safeSummary.totalGainLossPercentage || 0) + 50, 0), 100)}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Asset Allocation by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(safeSummary.byType || {}).map(([type, data]) => {
              const percentage = safeSummary.totalValue > 0 ? (data.value / safeSummary.totalValue) * 100 : 0
              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{type.replace("_", " ")}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(data.value)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{data.count} investments</span>
                    <span className={data.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(data.gainLoss)}
                    </span>
                  </div>
                </div>
              )
            })}
            {Object.keys(safeSummary.byType || {}).length === 0 && (
              <div className="text-center text-muted-foreground py-4">No portfolio data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Allocation by Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(safeSummary.byBroker || {}).map(([broker, data]) => {
              const percentage = safeSummary.totalValue > 0 ? (data.value / safeSummary.totalValue) * 100 : 0
              return (
                <div key={broker} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{broker}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(data.value)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{data.count} investments</span>
                    <span className={data.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(data.gainLoss)}
                    </span>
                  </div>
                </div>
              )
            })}
            {Object.keys(safeSummary.byBroker || {}).length === 0 && (
              <div className="text-center text-muted-foreground py-4">No platform data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      {safePortfolioEntries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPerformers.map((entry, index) => (
                <div key={entry.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{entry.name}</div>
                    <div className="text-xs text-muted-foreground">{entry.broker || entry.platform || "Manual"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {formatPercentage(entry.gainLossPercentage)}
                    </div>
                    <div className="text-xs text-green-600">{formatCurrency(entry.gainLoss)}</div>
                  </div>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No performance data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {worstPerformers.map((entry, index) => (
                <div key={entry.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{entry.name}</div>
                    <div className="text-xs text-muted-foreground">{entry.broker || entry.platform || "Manual"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">{formatPercentage(entry.gainLossPercentage)}</div>
                    <div className="text-xs text-red-600">{formatCurrency(entry.gainLoss)}</div>
                  </div>
                </div>
              ))}
              {worstPerformers.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No performance data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {safePortfolioEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Portfolio Data</h3>
            <p className="text-muted-foreground">
              Upload your portfolio files or add manual entries to see your investment analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
