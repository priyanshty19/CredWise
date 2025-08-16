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

interface EnhancedUserSubmission {
  timestamp: string
  monthlyIncome: number
  monthlySpending: number
  creditScoreRange: string
  currentCards: string
  spendingCategories: string[]
  preferredBanks: string[]
  joiningFeePreference: string
  userAgent?: string
  submissionType: "enhanced_form"
}

// Card Application Click Tracking
interface CardApplicationClick {
  timestamp: string
  cardName: string
  bankName: string
  cardType: string
  joiningFee: number
  annualFee: number
  rewardRate: string
  userAgent?: string
  sessionId?: string
  submissionType: "card_application_click"
}

// Google Sheets configuration for submissions
const SUBMISSIONS_SHEET_ID = "1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw"
const SUBMISSIONS_TAB_NAME = "Sheet1"
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

export async function submitUserDataToGoogleSheets(submission: UserSubmission): Promise<boolean> {
  try {
    console.log("📝 Submitting user data via Google Apps Script...")
    console.log("📊 Submission data:", submission)
    console.log("🔗 Apps Script URL:", APPS_SCRIPT_URL)

    if (!APPS_SCRIPT_URL) {
      throw new Error(
        "Google Apps Script URL not configured. Please add NEXT_PUBLIC_APPS_SCRIPT_URL to your environment variables.",
      )
    }

    // Prepare the payload with FIXED structure
    const payload = {
      timestamp: submission.timestamp,
      monthlyIncome: submission.monthlyIncome, // FIXED: was creditScore
      monthlySpending: "", // Empty for basic submissions
      creditScoreRange: submission.creditScore.toString(), // FIXED: convert to string
      currentCards: "", // Empty for basic submissions
      spendingCategories: "", // Empty for basic submissions
      preferredBanks: submission.preferredBrand || "Any", // FIXED: map preferredBrand to preferredBanks
      joiningFeePreference: submission.maxJoiningFee?.toString() || "Any", // FIXED: map maxJoiningFee
      submissionType: submission.submissionType,
      userAgent: submission.userAgent || "Unknown",
    }

    console.log("📦 FIXED Payload being sent:", payload)

    // Submit via Google Apps Script with enhanced error handling
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    })

    console.log("📡 Apps Script response status:", response.status)
    console.log("📡 Apps Script response URL:", response.url)

    // Check if we got redirected (common Apps Script issue)
    const wasRedirected = response.url !== APPS_SCRIPT_URL
    if (wasRedirected) {
      console.warn("⚠️ Apps Script URL redirected from:", APPS_SCRIPT_URL)
      console.warn("⚠️ Apps Script URL redirected to:", response.url)
    }

    const responseText = await response.text()
    console.log("📄 Raw Apps Script response:", responseText)

    // Handle different response scenarios
    if (response.ok) {
      // Try to parse as JSON first
      try {
        const result = JSON.parse(responseText)
        console.log("✅ Apps Script JSON response:", result)

        if (result.success) {
          console.log("✅ Data submitted successfully via Apps Script")
          console.log("📊 New row added at:", result.row)
          return true
        } else {
          console.warn("⚠️ Apps Script returned success=false:", result.error)
          // Even if success=false, if we got a valid JSON response, the data might still be there
          return await verifySubmissionInSheet(submission)
        }
      } catch (parseError) {
        console.warn("⚠️ Apps Script response is not JSON:", parseError)
        console.log("📄 Response text:", responseText)

        // If response is not JSON but status is OK, the data might still be submitted
        if (response.status === 200 || response.status === 302) {
          console.log("🔍 Verifying if data was actually submitted to sheet...")
          return await verifySubmissionInSheet(submission)
        }

        throw new Error(`Apps Script returned non-JSON response: ${responseText.substring(0, 200)}...`)
      }
    } else {
      // Handle error responses
      if (responseText.includes("Moved Temporarily") || responseText.includes("302")) {
        console.warn("⚠️ Apps Script redirect detected, but checking if data was submitted anyway...")

        const dataSubmitted = await verifySubmissionInSheet(submission)
        if (dataSubmitted) {
          console.log("✅ Data was successfully submitted despite redirect error!")
          return true
        }

        throw new Error(
          `Apps Script URL redirect detected. This usually means:\n` +
            `1. Your Apps Script deployment URL has changed\n` +
            `2. The script needs to be redeployed\n` +
            `3. Check your NEXT_PUBLIC_APPS_SCRIPT_URL environment variable\n\n` +
            `Current URL: ${APPS_SCRIPT_URL}\n` +
            `Redirected to: ${response.url}`,
        )
      }

      if (responseText.includes("Authorization required") || responseText.includes("permission")) {
        throw new Error(
          `Apps Script authorization issue:\n` +
            `1. Make sure your Apps Script is deployed as a web app\n` +
            `2. Set "Execute as" to "Me"\n` +
            `3. Set "Who has access" to "Anyone"\n` +
            `4. Redeploy the script if you made changes`,
        )
      }

      throw new Error(`Apps Script submission failed: ${response.status} - ${responseText}`)
    }
  } catch (error) {
    console.error("❌ Error submitting user data via Apps Script:", error)

    // Before throwing the error, let's check if the data was actually submitted
    try {
      console.log("🔍 Final check: Verifying if data was submitted despite error...")
      const dataSubmitted = await verifySubmissionInSheet(submission)
      if (dataSubmitted) {
        console.log("✅ Data was successfully submitted despite the error!")
        return true
      }
    } catch (verifyError) {
      console.warn("⚠️ Could not verify submission in sheet:", verifyError)
    }

    throw error
  }
}

// Enhanced form submission function
export async function submitEnhancedFormData(submission: EnhancedUserSubmission): Promise<boolean> {
  try {
    console.log("📝 Submitting enhanced form data via Google Apps Script...")
    console.log("📊 Enhanced submission data:", submission)

    if (!APPS_SCRIPT_URL) {
      throw new Error(
        "Google Apps Script URL not configured. Please add NEXT_PUBLIC_APPS_SCRIPT_URL to your environment variables.",
      )
    }

    // Prepare the enhanced payload with FIXED structure
    const payload = {
      timestamp: submission.timestamp,
      monthlyIncome: submission.monthlyIncome,
      monthlySpending: submission.monthlySpending,
      creditScoreRange: submission.creditScoreRange,
      currentCards: submission.currentCards,
      spendingCategories: submission.spendingCategories.join(", "), // Convert array to comma-separated string
      preferredBanks: submission.preferredBanks.join(", "), // Convert array to comma-separated string
      joiningFeePreference: submission.joiningFeePreference,
      submissionType: submission.submissionType,
      userAgent: submission.userAgent || "Unknown",
    }

    console.log("📦 Enhanced payload being sent:", payload)

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    })

    console.log("📡 Enhanced form response status:", response.status)

    const responseText = await response.text()
    console.log("📄 Enhanced form response:", responseText)

    if (response.ok) {
      try {
        const result = JSON.parse(responseText)
        if (result.success) {
          console.log("✅ Enhanced form data submitted successfully")
          return true
        }
      } catch (parseError) {
        // If we can't parse JSON but got 200, assume success
        if (response.status === 200) {
          console.log("✅ Enhanced form data submitted (non-JSON response)")
          return true
        }
      }
    }

    console.warn("⚠️ Enhanced form submission may have failed")
    return false
  } catch (error) {
    console.error("❌ Error submitting enhanced form data:", error)
    return false
  }
}

// Card Application Click Tracking Function
export async function trackCardApplicationClick(clickData: CardApplicationClick): Promise<boolean> {
  try {
    console.log("🎯 Tracking card application click via Google Apps Script...")
    console.log("📊 Click data:", clickData)

    if (!APPS_SCRIPT_URL) {
      console.error("❌ Apps Script URL not configured for click tracking")
      return false
    }

    // Prepare the click tracking payload
    const payload = {
      timestamp: clickData.timestamp,
      cardName: clickData.cardName,
      bankName: clickData.bankName,
      cardType: clickData.cardType,
      joiningFee: clickData.joiningFee,
      annualFee: clickData.annualFee,
      rewardRate: clickData.rewardRate,
      submissionType: clickData.submissionType,
      userAgent: clickData.userAgent || "Unknown",
      sessionId: clickData.sessionId || generateSessionId(),
    }

    console.log("📦 Click tracking payload:", payload)

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    })

    console.log("📡 Click tracking response status:", response.status)

    const responseText = await response.text()
    console.log("📄 Click tracking response:", responseText)

    if (response.ok) {
      try {
        const result = JSON.parse(responseText)
        if (result.success) {
          console.log("✅ Card application click tracked successfully")
          return true
        }
      } catch (parseError) {
        // If we can't parse JSON but got 200, assume success
        if (response.status === 200) {
          console.log("✅ Card application click tracked (non-JSON response)")
          return true
        }
      }
    }

    console.warn("⚠️ Card application click tracking may have failed")
    return false
  } catch (error) {
    console.error("❌ Error tracking card application click:", error)
    return false
  }
}

// Helper function to generate a simple session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Function to verify if the submission actually made it to the sheet
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
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SUBMISSIONS_SHEET_ID}/values/${SUBMISSIONS_TAB_NAME}!A:R?key=${API_KEY}`

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
      const rowCreditScore = row[3] // Credit_Score_Range column
      const rowIncome = Number.parseInt(row[1]) // Monthly_Income column
      const rowTimestamp = row[0]

      // Check if the timestamp is within the last 5 minutes and other fields match
      const rowTime = new Date(rowTimestamp).getTime()
      const submissionTime = new Date(submission.timestamp).getTime()
      const timeDiff = Math.abs(rowTime - submissionTime)

      return (
        timeDiff < 5 * 60 * 1000 && // Within 5 minutes
        rowCreditScore === submission.creditScore.toString() &&
        rowIncome === submission.monthlyIncome
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

// Analytics function with enhanced click tracking
export async function getSubmissionAnalytics(): Promise<{
  totalSubmissions: number
  cardTypeDistribution: Record<string, number>
  avgCreditScore: number
  avgIncome: number
  recentSubmissions: any[]
  cardApplicationClicks?: number
  topClickedCards?: Array<{ cardName: string; clicks: number }>
}> {
  try {
    console.log("📊 Fetching submission analytics from Google Sheets...")
    console.log("📋 Sheet ID:", SUBMISSIONS_SHEET_ID)
    console.log("📋 Tab Name:", SUBMISSIONS_TAB_NAME)

    if (!API_KEY) {
      throw new Error("Google Sheets API key is not configured")
    }

    // Fetch all submission data (read operations work with API keys)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SUBMISSIONS_SHEET_ID}/values/${SUBMISSIONS_TAB_NAME}!A:R?key=${API_KEY}`

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
        cardApplicationClicks: 0,
        topClickedCards: [],
      }
    }

    const [headers, ...rows] = data.values
    console.log("📋 Analytics headers:", headers)
    console.log("📊 Total data rows:", rows.length)

    // Separate form submissions from card application clicks
    const formSubmissions = rows.filter((row) => {
      const submissionType = row[15] // Column P: Submission_Type
      return submissionType !== "card_application_click"
    })

    const cardClicks = rows.filter((row) => {
      const submissionType = row[15] // Column P: Submission_Type
      return submissionType === "card_application_click"
    })

    console.log("📊 Form submissions:", formSubmissions.length)
    console.log("🎯 Card application clicks:", cardClicks.length)

    // Parse the form submission data with better error handling
    const submissions = formSubmissions
      .map((row: any[], index: number) => {
        try {
          return {
            timestamp: row[0] || "",
            monthlyIncome: Number.parseInt(row[1]) || 0,
            creditScoreRange: row[3] || "",
            submissionType: row[15] || "",
            userAgent: row[16] || "",
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing form submission row ${index + 2}:`, error, row)
          return null
        }
      })
      .filter((sub): sub is NonNullable<typeof sub> => sub !== null && sub.monthlyIncome > 0)

    // Parse card click data
    const clickAnalytics = cardClicks
      .map((row: any[], index: number) => {
        try {
          return {
            timestamp: row[0] || "",
            cardName: row[8] || "", // Column I: Card_Name
            bankName: row[9] || "", // Column J: Bank_Name
            cardType: row[10] || "", // Column K: Card_Type
            submissionType: row[15] || "",
            userAgent: row[16] || "",
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing card click row ${index + 2}:`, error, row)
          return null
        }
      })
      .filter((click): click is NonNullable<typeof click> => click !== null && click.cardName)

    console.log("📊 Parsed form submissions:", submissions.length)
    console.log("🎯 Parsed card clicks:", clickAnalytics.length)

    const totalSubmissions = submissions.length

    // Calculate card type distribution from credit score ranges
    const cardTypeDistribution = submissions.reduce((acc: Record<string, number>, sub) => {
      if (sub.creditScoreRange) {
        acc[sub.creditScoreRange] = (acc[sub.creditScoreRange] || 0) + 1
      }
      return acc
    }, {})

    // Calculate averages
    const avgIncome =
      submissions.length > 0
        ? Math.round(submissions.reduce((sum, sub) => sum + sub.monthlyIncome, 0) / submissions.length)
        : 0

    // Get recent submissions (last 5)
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    // Calculate top clicked cards
    const cardClickCounts = clickAnalytics.reduce((acc: Record<string, number>, click) => {
      acc[click.cardName] = (acc[click.cardName] || 0) + 1
      return acc
    }, {})

    const topClickedCards = Object.entries(cardClickCounts)
      .map(([cardName, clicks]) => ({ cardName, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    const analyticsResult = {
      totalSubmissions,
      cardTypeDistribution,
      avgCreditScore: 0, // Not applicable with new structure
      avgIncome,
      recentSubmissions,
      cardApplicationClicks: clickAnalytics.length,
      topClickedCards,
    }

    console.log("📊 Analytics calculated:", analyticsResult)

    return analyticsResult
  } catch (error) {
    console.error("❌ Error fetching submission analytics:", error)
    throw error
  }
}

// Export the new interface for use in components
export type { CardApplicationClick }
