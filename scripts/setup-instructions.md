# Enhanced CredWise Setup Instructions

## 🚀 Complete Setup Guide

### 1. Google Apps Script Setup

1. **Open Google Apps Script**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"

2. **Replace Default Code**
   - Delete the default `myFunction()` code
   - Copy and paste the entire `enhanced-google-apps-script.js` code

3. **Update Configuration**
   - Change `SPREADSHEET_ID` to your Google Sheet ID: `1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw`
   - Keep `SHEET_NAME` as `'Form-Submissions'`

4. **Run Setup Function**
   \`\`\`javascript
   // Run this function once to set up the sheet structure
   setupCompleteColumnStructure()
   \`\`\`

5. **Deploy as Web App**
   - Click "Deploy" → "New Deployment"
   - Choose "Web app" as type
   - Set execute as: "Me"
   - Set access to: "Anyone"
   - Click "Deploy"
   - Copy the deployment URL

6. **Add Environment Variable**
   \`\`\`bash
   NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxICw4o9GbH59pQYDTmY_d9R0XdNGGuoOejbFRmGtdfqayd8Q6EpRArs6XigY3QjKa5/exec
   \`\`\`

### 2. Google Sheets Setup

1. **Open Your Submission Sheet**
   - Go to: https://docs.google.com/spreadsheets/d/1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw/edit

2. **Verify Sheet Structure**
   - Should have 18 columns (A-R)
   - Headers should be properly formatted
   - If not, run `setupCompleteColumnStructure()` in Apps Script

3. **Set Permissions**
   - Make sure the sheet is accessible to your Apps Script
   - Share with your Google account if needed

### 3. Card Data Sheet Setup

1. **Open Your Card Data Sheet**
   - Go to: https://docs.google.com/spreadsheets/d/1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo/edit

2. **Verify Column L (Spending Category)**
   - Should contain comma-separated spending categories
   - Examples: "dining, fuel, shopping", "travel, entertainment"

3. **Update Environment Variable**
   \`\`\`bash
   NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
   \`\`\`

### 4. Testing the Setup

1. **Test Apps Script Connection**
   - Run `testScriptDirectly()` in Apps Script editor
   - Check console logs for success/error messages

2. **Test Card Click Tracking**
   - Run `testCardClickTracking()` in Apps Script editor
   - Verify data appears in your submission sheet

3. **Test Form Submission**
   - Fill out the form in your app
   - Submit and check if data appears in Google Sheets

4. **Test SBI Card Logic**
   - Use the card tester component
   - Check why SBI Cashback card might not appear

### 5. Debugging SBI Card Issue

The card tester will help identify why SBI Cashback card isn't appearing:

1. **Check Card Data**
   - Verify SBI Cashback card exists in your card data sheet
   - Check exact spelling of card name and bank name

2. **Check Eligibility Criteria**
   - Credit score requirement vs user's score
   - Income requirement vs user's income
   - Card type matching (Cashback)

3. **Check Bank Filter**
   - Ensure "SBI" is selected in preferred banks
   - Verify exact bank name matching

4. **Check Composite Score**
   - Card must have score ≥25.0 to be eligible
   - Check scoring components (fees, rewards, bonus)

### 6. Column Structure (18 Columns)

| Column | Name | Description |
|--------|------|-------------|
| A | Timestamp | When the submission occurred |
| B | Monthly Income | User's monthly income |
| C | Monthly Spending | User's monthly credit card spending |
| D | Credit Score Range | User's credit score range |
| E | Current Cards | Number of current credit cards |
| F | Spending Categories | Comma-separated spending categories |
| G | Preferred Banks | Comma-separated preferred banks |
| H | Joining Fee Preference | User's joining fee preference |
| I | Submission Type | Type of submission (form/click) |
| J | User Agent | Browser/device information |
| K | Card Name | Name of clicked card (for clicks) |
| L | Bank Name | Bank of clicked card (for clicks) |
| M | Card Type | Type of clicked card (for clicks) |
| N | Joining Fee | Joining fee of clicked card |
| O | Annual Fee | Annual fee of clicked card |
| P | Reward Rate | Reward rate of clicked card |
| Q | Session ID | Unique session identifier |
| R | Additional Data | JSON data for extra information |

### 7. Troubleshooting

**Common Issues:**

1. **Apps Script URL not working**
   - Redeploy the web app
   - Check permissions are set to "Anyone"
   - Verify the URL is correct

2. **Data not appearing in sheets**
   - Check Apps Script execution logs
   - Verify sheet permissions
   - Run test functions to debug

3. **SBI cards not showing**
   - Use the card tester component
   - Check console logs for detailed eligibility analysis
   - Verify bank name matching exactly

4. **CORS errors**
   - Apps Script should handle CORS automatically
   - If issues persist, check deployment settings

### 8. Success Indicators

✅ **Setup Complete When:**
- Apps Script deploys successfully
- Test functions run without errors
- Form submissions appear in Google Sheets
- Card clicks are tracked properly
- SBI cards appear in recommendations when criteria are met
- Card tester shows detailed eligibility analysis
- Console logs show proper data flow

### 9. Next Steps

After successful setup:

1. **Monitor Data Collection**
   - Check Google Sheets regularly for new submissions
   - Analyze user preferences and behavior patterns
   - Use data to improve recommendations

2. **Optimize Card Logic**
   - Use tester component to fine-tune eligibility criteria
   - Adjust scoring weights based on user feedback
   - Add more spending categories as needed

3. **Production Deployment**
   - Remove or hide the tester component
   - Set up proper error monitoring
   - Configure analytics tracking

### 10. Support

If you encounter issues:

1. **Check Console Logs**
   - Browser developer tools for frontend issues
   - Apps Script editor for backend issues

2. **Use Test Functions**
   - `testScriptDirectly()` for basic connectivity
   - `testCardClickTracking()` for click tracking
   - `checkSheetStructure()` for sheet validation

3. **Debug with Card Tester**
   - Shows exactly why cards pass or fail eligibility
   - Provides detailed scoring breakdown
   - Helps identify data mismatches

---

**Important:** The card tester component is designed for debugging only. Remove it before production deployment to maintain a clean user experience.
