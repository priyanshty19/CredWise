import { submitToGoogleSheets, type SubmissionData } from "./google-apps-script-submission"

interface UserSubmission {
  creditScore: number
  monthlyIncome: number
  cardType: string
  preferredBrand?: string
  maxJoiningFee?: number
  topN: number
  timestamp: string
  userAgent?: string
  ipAddress?: string
  submissionType: "basic" | "enhanced"
}

// Google Sheets configuration for submissions
const SUBMISSIONS_SHEET_ID = "1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw"
const SUBMISSIONS_TAB_NAME = "Sheet1"
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

export class SubmissionTracker {
  async trackRecommendation(data: SubmissionData): Promise<boolean> {
    try {
      const result = await submitToGoogleSheets(data)
      return result.success
    } catch (error) {
      console.error("Failed to track recommendation:", error)
      return false
    }
  }

  async getSubmissionStats(): Promise<{
    totalSubmissions: number
    avgIncome: number
    popularCategories: Record<string, number>
    popularBanks: Record<string, number>
  } | null> {
    // This would fetch from your Google Sheets or database
    // For now, return null to indicate no data available
    return null
  }
}

export const submissionTracker = new SubmissionTracker()

// New function to verify if the submission actually made it to the sheet
async function verifySubmissionInSheet(submission: UserSubmission): Promise<boolean> {
  try {
    console.log("🔍 Verifying submission in Google Sheet...")

    if (!API_KEY) {
      console.warn("⚠️ Cannot verify submission - no API key")
      return false
    }

    // Wait a moment for the data to be written
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Fetch recent data from the sheet
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SUBMISSIONS_SHEET_ID}/values/${SUBMISSIONS_TAB_NAME}!A:I?key=${API_KEY}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.warn("⚠️ Could not fetch sheet data for verification")
      return false
    }

    const data = await response.json()

    if (!data.values || data.values.length <= 1) {
      console.warn("⚠️ No data in sheet for verification")
      return false
    }

    const [headers, ...rows] = data.values

    // Look for our submission in the last few rows
    const recentRows = rows.slice(-10) // Check last 10 rows

    const submissionFound = recentRows.some((row: any[]) => {
      // Check if this row matches our submission
      const rowCreditScore = Number.parseInt(row[1])
      const rowIncome = Number.parseInt(row[2])
      const rowCardType = row[3]
      const rowTimestamp = row[0]

      // Check if the timestamp is within the last 5 minutes and other fields match
      const rowTime = new Date(rowTimestamp).getTime()
      const submissionTime = new Date(submission.timestamp).getTime()
      const timeDiff = Math.abs(rowTime - submissionTime)

      return (
        timeDiff < 5 * 60 * 1000 && // Within 5 minutes
        rowCreditScore === submission.creditScore &&
        rowIncome === submission.monthlyIncome &&
        rowCardType === submission.cardType
      )
    })

    if (submissionFound) {
      console.log("✅ Submission verified in Google Sheet!")
      return true
    } else {
      console.log("❌ Submission not found in Google Sheet")
      return false
    }
  } catch (error) {
    console.error("❌ Error verifying submission:", error)
    return false
  }
}

// Keep the analytics function unchanged (uses API key for read operations)
export async function getSubmissionAnalytics(): Promise<{
  totalSubmissions: number
  cardTypeDistribution: Record<string, number>
  avgCreditScore: number
  avgIncome: number
  recentSubmissions: any[]
}> {
  try {
    console.log("📊 Fetching submission analytics from Google Sheets...")
    console.log("📋 Sheet ID:", SUBMISSIONS_SHEET_ID)
    console.log("📋 Tab Name:", SUBMISSIONS_TAB_NAME)

    if (!API_KEY) {
      throw new Error("Google Sheets API key is not configured")
    }

    // Fetch all submission data (read operations work with API keys)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SUBMISSIONS_SHEET_ID}/values/${SUBMISSIONS_TAB_NAME}!A:I?key=${API_KEY}`

    console.log("🔗 Fetching analytics from:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    console.log("📡 Analytics response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Analytics fetch error:", errorText)
      throw new Error(`Failed to fetch analytics: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("📊 Raw analytics data:", data)

    if (!data.values || data.values.length <= 1) {
      console.log("📊 No submission data found (only headers or empty sheet)")
      return {
        totalSubmissions: 0,
        cardTypeDistribution: {},
        avgCreditScore: 0,
        avgIncome: 0,
        recentSubmissions: [],
      }
    }

    const [headers, ...rows] = data.values
    console.log("📋 Analytics headers:", headers)
    console.log("📊 Total data rows:", rows.length)

    // Parse the data with better error handling
    const submissions = rows
      .map((row: any[], index: number) => {
        try {
          return {
            timestamp: row[0] || "",
            creditScore: Number.parseInt(row[1]) || 0,
            monthlyIncome: Number.parseInt(row[2]) || 0,
            cardType: row[3] || "",
            preferredBrand: row[4] || "",
            maxJoiningFee: row[5] || "",
            topN: Number.parseInt(row[6]) || 0,
            submissionType: row[7] || "",
            userAgent: row[8] || "",
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing row ${index + 2}:`, error, row)
          return null
        }
      })
      .filter((sub): sub is NonNullable<typeof sub> => sub !== null && sub.creditScore > 0)

    console.log("📊 Parsed submissions:", submissions.length)

    const totalSubmissions = submissions.length

    // Calculate card type distribution
    const cardTypeDistribution = submissions.reduce((acc: Record<string, number>, sub) => {
      if (sub.cardType) {
        acc[sub.cardType] = (acc[sub.cardType] || 0) + 1
      }
      return acc
    }, {})

    // Calculate averages
    const avgCreditScore =
      submissions.length > 0
        ? Math.round(submissions.reduce((sum, sub) => sum + sub.creditScore, 0) / submissions.length)
        : 0

    const avgIncome =
      submissions.length > 0
        ? Math.round(submissions.reduce((sum, sub) => sum + sub.monthlyIncome, 0) / submissions.length)
        : 0

    // Get recent submissions (last 5)
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    const analyticsResult = {
      totalSubmissions,
      cardTypeDistribution,
      avgCreditScore,
      avgIncome,
      recentSubmissions,
    }

    console.log("📊 Analytics calculated:", analyticsResult)

    return analyticsResult
  } catch (error) {
    console.error("❌ Error fetching submission analytics:", error)
    throw error
  }
}
