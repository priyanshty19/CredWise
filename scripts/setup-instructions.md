# Setup Instructions for Enhanced Google Sheets Structure

## Step 1: Update Column Headers

Run this function in your Google Apps Script to set up proper column headers:

\`\`\`javascript
setupColumnHeaders()
\`\`\`

This will create the following column structure:

| Column | Header Name | Purpose |
|--------|-------------|---------|
| A | Timestamp | Date/time of submission or click |
| B | Monthly_Income | User's monthly income (forms only) |
| C | Monthly_Spending | User's credit card spending (forms only) |
| D | Credit_Score_Range | User's credit score range (forms only) |
| E | Current_Cards_Count | Number of current cards (forms only) |
| F | Spending_Categories | Comma-separated spending categories (forms only) |
| G | Preferred_Banks | Comma-separated preferred banks (forms only) |
| H | Joining_Fee_Preference | Fee preference (forms only) |
| I | Card_Name | Full name of the credit card (clicks only) |
| J | Bank_Name | Issuing bank name (clicks only) |
| K | Card_Type | Card category/type (clicks only) |
| L | Joining_Fee | One-time joining fee amount (clicks only) |
| M | Annual_Fee | Annual fee amount (clicks only) |
| N | Reward_Rate | Reward rate description (clicks only) |
| O | Session_ID | Unique session identifier (clicks only) |
| P | Submission_Type | Type: "enhanced_form" or "card_application_click" |
| Q | User_Agent | Browser/device information |
| R | IP_Address | User's IP address |

## Step 2: Test the Setup

### Test Form Submission:
\`\`\`javascript
testFormSubmission()
\`\`\`

### Test Card Click Tracking:
\`\`\`javascript
testCardApplicationClick()
\`\`\`

### Analyze Current Data:
\`\`\`javascript
analyzeDataStructure()
\`\`\`

## Step 3: Migrate Existing Data (if needed)

If you have existing data that needs to be preserved:

\`\`\`javascript
migrateToNewStructure()
\`\`\`

This will:
- Create a backup of your existing data
- Set up the new column structure
- Preserve all historical data

## Benefits of New Structure:

✅ **Clear Data Separation**: Form data and click data in separate columns
✅ **Easy Analytics**: Filter by Submission_Type to analyze each data type
✅ **Complete Tracking**: All relevant information captured with proper labels
✅ **Scalable**: Easy to add more columns or data types in the future
✅ **Professional**: Proper column names for better data management

## Sample Data Examples:

### Form Submission Row:
\`\`\`
2024-01-15 10:30:00 | 75000 | 35000 | 750-850 | 2 | dining,travel | HDFC,ICICI | low_fee | | | | | | | | enhanced_form | Mozilla/5.0... | 192.168.1.100
\`\`\`

### Card Application Click Row:
\`\`\`
2024-01-15 10:35:00 | | | | | | | | HDFC Regalia Gold | HDFC Bank | Premium | 2500 | 2500 | 2-4% rewards | session_123 | card_application_click | Mozilla/5.0... | 192.168.1.101
\`\`\`

This structure provides complete visibility into both user profiles and their card application behavior!
