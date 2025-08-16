# Enhanced Google Apps Script Setup Instructions

## Step 1: Update Your Apps Script

1. **Open Google Apps Script**: Go to [script.google.com](https://script.google.com)
2. **Find your existing project** or create a new one
3. **Replace the entire Code.gs file** with the content from `enhanced-google-apps-script.js`
4. **Save the project** (Ctrl+S or Cmd+S)

## Step 2: Set Up Your Google Sheet Structure

### Option A: Automatic Setup (Recommended)
1. In the Apps Script editor, run the `setupColumnHeaders()` function:
   - Click on the function dropdown
   - Select `setupColumnHeaders`
   - Click the "Run" button (▶️)
   - Authorize permissions if prompted

### Option B: Manual Setup
If you prefer to set up manually, create these 18 columns in your Google Sheet:

| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | When the submission occurred |
| B | Monthly_Income | User's monthly income |
| C | Monthly_Spending | User's monthly credit card spending |
| D | Credit_Score_Range | User's credit score range |
| E | Current_Cards | Number of current credit cards |
| F | Spending_Categories | Primary spending categories |
| G | Preferred_Banks | User's preferred banks |
| H | Joining_Fee_Preference | Joining fee preference |
| I | User_Agent | Browser/device information |
| J | Card_Name | Name of clicked card (for click tracking) |
| K | Bank_Name | Bank of clicked card |
| L | Card_Type | Type of clicked card |
| M | Joining_Fee | Joining fee of clicked card |
| N | Annual_Fee | Annual fee of clicked card |
| O | Reward_Rate | Reward rate of clicked card |
| P | Submission_Type | Type of submission (form/click) |
| Q | Session_ID | Session identifier |
| R | Notes | Additional notes |

## Step 3: Deploy the Apps Script

1. **Click "Deploy"** in the top-right corner
2. **Choose "New deployment"**
3. **Set the type** to "Web app"
4. **Configure settings**:
   - Description: "CredWise Enhanced Submission Handler"
   - Execute as: "Me"
   - Who has access: "Anyone"
5. **Click "Deploy"**
6. **Copy the Web App URL** - you'll need this for your environment variables

## Step 4: Update Environment Variables

Add this to your `.env.local` file:
\`\`\`
NEXT_PUBLIC_APPS_SCRIPT_URL=your_web_app_url_here
\`\`\`

## Step 5: Test the Setup

### Test 1: Direct Script Test
1. In Apps Script editor, run `testScriptDirectly()`
2. Check the execution log for success messages
3. Verify data appears in your Google Sheet

### Test 2: Mock POST Test
1. Run `testWithMockPostData()`
2. Check the execution log
3. Verify the response structure

### Test 3: Live Application Test
1. Use your application to submit a form
2. Check browser console for submission logs
3. Verify data appears in Google Sheet

## Step 6: Verify Data Structure

Run `checkSheetStructure()` to verify:
- Sheet has 18 columns
- Headers are correctly set
- Sample data is properly formatted

## Troubleshooting

### Common Issues:

1. **"Sheet not found" error**:
   - Make sure your sheet has a tab named "Form-Submissions"
   - Or run `setupColumnHeaders()` to create it automatically

2. **Permission errors**:
   - Re-authorize the script permissions
   - Make sure the deployment has "Anyone" access

3. **Data not appearing**:
   - Check the Apps Script execution log
   - Verify the Web App URL in your environment variables
   - Test with the mock functions first

4. **Column mismatch**:
   - Run `migrateExistingData()` to update structure
   - Or manually add missing columns

### Debug Functions:

- `testScriptDirectly()` - Test without HTTP requests
- `testWithMockPostData()` - Test with simulated POST data
- `checkSheetStructure()` - Verify sheet structure
- `setupColumnHeaders()` - Set up proper headers
- `migrateExistingData()` - Update existing sheets

## Expected Results

After successful setup:
- ✅ Form submissions logged with user preferences
- ✅ Card application clicks tracked separately
- ✅ All data properly structured in 18 columns
- ✅ Both submission types identifiable by `Submission_Type` column

## Data Types You'll See:

1. **Form Submissions**: `submission_type = "enhanced_form"`
   - Contains user profile data (income, spending, preferences)
   - Card-specific columns will be empty

2. **Card Clicks**: `submission_type = "card_application_click"`
   - Contains clicked card details
   - User profile columns will be empty
   - Includes session tracking

This enhanced structure allows for comprehensive analytics on both user preferences and card application behavior.
