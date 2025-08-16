# Google Sheet Column Structure for CredWise

## Recommended Column Headers

Your Google Sheet should have the following 18 columns with these exact names:

| Column | Name | Description | Used For |
|--------|------|-------------|----------|
| A | Timestamp | Date and time of submission | Both |
| B | Monthly_Income | User's monthly income in ₹ | Form submissions |
| C | Monthly_Spending | Monthly credit card spending | Form submissions |
| D | Credit_Score_Range | Credit score range (e.g., "750-850") | Form submissions |
| E | Current_Cards_Count | Number of existing credit cards | Form submissions |
| F | Spending_Categories | Comma-separated spending categories | Form submissions |
| G | Preferred_Banks | Comma-separated preferred banks | Form submissions |
| H | Joining_Fee_Preference | Fee preference (no_fee, low_fee, any_amount) | Form submissions |
| I | Card_Name | Name of the credit card clicked | Card clicks |
| J | Bank_Name | Bank name of the clicked card | Card clicks |
| K | Card_Type | Type of card (Cashback, Travel, etc.) | Card clicks |
| L | Joining_Fee | Joining fee amount | Card clicks |
| M | Annual_Fee | Annual fee amount | Card clicks |
| N | Reward_Rate | Reward rate description | Card clicks |
| O | Session_ID | Unique session identifier | Card clicks |
| P | Submission_Type | Type of data (enhanced_form, card_application_click) | Both |
| Q | User_Agent | Browser/device information | Both |
| R | IP_Address | User's IP address | Both |

## Data Flow

### Form Submissions
- Columns B-H contain form data
- Columns I-O are empty
- Submission_Type = "enhanced_form"

### Card Application Clicks
- Columns B-H are empty
- Columns I-O contain card data
- Submission_Type = "card_application_click"

## Setup Instructions

1. Open your Google Sheet
2. Add these headers to row 1
3. Format the header row (bold, colored background)
4. Run the `setupColumnHeaders()` function in Apps Script to automate this
