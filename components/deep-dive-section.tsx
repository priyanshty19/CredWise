"use client"

import type React from "react"

import { useState, useTransition, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileText,
  X,
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Target,
  Settings,
  Construction,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react"
import { parsePortfolioFile, addManualPortfolioEntry } from "@/app/actions/portfolio-parsing"
import PortfolioCharts from "./portfolio-charts"
import type { PortfolioParseResult, ParsedPortfolioData } from "@/lib/portfolio-parser"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  category: "income" | "investments" | "expenses" | "other"
}

export default function DeepDiveSection() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [parsedData, setParsedData] = useState<PortfolioParseResult | null>(null)
  const [manualEntries, setManualEntries] = useState<ParsedPortfolioData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showManualForm, setShowManualForm] = useState(false)

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const incomeInputRef = useRef<HTMLInputElement>(null)
  const investmentInputRef = useRef<HTMLInputElement>(null)
  const expenseInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (files: FileList | null, category = "other") => {
    if (!files) return

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      category: category as "income" | "investments" | "expenses" | "other",
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const handlePortfolioProcessing = async (file: File) => {
    setError(null)
    setParsedData(null)

    const formData = new FormData()
    formData.append("file", file)

    startTransition(async () => {
      try {
        const result = await parsePortfolioFile(formData)

        if (result.success) {
          setParsedData(result)
        } else {
          setError(result.errors.join(", ") || "Failed to process portfolio file")
        }
      } catch (err) {
        setError("An unexpected error occurred during processing")
        console.error("Processing error:", err)
      }
    })
  }

  const handleManualEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      try {
        const result = await addManualPortfolioEntry(formData)

        if (result.success) {
          setManualEntries((prev) => [...prev, result.data])
          setShowManualForm(false)
          event.currentTarget.reset()
        } else {
          setError(result.error || "Failed to add manual entry")
        }
      } catch (err) {
        setError("An unexpected error occurred while adding manual entry")
        console.error("Manual entry error:", err)
      }
    })
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "income":
        return "bg-green-100 text-green-800"
      case "investments":
        return "bg-blue-100 text-blue-800"
      case "expenses":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileUpload(e.dataTransfer.files)
      // Auto-process if it's a portfolio file
      if (
        file.type.includes("spreadsheet") ||
        file.type.includes("csv") ||
        file.name.toLowerCase().includes("portfolio") ||
        file.name.toLowerCase().endsWith(".xlsx") ||
        file.name.toLowerCase().endsWith(".xls") ||
        file.name.toLowerCase().endsWith(".csv")
      ) {
        handlePortfolioProcessing(file)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      handleFileUpload(e.target.files)
      // Auto-process the file
      handlePortfolioProcessing(file)
    }
  }

  const handleChooseFiles = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Current Portfolio Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="handle" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Handle Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          {/* AI-Powered Analysis Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Powered Portfolio Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Upload your portfolio statements (CSV or Excel format) to get instant analysis including performance
                  metrics, category allocation, AMC distribution, and detailed insights.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Financial Documents
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleChooseFiles}
                >
                  {isPending ? (
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
                      <p className="text-lg font-medium text-blue-700">Processing Portfolio...</p>
                      <p className="text-sm text-gray-500">Analyzing your investment data</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to upload</p>
                      <p className="text-sm text-gray-500 mb-4">Support for CSV and Excel files (Max 10MB each)</p>
                      <Button variant="outline" className="bg-transparent" disabled={isPending}>
                        <Plus className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </>
                  )}
                </div>

                {/* Hidden file inputs */}
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isPending}
                />

                {/* Category-specific Upload Buttons */}
                {!isPending && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        ref={incomeInputRef}
                        type="file"
                        multiple
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          handleFileUpload(e.target.files, "income")
                          if (e.target.files?.[0]) handlePortfolioProcessing(e.target.files[0])
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => incomeInputRef.current?.click()}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Income
                      </Button>
                    </div>
                    <div>
                      <Input
                        ref={investmentInputRef}
                        type="file"
                        multiple
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          handleFileUpload(e.target.files, "investments")
                          if (e.target.files?.[0]) handlePortfolioProcessing(e.target.files[0])
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => investmentInputRef.current?.click()}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Investments
                      </Button>
                    </div>
                    <div>
                      <Input
                        ref={expenseInputRef}
                        type="file"
                        multiple
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => {
                          handleFileUpload(e.target.files, "expenses")
                          if (e.target.files?.[0]) handlePortfolioProcessing(e.target.files[0])
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => expenseInputRef.current?.click()}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Expenses
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Data Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Manual Data Entry
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManualForm(!showManualForm)}
                    disabled={isPending}
                  >
                    {showManualForm ? "Cancel" : "Add Entry"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showManualForm ? (
                  <form onSubmit={handleManualEntry} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="schemeName">Scheme Name *</Label>
                        <Input
                          id="schemeName"
                          name="schemeName"
                          placeholder="e.g., SBI Blue Chip Fund"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amc">AMC *</Label>
                        <Input id="amc" name="amc" placeholder="e.g., SBI Mutual Fund" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Input
                          id="category"
                          name="category"
                          placeholder="e.g., Equity, Debt, Hybrid"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="investedValue">Invested Amount (₹) *</Label>
                        <Input
                          id="investedValue"
                          name="investedValue"
                          type="number"
                          step="0.01"
                          placeholder="50000"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentValue">Current Value (₹) *</Label>
                        <Input
                          id="currentValue"
                          name="currentValue"
                          type="number"
                          step="0.01"
                          placeholder="55000"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="date">Investment Date</Label>
                      <Input id="date" name="date" type="date" className="mt-1" />
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Manual Entry
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthly-income">Monthly Income</Label>
                        <Input id="monthly-income" type="number" placeholder="₹ 50,000" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
                        <Input id="monthly-expenses" type="number" placeholder="₹ 30,000" className="mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="total-investments">Total Investments</Label>
                        <Input id="total-investments" type="number" placeholder="₹ 5,00,000" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="emergency-fund">Emergency Fund</Label>
                        <Input id="emergency-fund" type="number" placeholder="₹ 1,00,000" className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="financial-goals">Financial Goals</Label>
                      <Input
                        id="financial-goals"
                        placeholder="House purchase, retirement planning, etc."
                        className="mt-1"
                      />
                    </div>

                    <Button className="w-full" onClick={() => setShowManualForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manual Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {parsedData && parsedData.success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully processed {parsedData.fileName} with {parsedData.data.length} investments in{" "}
                {parsedData.processingTime}ms
              </AlertDescription>
            </Alert>
          )}

          {/* Manual Entries Display */}
          {manualEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Manual Entries ({manualEntries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {manualEntries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">{entry.schemeName}</p>
                          <p className="text-xs text-gray-500">
                            {entry.amc} • {entry.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{entry.currentValue.toLocaleString()}</p>
                        <p className={`text-xs ${entry.returns >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {entry.returns >= 0 ? "+" : ""}₹{entry.returns.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Uploaded Files ({uploadedFiles.length})
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setUploadedFiles([])}>
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}
                        >
                          {file.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Trigger reprocessing by clicking the file input
                            fileInputRef.current?.click()
                          }}
                          disabled={isPending}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Process
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI-Processed Results */}
          {parsedData && parsedData.success && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioCharts data={parsedData} />
              </CardContent>
            </Card>
          )}

          {/* Placeholder when no data */}
          {!parsedData && !isPending && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Insights & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Placeholder for charts */}
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-700 mb-2">Category Distribution</h3>
                    <p className="text-sm text-gray-500">Upload your portfolio to see category-wise allocation</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-700 mb-2">Performance Analysis</h3>
                    <p className="text-sm text-gray-500">View returns, XIRR, and performance metrics</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-700 mb-2">Investment Insights</h3>
                    <p className="text-sm text-gray-500">Get detailed analysis of your investment portfolio</p>
                  </div>
                </div>

                <Alert className="mt-6">
                  <AlertDescription>
                    Upload your portfolio CSV or Excel file to get instant AI-powered analysis with detailed insights
                    and visualizations.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Construction className="h-10 w-10 text-orange-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Under Development</h2>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Coming Soon</span>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  This segment will offer insightful trends and personalized recommendations based on your portfolio and
                  financial health. Our AI-powered analytics will provide actionable insights to optimize your financial
                  strategy.
                </p>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">What to Expect:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Spending pattern analysis</li>
                    <li>• Investment performance insights</li>
                    <li>• Personalized financial recommendations</li>
                    <li>• Risk assessment and optimization tips</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="handle" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings className="h-10 w-10 text-purple-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Under Development</h2>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">Coming Soon</span>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  Here you will be able to manage your portfolio actively with options to adjust investments, track
                  goals, and more. Take control of your financial future with our comprehensive portfolio management
                  tools.
                </p>

                <div className="mt-8 p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Planned Features:</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Portfolio rebalancing tools</li>
                    <li>• Goal tracking and planning</li>
                    <li>• Investment recommendations</li>
                    <li>• Risk management controls</li>
                    <li>• Automated savings strategies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
