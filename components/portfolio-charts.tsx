"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, BarChart3, TrendingUp, TrendingDown, DollarSign, Target, Activity } from "lucide-react"

interface PortfolioData {
  summary: {
    total_investments: number
    total_current_value: number
    total_gain_loss: number
    gain_loss_percentage: number
    top_performers: Array<{
      name: string
      gain_loss_percentage: number
    }>
    worst_performers: Array<{
      name: string
      gain_loss_percentage: number
    }>
  }
  holdings: Array<{
    name: string
    quantity: number
    avg_price: number
    current_price: number
    invested_amount: number
    current_value: number
    gain_loss: number
    gain_loss_percentage: number
    allocation_percentage: number
  }>
  sector_allocation: Record<string, number>
  monthly_performance: Array<{
    month: string
    value: number
  }>
}

interface PortfolioChartsProps {
  data: PortfolioData
  processingTime?: number
}

export default function PortfolioCharts({ data, processingTime }: PortfolioChartsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Processing Time Badge */}
      {processingTime && (
        <div className="flex justify-end">
          <Badge variant="secondary" className="text-xs">
            Processed in {processingTime.toFixed(2)}s
          </Badge>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-xl font-bold">{formatCurrency(data.summary.total_investments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-xl font-bold">{formatCurrency(data.summary.total_current_value)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {data.summary.total_gain_loss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-600">Total P&L</p>
                <p
                  className={`text-xl font-bold ${data.summary.total_gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(data.summary.total_gain_loss)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Returns</p>
                <p
                  className={`text-xl font-bold ${data.summary.gain_loss_percentage >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatPercentage(data.summary.gain_loss_percentage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Security</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">Avg Price</th>
                  <th className="text-right p-2">Current Price</th>
                  <th className="text-right p-2">Invested</th>
                  <th className="text-right p-2">Current Value</th>
                  <th className="text-right p-2">P&L</th>
                  <th className="text-right p-2">Returns</th>
                  <th className="text-right p-2">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map((holding, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{holding.name}</td>
                    <td className="p-2 text-right">{holding.quantity.toLocaleString()}</td>
                    <td className="p-2 text-right">₹{holding.avg_price.toFixed(2)}</td>
                    <td className="p-2 text-right">₹{holding.current_price.toFixed(2)}</td>
                    <td className="p-2 text-right">{formatCurrency(holding.invested_amount)}</td>
                    <td className="p-2 text-right">{formatCurrency(holding.current_value)}</td>
                    <td
                      className={`p-2 text-right font-medium ${holding.gain_loss >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(holding.gain_loss)}
                    </td>
                    <td
                      className={`p-2 text-right font-medium ${holding.gain_loss_percentage >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatPercentage(holding.gain_loss_percentage)}
                    </td>
                    <td className="p-2 text-right">{holding.allocation_percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.summary.top_performers.map((performer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-sm">{performer.name}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {formatPercentage(performer.gain_loss_percentage)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Worst Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Underperformers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.summary.worst_performers.map((performer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-sm">{performer.name}</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {formatPercentage(performer.gain_loss_percentage)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Sector Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(data.sector_allocation).map(([sector, percentage]) => (
              <div key={sector} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{sector}</p>
                <p className="text-lg font-bold text-blue-600">{percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.monthly_performance.map((month, index) => (
              <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span className="text-sm font-medium">{month.month}</span>
                <span className="text-sm font-bold">{formatCurrency(month.value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
