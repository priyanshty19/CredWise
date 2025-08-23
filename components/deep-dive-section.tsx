"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  AlertCircle,
  Construction,
  Target,
  Settings,
} from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
}

export default function DeepDiveSection() {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
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
    handleFileUpload(e.dataTransfer.files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔍 Deep Dive Portfolio Analysis</h1>
        <p className="text-gray-600">Comprehensive financial analysis and portfolio management tools</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Current Portfolio Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="handle" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Handle Portfolio
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Current Portfolio Analysis */}
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
                  <p className="text-lg font-medium mb-2">Upload Your Financial Files</p>
                  <p className="text-sm text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supported: Bank statements, Investment reports, Expense sheets (PDF, CSV, Excel)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.csv,.xlsx,.xls"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button className="cursor-pointer">
                      <Plus className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium truncate max-w-48">{file.name}</p>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthly-income">Monthly Income (₹)</Label>
                    <Input id="monthly-income" type="number" placeholder="85,000" />
                  </div>
                  <div>
                    <Label htmlFor="monthly-expenses">Monthly Expenses (₹)</Label>
                    <Input id="monthly-expenses" type="number" placeholder="45,000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="investments">Total Investments (₹)</Label>
                    <Input id="investments" type="number" placeholder="5,00,000" />
                  </div>
                  <div>
                    <Label htmlFor="savings">Monthly Savings (₹)</Label>
                    <Input id="savings" type="number" placeholder="25,000" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="financial-goals">Financial Goals</Label>
                  <Textarea
                    id="financial-goals"
                    placeholder="Describe your financial goals, investment preferences, and risk tolerance..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="spending-categories">Major Spending Categories</Label>
                  <Textarea
                    id="spending-categories"
                    placeholder="List your major spending categories (e.g., Dining: ₹8,000, Groceries: ₹6,000, Fuel: ₹4,000...)"
                    rows={3}
                  />
                </div>

                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manual Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Graphical Insights Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Portfolio Insights & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <PieChart className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-semibold">Spending Distribution</h3>
                  <p className="text-sm text-gray-600">Category-wise breakdown</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <h3 className="font-semibold">Growth Trends</h3>
                  <p className="text-sm text-gray-600">Income vs expenses</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <h3 className="font-semibold">Goal Progress</h3>
                  <p className="text-sm text-gray-600">Financial milestones</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Dynamic graphical insights will appear here once you upload your financial documents or enter manual
                  data. Charts will include spending patterns, investment allocation, and personalized recommendations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Construction className="h-16 w-16 mx-auto text-orange-500 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Under Development</h2>
                <p className="text-gray-600 mb-6">
                  This segment will offer insightful trends and personalized recommendations based on your portfolio and
                  financial health.
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Personalized financial insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Spending pattern analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Investment optimization suggestions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Risk assessment and recommendations</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Handle Portfolio */}
        <TabsContent value="handle" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Settings className="h-16 w-16 mx-auto text-blue-500 mb-6" />
                <h2 className="text-2xl font-bold mb-4">Under Development</h2>
                <p className="text-gray-600 mb-6">
                  Here you will be able to manage your portfolio actively with options to adjust investments, track
                  goals, and more.
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Active portfolio management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Investment rebalancing tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Goal tracking and adjustment</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Automated alerts and notifications</span>
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
