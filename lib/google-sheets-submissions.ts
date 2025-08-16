interface FormSubmissionData {
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

interface CardApplicationClick {
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

export type { FormSubmissionData, CardApplicationClick }

export async function submitEnhancedFormData(data: FormSubmissionData): Promise<boolean> {
  try {
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      console.error("❌ Apps Script URL not configured")
      return false
    }

    console.log("📤 Submitting enhanced form data to Google Sheets:", {
      url: appsScriptUrl,
      dataKeys: Object.keys(data),
      timestamp: data.timestamp,
    })

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "form_submission",
        data: {
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
        },
      }),
    })

    if (!response.ok) {
      console.error("❌ HTTP error submitting form data:", response.status, response.statusText)
      return false
    }

    const result = await response.json()
    console.log("📥 Apps Script response for form submission:", result)

    if (result.success) {
      console.log("✅ Enhanced form data submitted successfully")
      return true
    } else {
      console.error("❌ Apps Script returned error for form submission:", result.error)
      return false
    }
  } catch (error) {
    console.error("❌ Error submitting enhanced form data:", error)
    return false
  }
}

export async function trackCardApplicationClick(data: CardApplicationClick): Promise<boolean> {
  try {
    const appsScriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      console.error("❌ Apps Script URL not configured for card click tracking")
      return false
    }

    console.log("📤 Tracking card application click:", {
      url: appsScriptUrl,
      cardName: data.cardName,
      bankName: data.bankName,
      timestamp: data.timestamp,
    })

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "card_click",
        data: {
          timestamp: data.timestamp,
          cardName: data.cardName,
          bankName: data.bankName,
          cardType: data.cardType,
          joiningFee: data.joiningFee,
          annualFee: data.annualFee,
          rewardRate: data.rewardRate,
          submissionType: data.submissionType,
          userAgent: data.userAgent || "Unknown",
          sessionId: data.sessionId || `session_${Date.now()}`,
        },
      }),
    })

    if (!response.ok) {
      console.error("❌ HTTP error tracking card click:", response.status, response.statusText)
      return false
    }

    const result = await response.json()
    console.log("📥 Apps Script response for card click:", result)

    if (result.success) {
      console.log("✅ Card application click tracked successfully")
      return true
    } else {
      console.error("❌ Apps Script returned error for card click:", result.error)
      return false
    }
  } catch (error) {
    console.error("❌ Error tracking card application click:", error)
    return false
  }
}
