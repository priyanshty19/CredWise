# Google Sheet Column Structure Guide

## 📊 Enhanced-Form-Submissions Sheet (18 Columns)

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Timestamp | When the form was submitted | 2024-01-15T10:30:00.000Z |
| B | Monthly Income | User's monthly income in ₹ | 100000 |
| C | Monthly Spending | User's monthly spending in ₹ | 25000 |
| D | Credit Score Range | User's credit score range | 750-850 |
| E | Current Cards | Number of current credit cards | 2 |
| F | Spending Categories | Selected spending categories | dining, fuel, grocery |
| G | Preferred Banks | Selected preferred banks | SBI, HDFC Bank |
| H | Joining Fee Preference | Joining fee preference | any_amount |
| I | Submission Type | Type of submission | enhanced_personalization |
| J | User Agent | Browser and device information | Mozilla/5.0... |
| K | Session ID | Unique session identifier | session_1705312200_abc123 |
| L | IP Address | User's IP address | (Not available in Apps Script) |
| M | Referrer | Page that referred the user | (Not available in Apps Script) |
| N | Device Type | Mobile/Desktop/Tablet | (Parsed from User Agent) |
| O | Browser | Browser name and version | (Parsed from User Agent) |
| P | OS | Operating system | (Parsed from User Agent) |
| Q | Screen Resolution | User's screen resolution | (Not available in Apps Script) |
| R | Additional Data | Full JSON data for debugging | {"timestamp":"...","monthlyIncome":...} |

## 🎯 Card-Click-Tracking Sheet (18 Columns)

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Timestamp | When the card was clicked | 2024-01-15T10:35:00.000Z |
| B | Card Name | Name of the clicked card | SBI Card CashBack |
| C | Bank Name | Bank that issued the card | SBI |
| D | Card Type | Type/category of the card | Cashback |
| E | Joining Fee | Card's joining fee in ₹ | 500 |
| F | Annual Fee | Card's annual fee in ₹ | 999 |
| G | Reward Rate | Card's reward rate | 5.0% |
| H | Submission Type | Type of tracking event | card_application_click |
| I | User Agent | Browser and device information | Mozilla/5.0... |
| J | Session ID | Unique session identifier | session_1705312200_abc123 |
| K | IP Address | User's IP address | (Not available in Apps Script) |
| L | Referrer | Page that referred the user | (Not available in Apps Script) |
| M | Device Type | Mobile/Desktop/Tablet | (Parsed from User Agent) |
| N | Browser | Browser name and version | (Parsed from User Agent) |
| O | OS | Operating system | (Parsed from User Agent) |
| P | Screen Resolution | User's screen resolution | (Not available in Apps Script) |
| Q | Click Source | Where the click originated | recommendation_page |
| R | Additional Data | Full JSON data for debugging | {"timestamp":"...","cardName":"...","bankName":"..."} |

## 🔧 Setup Functions

### setupCompleteColumnStructure()
This function creates both sheets with the proper 18-column structure:

\`\`\`javascript
function setupCompleteColumnStructure() {
  // Creates Enhanced-Form-Submissions sheet with 18 columns
  // Creates Card-Click-Tracking sheet with 18 columns
  // Sets up headers and formatting
  // Returns success confirmation
}
\`\`\`

### testScriptDirectly()
This function tests both submission types:

\`\`\`javascript
function testScriptDirectly() {
  // Tests enhanced form submission
  // Tests card click tracking
  // Adds sample data to both sheets
  // Returns test results
}
\`\`\`

### checkSheetStructure()
This function verifies the sheet setup:

\`\`\`javascript
function checkSheetStructure() {
  // Lists all sheets in the spreadsheet
  // Shows row and column counts
  // Displays headers for each sheet
  // Returns structure information
}
\`\`\`

## 📈 Data Analysis Tips

### Form Submissions Analysis:
- **Popular Income Ranges**: Analyze Monthly Income column
- **Spending Patterns**: Look at Spending Categories combinations
- **Bank Preferences**: Track which banks are most preferred
- **Credit Score Distribution**: Analyze Credit Score Range data

### Card Click Analysis:
- **Popular Cards**: Count clicks per Card Name
- **Bank Performance**: Group clicks by Bank Name
- **Card Type Preferences**: Analyze clicks by Card Type
- **Conversion Rates**: Compare form submissions to card clicks

### User Behavior Analysis:
- **Session Tracking**: Use Session ID to track user journeys
- **Device Preferences**: Analyze User Agent data
- **Time Patterns**: Look at Timestamp patterns for peak usage

## 🚨 Important Notes

1. **Column Order**: The order of columns is important for the Apps Script to work correctly
2. **Data Types**: Ensure numeric columns (Income, Fees) contain numbers, not text
3. **Array Data**: Spending Categories and Preferred Banks are stored as comma-separated strings
4. **JSON Backup**: Additional Data column contains full JSON for data recovery
5. **Privacy**: IP Address and Screen Resolution are not available in Google Apps Script environment

## 🔄 Maintenance

### Regular Tasks:
- **Data Cleanup**: Remove test entries periodically
- **Performance**: Archive old data if sheets become too large
- **Backup**: Export data regularly for backup purposes
- **Analysis**: Create pivot tables and charts for insights

### Monitoring:
- **Error Tracking**: Check Additional Data column for error messages
- **Data Quality**: Verify that all required fields are being populated
- **Usage Patterns**: Monitor submission frequency and peak times
