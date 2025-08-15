# Google Sheets Setup Instructions

## 1. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Add the API key to your environment variables as `NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY`

## 2. Sheet Structure

Your Google Sheet should have the following columns (A-L):

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | Card Name | Text | Name of the credit card |
| B | Bank | Text | Issuing bank name |
| C | Card Type | Text | Cashback, Travel, Rewards, Student, Business |
| D | Joining Fee | Number | One-time joining fee |
| E | Annual Fee | Number | Yearly fee |
| F | Credit Score Requirement | Number | Minimum credit score needed |
| G | Income Requirement | Number | Minimum annual income (0 if not specified) |
| H | Rewards Rate | Number | Percentage rewards rate |
| I | Sign Up Bonus | Number | Welcome bonus amount |
| J | Features | Text | Comma-separated list of features |
| K | Description | Text | Card description/reason text |

## 3. Sample Data

\`\`\`
Card Name,Bank,Card Type,Joining Fee,Annual Fee,Credit Score Requirement,Income Requirement,Rewards Rate,Sign Up Bonus,Features,Description
HDFC Millennia,HDFC Bank,Cashback,0,1000,650,300000,2.5,2000,"5% cashback on online shopping,2.5% on online food delivery,Airport lounge access",Great for online spenders with good cashback rates
SBI Simply Click,SBI Card,Cashback,499,499,600,200000,5,500,"10X reward points on online shopping,5X on dining and movies,Fuel surcharge waiver",Perfect starter card with excellent online rewards
\`\`\`

## 4. Sheet Permissions

1. Make sure your sheet is either:
   - Public (anyone with link can view)
   - Or properly configured with service account access

## 5. Environment Variables

Add to your `.env.local`:
\`\`\`
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
\`\`\`

## 6. Testing

The system will automatically validate the connection and show the number of cards loaded.
