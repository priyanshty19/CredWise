"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
  BarChart3,
  PieChart,
  Loader2,
  FileSpreadsheet,
  Table,
} from "lucide-react"
import {
  parsePortfolioFiles,
  addManualPortfolioEntry,
  type PortfolioEntry,
  type PortfolioSummary,
} from "@/app/actions/portfolio-actions"
import PortfolioDashboard from "./portfolio-dashboard"

interface PortfolioAnalysisProps {
  onDataUpdate?: (entries: PortfolioEntry[], summary: PortfolioSummary) => void
}

export default function PortfolioAnalysis({ onDataUpdate }: PortfolioAnalysisProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null)
  const [uploadStatus, setUploadStatus] = useState<{
    isUploading: boolean
    results: Array<{
      fileName: string
      broker?: string
      count: number
      success: boolean
      error?: string
      detectedTableRange?: string
      sheetName?: string
    }>
    error?: string
  }>({
    isUploading: false,
    results: [],
  })
  const [manualEntryStatus, setManualEntryStatus] = useState<{
    isAdding: boolean
    error?: string
    success?: boolean
  }>({
    isAdding: false,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const files = formData.getAll("files") as File[]

    if (files.length === 0) {
      setUploadStatus({
        isUploading: false,
        results: [],
        error: "Please select at least one file",
      })
      return
    }

    setUploadStatus({ isUploading: true, results: [] })

    try {
      const result = await parsePortfolioFiles(formData)

      if (result.success && result.data && result.summary) {
        setPortfolioEntries((prev) => [...prev, ...result.data])
        setPortfolioSummary(result.summary)
        setActiveTab("dashboard")

        // Notify parent component
        onDataUpdate?.(result.data, result.summary)

        setUploadStatus({
          isUploading: false,
          results: result.processingResults || [],
          error: result.error || undefined,
        })
      } else {
        setUploadStatus({
          isUploading: false,
          results: result.processingResults || [],
          error: result.error || "Failed to parse files",
        })
      }
    } catch (error) {
      setUploadStatus({
        isUploading: false,
        results: [],
        error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    // Reset form
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleManualEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    setManualEntryStatus({ isAdding: true })

    try {
      const result = await addManualPortfolioEntry(formData)

      if (result.success && result.data) {
        const updatedEntries = [...portfolioEntries, result.data]
        setPortfolioEntries(updatedEntries)

        // Recalculate summary with new entry
        const totalInvested = updatedEntries.reduce((sum, entry) => sum + entry.quantity * entry.avgPrice, 0)
        const totalValue = updatedEntries.reduce((sum, entry) => sum + entry.currentValue, 0)
        const totalGainLoss = totalValue - totalInvested
        const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

        const updatedSummary: PortfolioSummary = {
          totalEntries: updatedEntries.length,
          totalInvested,
          totalValue,
          totalGainLoss,
          totalGainLossPercentage,
          byType: {},
          byBroker: {},
        }

        setPortfolioSummary(updatedSummary)
        setManualEntryStatus({ isAdding: false, success: true })

        // Reset form
        event.currentTarget.reset()

        // Clear success message after 3 seconds
        setTimeout(() => {
          setManualEntryStatus({ isAdding: false })
        }, 3000)
      } else {
        setManualEntryStatus({
          isAdding: false,
          error: result.error || "Failed to add entry",
        })
      }
    } catch (error) {
      setManualEntryStatus({
        isAdding: false,
        error: `Failed to add entry: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  const clearUploadStatus = () => {
    setUploadStatus({ isUploading: false, results: [] })
  }

  const clearManualEntryStatus = () => {
    setManualEntryStatus({ isAdding: false })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Files</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Manual</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Analytics</span>
            {portfolioEntries.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {portfolioEntries.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Upload Portfolio Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Supported formats:</strong> CSV and Excel files from major Indian brokers and platforms
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>✅ Zerodha Console exports (.csv/.xlsx)</div>
                  <div>✅ Groww portfolio files (.csv/.xlsx)</div>
                  <div>✅ HDFC Securities holdings (.csv/.xlsx)</div>
                  <div>✅ Angel One portfolio (.csv/.xlsx)</div>
                  <div>✅ Kuvera exports (.csv/.xlsx)</div>
                  <div>✅ Coin (Zerodha MF) exports (.csv/.xlsx)</div>
                  <div>✅ Paytm Money exports (.csv/.xlsx)</div>
                  <div>✅ Generic CSV/Excel formats</div>
                </div>
              </div>

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="files">Select Portfolio Files</Label>
                  <Input
                    ref={fileInputRef}
                    id="files"
                    name="files"
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls"
                    className="mt-1"
                    disabled={uploadStatus.isUploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can select multiple CSV or Excel files to upload at once
                  </p>
                </div>

                <Button type="submit" disabled={uploadStatus.isUploading} className="w-full">
                  {uploadStatus.isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Files...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
              </form>

              {/* Upload Status */}
              {(uploadStatus.results.length > 0 || uploadStatus.error) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Processing Results</h4>
                    <Button variant="ghost" size="sm" onClick={clearUploadStatus}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {uploadStatus.results.map((result, index) => (
                    <Alert
                      key={index}
                      className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {result.fileName}
                            {result.fileName.endsWith(".xlsx") && <FileSpreadsheet className="h-3 w-3" />}
                            {result.sheetName && (
                              <Badge variant="outline" className="text-xs">
                                Sheet: {result.sheetName}
                              </Badge>
                            )}
                          </div>
                          {result.success ? (
                            <div className="text-xs text-green-700 space-y-1">
                              <div>✅ Parsed {result.count} investments</div>
                              {result.broker && <div>📊 Detected: {result.broker}</div>}
                              {result.detectedTableRange && (
                                <div className="flex items-center gap-1">
                                  <Table className="h-3 w-3" />
                                  Data found at: {result.detectedTableRange}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-red-700">
                              ❌ Failed to parse
                              {result.error && `: ${result.error}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}

                  {uploadStatus.error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{uploadStatus.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Enhanced File Format Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Enhanced File Upload Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • <strong>Excel Support:</strong> Now supports .xlsx files with automatic table detection
                  </li>
                  <li>
                    • <strong>Smart Parsing:</strong> Automatically finds your portfolio data even if it's not in the
                    first row
                  </li>
                  <li>
                    • <strong>Multiple Sheets:</strong> For Excel files, we'll scan all sheets to find your holdings
                  </li>
                  <li>
                    • <strong>Flexible Headers:</strong> Works with different column names and formats
                  </li>
                  <li>
                    • <strong>Batch Upload:</strong> Upload multiple files from different brokers at once
                  </li>
                  <li>
                    • <strong>Error Recovery:</strong> If parsing fails, we'll show exactly what went wrong
                  </li>
                </ul>
              </div>

              {/* Supported File Examples */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📋 What We Look For:</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <strong>Required Columns:</strong>
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Investment/Scheme/Fund Name</li>
                    <li>Units/Quantity/Shares</li>
                    <li>NAV/Price/Rate</li>
                    <li>Current Value (optional - we can calculate)</li>
                    <li>Invested Value (optional - we can calculate)</li>
                  </ul>
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Note:</strong> Column names can vary - we automatically detect common variations
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Manual Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Investment Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Reliance Industries"
                      required
                      disabled={manualEntryStatus.isAdding}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required disabled={manualEntryStatus.isAdding}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                        <SelectItem value="etf">ETF</SelectItem>
                        <SelectItem value="bond">Bond</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.001"
                      placeholder="100"
                      required
                      disabled={manualEntryStatus.isAdding}
                    />
                  </div>

                  <div>
                    <Label htmlFor="avgPrice">Average Price (₹)</Label>
                    <Input
                      id="avgPrice"
                      name="avgPrice"
                      type="number"
                      step="0.01"
                      placeholder="2500.00"
                      required
                      disabled={manualEntryStatus.isAdding}
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentPrice">Current Price (₹)</Label>
                    <Input
                      id="currentPrice"
                      name="currentPrice"
                      type="number"
                      step="0.01"
                      placeholder="2750.00"
                      required
                      disabled={manualEntryStatus.isAdding}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={manualEntryStatus.isAdding} className="w-full">
                  {manualEntryStatus.isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Entry...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Portfolio
                    </>
                  )}
                </Button>
              </form>

              {/* Manual Entry Status */}
              {(manualEntryStatus.error || manualEntryStatus.success) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Status</h4>
                    <Button variant="ghost" size="sm" onClick={clearManualEntryStatus}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {manualEntryStatus.success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">Investment added successfully!</AlertDescription>
                    </Alert>
                  )}

                  {manualEntryStatus.error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{manualEntryStatus.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          {portfolioEntries.length > 0 && portfolioSummary ? (
            <PortfolioDashboard portfolioEntries={portfolioEntries} summary={portfolioSummary} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                    <PieChart className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">No Portfolio Data</h3>
                    <p className="text-gray-600 mt-1">
                      Upload your portfolio files or add manual entries to see detailed analytics
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setActiveTab("upload")} variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                    <Button onClick={() => setActiveTab("manual")} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
