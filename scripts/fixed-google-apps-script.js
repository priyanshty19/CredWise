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

    // Prepare row data according to new structure
    // A: Timestamp, B: Monthly Income, C: Monthly Credit Card Spending, D: Credit Score Range,
    // E: Current Cards Count, F: Spending Categories, G: Preferred Banks, H: Joining Fee Preference,
    // I: Submission Type, J: User Agent

    const rowData = [
      timestamp, // A: Timestamp
      data.monthlyIncome || "", // B: Monthly Income
      data.monthlySpending || "", // C: Monthly Credit Card Spending
      data.creditScoreRange || "", // D: Credit Score Range
      data.currentCards || "", // E: Current Cards Count
      data.spendingCategories || "", // F: Spending Categories (comma-separated)
      data.preferredBanks || "", // G: Preferred Banks (comma-separated)
      data.joiningFeePreference || "", // H: Joining Fee Preference
      data.submissionType || "enhanced_form", // I: Submission Type
      data.userAgent || "Unknown", // J: User Agent
    ]

    console.log("Row data to append:", rowData) // For debugging

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

// SEPARATE test function that can be run directly in the Apps Script editor
function testScriptDirectly() {
  try {
    console.log("🧪 Starting direct test of the script...")

    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById("1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw")
    const sheet = spreadsheet.getSheetByName("Sheet1")

    if (!sheet) {
      throw new Error("Sheet 'Sheet1' not found. Check the sheet name.")
    }

    console.log("✅ Successfully connected to spreadsheet and sheet")

    // Test data
    const testData = {
      monthlyIncome: 75000,
      monthlySpending: 35000,
      creditScoreRange: "750-850",
      currentCards: "2",
      spendingCategories: "dining, travel, shopping",
      preferredBanks: "HDFC Bank, ICICI Bank",
      joiningFeePreference: "low_fee",
      submissionType: "test_direct",
      userAgent: "Direct Test from Apps Script",
    }

    // Create timestamp
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    // Prepare row data
    const rowData = [
      timestamp,
      testData.monthlyIncome,
      testData.monthlySpending,
      testData.creditScoreRange,
      testData.currentCards,
      testData.spendingCategories,
      testData.preferredBanks,
      testData.joiningFeePreference,
      testData.submissionType,
      testData.userAgent,
    ]

    console.log("📝 Test data to append:", rowData)

    // Append to sheet
    sheet.appendRow(rowData)

    const lastRow = sheet.getLastRow()
    console.log("✅ Test data successfully appended to row:", lastRow)

    // Verify the data was written
    const writtenData = sheet.getRange(lastRow, 1, 1, 10).getValues()[0]
    console.log("📊 Data written to sheet:", writtenData)

    return {
      success: true,
      message: "Direct test completed successfully",
      row: lastRow,
      data: writtenData,
    }
  } catch (error) {
    console.error("❌ Error in direct test:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}

// Test function that simulates a POST request (can also be run directly)
function testWithMockPostData() {
  try {
    console.log("🧪 Starting mock POST test...")

    const testData = {
      monthlyIncome: 85000,
      monthlySpending: 40000,
      creditScoreRange: "650-749",
      currentCards: "1",
      spendingCategories: "fuel, groceries, utilities",
      preferredBanks: "SBI, Axis Bank",
      joiningFeePreference: "no_fee",
      submissionType: "test_mock_post",
      userAgent: "Mock POST Test from Apps Script",
    }

    // Create mock event object
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testData),
      },
    }

    console.log("📦 Mock POST data:", testData)

    // Call doPost with mock data
    const result = doPost(mockEvent)
    const response = JSON.parse(result.getContent())

    console.log("📡 Mock POST result:", response)

    return response
  } catch (error) {
    console.error("❌ Error in mock POST test:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}

// Function to check sheet structure
function checkSheetStructure() {
  try {
    console.log("🔍 Checking sheet structure...")

    const spreadsheet = SpreadsheetApp.openById("1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw")
    const sheet = spreadsheet.getSheetByName("Sheet1")

    if (!sheet) {
      throw new Error("Sheet 'Sheet1' not found")
    }

    // Get headers (first row)
    const headers = sheet.getRange(1, 1, 1, 10).getValues()[0]
    console.log("📋 Current headers:", headers)

    // Expected headers
    const expectedHeaders = [
      "Timestamp",
      "Monthly Income",
      "Monthly Credit Card Spending",
      "Credit Score Range",
      "Current Cards Count",
      "Spending Categories",
      "Preferred Banks",
      "Joining Fee Preference",
      "Submission Type",
      "User Agent",
    ]

    console.log("📋 Expected headers:", expectedHeaders)

    // Check if headers match
    const headersMatch = expectedHeaders.every((expected, index) => headers[index] === expected)

    console.log("✅ Headers match expected structure:", headersMatch)

    if (!headersMatch) {
      console.log("⚠️ Header mismatches:")
      expectedHeaders.forEach((expected, index) => {
        if (headers[index] !== expected) {
          console.log(`   Column ${index + 1}: Expected "${expected}", Found "${headers[index]}"`)
        }
      })
    }

    // Get row count
    const lastRow = sheet.getLastRow()
    console.log("📊 Total rows (including header):", lastRow)
    console.log("📊 Data rows:", lastRow - 1)

    return {
      success: true,
      headers: headers,
      expectedHeaders: expectedHeaders,
      headersMatch: headersMatch,
      totalRows: lastRow,
      dataRows: lastRow - 1,
    }
  } catch (error) {
    console.error("❌ Error checking sheet structure:", error)
    return {
      success: false,
      error: error.toString(),
    }
  }
}
