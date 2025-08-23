# Google Sheets Form Submissions Setup

This guide explains how to set up Google Sheets to capture form submissions from the CredWise application.

## Step 1: Create Form Submissions Sheet

1. **Create a new Google Sheet** or add a new tab to your existing sheet
2. **Name the tab** "Form-Submissions"
3. **Add headers** in row 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Monthly Income | Spending Categories | Monthly Spending | Current Cards | Credit Score | Preferred Banks | Joining Fee Preference |

## Step 2: Set Up Google Apps Script

1. **Open Google Apps Script**: https://script.google.com/
2. **Create a new project**
3. **Replace the default code** with the webhook handler:

\`\`\`javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = Sprea 

\`\`\`javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form-Submissions');
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Create timestamp
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata'
    });
    
    // Prepare row data
    const rowData = [
      timestamp,
      data.monthlyIncome || '',
      Array.isArray(data.spendingCategories) ? data.spendingCategories.join(', ') : '',
      data.monthlySpending || '',
      data.currentCards || '',
      data.creditScore || '',
      Array.isArray(data.preferredBanks) ? data.preferredBanks.join(', ') : '',
      data.joiningFeePreference || ''
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
\`\`\`

4. **Save the project** with a meaningful name like "CredWise Form Handler"
5. **Deploy as web app**:
   - Click "Deploy" > "New deployment"
   - Choose "Web app" as type
   - Set execute as "Me"
   - Set access to "Anyone"
   - Click "Deploy"
   - Copy the web app URL

## Step 3: Configure Environment Variables

Add the Apps Script URL to your environment variables:

\`\`\`env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
\`\`\`

## Step 4: Test the Integration

1. **Submit a test form** through your application
2. **Check the Google Sheet** to verify data is being captured
3. **Monitor the Apps Script logs** for any errors

## Step 5: Set Up Analytics (Optional)

Create additional sheets for analytics:

- **"Analytics"** - For processed analytics data
- **"Daily-Stats"** - For daily submission counts
- **"Category-Stats"** - For spending category analysis

## Troubleshooting

### Common Issues:

1. **"Script not found" error**
   - Verify the Apps Script URL is correct
   - Ensure the script is deployed as a web app

2. **Permission denied**
   - Check that the script has permission to access the spreadsheet
   - Verify the execution permissions are set correctly

3. **Data not appearing**
   - Check the sheet name matches exactly ("Form-Submissions")
   - Verify the column headers are in the correct order

### Testing the Webhook:

You can test the webhook directly using curl:

\`\`\`bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"monthlyIncome":"50000","spendingCategories":["dining","travel"],"monthlySpending":"20000","currentCards":"1","creditScore":"750","preferredBanks":["HDFC Bank"],"joiningFeePreference":"low_fee"}' \
  YOUR_APPS_SCRIPT_URL
\`\`\`

## Security Considerations

- The webhook URL is public but only accepts POST requests
- Consider adding basic validation in the Apps Script
- Monitor for spam or malicious submissions
- Set up alerts for unusual activity patterns
