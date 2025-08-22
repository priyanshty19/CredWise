"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import {
  parseUniversalStatement,
  formatCurrency,
  formatPercentage,
  type ParsedPortfolio,
} from "@/lib/universal-statement-parser"
import { parseCSV, parseExcel } from "@/lib/file-parsers"

export function PortfolioAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [portfolio, setPortfolio] = useState<ParsedPortfolio | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const processFile = useCallback(async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      let data: any[][] = []

      if (file.name.endsWith(".csv")) {
        data = await parseCSV(file)
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        data = await parseExcel(file)
      } else {
        throw new Error("Unsupported file format. Please upload CSV or Excel files.")
      }

      const parsedPortfolio = parseUniversalStatement(data, file.name)
      setPortfolio(parsedPortfolio)
      setActiveTab("results")

      console.log("Portfolio parsed successfully:", parsedPortfolio)
    } catch (err) {
      console.error("Error processing file:", err)
      setError(err instanceof Error ? err.message : "Failed to process file")
    } finally {
      setIsLoading(false)
    }
  }, [file])

  const getSupportedPlatforms = () => [
    { name: "Groww", formats: ["CSV", "Excel"], status: "Fully Supported" },
    { name: "Zerodha", formats: ["CSV", "Excel"], status: "Fully Supported" },
    { name: "Angel One", formats: ["CSV", "Excel"], status: "Generic Parser" },
    { name: "HDFC Securities", formats: ["CSV", "Excel"], status: "Generic Parser" },
    { name: "ICICI Direct", formats: ["CSV", "Excel"], status: "Generic Parser" },
    { name: "Other Platforms", formats: ["CSV", "Excel"], status: "Generic Parser" },
  ]

  const renderUploadSection = () => (
    <div className="space-y-6">
      {/* Platform Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Supported Platforms
          </CardTitle>
          <CardDescription>Upload your portfolio statement from any of these platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {getSupportedPlatforms().map((platform) => (
              <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{platform.name}</div>
                  <div className="text-sm text-gray-500">{platform.formats.join(", ")}</div>
                </div>
                <Badge variant={platform.status === "Fully Supported" ? "default" : "secondary"}>
                  {platform.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Portfolio Statement
          </CardTitle>
          <CardDescription>Select your CSV or Excel portfolio statement file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Portfolio Statement File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <Button onClick={processFile} disabled={!file || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Portfolio
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Export Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                1
              </div>
              <div>
                <div className="font-medium">Login to your broker platform</div>
                <div className="text-sm text-gray-600">Access your portfolio or holdings section</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                2
              </div>
              <div>
                <div className="font-medium">Export portfolio data</div>
                <div className="text-sm text-gray-600">Look for "Export", "Download" or "Statement" options</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                3
              </div>
              <div>
                <div className="font-medium">Choose CSV or Excel format</div>
                <div className="text-sm text-gray-600">Select the most detailed format available</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                4
              </div>
              <div>
                <div className="font-medium">Upload and analyze</div>
                <div className="text-sm text-gray-600">Upload the file here for comprehensive analysis</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPortfolioOverview = () => {
    if (!portfolio) return null

    const { summary, platform, parseDate } = portfolio
    const gainColor = summary.totalPnL >= 0 ? "text-green-600" : "text-red-600"
    const gainIcon = summary.totalPnL >= 0 ? TrendingUp : TrendingDown

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Portfolio Overview</h2>
            <p className="text-gray-600">
              Platform: {platform} • Analyzed on {new Date(parseDate).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {portfolio.holdings.length} Holdings
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Invested</div>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalInvested)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Current Value</div>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalCurrent)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total P&L</div>
              <div className={`text-2xl font-bold flex items-center gap-1 ${gainColor}`}>
                {React.createElement(gainIcon, { className: "h-5 w-5" })}
                {formatCurrency(Math.abs(summary.totalPnL))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Returns</div>
              <div className={`text-2xl font-bold ${gainColor}`}>{formatPercentage(summary.totalPnLPercentage)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Stocks</span>
                  <span className="font-medium">{summary.stocksCount} holdings</span>
                </div>
                <Progress
                  value={(summary.stocksCount / (summary.stocksCount + summary.mutualFundsCount)) * 100}
                  className="h-2"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Mutual Funds</span>
                  <span className="font-medium">{summary.mutualFundsCount} holdings</span>
                </div>
                <Progress
                  value={(summary.mutualFundsCount / (summary.stocksCount + summary.mutualFundsCount)) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Holdings */}
        <Card>
          <CardHeader>
            <CardTitle>Top Holdings by Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolio.holdings
                .sort((a, b) => b.currentValue - a.currentValue)
                .slice(0, 5)
                .map((holding, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{holding.name}</div>
                      <div className="text-sm text-gray-600">
                        {holding.type === "stock" ? "Stock" : "Mutual Fund"} • {holding.platform}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(holding.currentValue)}</div>
                      <div className={`text-sm ${holding.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatPercentage(holding.pnlPercentage)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderDetailedHoldings = () => {
    if (!portfolio) return null

    const stocks = portfolio.holdings.filter((h) => h.type === "stock")
    const mutualFunds = portfolio.holdings.filter((h) => h.type === "mutual_fund")

    return (
      <div className="space-y-6">
        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks">Stocks ({stocks.length})</TabsTrigger>
            <TabsTrigger value="mutual-funds">Mutual Funds ({mutualFunds.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-4">
            {stocks.length > 0 ? (
              <div className="space-y-3">
                {stocks.map((stock, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-6 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="font-medium">{stock.name}</div>
                          <div className="text-sm text-gray-600">{stock.symbol || stock.isin}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Quantity</div>
                          <div className="font-medium">{stock.quantity}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Avg Price</div>
                          <div className="font-medium">₹{stock.avgPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Current Value</div>
                          <div className="font-medium">{formatCurrency(stock.currentValue)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">P&L</div>
                          <div className={`font-medium ${stock.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(Math.abs(stock.pnl))}
                            <div className="text-xs">{formatPercentage(stock.pnlPercentage)}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">No stocks found in your portfolio</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mutual-funds" className="space-y-4">
            {mutualFunds.length > 0 ? (
              <div className="space-y-3">
                {mutualFunds.map((fund, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-6 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="font-medium">{fund.name}</div>
                          <div className="text-sm text-gray-600">
                            {fund.category} {fund.folio && `• Folio: ${fund.folio}`}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Units</div>
                          <div className="font-medium">{fund.quantity.toFixed(3)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Avg NAV</div>
                          <div className="font-medium">₹{fund.avgPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Current Value</div>
                          <div className="font-medium">{formatCurrency(fund.currentValue)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">P&L</div>
                          <div className={`font-medium ${fund.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(Math.abs(fund.pnl))}
                            <div className="text-xs">{formatPercentage(fund.pnlPercentage)}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">No mutual funds found in your portfolio</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Statement</TabsTrigger>
          <TabsTrigger value="results" disabled={!portfolio}>
            Portfolio Overview
          </TabsTrigger>
          <TabsTrigger value="holdings" disabled={!portfolio}>
            Detailed Holdings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">{renderUploadSection()}</TabsContent>

        <TabsContent value="results">{renderPortfolioOverview()}</TabsContent>

        <TabsContent value="holdings">{renderDetailedHoldings()}</TabsContent>
      </Tabs>
    </div>
  )
}
