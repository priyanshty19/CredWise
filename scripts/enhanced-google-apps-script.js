function doPost(e) {
  try {
    // Check if postData exists (it won't when running directly in editor)
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No POST data received. This function should be called via HTTP POST request.")
    }

    // Get the active spreadsheet and the correct sheet
    const spreadsheet = SpreadsheetApp.openById("1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw")
    const sheet = spreadsheet.getSheetByName("Sheet1") // Make sure this matches your sheet name

    // Parse the incoming data
    const data = JSON.parse(e.postData.contents)

    console.log("Received data:", data) // For debugging

    // Create timestamp in IST
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    // Get user's IP address (if available)
    const ipAddress = e.parameter.userip || "Unknown"

    let rowData = []

    // Check if this is a card application click or a form submission
    if (data.submissionType === "card_application_click") {
      // Handle card application click tracking
      // Enhanced structure with separate columns for each data type
      rowData = [
        timestamp, // A: Timestamp
        "", // B: Monthly_Income (empty for clicks)
        "", // C: Monthly_Spending (empty for clicks)
        "", // D: Credit_Score_Range (empty for clicks)
        "", // E: Current_Cards_Count (empty for clicks)
        "", // F: Spending_Categories (empty for clicks)
        "", // G: Preferred_Banks (empty for clicks)
        "", // H: Joining_Fee_Preference (empty for clicks)
        data.cardName || "", // I: Card_Name
        data.bankName || "", // J: Bank_Name
        data.cardType || "", // K: Card_Type
        data.joiningFee || "", // L: Joining_Fee
        data.annualFee || "", // M: Annual_Fee
        data.rewardRate || "", // N: Reward_Rate
        data.sessionId || "", // O: Session_ID
        data.submissionType || "card_application_click", // P: Submission_Type
        data.userAgent || "Unknown", // Q: User_Agent
        ipAddress, // R: IP_Address
      ]

      console.log("Card application click data to append:", rowData)
    } else {
      // Handle regular form submission
      // Enhanced structure with separate columns for each data type
      rowData = [
        timestamp, // A: Timestamp
        data.monthlyIncome || "", // B: Monthly_Income
        data.monthlySpending || "", // C: Monthly_Spending
        data.creditScoreRange || "", // D: Credit_Score_Range
        data.currentCards || "", // E: Current_Cards_Count
        data.spendingCategories || "", // F: Spending_Categories (comma-separated)
        data.preferredBanks || "", // G: Preferred_Banks (comma-separated)
        data.joiningFeePreference || "", // H: Joining_Fee_Preference
        "", // I: Card_Name (empty for forms)
        "", // J: Bank_Name (empty for forms)
        "", // K: Card_Type (empty for forms)
        "", // L: Joining_Fee (empty for forms)
        "", // M: Annual_Fee (empty for forms)
        "", // N: Reward_Rate (empty for forms)
        "", // O: Session_ID (empty for forms)
        data.submissionType || "enhanced_form", // P: Submission_Type
        data.userAgent || "Unknown", // Q: User_Agent
        ipAddress, // R: IP_Address
      ]

      console.log("Form submission data to append:", rowData)
    }

    // Append to sheet
    sheet.appendRow(rowData)

    console.log("Data successfully appended to sheet") // For debugging

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Data submitted successfully",
        timestamp: timestamp,
        row: sheet.getLastRow(),
        dataType: data.submissionType || "form_submission",
        ipAddress: ipAddress,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("Error in doPost:", error) // For debugging

    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
        message: "Failed to submit data",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

// Function to set up proper column headers
function setupColumnHeaders() {
  try {
    console.log("🏗️ Setting up column headers...")

    const spreadsheet = SpreadsheetApp.openById("1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw")
    const sheet = spreadsheet.getSheetByName("Sheet1")

    if (!sheet) {
      throw new Error("Sheet 'Sheet1' not found")
    }

    // Define the column headers
    const headers = [
      "Timestamp", // A
      "Monthly_Income", // B
      "Monthly_Spending", // C
      "Credit_Score_Range", // D
      "Current_Cards_Count", // E
      "Spending_Categories", // F
      "Preferred_Banks", // G
      "Joining_Fee_Preference", // H
      "Card_Name", // I
      "Bank_Name", // J
      "Card_Type", // K
      "Joining_Fee", // L
      "Annual_Fee", // M
      "Reward_Rate", // N
      "Session_ID", // O
      "Submission_Type", // P
      "User_Agent", // Q
      "IP_Address", // R
    ]

    // Check if headers already exist
    const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0]
    const hasHeaders = currentHeaders.some((header) => header && header.toString().trim() !== "")

    if (hasHeaders) {
      console.log("⚠️ Headers already exist. Current headers:", currentHeaders)
      console.log("🔄 Updating headers to new structure...")
    }

    // Set the headers in the first row
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])

    // Format the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length)
    headerRange.setFontWeight("bold")
    headerRange.setBackground("#4285f4")
    headerRange.setFontColor("white")

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length)

    console.log("✅ Column headers set up successfully!")
    console.log("📋 Headers:", headers)

    return {
      success: true,
      message: "Column headers set up successfully",
      headers: headers,
      totalColumns: headers.length,
    }
  } catch (error) {
    console.error("❌ Error setting up column headers:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}

// Test function for card application clicks with new structure
function testCardApplicationClick() {
  try {
    console.log("🧪 Testing card application click tracking with new structure...")

    const testClickData = {
      cardName: "HDFC Regalia Gold Credit Card",
      bankName: "HDFC Bank",
      cardType: "Premium",
      joiningFee: 2500,
      annualFee: 2500,
      rewardRate: "2-4% on dining & travel",
      submissionType: "card_application_click",
      userAgent: "Test Click from Apps Script",
      sessionId: "test_session_" + Date.now(),
    }

    // Create mock event object
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testClickData),
      },
      parameter: {
        userip: "192.168.1.100", // Mock IP
      },
    }

    console.log("📦 Mock click data:", testClickData)

    // Call doPost with mock data
    const result = doPost(mockEvent)
    const response = JSON.parse(result.getContent())

    console.log("📡 Click tracking result:", response)

    return response
  } catch (error) {
    console.error("❌ Error in click tracking test:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}

// Test function for form submission with new structure
function testFormSubmission() {
  try {
    console.log("🧪 Testing form submission with new structure...")

    const testFormData = {
      monthlyIncome: 75000,
      monthlySpending: 35000,
      creditScoreRange: "750-850",
      currentCards: "2",
      spendingCategories: "dining, travel, shopping",
      preferredBanks: "HDFC Bank, ICICI Bank",
      joiningFeePreference: "low_fee",
      submissionType: "enhanced_form",
      userAgent: "Test Form from Apps Script",
    }

    // Create mock event object
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testFormData),
      },
      parameter: {
        userip: "192.168.1.101", // Mock IP
      },
    }

    console.log("📦 Mock form data:", testFormData)

    // Call doPost with mock data
    const result = doPost(mockEvent)
    const response = JSON.parse(result.getContent())

    console.log("📡 Form submission result:", response)

    return response
  } catch (error) {
    console.error("❌ Error in form submission test:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}

// Function to analyze current data structure
function analyzeDataStructure() {
  try {
    console.log("📊 Analyzing current data structure...")

    const spreadsheet = SpreadsheetApp.openById("1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw")
    const sheet = spreadsheet.getSheetByName("Sheet1")

    if (!sheet) {
      throw new Error("Sheet 'Sheet1' not found")
    }

    // Get all data
    const lastRow = sheet.getLastRow()
    const lastCol = sheet.getLastColumn()

    console.log("📋 Sheet dimensions:", lastRow, "rows x", lastCol, "columns")

    if (lastRow === 0) {
      console.log("📋 Sheet is empty")
      return {
        success: true,
        message: "Sheet is empty - ready for setup",
        isEmpty: true,
      }
    }

    // Get headers
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    console.log("📋 Current headers:", headers)

    // Analyze data types
    if (lastRow > 1) {
      const sampleData = sheet.getRange(2, 1, Math.min(5, lastRow - 1), lastCol).getValues()
      console.log("📊 Sample data (first 5 rows):")

      sampleData.forEach((row, index) => {
        const submissionType = row[15] || row[8] || "unknown" // Check different possible positions
        console.log(`   Row ${index + 2}: ${submissionType}`)
      })

      // Count submission types
      const allData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues()
      const typeCounts = {}

      allData.forEach((row) => {
        const type = row[15] || row[8] || "unknown"
        typeCounts[type] = (typeCounts[type] || 0) + 1
      })

      console.log("📊 Submission type distribution:", typeCounts)
    }

    return {
      success: true,
      headers: headers,
      totalRows: lastRow,
      totalColumns: lastCol,
      dataRows: lastRow - 1,
      needsHeaderUpdate: true,
    }
  } catch (error) {
    console.error("❌ Error analyzing data structure:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}

// Function to migrate existing data to new structure (if needed)
function migrateToNewStructure() {
  try {
    console.log("🔄 Starting data migration to new structure...")

    const spreadsheet = SpreadsheetApp.openById("1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw")
    const sheet = spreadsheet.getSheetByName("Sheet1")

    if (!sheet) {
      throw new Error("Sheet 'Sheet1' not found")
    }

    const lastRow = sheet.getLastRow()

    if (lastRow <= 1) {
      console.log("📋 No data to migrate, setting up fresh headers...")
      return setupColumnHeaders()
    }

    // Backup existing data
    console.log("💾 Creating backup of existing data...")
    const backupSheet = spreadsheet.insertSheet("Backup_" + new Date().getTime())
    const allData = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues()
    backupSheet.getRange(1, 1, allData.length, allData[0].length).setValues(allData)

    console.log("✅ Backup created successfully")
    console.log("🔄 Migration completed - old data backed up, new structure ready")

    // Set up new headers
    return setupColumnHeaders()
  } catch (error) {
    console.error("❌ Error during migration:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}
