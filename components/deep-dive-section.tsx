"use client"

import type React from "react"

import { useState } from "react"
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
} from "lucide-react"

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
      handleFileUpload(e.dataTransfer.files)
    }
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Financial Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-gray-500 mb-4">Support for PDF, CSV, Excel files (Max 10MB each)</p>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.csv,.xlsx,.xls"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </Label>
                </div>

                {/* Category-specific Upload Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.csv,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e.target.files, "income")}
                      className="hidden"
                      id="income-upload"
                    />
                    <Label htmlFor="income-upload">
                      <Button variant="outline" size="sm" className="w-full cursor-pointer bg-transparent">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Income
                      </Button>
                    </Label>
                  </div>
                  <div>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.csv,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e.target.files, "investments")}
                      className="hidden"
                      id="investments-upload"
                    />
                    <Label htmlFor="investments-upload">
                      <Button variant="outline" size="sm" className="w-full cursor-pointer bg-transparent">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Investments
                      </Button>
                    </Label>
                  </div>
                  <div>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.csv,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e.target.files, "expenses")}
                      className="hidden"
                      id="expenses-upload"
                    />
                    <Label htmlFor="expenses-upload">
                      <Button variant="outline" size="sm" className="w-full cursor-pointer bg-transparent">
                        <FileText className="h-4 w-4 mr-1" />
                        Expenses
                      </Button>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Data Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Manual Data Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manual Data
                </Button>
              </CardContent>
            </Card>
          </div>

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
                      <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Graphical Insights Placeholder */}
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
                  <h3 className="font-medium text-gray-700 mb-2">Expense Distribution</h3>
                  <p className="text-sm text-gray-500">Dynamic chart will appear here based on uploaded data</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-700 mb-2">Income vs Expenses</h3>
                  <p className="text-sm text-gray-500">Monthly comparison chart will be generated automatically</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-gray-700 mb-2">Investment Growth</h3>
                  <p className="text-sm text-gray-500">Portfolio performance tracking and projections</p>
                </div>
              </div>

              {uploadedFiles.length === 0 && (
                <Alert className="mt-6">
                  <AlertDescription>
                    Upload your financial documents or enter manual data to see personalized insights and analytics.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
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
