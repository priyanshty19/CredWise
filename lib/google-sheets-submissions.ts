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

    // Prepare the payload
    const payload = {
      timestamp: submission.timestamp,
      creditScore: submission.creditScore,
      monthlyIncome: submission.monthlyIncome,
      cardType: submission.cardType,
      preferredBrand: submission.preferredBrand || "Any",
      maxJoiningFee: submission.maxJoiningFee?.toString() || "Any",
      topN: submission.topN,
      submissionType: submission.submissionType,
      userAgent: submission.userAgent || "Unknown",
    }

    console.log("📦 Payload being sent:", payload)

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
    console.log("📡 Apps Script response headers:", Object.fromEntries(response.headers.entries()))

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
          // Let's verify by checking the sheet
          return await verifySubmissionInSheet(submission)
        }
      } catch (parseError) {
        console.warn("⚠️ Apps Script response is not JSON:", parseError)
        console.log("📄 Response text:", responseText)

        // If response is not JSON but status is OK, the data might still be submitted
        // This is common when Apps Script doesn't return proper JSON
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

        // Even with redirect errors, data might still be submitted
        // This is a common Apps Script behavior
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
    // This handles cases where the submission works but the response is malformed
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

// NEW: Enhanced form submission function
export async function submitEnhancedFormData(submission: EnhancedUserSubmission): Promise<boolean> {
  try {
    console.log("📝 Submitting enhanced form data via Google Apps Script...")
    console.log("📊 Enhanced submission data:", submission)

    if (!APPS_SCRIPT_URL) {
      throw new Error(
        "Google Apps Script URL not configured. Please add NEXT_PUBLIC_APPS_SCRIPT_URL to your environment variables.",
      )
    }

    // Prepare the enhanced payload
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
