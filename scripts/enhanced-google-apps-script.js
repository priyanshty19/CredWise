/**
 * Enhanced Google Apps Script for CredWise Card Page
 * Handles both form submissions and card application click tracking
 * Updated for 18-column structure with comprehensive data capture
 */

// Declare variables
const ContentService = google.script.content
const SpreadsheetApp = google.script.spreadsheet
const Utilities = google.script.util
const google = {} // Declare the google variable to fix the undeclared variable error

// Configuration
const SHEET_NAME = "Form-Submissions" // Make sure this tab exists in your Google Sheet
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

/**
 * Main function to handle POST requests
 * This is the entry point for all submissions
 */
function doPost(e) {
  console.log("📨 Received POST request")

  try {
    // Parse the request data
    let data
    try {
      const contents = e.postData.contents
      console.log("📦 Raw request contents:", contents)
      data = JSON.parse(contents)
      console.log("✅ Parsed data successfully:", data)
    } catch (parseError) {
      console.error("❌ Error parsing request data:", parseError)
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Invalid JSON data",
          details: parseError.toString(),
        }),
      ).setMimeType(ContentService.MimeType.JSON)
    }

    // Process the submission
    const result = processSubmission(data)

    // Return the result
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("❌ Error in doPost:", error)
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

/**
 * Process the submission data and write to Google Sheets
 */
function processSubmission(data) {
  console.log("🔄 Processing submission:", data)

  try {
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    console.log("📊 Got spreadsheet:", spreadsheet.getName())

    // Get or create the target sheet
    let sheet = spreadsheet.getSheetByName(SHEET_NAME)
    if (!sheet) {
      console.log(`📋 Creating new sheet: ${SHEET_NAME}`)
      sheet = spreadsheet.insertSheet(SHEET_NAME)
      setupColumnHeaders(sheet)
    }

    console.log("📋 Using sheet:", sheet.getName())

    // Prepare the row data for the 18-column structure
    const rowData = [
      data.timestamp || new Date().toISOString(), // A: Timestamp
      data.monthlyIncome || "", // B: Monthly_Income
      data.monthlySpending || "", // C: Monthly_Spending
      data.creditScoreRange || "", // D: Credit_Score_Range
      data.currentCards || "", // E: Current_Cards
      data.spendingCategories || "", // F: Spending_Categories
      data.preferredBanks || "", // G: Preferred_Banks
      data.joiningFeePreference || "", // H: Joining_Fee_Preference
      data.userAgent || "", // I: User_Agent
      data.cardName || "", // J: Card_Name
      data.bankName || "", // K: Bank_Name
      data.cardType || "", // L: Card_Type
      data.joiningFee || "", // M: Joining_Fee
      data.annualFee || "", // N: Annual_Fee
      data.rewardRate || "", // O: Reward_Rate
      data.submissionType || "unknown", // P: Submission_Type
      data.sessionId || "", // Q: Session_ID
      data.notes || "", // R: Notes
    ]

    console.log("📝 Prepared row data:", rowData)

    // Write the data to the sheet with retry logic
    const writeResult = writeDataWithRetry(sheet, rowData)

    if (writeResult.success) {
      console.log("✅ Data written successfully to row:", writeResult.row)
      return {
        success: true,
        message: "Data submitted successfully",
        row: writeResult.row,
        timestamp: rowData[0],
      }
    } else {
      console.error("❌ Failed to write data:", writeResult.error)
      return {
        success: false,
        error: "Failed to write data to sheet",
        details: writeResult.error,
      }
    }
  } catch (error) {
    console.error("❌ Error processing submission:", error)
    return {
      success: false,
      error: "Error processing submission",
      details: error.toString(),
    }
  }
}

/**
 * Write data to sheet with retry logic
 */
function writeDataWithRetry(sheet, rowData, retryCount = 0) {
  try {
    // Get the next available row
    const lastRow = sheet.getLastRow()
    const nextRow = lastRow + 1

    console.log(`📍 Writing to row ${nextRow} (last row was ${lastRow})`)

    // Write the data
    const range = sheet.getRange(nextRow, 1, 1, rowData.length)
    range.setValues([rowData])

    console.log("✅ Data written successfully")

    return {
      success: true,
      row: nextRow,
    }
  } catch (error) {
    console.error(`❌ Error writing data (attempt ${retryCount + 1}):`, error)

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying in ${RETRY_DELAY}ms...`)
      Utilities.sleep(RETRY_DELAY)
      return writeDataWithRetry(sheet, rowData, retryCount + 1)
    } else {
      return {
        success: false,
        error: error.toString(),
      }
    }
  }
}

/**
 * Set up column headers for the 18-column structure
 */
function setupColumnHeaders(sheet) {
  console.log("📋 Setting up column headers")

  const headers = [
    "Timestamp", // A
    "Monthly_Income", // B
    "Monthly_Spending", // C
    "Credit_Score_Range", // D
    "Current_Cards", // E
    "Spending_Categories", // F
    "Preferred_Banks", // G
    "Joining_Fee_Preference", // H
    "User_Agent", // I
    "Card_Name", // J
    "Bank_Name", // K
    "Card_Type", // L
    "Joining_Fee", // M
    "Annual_Fee", // N
    "Reward_Rate", // O
    "Submission_Type", // P
    "Session_ID", // Q
    "Notes", // R
  ]

  // Set the headers in the first row
  const headerRange = sheet.getRange(1, 1, 1, headers.length)
  headerRange.setValues([headers])

  // Format the header row
  headerRange.setFontWeight("bold")
  headerRange.setBackground("#E8F0FE")

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length)

  console.log("✅ Column headers set up successfully")
}

/**
 * Test function to verify the script is working
 * Run this manually in the Apps Script editor
 */
function testScriptDirectly() {
  console.log("🧪 Testing script directly")

  const testData = {
    timestamp: new Date().toISOString(),
    monthlyIncome: "75000",
    monthlySpending: "30000",
    creditScoreRange: "750-850",
    currentCards: "2",
    spendingCategories: "dining, fuel, groceries",
    preferredBanks: "SBI, American Express",
    joiningFeePreference: "low_fee",
    submissionType: "direct_test",
    userAgent: "Test User Agent",
    cardName: "",
    bankName: "",
    cardType: "",
    joiningFee: "",
    annualFee: "",
    rewardRate: "",
    sessionId: "test_session_123",
    notes: "Direct script test",
  }

  const result = processSubmission(testData)
  console.log("🧪 Test result:", result)

  return result
}

/**
 * Test function with mock POST data
 */
function testWithMockPostData() {
  console.log("🧪 Testing with mock POST data")

  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        monthlyIncome: "60000",
        monthlySpending: "25000",
        creditScoreRange: "650-749",
        currentCards: "1",
        spendingCategories: "travel, shopping",
        preferredBanks: "HDFC Bank, ICICI Bank",
        joiningFeePreference: "no_fee",
        submissionType: "mock_post_test",
        userAgent: "Mock Test User Agent",
        cardName: "Test Card",
        bankName: "Test Bank",
        cardType: "Cashback",
        joiningFee: "0",
        annualFee: "500",
        rewardRate: "2%",
        sessionId: "mock_session_456",
        notes: "Mock POST test",
      }),
    },
  }

  const result = doPost(mockEvent)
  const response = JSON.parse(result.getContent())
  console.log("🧪 Mock POST test result:", response)

  return response
}

/**
 * Check and display current sheet structure
 */
function checkSheetStructure() {
  console.log("🔍 Checking sheet structure")

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    console.log("📊 Spreadsheet:", spreadsheet.getName())

    const sheet = spreadsheet.getSheetByName(SHEET_NAME)
    if (!sheet) {
      console.log(`❌ Sheet "${SHEET_NAME}" not found`)
      return {
        success: false,
        error: `Sheet "${SHEET_NAME}" not found`,
      }
    }

    const lastRow = sheet.getLastRow()
    const lastCol = sheet.getLastColumn()

    console.log(`📐 Sheet dimensions: ${lastRow} rows x ${lastCol} columns`)

    if (lastRow > 0) {
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
      console.log("📋 Current headers:", headers)

      if (lastRow > 1) {
        const sampleData = sheet.getRange(2, 1, Math.min(3, lastRow - 1), lastCol).getValues()
        console.log("📊 Sample data (first 3 rows):", sampleData)
      }
    }

    return {
      success: true,
      rows: lastRow,
      columns: lastCol,
      sheetName: SHEET_NAME,
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
 * Set up the complete column structure (run this once)
 */
function setupCompleteColumnStructure() {
  console.log("🔧 Setting up complete column structure")

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = spreadsheet.getSheetByName(SHEET_NAME)

    if (!sheet) {
      console.log(`📋 Creating new sheet: ${SHEET_NAME}`)
      sheet = spreadsheet.insertSheet(SHEET_NAME)
    }

    setupColumnHeaders(sheet)

    console.log("✅ Complete column structure setup complete")
    return { success: true, message: "Complete column structure setup complete" }
  } catch (error) {
    console.error("❌ Error setting up complete column structure:", error)
    return { success: false, error: error.toString() }
  }
}

/**
 * Migrate existing data to new structure (if needed)
 */
function migrateExistingData() {
  console.log("🔄 Starting data migration")

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    const sheet = spreadsheet.getSheetByName(SHEET_NAME)

    if (!sheet) {
      console.log("❌ No sheet found to migrate")
      return { success: false, error: "No sheet found" }
    }

    const lastRow = sheet.getLastRow()
    const lastCol = sheet.getLastColumn()

    console.log(`📊 Current sheet: ${lastRow} rows x ${lastCol} columns`)

    // If we already have 18 columns, no migration needed
    if (lastCol >= 18) {
      console.log("✅ Sheet already has correct structure")
      return { success: true, message: "No migration needed" }
    }

    // Add missing columns
    const targetColumns = 18
    const columnsToAdd = targetColumns - lastCol

    if (columnsToAdd > 0) {
      console.log(`📝 Adding ${columnsToAdd} columns`)
      sheet.insertColumnsAfter(lastCol, columnsToAdd)
    }

    // Update headers
    setupColumnHeaders(sheet)

    console.log("✅ Data migration complete")
    return { success: true, message: "Data migration complete" }
  } catch (error) {
    console.error("❌ Error during migration:", error)
    return { success: false, error: error.toString() }
  }
}
