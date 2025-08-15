"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Plus, BarChart3, AlertCircle, CheckCircle, Loader2, X } from "lucide-react"
import { useDropzone } from "react-dropzone"
import PortfolioDashboard from "@/components/portfolio-dashboard"
import { uploadPortfolioFiles, addManualEntry } from "@/app/actions/portfolio-actions"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "completed" | "error"
  data?: any
}

interface ManualEntry {
  id: string
  type: "income" | "expense" | "investment" | "emi" | "obligation"
  category: string
  amount: number
  description: string
  frequency: "monthly" | "quarterly" | "yearly" | "one-time"
  date: string
}

interface PortfolioData {
  totalInvestments: number
  monthlyIncome: number
  monthlyExpenses: number
  netWorth: number
  savingsRate: number
  investments: Array<{
    category: string
    amount: number
    percentage: number
  }>
  expenses: Array<{
    category: string
    amount: number
    percentage: number
  }>
  obligations: Array<{
    type: string
    amount: number
    remaining: number
  }>
}

export default function PortfolioAnalysis() {
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([])
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    type: "expense" as ManualEntry["type"],
    category: "",
    amount: "",
    description: "",
    frequency: "monthly" as ManualEntry["frequency"],
    date: new Date().toISOString().split("T")[0],
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Process files
    for (const file of acceptedFiles) {
      const fileId = newFiles.find((f) => f.name === file.name)?.id
      if (!fileId) continue

      try {
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f)))

        const formData = new FormData()
        formData.append("file", file)

        const result = await uploadPortfolioFiles(formData)

        if (result.success) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "completed",
                    data: result.data,
                  }
                : f,
            ),
          )
        } else {
          setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)))
        }
      } catch (error) {
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)))
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualForm.category || !manualForm.amount || !manualForm.description) {
      return
    }

    const entry: ManualEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type: manualForm.type,
      category: manualForm.category,
      amount: Number.parseFloat(manualForm.amount),
      description: manualForm.description,
      frequency: manualForm.frequency,
      date: manualForm.date,
    }

    try {
      const result = await addManualEntry(entry)
      if (result.success) {
        setManualEntries((prev) => [...prev, entry])
        setManualForm({
          type: "expense",
          category: "",
          amount: "",
          description: "",
          frequency: "monthly",
          date: new Date().toISOString().split("T")[0],
        })
      }
    } catch (error) {
      console.error("Error adding manual entry:", error)
    }
  }

  const generateAnalysis = async () => {
    setIsProcessing(true)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock portfolio data based on uploaded files and manual entries
    const mockData: PortfolioData = {
      totalInvestments: 850000,
      monthlyIncome: 120000,
      monthlyExpenses: 75000,
      netWorth: 1250000,
      savingsRate: 37.5,
      investments: [
        { category: "Mutual Funds", amount: 450000, percentage: 52.9 },
        { category: "Stocks", amount: 250000, percentage: 29.4 },
        { category: "Fixed Deposits", amount: 100000, percentage: 11.8 },
        { category: "Gold", amount: 50000, percentage: 5.9 },
      ],
      expenses: [
        { category: "Housing", amount: 25000, percentage: 33.3 },
        { category: "Food & Dining", amount: 15000, percentage: 20.0 },
        { category: "Transportation", amount: 12000, percentage: 16.0 },
        { category: "Utilities", amount: 8000, percentage: 10.7 },
        { category: "Entertainment", amount: 7000, percentage: 9.3 },
        { category: "Miscellaneous", amount: 8000, percentage: 10.7 },
      ],
      obligations: [
        { type: "Home Loan", amount: 45000, remaining: 2800000 },
        { type: "Car Loan", amount: 18000, remaining: 450000 },
      ],
    }

    setPortfolioData(mockData)
    setIsProcessing(false)
    setShowDashboard(true)
  }

  const hasData = uploadedFiles.some((f) => f.status === "completed") || manualEntries.length > 0

  if (showDashboard && portfolioData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Your Financial Portfolio Analysis</h2>
          <Button variant="outline" onClick={() => setShowDashboard(false)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add More Data
          </Button>
        </div>

        <PortfolioDashboard data={portfolioData} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Statements
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Investment Statements
              </CardTitle>
              <p className="text-gray-600">
                Upload statements from Groww, Zerodha, bank FDs, or other investment platforms
              </p>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop your investment statements here, or click to select files
                    </p>
                    <p className="text-sm text-gray-500">Supports PDF, CSV, Excel files up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Supported Platforms */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Supported Platforms:</p>
                <div className="flex flex-wrap gap-2">
                  {["Groww", "Zerodha", "Angel One", "HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"].map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                        {file.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-orange-600" />}
                        {file.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {file.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                        <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Manual Data Entry
              </CardTitle>
              <p className="text-gray-600">
                Add EMIs, Splitwise data, or other financial information not captured in statements
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Entry Type</Label>
                    <select
                      id="type"
                      value={manualForm.type}
                      onChange={(e) =>
                        setManualForm((prev) => ({
                          ...prev,
                          type: e.target.value as ManualEntry["type"],
                        }))
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="investment">Investment</option>
                      <option value="emi">EMI</option>
                      <option value="obligation">Other Obligation</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={manualForm.category}
                      onChange={(e) =>
                        setManualForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      placeholder="e.g., Housing, Food, Mutual Funds"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={manualForm.amount}
                      onChange={(e) =>
                        setManualForm((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <select
                      id="frequency"
                      value={manualForm.frequency}
                      onChange={(e) =>
                        setManualForm((prev) => ({
                          ...prev,
                          frequency: e.target.value as ManualEntry["frequency"],
                        }))
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={manualForm.description}
                    onChange={(e) =>
                      setManualForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of this entry"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={manualForm.date}
                    onChange={(e) =>
                      setManualForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </form>

              {/* Manual Entries List */}
              {manualEntries.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">Added Entries:</h4>
                  {manualEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                          <span className="font-medium text-gray-900">{entry.category}</span>
                        </div>
                        <p className="text-sm text-gray-600">{entry.description}</p>
                        <p className="text-xs text-gray-500">
                          ₹{entry.amount.toLocaleString()} • {entry.frequency}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setManualEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Analysis Button */}
      {hasData && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ready to Generate Analysis</h3>
                <p className="text-gray-600">
                  You have {uploadedFiles.filter((f) => f.status === "completed").length} processed files and{" "}
                  {manualEntries.length} manual entries
                </p>
              </div>
              <Button onClick={generateAnalysis} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Need help?</strong> Upload your investment statements for automatic analysis, or manually add any
          financial data not captured in statements. We support most major investment platforms and banking formats.
        </AlertDescription>
      </Alert>
    </div>
  )
}
