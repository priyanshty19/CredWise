"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Clock, Target } from "lucide-react"
import type { PortfolioParseResult } from "@/lib/portfolio-parser"

interface PortfolioChartsProps {
  data: PortfolioParseResult
}

export default function PortfolioCharts({ data }: PortfolioChartsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getReturnColor = (returns: number) => {
    if (returns > 0) return "text-green-600"
    if (returns < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getReturnIcon = (returns: number) => {
    if (returns > 0) return <TrendingUp className="h-4 w-4" />
    if (returns < 0) return <TrendingDown className="h-4 w-4" />
    return <DollarSign className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Processing Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Processed in {data.processingTime}ms
        </span>
        <span>{data.data.length} investments found</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalInvested)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalCurrent)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className={`text-2xl font-bold ${getReturnColor(data.summary.totalReturns)}`}>
                  {formatCurrency(data.summary.totalReturns)}
                </p>
              </div>
              {getReturnIcon(data.summary.totalReturns)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average XIRR</p>
                <p className={`text-2xl font-bold ${getReturnColor(data.summary.averageXIRR)}`}>
                  {formatPercentage(data.summary.averageXIRR)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Category Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.categoryBreakdown)
              .sort(([, a], [, b]) => b.current - a.current)
              .map(([category, breakdown]) => {
                const percentage = (breakdown.current / data.summary.totalCurrent) * 100
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{formatCurrency(breakdown.current)}</span>
                        <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Invested: {formatCurrency(breakdown.invested)}</span>
                      <span className={getReturnColor(breakdown.returns)}>
                        Returns: {formatCurrency(breakdown.returns)}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* AMC Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AMC Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.amcBreakdown)
              .sort(([, a], [, b]) => b.current - a.current)
              .slice(0, 10) // Show top 10 AMCs
              .map(([amc, breakdown]) => {
                const percentage = (breakdown.current / data.summary.totalCurrent) * 100
                return (
                  <div key={amc} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{amc}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{formatCurrency(breakdown.current)}</span>
                        <Badge variant="outline" className="text-xs">
                          {breakdown.count} funds
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Scheme Name</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Invested</th>
                  <th className="text-right p-2">Current</th>
                  <th className="text-right p-2">Returns</th>
                  <th className="text-right p-2">XIRR</th>
                </tr>
              </thead>
              <tbody>
                {data.data
                  .sort((a, b) => b.currentValue - a.currentValue)
                  .slice(0, 20) // Show top 20 investments
                  .map((investment, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{investment.schemeName}</div>
                          <div className="text-xs text-gray-500">{investment.amc}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {investment.category}
                        </Badge>
                      </td>
                      <td className="text-right p-2">{formatCurrency(investment.investedValue)}</td>
                      <td className="text-right p-2">{formatCurrency(investment.currentValue)}</td>
                      <td className={`text-right p-2 ${getReturnColor(investment.returns)}`}>
                        {formatCurrency(investment.returns)}
                      </td>
                      <td className={`text-right p-2 ${getReturnColor(investment.xirr)}`}>
                        {formatPercentage(investment.xirr)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {data.data.length > 20 && (
            <div className="text-center text-sm text-gray-500 mt-4">
              Showing top 20 of {data.data.length} investments
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
