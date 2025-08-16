# Setup Instructions for Enhanced CredWise Tracking

## Step 1: Update Google Apps Script

1. Open your Google Apps Script project
2. Replace the existing code with the new enhanced script
3. Save the project
4. Deploy as a web app (if not already deployed)

## Step 2: Set Up Column Headers

Run this function in Apps Script:
\`\`\`javascript
setupColumnHeaders()
\`\`\`

This will create 18 properly named columns in your Google Sheet.

## Step 3: Test the Setup

### Test Form Submissions
\`\`\`javascript
testFormSubmission()
\`\`\`

### Test Card Click Tracking
\`\`\`javascript
testCardApplicationClick()
\`\`\`

### Analyze Current Data
\`\`\`javascript
analyzeDataStructure()
\`\`\`

## Step 4: Verify Data Flow

1. Submit a test form through your website
2. Click on a card application button
3. Check your Google Sheet for both types of data
4. Verify the data appears in the correct columns

## Troubleshooting

### If Data Isn't Appearing:
1. Check Apps Script execution logs
2. Verify the sheet ID in the script matches your sheet
3. Ensure the sheet name is "Sheet1" (or update the script)
4. Check that the web app is deployed with proper permissions

### If Bank Filtering Isn't Working:
1. Check the bank names in your Google Sheet data
2. Ensure exact matches between form selections and sheet data
3. Verify the filtering logic in the recommendation functions

## Column Mapping Reference

| Column | Name | Purpose |
|--------|------|---------|
| A | Timestamp | When the action occurred |
| B-H | Form Data | User preferences and profile |
| I-O | Card Data | Details of clicked cards |
| P | Submission_Type | Distinguishes form vs click data |
| Q-R | Metadata | Technical tracking info |
