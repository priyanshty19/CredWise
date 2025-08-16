// Enhanced Google Sheets submission library with comprehensive logging

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

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

export async function submitEnhancedFormData(data: EnhancedFormSubmission): Promise<boolean> {
  try {
    console.log("📝 Submitting enhanced form data to Google Sheets:", data)

    if (!APPS_SCRIPT_URL) {
      console.error("❌ Apps Script URL not configured")
      return false
    }

    // Prepare the payload with proper structure for 18-column sheet
    const payload = {
      timestamp: data.timestamp,
      monthlyIncome: data.monthlyIncome,
      monthlySpending: data.monthlySpending,
      creditScoreRange: data.creditScoreRange,
      currentCards: data.currentCards,
      spendingCategories: Array.isArray(data.spendingCategories)
        ? data.spendingCategories.join(", ")
        : data.spendingCategories,
      preferredBanks: Array.isArray(data.preferredBanks) ? data.preferredBanks.join(", ") : data.preferredBanks,
      joiningFeePreference: data.joiningFeePreference,
      submissionType: data.submissionType,
      userAgent: data.userAgent || "Unknown",
      // Additional fields for 18-column structure
      cardName: "",
      bankName: "",
      cardType: "",
      joiningFee: 0,
      annualFee: 0,
      rewardRate: "",
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      additionalData: JSON.stringify({
        formType: "enhanced_personalization",
        totalCategories: data.spendingCategories?.length || 0,
        totalBanks: data.preferredBanks?.length || 0,
      }),
    }

    console.log("📤 Sending payload to Apps Script:", payload)

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "cors",
    })

    console.log("📡 Apps Script response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Apps Script HTTP error:", response.status, errorText)
      return false
    }

    const result = await response.json()
    console.log("📊 Apps Script response:", result)

    if (result.success) {
      console.log("✅ Enhanced form data submitted successfully")
      return true
    } else {
      console.error("❌ Apps Script returned error:", result.error)
      return false
    }
  } catch (error) {
    console.error("❌ Error submitting enhanced form data:", error)
    return false
  }
}

export async function trackCardApplicationClick(data: CardApplicationClick): Promise<boolean> {
  try {
    console.log("🎯 Tracking card application click:", data)

    if (!APPS_SCRIPT_URL) {
      console.error("❌ Apps Script URL not configured")
      return false
    }

    // Prepare the payload for card click tracking
    const payload = {
      timestamp: data.timestamp,
      monthlyIncome: 0, // Not applicable for clicks
      monthlySpending: 0, // Not applicable for clicks
      creditScoreRange: "", // Not applicable for clicks
      currentCards: "", // Not applicable for clicks
      spendingCategories: "", // Not applicable for clicks
      preferredBanks: "", // Not applicable for clicks
      joiningFeePreference: "", // Not applicable for clicks
      submissionType: data.submissionType,
      userAgent: data.userAgent || "Unknown",
      cardName: data.cardName,
      bankName: data.bankName,
      cardType: data.cardType,
      joiningFee: data.joiningFee,
      annualFee: data.annualFee,
      rewardRate: data.rewardRate,
      sessionId: data.sessionId || `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      additionalData: JSON.stringify({
        clickType: "card_application",
        cardDetails: {
          name: data.cardName,
          bank: data.bankName,
          type: data.cardType,
        },
      }),
    }

    console.log("📤 Sending click tracking payload:", payload)

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "cors",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Click tracking HTTP error:", response.status, errorText)
      return false
    }

    const result = await response.json()
    console.log("📊 Click tracking response:", result)

    return result.success === true
  } catch (error) {
    console.error("❌ Error tracking card application click:", error)
    return false
  }
}

// Test function to verify Apps Script connectivity
export async function testAppsScriptConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!APPS_SCRIPT_URL) {
      return {
        success: false,
        message: "Apps Script URL not configured in environment variables",
      }
    }

    const testPayload = {
      timestamp: new Date().toISOString(),
      monthlyIncome: 50000,
      monthlySpending: 25000,
      creditScoreRange: "750-850",
      currentCards: "2",
      spendingCategories: "dining, shopping",
      preferredBanks: "HDFC Bank",
      joiningFeePreference: "any_amount",
      submissionType: "connection_test",
      userAgent: "Test Agent",
      cardName: "",
      bankName: "",
      cardType: "",
      joiningFee: 0,
      annualFee: 0,
      rewardRate: "",
      sessionId: `test_${Date.now()}`,
      additionalData: JSON.stringify({ testRun: true }),
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
      mode: "cors",
    })

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP Error: ${response.status} - ${await response.text()}`,
      }
    }

    const result = await response.json()

    return {
      success: result.success === true,
      message: result.success ? "Connection successful!" : `Apps Script Error: ${result.error}`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Network Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
