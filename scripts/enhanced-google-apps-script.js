/**
 * Enhanced Google Apps Script for CredWise Card Page
 * Handles form submissions and card application clicks with comprehensive logging
 *
 * Setup Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Replace the default code with this script
 * 3. Run setupCompleteColumnStructure() once to set up the sheet
 * 4. Deploy as web app with execute permissions for "Anyone"
 * 5. Copy the deployment URL to your environment variables
 */

// Declare necessary variables
const google = {} // Declare the google variable to fix the lint error
const ContentService = google.script.runtime.ContentService
const Utilities = google.script.runtime.Utilities
const SpreadsheetApp = google.script.runtime.SpreadsheetApp
const HtmlService = google.script.runtime.HtmlService

// Configuration
const SPREADSHEET_ID = "1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo" // Your Google Sheet ID
const SHEET_NAME = "Form-Submissions" // Sheet tab name
const CARD_CLICKS_TAB = "Card-Clicks"

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  try {
    console.log("📨 Received POST request")

    // Parse the request data
    let data
    try {
      data = JSON.parse(e.postData.contents)
      console.log("📋 Parsed data:", JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error("❌ Error parsing JSON:", parseError)
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid JSON format",
          details: parseError.toString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    // Validate required fields
    if (!data.timestamp || !data.submissionType) {
      console.error("❌ Missing required fields")
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Missing required fields: timestamp and submissionType",
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    // Get or create the spreadsheet and sheet
    const result = setupSheetIfNeeded()
    if (!result.success) {
      console.error("❌ Sheet setup failed:", result.error)
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Sheet setup failed: " + result.error,
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    const sheet = result.sheet

    // Prepare row data for 18-column structure
    const rowData = new Array(18).fill("") // Initialize with empty strings

    // Fill in the data based on column mapping
    rowData[0] = data.timestamp || ""
    rowData[1] = data.monthlyIncome || ""
    rowData[2] = data.monthlySpending || ""
    rowData[3] = data.creditScoreRange || ""
    rowData[4] = data.currentCards || ""
    rowData[5] = data.spendingCategories || ""
    rowData[6] = data.preferredBanks || ""
    rowData[7] = data.joiningFeePreference || ""
    rowData[8] = data.submissionType || ""
    rowData[9] = data.userAgent || ""
    rowData[10] = data.cardName || ""
    rowData[11] = data.bankName || ""
    rowData[12] = data.cardType || ""
    rowData[13] = data.joiningFee || ""
    rowData[14] = data.annualFee || ""
    rowData[15] = data.rewardRate || ""
    rowData[16] = data.sessionId || ""
    rowData[17] = data.additionalData || ""

    console.log("📝 Prepared row data:", rowData)

    // Add the row to the sheet with retry logic
    let success = false
    let lastError = null

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📤 Attempt ${attempt} to append row`)
        sheet.appendRow(rowData)
        console.log("✅ Row appended successfully")
        success = true
        break
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error)
        lastError = error
        if (attempt < 3) {
          Utilities.sleep(1000) // Wait 1 second before retry
        }
      }
    }

    if (!success) {
      console.error("❌ All append attempts failed")
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Failed to append data after 3 attempts",
          details: lastError ? lastError.toString() : "Unknown error",
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    // Return success response
    const response = {
      success: true,
      message: "Data submitted successfully",
      timestamp: new Date().toISOString(),
      submissionType: data.submissionType,
      rowsInSheet: sheet.getLastRow(),
    }

    console.log("✅ Success response:", response)

    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("❌ Unexpected error in doPost:", error)
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Unexpected server error",
        details: error.toString(),
        stack: error.stack,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

/**
 * Setup the sheet with proper structure if it doesn't exist
 */
function setupSheetIfNeeded() {
  try {
    console.log("🔧 Setting up sheet if needed")

    let spreadsheet
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      console.log("📊 Opened spreadsheet:", spreadsheet.getName())
    } catch (error) {
      console.error("❌ Cannot open spreadsheet:", error)
      return {
        success: false,
        error: "Cannot access spreadsheet with ID: " + SPREADSHEET_ID,
      }
    }

    // Get or create the sheet
    let sheet = spreadsheet.getSheetByName(SHEET_NAME)

    if (!sheet) {
      console.log("📋 Creating new sheet:", SHEET_NAME)
      sheet = spreadsheet.insertSheet(SHEET_NAME)
    }

    // Check if headers exist
    const lastRow = sheet.getLastRow()
    console.log("📏 Sheet has", lastRow, "rows")

    if (lastRow === 0) {
      console.log("📝 Adding headers to empty sheet")
      setupCompleteColumnStructure()
    }

    return {
      success: true,
      sheet: sheet,
    }
  } catch (error) {
    console.error("❌ Error in setupSheetIfNeeded:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}

/**
 * Set up the complete 18-column structure
 * Run this function once manually to initialize the sheet
 */
function setupCompleteColumnStructure() {
  try {
    console.log("🚀 Setting up complete 18-column structure...")

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)

    // Set up Form-Submissions sheet
    let formSheet = spreadsheet.getSheetByName(SHEET_NAME)
    if (!formSheet) {
      formSheet = spreadsheet.insertSheet(SHEET_NAME)
    }

    // Clear existing content and set up headers
    formSheet.clear()
    setupFormSubmissionsHeaders(formSheet)

    // Set up Card-Clicks sheet
    let cardClicksSheet = spreadsheet.getSheetByName(CARD_CLICKS_TAB)
    if (!cardClicksSheet) {
      cardClicksSheet = spreadsheet.insertSheet(CARD_CLICKS_TAB)
      setupCardClicksHeaders(cardClicksSheet)
    }

    console.log("✅ Complete column structure set up successfully!")
    console.log("📋 Sheet structure:")
    console.log("   - Form-Submissions: 18 columns (A-R)")
    console.log("   - Card-Clicks: 18 columns (A-R)")
    console.log("   - Supports both form submissions and card clicks")
    console.log("   - Ready for refined scoring algorithm data")

    return {
      success: true,
      message: "Complete column structure set up successfully",
      sheetsCreated: [SHEET_NAME, CARD_CLICKS_TAB],
      columnsSetup: 18,
    }
  } catch (error) {
    console.error("❌ Error setting up column structure:", error)
    return {
      success: false,
      error: "Failed to set up column structure: " + error.message,
    }
  }
}

/**
 * Set up headers for the Form-Submissions sheet (18 columns)
 */
function setupFormSubmissionsHeaders(sheet) {
  const headers = [
    "Timestamp", // A
    "Monthly Income", // B
    "Monthly Spending", // C
    "Credit Score Range", // D
    "Current Cards", // E
    "Spending Categories", // F
    "Preferred Banks", // G
    "Joining Fee Preference", // H
    "Submission Type", // I
    "User Agent", // J
    "Card Name", // K
    "Bank Name", // L
    "Card Type", // M
    "Joining Fee", // N
    "Annual Fee", // O
    "Reward Rate", // P
    "Session ID", // Q
    "Entry Type", // R
  ]

  sheet.getRange(1, 1, 1, headers.length).setValues([headers])

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length)
  headerRange.setFontWeight("bold")
  headerRange.setBackground("#4285f4")
  headerRange.setFontColor("white")

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length)

  console.log("✅ Form-Submissions headers set up with 18 columns")
}

/**
 * Set up headers for the Card-Clicks sheet (18 columns)
 */
function setupCardClicksHeaders(sheet) {
  const headers = [
    "Timestamp", // A
    "Monthly Income", // B
    "Monthly Spending", // C
    "Credit Score Range", // D
    "Current Cards", // E
    "Spending Categories", // F
    "Preferred Banks", // G
    "Joining Fee Preference", // H
    "Submission Type", // I
    "User Agent", // J
    "Card Name", // K
    "Bank Name", // L
    "Card Type", // M
    "Joining Fee", // N
    "Annual Fee", // O
    "Reward Rate", // P
    "Session ID", // Q
    "Entry Type", // R
  ]

  sheet.getRange(1, 1, 1, headers.length).setValues([headers])

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length)
  headerRange.setFontWeight("bold")
  headerRange.setBackground("#4285f4")
  headerRange.setFontColor("white")

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length)

  console.log("✅ Card-Clicks headers set up with 18 columns")
}

/**
 * Test function to verify the script works
 */
function testScriptDirectly() {
  console.log("🧪 Testing script directly")

  const testData = {
    timestamp: new Date().toISOString(),
    monthlyIncome: 100000,
    monthlySpending: 25000,
    creditScoreRange: "750-850",
    currentCards: "3",
    spendingCategories: "dining, shopping, fuel",
    preferredBanks: "SBI, HDFC Bank",
    joiningFeePreference: "any_amount",
    submissionType: "direct_test",
    userAgent: "Test Agent",
    sessionId: "test_session_" + Date.now(),
    additionalData: JSON.stringify({ testRun: true }),
  }

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
    },
  }

  const result = doPost(mockEvent)
  console.log("🧪 Test result:", result.getContent())

  return JSON.parse(result.getContent())
}

/**
 * Test function with card click data
 */
function testCardClickTracking() {
  console.log("🧪 Testing card click tracking")

  const testData = {
    timestamp: new Date().toISOString(),
    monthlyIncome: "",
    monthlySpending: "",
    creditScoreRange: "",
    currentCards: "",
    spendingCategories: "",
    preferredBanks: "",
    joiningFeePreference: "",
    submissionType: "card_application_click",
    userAgent: "Test Agent",
    cardName: "SBI Card CashBack",
    bankName: "SBI",
    cardType: "Cashback",
    joiningFee: 500,
    annualFee: 999,
    rewardRate: "5% cashback",
    sessionId: "click_test_" + Date.now(),
    additionalData: JSON.stringify({ clickTest: true }),
  }

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
    },
  }

  const result = doPost(mockEvent)
  console.log("🧪 Click test result:", result.getContent())

  return JSON.parse(result.getContent())
}

/**
 * Check current sheet structure
 */
function checkSheetStructure() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    const sheet = spreadsheet.getSheetByName(SHEET_NAME)

    if (!sheet) {
      console.log("❌ Sheet does not exist")
      return { exists: false }
    }

    const lastRow = sheet.getLastRow()
    const lastCol = sheet.getLastColumn()

    console.log("📊 Sheet structure:")
    console.log("- Rows:", lastRow)
    console.log("- Columns:", lastCol)

    if (lastRow > 0) {
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
      console.log("- Headers:", headers)

      if (lastRow > 1) {
        const sampleData = sheet.getRange(2, 1, Math.min(3, lastRow - 1), lastCol).getValues()
        console.log("- Sample data:", sampleData)
      }
    }

    return {
      exists: true,
      rows: lastRow,
      columns: lastCol,
      headers: lastRow > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [],
    }
  } catch (error) {
    console.error("❌ Error checking sheet structure:", error)
    return { error: error.toString() }
  }
}

/**
 * Handle GET requests for testing
 */
function doGet(e) {
  const html = `
    <html>
      <body>
        <h2>CredWise Apps Script Status</h2>
        <p>Script is running successfully!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Spreadsheet ID: ${SPREADSHEET_ID}</p>
        <p>Sheet Name: ${SHEET_NAME}</p>
        <hr>
        <p>To test the script, use the testScriptDirectly() function in the Apps Script editor.</p>
      </body>
    </html>
  `

  return HtmlService.createHtmlOutput(html)
}

/**
 * Utility function to get current timestamp in IST
 */
function getCurrentTimestamp() {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset)
  return istTime.toISOString()
}

/**
 * Function to clear all data (keep headers)
 */
function clearAllData() {
  try {
    console.log("🧹 Clearing all data...")

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    const formSheet = spreadsheet.getSheetByName(SHEET_NAME)

    if (formSheet && formSheet.getLastRow() > 1) {
      formSheet.getRange(2, 1, formSheet.getLastRow() - 1, formSheet.getLastColumn()).clear()
      console.log("✅ Form-Submissions data cleared")
    }

    return {
      success: true,
      message: "All data cleared successfully (headers preserved)",
    }
  } catch (error) {
    console.error("❌ Error clearing data:", error)
    return {
      success: false,
      error: "Failed to clear data: " + error.message,
    }
  }
}
