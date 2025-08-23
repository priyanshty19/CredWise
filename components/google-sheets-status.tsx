"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { checkGoogleSheetsStatus } from "@/app/actions/google-sheets-actions"

interface StatusResult {
  success: boolean
  message: string
  cardCount?: number
}

export function GoogleSheetsStatus() {
  const [status, setStatus] = useState<StatusResult | null>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const result = await checkGoogleSheetsStatus()
      setStatus(result)
    } catch (error) {
      setStatus({
        success: false,
        message: "Failed to check status",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Sheets Connection Status</CardTitle>
        <CardDescription>Check if the Google Sheets API is working correctly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={checkStatus} disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </Button>
          {status && (
            <Badge variant={status.success ? "default" : "destructive"}>{status.success ? "Connected" : "Error"}</Badge>
          )}
        </div>

        {status && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{status.message}</p>
            {status.cardCount !== undefined && (
              <p className="text-sm">Found {status.cardCount} credit cards in the sheet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
