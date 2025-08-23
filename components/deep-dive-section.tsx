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
  TrendingUp,
  PieChart,
  Target,
  Settings,
  Info,
  Lightbulb,
  Wrench,
} from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
}

export default function DeepDiveSection() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)

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
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      }
      setUploadedFiles((prev) => [...prev, newFile])
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Current Portfolio Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Handle Portfolio
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Current Portfolio Analysis */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Financial Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Financial Documents</h3>
                  <p className="text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, CSV, Excel (Max 10MB each)</p>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium mb-4">Uploaded Files</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Graphical Insights Placeholder */}
                <div className="border rounded-lg p-8 bg-gray-50">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Graphical Insights</h3>
                    <p className="text-gray-600 mb-4">
                      Upload your financial documents to see dynamic charts and analysis here
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Spending Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Income Trends</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        <span>Category Breakdown</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Data Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Manual Data Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="monthly-income">Monthly Income (₹)</Label>
                    <Input id="monthly-income" type="number" placeholder="50000" />
                  </div>
                  <div>
                    <Label htmlFor="monthly-expenses">Monthly Expenses (₹)</Label>
                    <Input id="monthly-expenses" type="number" placeholder="30000" />
                  </div>
                  <div>
                    <Label htmlFor="savings">Monthly Savings (₹)</Label>
                    <Input id="savings" type="number" placeholder="20000" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="investments">Current Investments (₹)</Label>
                    <Input id="investments" type="number" placeholder="500000" />
                  </div>
                  <div>
                    <Label htmlFor="debt">Outstanding Debt (₹)</Label>
                    <Input id="debt" type="number" placeholder="100000" />
                  </div>
                  <div>
                    <Label htmlFor="credit-score">Credit Score</Label>
                    <Input id="credit-score" type="number" placeholder="750" />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze My Financial Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Financial Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-10 w-10 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Under Development</h3>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  This segment will offer insightful trends and personalized recommendations based on your portfolio and
                  financial health.
                </p>

                <Alert className="max-w-2xl mx-auto">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Coming Soon:</strong> Advanced AI-powered insights including spending pattern analysis,
                    investment optimization suggestions, and personalized financial health scores.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Trend Analysis</h4>
                    <p className="text-xs text-gray-600">Track spending patterns over time</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Goal Tracking</h4>
                    <p className="text-xs text-gray-600">Monitor financial goal progress</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Performance Metrics</h4>
                    <p className="text-xs text-gray-600">Comprehensive financial scoring</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Handle Portfolio */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Portfolio Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wrench className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Under Development</h3>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Here you will be able to manage your portfolio actively with options to adjust investments, track
                  goals, and more.
                </p>

                <Alert className="max-w-2xl mx-auto">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Coming Soon:</strong> Interactive portfolio management tools including asset allocation,
                    rebalancing suggestions, and automated investment tracking.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <PieChart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Asset Allocation</h4>
                    <p className="text-xs text-gray-600">Optimize investment distribution</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Goal Management</h4>
                    <p className="text-xs text-gray-600">Set and track financial goals</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <Settings className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-medium text-sm">Auto Rebalancing</h4>
                    <p className="text-xs text-gray-600">Automated portfolio adjustments</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
