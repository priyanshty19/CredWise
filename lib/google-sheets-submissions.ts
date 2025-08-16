const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL

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

export async function submitEnhancedFormData(data: EnhancedFormSubmission): Promise<boolean> {
  if (!APPS_SCRIPT_URL) {
    console.warn("⚠️ NEXT_PUBLIC_APPS_SCRIPT_URL not configured")
    return false
  }

  try {
    console.log("📤 Submitting enhanced form data:", data)

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "submitEnhancedForm",
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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("✅ Enhanced form submission successful:", result)
    return true
  } catch (error) {
    console.error("❌ Error submitting enhanced form data:", error)
    return false
  }
}

export async function trackCardApplicationClick(data: CardApplicationClick): Promise<boolean> {
  if (!APPS_SCRIPT_URL) {
    console.warn("⚠️ NEXT_PUBLIC_APPS_SCRIPT_URL not configured")
    return false
  }

  try {
    console.log("🎯 Tracking card application click:", data)

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "trackCardClick",
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
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("✅ Card click tracking successful:", result)
    return true
  } catch (error) {
    console.error("❌ Error tracking card application click:", error)
    return false
  }
}
