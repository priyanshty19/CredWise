"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target, Clock } from "lucide-react"
import type { PortfolioParseResult } from "@/lib/portfolio-parser"

interface PortfolioChartsProps {
  data: PortfolioParseResult
}

export default function PortfolioCharts({ data }: PortfolioChartsProps) {
  const { summary, categoryBreakdown, amcBreakdown, processingTime } = data

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

  const getReturnColor = (returns: number) => {
    if (returns > 0) return "text-green-600"
    if (returns < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getReturnIcon = (returns: number) => {
    if (returns > 0) return <TrendingUp className="h-4 w-4" />
    if (returns < 0) return <TrendingDown className="h-4 w-4" />
    return <Target className="h-4 w-4" />
  }

  // Sort categories and AMCs by invested amount
  const sortedCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b.invested - a.invested)
    .slice(0, 10)

  const sortedAMCs = Object.entries(amcBreakdown)
    .sort(([, a], [, b]) => b.invested - a.invested)
    .slice(0, 10)

  const topHoldings = data.data.sort((a, b) => b.currentValue - a.currentValue).slice(0, 20)

  return (
    <div className="space-y-6">
      {/* Processing Time */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>Processed in {processingTime}ms</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalInvested)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalCurrent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getReturnIcon(summary.totalReturns)}
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className={`text-2xl font-bold ${getReturnColor(summary.totalReturns)}`}>
                  {formatCurrency(summary.totalReturns)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Average XIRR</p>
                <p className={`text-2xl font-bold ${getReturnColor(summary.averageXIRR)}`}>
                  {formatPercentage(summary.averageXIRR)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedCategories.map(([category, data]) => {
              const percentage = (data.invested / summary.totalInvested) * 100
              const returns = data.current - data.invested
              const returnPercentage = data.invested > 0 ? (returns / data.invested) * 100 : 0

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{category}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(data.invested)} • {data.count} investments
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{percentage.toFixed(1)}%</p>
                      <p className={`text-sm ${getReturnColor(returns)}`}>{formatPercentage(returnPercentage)}</p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* AMC Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top 10 AMCs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedAMCs.map(([amc, data]) => {
              const percentage = (data.invested / summary.totalInvested) * 100
              const returns = data.current - data.invested
              const returnPercentage = data.invested > 0 ? (returns / data.invested) * 100 : 0

              return (
                <div key={amc} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{amc}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(data.invested)} • {data.count} funds
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{percentage.toFixed(1)}%</p>
                      <p className={`text-sm ${getReturnColor(returns)}`}>{formatPercentage(returnPercentage)}</p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 20 Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scheme Name</th>
                  <th className="text-left p-2">AMC</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Invested</th>
                  <th className="text-right p-2">Current</th>
                  <th className="text-right p-2">Returns</th>
                  <th className="text-right p-2">XIRR</th>
                </tr>
              </thead>
              <tbody>
                {topHoldings.map((holding, index) => {
                  const returns = holding.currentValue - holding.investedValue
                  const returnPercentage = holding.investedValue > 0 ? (returns / holding.investedValue) * 100 : 0

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{holding.schemeName}</p>
                          <p className="text-xs text-gray-500">{holding.folioNo}</p>
                        </div>
                      </td>
                      <td className="p-2">{holding.amc}</td>
                      <td className="p-2">
                        <Badge variant="secondary" className="text-xs">
                          {holding.category}
                        </Badge>
                      </td>
                      <td className="p-2 text-right">{formatCurrency(holding.investedValue)}</td>
                      <td className="p-2 text-right">{formatCurrency(holding.currentValue)}</td>
                      <td className={`p-2 text-right ${getReturnColor(returns)}`}>
                        {formatCurrency(returns)}
                        <br />
                        <span className="text-xs">({formatPercentage(returnPercentage)})</span>
                      </td>
                      <td className={`p-2 text-right ${getReturnColor(holding.xirr)}`}>
                        {formatPercentage(holding.xirr)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
