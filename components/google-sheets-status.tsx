"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface ConnectionStatus {
  sheetsAPI: boolean
  appsScript: boolean
  lastChecked: Date | null
  cardCount: number
  errors: string[]
}

export default function GoogleSheetsStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    sheetsAPI: false,
    appsScript: false,
    lastChecked: null,
    cardCount: 0,
    errors: [],
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkConnections = async () => {
    setIsChecking(true)
    const newStatus: ConnectionStatus = {
      sheetsAPI: false,
      appsScript: false,
      lastChecked: new Date(),
      cardCount: 0,
      errors: [],
    }

    // Test Google Sheets API
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
      const sheetId = process.env.NEXT_PUBLIC_SHEET_ID

      if (!apiKey || !sheetId) {
        newStatus.errors.push("Missing API key or Sheet ID")
      } else {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:O10?key=${apiKey}`
        const response = await fetch(url)

        if (response.ok) {
          const data = await response.json()
          newStatus.sheetsAPI = true
          newStatus.cardCount = data.values ? data.values.length - 1 : 0
        } else {
          newStatus.errors.push(`Sheets API error: ${response.status}`)
        }
      }
    } catch (error) {
      newStatus.errors.push(`Sheets API: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    // Test Apps Script
    try {
      const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

      if (!appsScriptUrl) {
        newStatus.errors.push("Missing Apps Script URL")
      } else {
        const testData = {
          monthlyIncome: 50000,
          spendingCategories: ["Test"],
          preferredBanks: ["Test Bank"],
          maxAnnualFee: 1000,
          cardType: "Test",
          topRecommendation: "Test Card",
          totalRecommendations: 1,
          test: true,
        }

        const response = await fetch(appsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testData),
        })

        if (response.ok) {
          newStatus.appsScript = true
        } else {
          newStatus.errors.push(`Apps Script error: ${response.status}`)
        }
      }
    } catch (error) {
      newStatus.errors.push(`Apps Script: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    setStatus(newStatus)
    setIsChecking(false)
  }

  useEffect(() => {
    checkConnections()
  }, [])

  const getStatusIcon = (isWorking: boolean) => {
    if (isWorking) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (isWorking: boolean) => {
    return <Badge variant={isWorking ? "default" : "destructive"}>{isWorking ? "Connected" : "Failed"}</Badge>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Google Services Status</CardTitle>
            <Button variant="outline" size="sm" onClick={checkConnections} disabled={isChecking}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
              Check Status
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sheets API Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.sheetsAPI)}
              <div>
                <div className="font-medium">Google Sheets API</div>
                <div className="text-sm text-gray-600">
                  {status.sheetsAPI ? `${status.cardCount} cards loaded` : "Connection failed"}
                </div>
              </div>
            </div>
            {getStatusBadge(status.sheetsAPI)}
          </div>

          {/* Apps Script Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.appsScript)}
              <div>
                <div className="font-medium">Google Apps Script</div>
                <div className="text-sm text-gray-600">
                  {status.appsScript ? "Form submissions working" : "Submission failed"}
                </div>
              </div>
            </div>
            {getStatusBadge(status.appsScript)}
          </div>

          {/* Last Checked */}
          {status.lastChecked && (
            <div className="text-sm text-gray-600 text-center">Last checked: {status.lastChecked.toLocaleString()}</div>
          )}

          {/* Errors */}
          {status.errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong className="text-red-700">Issues found:</strong>
                  {status.errors.map((error, index) => (
                    <div key={index} className="text-red-700 text-sm">
                      • {error}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Environment Variables Check */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Environment Variables</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY:</span>
                <Badge variant={process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>NEXT_PUBLIC_APPS_SCRIPT_URL:</span>
                <Badge variant={process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ? "Set" : "Missing"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Google Cloud Console
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://script.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Apps Script
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
