// Enhanced Google Sheets submission interface for form data and card clicks
export interface EnhancedFormSubmission {
  timestamp: string
  monthlyIncome: number
  monthlySpending: number
  creditScoreRange: string
  currentCards: string
  spendingCategories: string[]
  preferredBanks: string[]
  joiningFeePreference: string
  submissionType: string
  userAgent?: string
}

export interface CardApplicationClick {
  timestamp: string
  cardName: string
  bankName: string
  cardType: string
  joiningFee: number
  annualFee: number
  rewardRate: string
  submissionType: string
  userAgent?: string
  sessionId?: string
}

// Submit enhanced form data to Google Sheets
export async function submitEnhancedFormData(data: EnhancedFormSubmission): Promise<boolean> {
  try {
    console.log("📝 Submitting enhanced form data:", data)

    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      console.error("❌ Apps Script URL not configured")
      throw new Error("Apps Script URL not configured")
    }

    console.log("🔗 Using Apps Script URL:", appsScriptUrl)

    // Prepare the payload with the correct structure for the 18-column sheet
    const payload = {
      timestamp: data.timestamp,
      monthlyIncome: data.monthlyIncome,
      monthlySpending: data.monthlySpending,
      creditScoreRange: data.creditScoreRange,
      currentCards: data.currentCards,
      spendingCategories: data.spendingCategories.join(", "),
      preferredBanks: data.preferredBanks.join(", "),
      joiningFeePreference: data.joiningFeePreference,
      submissionType: data.submissionType,
      userAgent: data.userAgent || "Unknown",
      // Additional fields for card click data (will be empty for form submissions)
      cardName: "",
      bankName: "",
      cardType: "",
      joiningFee: "",
      annualFee: "",
      rewardRate: "",
      sessionId: "",
      notes: "Enhanced form submission",
    }

    console.log("📦 Payload being sent:", payload)

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("📡 Response status:", response.status)
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ HTTP error response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ Apps Script response:", result)

    return result.success === true
  } catch (error) {
    console.error("❌ Error submitting enhanced form data:", error)
    return false
  }
}

// Track card application clicks
export async function trackCardApplicationClick(data: CardApplicationClick): Promise<boolean> {
  try {
    console.log("🎯 Tracking card application click:", data)

    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      console.error("❌ Apps Script URL not configured")
      throw new Error("Apps Script URL not configured")
    }

    // Prepare the payload with the correct structure for the 18-column sheet
    const payload = {
      timestamp: data.timestamp,
      monthlyIncome: "", // Empty for click tracking
      monthlySpending: "", // Empty for click tracking
      creditScoreRange: "", // Empty for click tracking
      currentCards: "", // Empty for click tracking
      spendingCategories: "", // Empty for click tracking
      preferredBanks: "", // Empty for click tracking
      joiningFeePreference: "", // Empty for click tracking
      submissionType: data.submissionType,
      userAgent: data.userAgent || "Unknown",
      // Card-specific data
      cardName: data.cardName,
      bankName: data.bankName,
      cardType: data.cardType,
      joiningFee: data.joiningFee.toString(),
      annualFee: data.annualFee.toString(),
      rewardRate: data.rewardRate,
      sessionId: data.sessionId || "",
      notes: "Card application click tracking",
    }

    console.log("📦 Click tracking payload:", payload)

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ HTTP error response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ Click tracking response:", result)

    return result.success === true
  } catch (error) {
    console.error("❌ Error tracking card application click:", error)
    return false
  }
}

// Verify Google Sheets submission setup
export async function verifyGoogleSheetsSubmission(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      return {
        success: false,
        message:
          "Apps Script URL not configured. Please add NEXT_PUBLIC_APPS_SCRIPT_URL to your environment variables.",
      }
    }

    // Test with a simple verification payload
    const testPayload = {
      timestamp: new Date().toISOString(),
      monthlyIncome: "50000",
      monthlySpending: "25000",
      creditScoreRange: "750-850",
      currentCards: "1",
      spendingCategories: "dining, fuel",
      preferredBanks: "SBI, American Express",
      joiningFeePreference: "any_amount",
      submissionType: "verification_test",
      userAgent: "Test User Agent",
      cardName: "",
      bankName: "",
      cardType: "",
      joiningFee: "",
      annualFee: "",
      rewardRate: "",
      sessionId: "",
      notes: "Verification test submission",
    }

    console.log("🔍 Testing Google Sheets submission with payload:", testPayload)

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      return {
        success: true,
        message: "Google Sheets submission is working correctly!",
        details: result,
      }
    } else {
      return {
        success: false,
        message: `Google Sheets submission failed: ${result.error || "Unknown error"}`,
        details: result,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Error testing Google Sheets submission: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
    }
  }
}
