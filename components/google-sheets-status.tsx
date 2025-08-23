"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ExternalLink,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react"

interface ConnectionStatus {
  sheetsApi: {
    status: "connected" | "error" | "checking"
    message?: string
    responseTime?: number
  }
  appsScript: {
    status: "connected" | "error" | "checking"
    message?: string
    responseTime?: number
  }
  lastChecked?: Date
}

export default function GoogleSheetsStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    sheetsApi: { status: "checking" },
    appsScript: { status: "checking" },
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkConnections = async () => {
    setIsRefreshing(true)
    setStatus({
      sheetsApi: { status: "checking" },
      appsScript: { status: "checking" },
    })

    // Check Google Sheets API
    const sheetsStartTime = Date.now()
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
      if (!apiKey) {
        throw new Error("API key not configured")
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/values/Sheet1!A1:A1?key=${apiKey}`,
      )

      const sheetsResponseTime = Date.now() - sheetsStartTime

      if (response.ok) {
        setStatus((prev) => ({
          ...prev,
          sheetsApi: {
            status: "connected",
            message: "Google Sheets API is accessible",
            responseTime: sheetsResponseTime,
          },
        }))
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        sheetsApi: {
          status: "error",
          message: error instanceof Error ? error.message : "Connection failed",
          responseTime: Date.now() - sheetsStartTime,
        },
      }))
    }

    // Check Apps Script
    const appsScriptStartTime = Date.now()
    try {
      const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
      if (!appsScriptUrl) {
        throw new Error("Apps Script URL not configured")
      }

      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: true }),
      })

      const appsScriptResponseTime = Date.now() - appsScriptStartTime

      if (response.ok) {
        setStatus((prev) => ({
          ...prev,
          appsScript: {
            status: "connected",
            message: "Apps Script webhook is responding",
            responseTime: appsScriptResponseTime,
          },
        }))
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        appsScript: {
          status: "error",
          message: error instanceof Error ? error.message : "Connection failed",
          responseTime: Date.now() - appsScriptStartTime,
        },
      }))
    }

    setStatus((prev) => ({
      ...prev,
      lastChecked: new Date(),
    }))
    setIsRefreshing(false)
  }

  useEffect(() => {
    checkConnections()
  }, [])

  const getStatusIcon = (status: "connected" | "error" | "checking") => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    }
  }

  const getStatusBadge = (status: "connected" | "error" | "checking") => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "checking":
        return <Badge variant="secondary">Checking...</Badge>
    }
  }

  const overallStatus = status.sheetsApi.status === "connected" && status.appsScript.status === "connected"

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {overallStatus ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              Google Sheets Integration Status
            </div>
            <Button onClick={checkConnections} disabled={isRefreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Status */}
          <Alert className={overallStatus ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {overallStatus ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className={overallStatus ? "text-green-800" : "text-red-800"}>
                {overallStatus
                  ? "✅ All systems operational - ready to receive form submissions"
                  : "❌ Some services are experiencing issues"}
              </div>
            </AlertDescription>
          </Alert>

          {/* Individual Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Sheets API */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Google Sheets API</span>
                </div>
                {getStatusBadge(status.sheetsApi.status)}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.sheetsApi.status)}
                  <span>{status.sheetsApi.message || "Checking connection..."}</span>
                </div>
                {status.sheetsApi.responseTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{status.sheetsApi.responseTime}ms response time</span>
                  </div>
                )}
              </div>
            </div>

            {/* Apps Script */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-medium">Apps Script Webhook</span>
                </div>
                {getStatusBadge(status.appsScript.status)}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.appsScript.status)}
                  <span>{status.appsScript.message || "Checking connection..."}</span>
                </div>
                {status.appsScript.responseTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{status.appsScript.responseTime}ms response time</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Last Checked */}
          {status.lastChecked && (
            <div className="text-xs text-gray-500 text-center">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>
          )}

          {/* Configuration Status */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Configuration Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span>API Key:</span>
                <Badge
                  variant={process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY ? "default" : "destructive"}
                  className="text-xs"
                >
                  {process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Apps Script URL:</span>
                <Badge
                  variant={process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ? "default" : "destructive"}
                  className="text-xs"
                >
                  {process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ? "Set" : "Missing"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
