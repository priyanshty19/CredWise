# Google Apps Script Update Instructions

## Problem
Your Google Sheet headers have been updated, but the Google Apps Script still expects the old field structure. This is why data isn't being logged.

## Solution
You need to update your Google Apps Script to handle the new enhanced form fields.

## Step-by-Step Instructions:

### 1. Open Google Apps Script
- Go to https://script.google.com
- Find your existing CredWise project
- Open the script editor

### 2. Replace Your Current Script
Replace your entire `doPost` function with the updated version provided in the `updated-google-apps-script.js` file.

### 3. Key Changes Made:
- **Field Mapping**: Updated to match new Google Sheet structure
- **Data Handling**: Now processes enhanced form fields correctly
- **Error Handling**: Improved logging for debugging
- **Response Format**: Better success/error responses

### 4. New Field Structure:
The script now expects these fields from the form:
\`\`\`javascript
{
  "monthlyIncome": 75000,
  "monthlySpending": 35000,
  "creditScoreRange": "750-850",
  "currentCards": "2",
  "spendingCategories": "dining, travel, shopping",
  "preferredBanks": "HDFC Bank, ICICI Bank",
  "joiningFeePreference": "low_fee",
  "submissionType": "enhanced_form",
  "userAgent": "Mozilla/5.0..."
}
\`\`\`

### 5. Test the Script:
- Use the `testScript()` function in Apps Script to verify it works
- Or use the debugger page at `/debug` to test the integration

### 6. Redeploy:
- After updating the script, click "Deploy" > "New deployment"
- Or update your existing deployment
- Make sure "Execute as" is set to "Me"
- Make sure "Who has access" is set to "Anyone"

### 7. Verify:
- Test a form submission
- Check your Google Sheet to see if data appears
- Check the Apps Script logs for any errors

## Common Issues:
1. **Script not updated**: Make sure you replaced the entire doPost function
2. **Deployment not updated**: Redeploy after making changes
3. **Permissions**: Ensure the script has access to your spreadsheet
4. **Sheet name**: Verify the sheet name matches (currently "Sheet1")

## Testing:
Use the debugger at `/debug` to test the integration without filling out the entire form.
