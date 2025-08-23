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

// Configuration
const SPREADSHEET_ID = "1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo" // Your Google Sheet ID
const SHEET_NAME = "Form-Submissions" // Sheet tab name

// Declare necessary variables
const SpreadsheetApp = SpreadsheetApp
const ContentService = SpreadsheetApp.newContentService()
const Utilities = SpreadsheetApp.newUtilities()
const HtmlService = SpreadsheetApp.newHtmlService()

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  try {
    console.log("📥 Received POST request:", e.postData.contents)

    const requestData = JSON.parse(e.postData.contents)
    const action = requestData.action
    const data = requestData.data

    console.log("🎯 Action:", action)
    console.log("📊 Data:", data)

    let result

    switch (action) {
      case "submitEnhancedForm":
        result = handleEnhancedFormSubmission(data)
        break
      case "trackCardClick":
        result = handleCardClickTracking(data)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, result: result })).setMimeType(
      ContentService.MimeType.JSON,
    )
  } catch (error) {
    console.error("❌ Error in doPost:", error)
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

function handleEnhancedFormSubmission(data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = spreadsheet.getSheetByName("Enhanced-Form-Submissions")

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet("Enhanced-Form-Submissions")

      // Set up headers
      const headers = [
        "Timestamp",
        "Monthly Income",
        "Monthly Spending",
        "Credit Score Range",
        "Current Cards",
        "Spending Categories",
        "Preferred Banks",
        "Joining Fee Preference",
        "Submission Type",
        "User Agent",
        "Session ID",
        "IP Address",
        "Referrer",
        "Device Type",
        "Browser",
        "OS",
        "Screen Resolution",
        "Additional Data",
      ]

      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold")
      sheet.setFrozenRows(1)
    }

    // Prepare row data
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.monthlyIncome || "",
      data.monthlySpending || "",
      data.creditScoreRange || "",
      data.currentCards || "",
      data.spendingCategories || "",
      data.preferredBanks || "",
      data.joiningFeePreference || "",
      data.submissionType || "enhanced_form",
      data.userAgent || "",
      `session_${Date.now()}`,
      "", // IP Address (not available in Apps Script)
      "", // Referrer
      "", // Device Type
      "", // Browser
      "", // OS
      "", // Screen Resolution
      JSON.stringify(data), // Additional Data
    ]

    // Add the row
    sheet.appendRow(rowData)

    console.log("✅ Enhanced form submission recorded")
    return {
      success: true,
      message: "Enhanced form submission recorded successfully",
      rowsAdded: 1,
    }
  } catch (error) {
    console.error("❌ Error handling enhanced form submission:", error)
    throw error
  }
}

function handleCardClickTracking(data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = spreadsheet.getSheetByName("Card-Click-Tracking")

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet("Card-Click-Tracking")

      // Set up headers
      const headers = [
        "Timestamp",
        "Card Name",
        "Bank Name",
        "Card Type",
        "Joining Fee",
        "Annual Fee",
        "Reward Rate",
        "Submission Type",
        "User Agent",
        "Session ID",
        "IP Address",
        "Referrer",
        "Device Type",
        "Browser",
        "OS",
        "Screen Resolution",
        "Click Source",
        "Additional Data",
      ]

      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold")
      sheet.setFrozenRows(1)
    }

    // Prepare row data
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.cardName || "",
      data.bankName || "",
      data.cardType || "",
      data.joiningFee || 0,
      data.annualFee || 0,
      data.rewardRate || "",
      data.submissionType || "card_application_click",
      data.userAgent || "",
      data.sessionId || `session_${Date.now()}`,
      "", // IP Address
      "", // Referrer
      "", // Device Type
      "", // Browser
      "", // OS
      "", // Screen Resolution
      "recommendation_page", // Click Source
      JSON.stringify(data), // Additional Data
    ]

    // Add the row
    sheet.appendRow(rowData)

    console.log("✅ Card click tracking recorded")
    return {
      success: true,
      message: "Card click tracking recorded successfully",
      rowsAdded: 1,
    }
  } catch (error) {
    console.error("❌ Error handling card click tracking:", error)
    throw error
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
 * Set up the complete column structure
 * Run this function once manually to initialize the sheet
 */
function setupCompleteColumnStructure() {
  try {
    console.log("🔧 Setting up complete column structure...")

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

    // Setup Enhanced Form Submissions sheet
    let enhancedSheet = spreadsheet.getSheetByName("Enhanced-Form-Submissions")
    if (!enhancedSheet) {
      enhancedSheet = spreadsheet.insertSheet("Enhanced-Form-Submissions")
    }

    const enhancedHeaders = [
      "Timestamp",
      "Monthly Income",
      "Monthly Spending",
      "Credit Score Range",
      "Current Cards",
      "Spending Categories",
      "Preferred Banks",
      "Joining Fee Preference",
      "Submission Type",
      "User Agent",
      "Session ID",
      "IP Address",
      "Referrer",
      "Device Type",
      "Browser",
      "OS",
      "Screen Resolution",
      "Additional Data",
    ]

    enhancedSheet.clear()
    enhancedSheet.getRange(1, 1, 1, enhancedHeaders.length).setValues([enhancedHeaders])
    enhancedSheet.getRange(1, 1, 1, enhancedHeaders.length).setFontWeight("bold")
    enhancedSheet.setFrozenRows(1)

    // Setup Card Click Tracking sheet
    let clickSheet = spreadsheet.getSheetByName("Card-Click-Tracking")
    if (!clickSheet) {
      clickSheet = spreadsheet.insertSheet("Card-Click-Tracking")
    }

    const clickHeaders = [
      "Timestamp",
      "Card Name",
      "Bank Name",
      "Card Type",
      "Joining Fee",
      "Annual Fee",
      "Reward Rate",
      "Submission Type",
      "User Agent",
      "Session ID",
      "IP Address",
      "Referrer",
      "Device Type",
      "Browser",
      "OS",
      "Screen Resolution",
      "Click Source",
      "Additional Data",
    ]

    clickSheet.clear()
    clickSheet.getRange(1, 1, 1, clickHeaders.length).setValues([clickHeaders])
    clickSheet.getRange(1, 1, 1, clickHeaders.length).setFontWeight("bold")
    clickSheet.setFrozenRows(1)

    console.log("✅ Complete column structure setup completed")
    return {
      success: true,
      message: "Complete column structure setup completed",
      enhancedSheetColumns: enhancedHeaders.length,
      clickSheetColumns: clickHeaders.length,
    }
  } catch (error) {
    console.error("❌ Error setting up column structure:", error)
    throw error
  }
}

/**
 * Test function to verify the script works
 */
function testScriptDirectly() {
  try {
    console.log("🧪 Testing script directly...")

    // Test enhanced form submission
    const testFormData = {
      timestamp: new Date().toISOString(),
      monthlyIncome: 100000,
      monthlySpending: 25000,
      creditScoreRange: "750-850",
      currentCards: "2",
      spendingCategories: "dining, fuel, grocery",
      preferredBanks: "SBI, HDFC Bank",
      joiningFeePreference: "any_amount",
      submissionType: "test_enhanced_form",
      userAgent: "Test User Agent",
    }

    const formResult = handleEnhancedFormSubmission(testFormData)
    console.log("📝 Form submission test result:", formResult)

    // Test card click tracking
    const testClickData = {
      timestamp: new Date().toISOString(),
      cardName: "SBI Card CashBack",
      bankName: "SBI",
      cardType: "Cashback",
      joiningFee: 500,
      annualFee: 999,
      rewardRate: "5.0%",
      submissionType: "test_card_click",
      userAgent: "Test User Agent",
      sessionId: "test_session_123",
    }

    const clickResult = handleCardClickTracking(testClickData)
    console.log("🎯 Click tracking test result:", clickResult)

    return {
      success: true,
      message: "Direct script test completed successfully",
      formTest: formResult,
      clickTest: clickResult,
    }
  } catch (error) {
    console.error("❌ Error in direct script test:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
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
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    const sheets = spreadsheet.getSheets()

    const sheetInfo = sheets.map((sheet) => {
      const name = sheet.getName()
      const lastRow = sheet.getLastRow()
      const lastColumn = sheet.getLastColumn()

      let headers = []
      if (lastRow > 0 && lastColumn > 0) {
        headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
      }

      return {
        name: name,
        rows: lastRow,
        columns: lastColumn,
        headers: headers,
      }
    })

    console.log("📊 Sheet structure:", sheetInfo)
    return {
      success: true,
      sheets: sheetInfo,
      totalSheets: sheets.length,
    }
  } catch (error) {
    console.error("❌ Error checking sheet structure:", error)
    return {
      success: false,
      error: error.toString(),
    }
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

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    const formSheet = spreadsheet.getSheetByName("Enhanced-Form-Submissions")
    const clickSheet = spreadsheet.getSheetByName("Card-Click-Tracking")

    if (formSheet && formSheet.getLastRow() > 1) {
      formSheet.getRange(2, 1, formSheet.getLastRow() - 1, formSheet.getLastColumn()).clear()
      console.log("✅ Enhanced-Form-Submissions data cleared")
    }

    if (clickSheet && clickSheet.getLastRow() > 1) {
      clickSheet.getRange(2, 1, clickSheet.getLastRow() - 1, clickSheet.getLastColumn()).clear()
      console.log("✅ Card-Click-Tracking data cleared")
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
