# Google Sheets Submissions Setup

## Overview
This guide helps you set up Google Sheets to capture form submissions from the CredWise application.

## Step 1: Create Submissions Sheet

1. Create a new Google Sheet named "CredWise Submissions"
2. Add these headers in row 1:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp | Monthly Income | Spending Categories | Preferred Banks | Max Annual Fee | Card Type | Top Recommendation | Total Recommendations | User Agent |

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to Extensions > Apps Script
2. Replace the default code with:

\`\`\`javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    const row = [
      new Date(),
      data.monthlyIncome,
      data.spendingCategories.join(', '),
      data.preferredBanks.join(', '),
      data.maxAnnualFee,
      data.cardType,
      data.topRecommendation,
      data.totalRecommendations,
      data.userAgent || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
\`\`\`

## Step 3: Deploy Apps Script

1. Click "Deploy" > "New deployment"
2. Choose type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone"
5. Click "Deploy"
6. Copy the web app URL

## Step 4: Update Environment Variables

Add to your `.env.local`:
\`\`\`
NEXT_PUBLIC_APPS_SCRIPT_URL=your_web_app_url_here
\`\`\`

## Step 5: Test the Setup

Use the form submission feature to test if data is being captured in your Google Sheet.

## Troubleshooting

- **403 Error**: Check Apps Script permissions
- **No data appearing**: Verify the web app URL is correct
- **CORS issues**: Ensure Apps Script is deployed with "Anyone" access
