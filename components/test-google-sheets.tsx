"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react"

interface CardData {
  cardName: string
  bank: string
  cardType: string
  annualFee: number
  joiningFee: number
  rewardRate: string
  welcomeBonus: string
  minIncome: number
  maxIncome: number
  spendingCategories: string[]
  keyFeatures: string[]
  bestFor: string[]
  rating: number
  status: string
}

export default function TestGoogleSheets() {
  const [isLoading, setIsLoading] = useState(false)
  const [cards, setCards] = useState<CardData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
      const sheetId = process.env.NEXT_PUBLIC_SHEET_ID

      if (!apiKey || !sheetId) {
        throw new Error("Missing API key or Sheet ID in environment variables")
      }

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:O100?key=${apiKey}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.values || data.values.length < 2) {
        throw new Error("No data found in the sheet")
      }

      // Parse the data
      const headers = data.values[0]
      const rows = data.values.slice(1)

      const parsedCards: CardData[] = rows.map((row: string[]) => ({
        cardName: row[0] || "",
        bank: row[1] || "",
        cardType: row[2] || "",
        annualFee: Number.parseInt(row[3]) || 0,
        joiningFee: Number.parseInt(row[4]) || 0,
        rewardRate: row[5] || "",
        welcomeBonus: row[6] || "",
        minIncome: Number.parseInt(row[7]) || 0,
        maxIncome: Number.parseInt(row[8]) || 0,
        spendingCategories: row[9] ? row[9].split(",").map((s) => s.trim()) : [],
        keyFeatures: row[10] ? row[10].split(",").map((s) => s.trim()) : [],
        bestFor: row[11] ? row[11].split(",").map((s) => s.trim()) : [],
        rating: Number.parseFloat(row[12]) || 0,
        status: row[13] || "",
      }))

      setCards(parsedCards.filter((card) => card.cardName && card.status === "Active"))
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Google Sheets Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={testConnection} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Google Sheets Connection"
              )}
            </Button>

            {success && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Connection successful!</span>
              </div>
            )}
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {success && cards.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Found {cards.length} active credit cards</h3>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.slice(0, 6).map((card, index) => (
                  <Card key={index} className="border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{card.cardName}</CardTitle>
                        <Badge variant="secondary">{card.cardType}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{card.bank}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Annual Fee:</span>
                        <span className="font-medium">₹{card.annualFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Reward Rate:</span>
                        <span className="font-medium">{card.rewardRate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rating:</span>
                        <span className="font-medium">{card.rating}/5</span>
                      </div>
                      {card.bestFor.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs text-gray-600 mb-1">Best For:</p>
                          <div className="flex flex-wrap gap-1">
                            {card.bestFor.slice(0, 2).map((category, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {cards.length > 6 && (
                <p className="text-sm text-gray-600 text-center">...and {cards.length - 6} more cards</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
