# CredWise Enhanced Personalization Setup Instructions

## 🚀 Quick Setup Guide

### Step 1: Update Apps Script URL
Add your Google Apps Script URL to your environment variables:

\`\`\`bash
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
\`\`\`

### Step 2: Set Up Google Sheets Structure
1. Open your Google Apps Script editor
2. Run the `setupCompleteColumnStructure()` function
3. This will create two sheets with proper headers:
   - **Enhanced-Form-Submissions** (18 columns)
   - **Card-Click-Tracking** (18 columns)

### Step 3: Test the Setup
1. Run `testScriptDirectly()` in Apps Script to verify functionality
2. Check that both sheets are created with sample data
3. Verify the console logs show successful operations

### Step 4: Test the Form
1. Fill out the enhanced personalization form with:
   - **Monthly Income**: 100000
   - **Monthly Spending**: 25000
   - **Credit Score**: Excellent (750-850)
   - **Spending Categories**: Select dining, fuel, grocery
   - **Preferred Banks**: Select SBI
   - **Joining Fee**: Any Amount

2. Submit the form and check:
   - Form submission is logged in Google Sheets
   - Recommendations appear (should include SBI cards)
   - Click "Show Tester" to see detailed analysis

### Step 5: Use the Card Tester
1. After getting recommendations, click "Show Tester"
2. The tester now includes **ALL 18 cards** in the dropdown
3. Select any card (especially SBI cards) to see:
   - **Basic Eligibility Check** (Credit Score, Income, Card Type)
   - **Refined Scoring Breakdown** (6 categories with detailed scores)
   - **Category Matching Analysis** (Your categories vs Card categories)
   - **Final Verdict** (Eligible/Not Eligible with reasoning)

## 🎯 Enhanced Features

### Refined Scoring Algorithm (105 points total):
- **🎁 Rewards Rate (30 points)**: Higher reward rates get more points
- **🛍️ Category Match (30 points)**: Cards matching your spending categories
- **🎉 Sign-up Bonus (20 points)**: Higher bonuses get more points
- **💳 Joining Fee (10 points)**: Lower fees get more points
- **📅 Annual Fee (10 points)**: Lower fees get more points
- **🏦 Bank Bonus (5 points)**: Extra points for preferred banks

### Card Database (18 Cards Total):
- **SBI Cards**: 4 cards (CashBack, SimplyCLICK, PRIME, ELITE)
- **HDFC Bank**: 3 cards (Millennia, Regalia, Infinia)
- **ICICI Bank**: 2 cards (Amazon Pay, Platinum)
- **Axis Bank**: 2 cards (ACE, Magnus)
- **American Express**: 2 cards (Gold, Platinum)
- **Other Banks**: 5 cards (Kotak, YES Bank, IndusInd, Standard Chartered, Citibank)

### Eligibility Tester Features:
- **All Cards Available**: Test any of the 18 cards in the database
- **SBI Cards Overview**: Quick view of all SBI cards and their eligibility
- **Detailed Analysis**: See exactly why cards pass or fail
- **Score Breakdown**: Understand how each card scores in all 6 categories
- **Category Matching**: Visual representation of spending category matches

## 🔧 Troubleshooting

### If form submission fails:
1. Check that `NEXT_PUBLIC_APPS_SCRIPT_URL` is set correctly
2. Verify the Apps Script is deployed as a web app
3. Ensure the script has proper permissions
4. Run `testScriptDirectly()` to test the backend

### If cards don't appear in recommendations:
1. Check the eligibility criteria (credit score, income)
2. Verify the scoring algorithm (minimum 25.0 points required)
3. Use the card tester to see detailed analysis
4. Check console logs for debugging information

### If SBI Cashback doesn't appear:
1. Ensure you select "SBI" in preferred banks
2. Check that your income ≥ ₹25,000
3. Verify credit score ≥ 650
4. Use the tester to see the exact score breakdown

## 📊 Data Tracking

The system tracks:
- **Form Submissions**: All user inputs and preferences
- **Card Clicks**: Which cards users click to apply
- **User Analytics**: Browser, device, and session information
- **Scoring Data**: How each card scores for each user

All data is stored in Google Sheets with timestamps and can be analyzed for insights.
