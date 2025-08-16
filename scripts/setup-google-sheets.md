# Google Sheets Setup Guide

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "CredWise Card Database"

## Step 2: Set up the Headers

Add these headers in row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Card Name | Bank | Card Type | Annual Fee | Joining Fee | Reward Rate | Welcome Bonus | Min Income | Max Income | Spending Categories | Key Features | Best For | Rating | Status | Last Updated |

## Step 3: Add Sample Data

See the sample-sheet-data.md file for example data to populate your sheet.

## Step 4: Make Sheet Public

1. Click "Share" button
2. Change access to "Anyone with the link can view"
3. Copy the sheet URL
4. Extract the Sheet ID from the URL (the long string between `/d/` and `/edit`)

## Step 5: Get Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create credentials (API Key)
5. Restrict the API key to Google Sheets API only

## Step 6: Update Environment Variables

Add to your `.env.local`:

\`\`\`
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
NEXT_PUBLIC_SHEET_ID=your_sheet_id_here
\`\`\`

## Step 7: Test the Connection

Use the TestGoogleSheets component to verify everything works.
