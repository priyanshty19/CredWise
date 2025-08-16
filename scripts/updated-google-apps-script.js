function doPost(e) {
  try {
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

// Test function to verify the script works
function testScript() {
  const testData = {
    monthlyIncome: 75000,
    monthlySpending: 35000,
    creditScoreRange: "750-850",
    currentCards: "2",
    spendingCategories: "dining, travel, shopping",
    preferredBanks: "HDFC Bank, ICICI Bank",
    joiningFeePreference: "low_fee",
    submissionType: "enhanced_form",
    userAgent: "Test User Agent",
  }

  // Simulate the POST request
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
    },
  }

  const result = doPost(mockEvent)
  console.log("Test result:", result.getContent())
}
