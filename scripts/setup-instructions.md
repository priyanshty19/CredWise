# CredWise Card Page - Complete Setup Instructions

## 🚀 Quick Setup Guide

### 1. Environment Variables Setup
Add these environment variables to your project:

\`\`\`env
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxICw4o9GbH59pQYDTmY_d9R0XdNGGuoOejbFRmGtdfqayd8Q6EpRArs6XigY3QjKa5/exec
\`\`\`

### 2. Google Apps Script Setup

1. **Create New Apps Script Project**
   - Go to [Google Apps Script](https://script.google.com)
   - Click "New Project"
   - Replace default code with `scripts/enhanced-google-apps-script.js`

2. **Configure Spreadsheet ID**
   - Update `SPREADSHEET_ID` in the script with your Google Sheet ID
   - Current ID: `1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo`

3. **Run Setup Function**
   - In Apps Script editor, run `setupCompleteColumnStructure()`
   - This creates the 18-column structure needed for the refined algorithm

4. **Deploy as Web App**
   - Click "Deploy" → "New Deployment"
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copy the deployment URL

### 3. Google Sheets Structure

The system uses an 18-column structure to capture:

| Column | Field | Description |
|--------|-------|-------------|
| A | Timestamp | When the submission occurred |
| B | Monthly Income | User's monthly income |
| C | Monthly Spending | User's monthly spending |
| D | Credit Score Range | User's credit score range |
| E | Current Cards | Number of current credit cards |
| F | Spending Categories | Selected spending categories |
| G | Preferred Banks | User's preferred banks |
| H | Joining Fee Preference | Fee preference selection |
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

### 4. Refined Scoring Algorithm

The new algorithm uses these weights:

- **🎁 Rewards Rate: 30 points** (highest priority)
- **🛍️ Category Match: 30 points** (highest priority)
- **🎉 Sign-up Bonus: 20 points**
- **💳 Joining Fee: 10 points**
- **📅 Annual Fee: 10 points**
- **🏦 Bank Bonus: +5 points** (for preferred banks)

### 5. Testing & Debugging

#### Test Apps Script Connection
1. In Apps Script editor, run `testScriptDirectly()`
2. Check execution logs for success/error messages
3. Verify data appears in Google Sheet

#### Test Card Click Tracking
1. Run `testCardClickTracking()` in Apps Script
2. Verify click data is logged correctly
3. Check both form submissions and card clicks work

#### Use Built-in Card Tester
1. Fill out the form and get recommendations
2. Click "Show Tester" button
3. Select any card to see detailed analysis:
   - Basic eligibility check
   - Refined scoring breakdown
   - Category matching analysis
   - Final verdict with reasoning

### 6. Troubleshooting

#### Common Issues:

**"Load failed" Error:**
- Check Apps Script URL is correct in environment variables
- Verify Apps Script is deployed with "Anyone" access
- Test Apps Script directly using `testScriptDirectly()`

**SBI Cashback Not Appearing:**
- Use the Card Tester to see detailed analysis
- Check if card passes basic eligibility (credit score, income)
- Verify scoring meets 25.0 threshold
- Check category matching for your spending patterns

**Google Sheets Not Updating:**
- Run `checkSheetStructure()` in Apps Script
- Verify spreadsheet ID is correct
- Check sheet permissions are set to "Editor"
- Test with `testScriptDirectly()` function

### 7. Features Overview

#### Enhanced Personalization Form
- Captures detailed financial profile
- Multiple spending categories selection
- Bank preferences with bonus scoring
- Joining fee preferences

#### Refined Scoring Algorithm
- Prioritizes rewards rate and category matching
- Normalizes scores across all factors
- Includes bank preference bonus
- Filters cards with score ≥ 25.0

#### Comprehensive Card Tester
- Real-time eligibility analysis
- Detailed scoring breakdown
- Category matching visualization
- SBI cards quick overview
- Pass/fail reasoning

#### Google Sheets Integration
- 18-column comprehensive logging
- Both form submissions and card clicks
- Session tracking and analytics
- Error handling and retry logic

### 8. Next Steps

1. **Update Apps Script URL** in your environment variables
2. **Run setupCompleteColumnStructure()** in Google Apps Script
3. **Test the form** with SBI preference and high spending categories
4. **Use Card Tester** to debug why specific cards appear/don't appear
5. **Monitor Google Sheets** for data capture verification

The system is now ready with the refined scoring algorithm that prioritizes rewards rate and category matching, ensuring high-cashback cards like SBI Cashback rank appropriately when they match user spending patterns.
