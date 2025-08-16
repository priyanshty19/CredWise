# Google Sheets Structure Update Guide

## Current Sheet Structure Issues
Your current Google Sheets structure doesn't match the new enhanced form fields. Here are the required changes:

## Required Changes for Google Sheets

### Current Headers (Need to Update):
\`\`\`
A: Timestamp
B: Credit Score  
C: Monthly Income
D: Card Type
E: Preferred Brand
F: Max Joining Fee
G: Top N
H: Submission Type
I: User Agent
\`\`\`

### NEW Required Headers (Replace with these):
\`\`\`
A: Timestamp
B: Monthly Income
C: Monthly Credit Card Spending
D: Credit Score Range
E: Current Cards Count
F: Spending Categories
G: Preferred Banks
H: Joining Fee Preference
I: Submission Type
J: User Agent
\`\`\`

## Step-by-Step Update Instructions:

### 1. Update Column Headers
Replace your current headers in Row 1 with:
- A1: `Timestamp`
- B1: `Monthly Income`
- C1: `Monthly Credit Card Spending`
- D1: `Credit Score Range`
- E1: `Current Cards Count`
- F1: `Spending Categories`
- G1: `Preferred Banks`
- H1: `Joining Fee Preference`
- I1: `Submission Type`
- J1: `User Agent`

### 2. Data Format Examples
Here's what the data will look like:

| Timestamp | Monthly Income | Monthly Spending | Credit Score Range | Current Cards | Spending Categories | Preferred Banks | Joining Fee Preference | Submission Type | User Agent |
|-----------|----------------|------------------|-------------------|---------------|-------------------|-----------------|----------------------|----------------|------------|
| 2024-01-15T10:30:00Z | 75000 | 35000 | 750-850 | 2 | dining, travel, shopping | HDFC Bank, ICICI Bank | low_fee | enhanced_form | Mozilla/5.0... |

### 3. Expected Data Types:
- **Timestamp**: ISO date string
- **Monthly Income**: Number (e.g., 75000)
- **Monthly Credit Card Spending**: Number (e.g., 35000)
- **Credit Score Range**: Text (300-549, 550-649, 650-749, 750-850)
- **Current Cards Count**: Text (0, 1, 2, 3)
- **Spending Categories**: Comma-separated text (e.g., "dining, travel, shopping")
- **Preferred Banks**: Comma-separated text (e.g., "HDFC Bank, ICICI Bank")
- **Joining Fee Preference**: Text (no_fee, low_fee, any_amount)
- **Submission Type**: Text (enhanced_form)
- **User Agent**: Text (browser info)

### 4. Apps Script Update Required
You'll also need to update your Google Apps Script to handle the new column structure. The script should expect these new field names in the POST request.

### 5. Backward Compatibility
If you want to keep existing data, you can:
1. Create a new tab called "Enhanced-Submissions" with the new structure
2. Keep the old tab for historical data
3. Update the sheet ID in the code to point to the new tab

## Benefits of New Structure:
- ✅ Captures detailed spending preferences
- ✅ Records credit score ranges instead of exact scores
- ✅ Tracks current card ownership
- ✅ Stores bank preferences for better recommendations
- ✅ More comprehensive user profiling for analytics

## Next Steps:
1. Update the Google Sheet headers as shown above
2. Test a form submission to ensure data flows correctly
3. Check the analytics dashboard to verify data is being captured
4. Update any Apps Script code if needed to handle new field names
