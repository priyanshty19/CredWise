"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, FileText, DollarSign, TrendingUp, PieChart } from "lucide-react"
import { uploadPortfolioFile, addManualEntry, removePortfolioFile } from "@/app/actions/portfolio-actions"

interface PortfolioFile {
  name: string
  type: string
  data: any[]
  uploadedAt: Date
}

interface ManualEntry {
  id: string
  category: string
  amount: number
  description: string
  date: string
  type: "manual"
}

export default function PortfolioDashboard() {
  const [files, setFiles] = useState<PortfolioFile[]>([])
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([])
  const [isPending, startTransition] = useTransition()
  const [showManualForm, setShowManualForm] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    startTransition(async () => {
      const result = await uploadPortfolioFile(formData)

      if (result.success) {
        const newFile: PortfolioFile = {
          name: result.fileName!,
          type: result.fileType!,
          data: result.data,
          uploadedAt: new Date(),
        }
        setFiles((prev) => [...prev, newFile])
      } else {
        alert(result.error)
      }
    })
  }

  const handleRemoveFile = async (fileName: string) => {
    startTransition(async () => {
      const result = await removePortfolioFile(fileName)

      if (result.success) {
        setFiles((prev) => prev.filter((f) => f.name !== fileName))
      } else {
        alert(result.error)
      }
    })
  }

  const handleManualEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await addManualEntry(formData)

      if (result.success) {
        setManualEntries((prev) => [...prev, result.data])
        setShowManualForm(false)
        event.currentTarget.reset()
      } else {
        alert(result.error)
      }
    })
  }

  const totalFiles = files.length
  const totalEntries = manualEntries.length
  const totalAmount = manualEntries.reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Files Uploaded</p>
                <p className="text-2xl font-bold">{totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Manual Entries</p>
                <p className="text-2xl font-bold">{totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold">{new Set(manualEntries.map((e) => e.category)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Portfolio Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload income, investment, or expense files
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">Supports CSV, Excel, and PDF files</span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={handleFileUpload}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files:</h4>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">Uploaded {file.uploadedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file.name)} disabled={isPending}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Manual Data Entry
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowManualForm(!showManualForm)}>
              {showManualForm ? "Cancel" : "Add Entry"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showManualForm && (
            <form onSubmit={handleManualEntry} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" placeholder="e.g., Salary, Investment, Expense" required />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Brief description" required />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Entry"}
              </Button>
            </form>
          )}

          {/* Manual Entries List */}
          {manualEntries.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Manual Entries:</h4>
              {manualEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{entry.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {entry.category}
                        </Badge>
                        <span>₹{entry.amount.toLocaleString()}</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <PieChart className="mx-auto h-12 w-12 mb-4" />
            <p>Upload files or add manual entries to see graphical insights</p>
            <p className="text-sm mt-2">Charts and analysis will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
