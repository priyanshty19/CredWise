# Google Sheets API Setup Guide

This guide will help you set up Google Sheets API access for the CredWise application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

## Step 3: Create Credentials

### Option A: API Key (Recommended for public sheets)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Add it to your environment variables as `NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY`

### Option B: Service Account (For private sheets)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details and create
4. Download the JSON key file
5. Add the JSON content to your environment variables

## Step 4: Create Your Google Sheet

1. Create a new Google Sheet
2. Copy the sheet ID from the URL (the long string between `/d/` and `/edit`)
3. Add it to your environment variables as `GOOGLE_SHEET_ID`

## Step 5: Set Up Environment Variables

Add these to your `.env.local` file:

\`\`\`env
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_SHEET_ID=your_sheet_id_here
\`\`\`

## Step 6: Make Sheet Public (if using API Key)

1. Open your Google Sheet
2. Click "Share" in the top right
3. Change access to "Anyone with the link can view"
4. Copy the sharing link

## Testing

Use the test component in the app to verify your setup is working correctly.
