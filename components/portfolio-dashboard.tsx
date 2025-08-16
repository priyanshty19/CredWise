"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, IndianRupee, PieChart, BarChart3, Target, Building2 } from "lucide-react"
import type { PortfolioEntry, PortfolioSummary } from "@/app/actions/portfolio-actions"

interface PortfolioDashboardProps {
  portfolioEntries: PortfolioEntry[]
  summary: PortfolioSummary
}

export default function PortfolioDashboard({ portfolioEntries, summary }: PortfolioDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  // Get top performing investments
  const topPerformers = [...portfolioEntries].sort((a, b) => b.gainLossPercentage - a.gainLossPercentage).slice(0, 5)

  // Get worst performing investments
  const worstPerformers = [...portfolioEntries].sort((a, b) => a.gainLossPercentage - b.gainLossPercentage).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Real Data Confirmation */}
      <div className="text-xs text-green-700 bg-green-50 p-3 rounded border border-green-200">
        ✅ <strong>Universal Parser Analysis:</strong> Showing analysis of {portfolioEntries.length} actual investments parsed from your uploaded files and manual entries
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Invested: {formatCurrency(summary.totalInvested)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {summary.totalGainLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(summary.totalGainLoss)}
            </div>
            <p className={`text-xs ${summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPercentage(summary.totalGainLossPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEntries}</div>
            <p className="text-xs text-muted-foreground">Across {Object.keys(summary.byBroker).length} platforms</p>
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
            <Progress value={Math.min(Math.max(summary.totalGainLossPercentage + 50, 0), 100)} className="mt-2" />
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
            {Object.entries(summary.byType).map(([type, data]) => {
              const percentage = (data.value / summary.totalValue) * 100
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
            {Object.entries(summary.byBroker).map(([broker, data]) => {
              const percentage = (data.value / summary.total\
