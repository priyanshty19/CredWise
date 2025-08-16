import { submitFormToGoogleSheets, type FormSubmissionData } from "./google-apps-script-submission"
import { submitViaWebhook, type WebhookSubmissionData } from "./webhook-submission"

export type SubmissionMethod = "google-apps-script" | "webhook" | "both"

export interface SubmissionConfig {
  method: SubmissionMethod
  retryAttempts?: number
  timeout?: number
}

export async function submitFormData(
  data: FormSubmissionData,
  config: SubmissionConfig = { method: "google-apps-script", retryAttempts: 3, timeout: 10000 },
): Promise<{
  success: boolean
  error?: string
  method?: string
  attempts?: number
}> {
  const { method, retryAttempts = 3, timeout = 10000 } = config

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      let result: { success: boolean; error?: string }

      switch (method) {
        case "google-apps-script":
          result = await Promise.race([
            submitFormToGoogleSheets(data),
            new Promise<{ success: boolean; error: string }>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), timeout),
            ),
          ])
          break

        case "webhook":
          const webhookData: WebhookSubmissionData = {
            ...data,
            timestamp: new Date().toISOString(),
          }
          const webhookResult = await Promise.race([
            submitViaWebhook(webhookData),
            new Promise<{ success: boolean; error: string }>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), timeout),
            ),
          ])
          result = {
            success: webhookResult.success,
            error: webhookResult.error,
          }
          break

        case "both":
          // Try both methods, succeed if either works
          const [appsScriptResult, webhookResult2] = await Promise.allSettled([
            submitFormToGoogleSheets(data),
            submitViaWebhook({ ...data, timestamp: new Date().toISOString() }),
          ])

          const appsScriptSuccess = appsScriptResult.status === "fulfilled" && appsScriptResult.value.success
          const webhookSuccess = webhookResult2.status === "fulfilled" && webhookResult2.value.success

          if (appsScriptSuccess || webhookSuccess) {
            return {
              success: true,
              method: appsScriptSuccess ? "google-apps-script" : "webhook",
              attempts: attempt,
            }
          }

          result = {
            success: false,
            error: "Both submission methods failed",
          }
          break

        default:
          return {
            success: false,
            error: "Invalid submission method",
            attempts: attempt,
          }
      }

      if (result.success) {
        return {
          success: true,
          method,
          attempts: attempt,
        }
      }

      // If this is the last attempt, return the error
      if (attempt === retryAttempts) {
        return {
          success: false,
          error: result.error || "Submission failed after all attempts",
          method,
          attempts: attempt,
        }
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    } catch (error) {
      if (attempt === retryAttempts) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          method,
          attempts: attempt,
        }
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }

  return {
    success: false,
    error: "Max retry attempts exceeded",
    method,
    attempts: retryAttempts,
  }
}
