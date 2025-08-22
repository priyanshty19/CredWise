"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  FileText,
  TrendingUp,
  TrendingDown,
  PieChart,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Target,
} from "lucide-react"
import {
  parseUniversalStatement,
  formatCurrency,
  formatPercentage,
  type ParsedPortfolio,
} from "@/lib/universal-statement-parser"

interface PortfolioAnalysisProps {
  onAnalysisComplete?: (analysis: ParsedPortfolio) => void
}

export function PortfolioAnalysis({ onAnalysisComplete }: PortfolioAnalysisProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ParsedPortfolio | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setAnalysis(null)
    }
  }

  const analyzePortfolio = useCallback(async () => {
    if (!file) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const fileContent = await file.text()
      const portfolioAnalysis = parseUniversalStatement(fileContent, file.name)

      if (!portfolioAnalysis.success) {
        throw new Error(portfolioAnalysis.error || "Failed to parse portfolio statement")
      }

      setAnalysis(portfolioAnalysis)
      onAnalysisComplete?.(portfolioAnalysis)
    } catch (err) {
      console.error("Portfolio analysis error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze portfolio")
    } finally {
      setIsAnalyzing(false)
    }
  }, [file, onAnalysisComplete])

  const getPerformanceColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getPerformanceIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4" />
    return <Target className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Portfolio Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="portfolio-file">Select your portfolio statement (CSV, Excel, or text format)</Label>
            <Input
              id="portfolio-file"
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={handleFileChange}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supports statements from Zerodha, Groww, Angel One, ICICI Direct, and other major platforms
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <Button onClick={analyzePortfolio} disabled={!file || isAnalyzing} className="w-full">
            {isAnalyzing ? "Analyzing Portfolio..." : "Analyze Portfolio"}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && analysis.success && (
        <div className="space-y-6">
          {/* Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(analysis.summary.totalValue)}</div>
                  <div className="text-sm text-gray-500">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(analysis.summary.totalInvested)}
                  </div>
                  <div className="text-sm text-gray-500">Total Invested</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPerformanceColor(analysis.summary.totalGainLoss)}`}>
                    {formatCurrency(analysis.summary.totalGainLoss)}
                  </div>
                  <div className="text-sm text-gray-500">Total P&L</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold flex items-center justify-center gap-1 ${getPerformanceColor(analysis.summary.totalGainLossPercentage)}`}
                  >
                    {getPerformanceIcon(analysis.summary.totalGainLossPercentage)}
                    {formatPercentage(analysis.summary.totalGainLossPercentage)}
                  </div>
                  <div className="text-sm text-gray-500">Return %</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Holdings Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Holdings Breakdown ({analysis.holdings.length} holdings)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analysis.holdings.map((holding, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{holding.symbol}</div>
                      <div className="text-sm text-gray-600">
                        {holding.quantity} shares @ {formatCurrency(holding.avgPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(holding.currentValue)}</div>
                      <div
                        className={`text-sm flex items-center gap-1 ${getPerformanceColor(holding.gainLossPercentage)}`}
                      >
                        {getPerformanceIcon(holding.gainLossPercentage)}
                        {formatPercentage(holding.gainLossPercentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Information */}
          {analysis.platform && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Platform Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{analysis.platform}</Badge>
                  <span className="text-sm text-gray-600">Statement format automatically detected and parsed</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Portfolio Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Best Performer</h4>
                  {(() => {
                    const bestPerformer = analysis.holdings.reduce((best, current) =>
                      current.gainLossPercentage > best.gainLossPercentage ? current : best,
                    )
                    return (
                      <div>
                        <div className="font-medium">{bestPerformer.symbol}</div>
                        <div className="text-sm text-green-600">
                          +{formatPercentage(bestPerformer.gainLossPercentage)} (
                          {formatCurrency(bestPerformer.gainLoss)})
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Needs Attention</h4>
                  {(() => {
                    const worstPerformer = analysis.holdings.reduce((worst, current) =>
                      current.gainLossPercentage < worst.gainLossPercentage ? current : worst,
                    )
                    return (
                      <div>
                        <div className="font-medium">{worstPerformer.symbol}</div>
                        <div className="text-sm text-red-600">
                          {formatPercentage(worstPerformer.gainLossPercentage)} (
                          {formatCurrency(worstPerformer.gainLoss)})
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Portfolio Allocation</h4>
                <div className="space-y-2">
                  {analysis.holdings
                    .sort((a, b) => b.currentValue - a.currentValue)
                    .slice(0, 5)
                    .map((holding, index) => {
                      const percentage = (holding.currentValue / analysis.summary.totalValue) * 100
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{holding.symbol}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PortfolioAnalysis
