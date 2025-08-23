# Updated Google Sheets Structure for Click Tracking

## New Capability Added
Your Google Sheet now supports **dual-purpose data capture**:
1. **Form Submissions** (user profile data)
2. **Card Application Clicks** (click tracking data)

## How It Works
The same sheet and Apps Script now handle both types of data by using the `submissionType` field to differentiate between:
- `enhanced_form` - Regular form submissions
- `card_application_click` - Card application button clicks

## Data Structure

### Column Layout:
| Column | Form Submission | Card Application Click |
|--------|----------------|----------------------|
| A | Timestamp | Timestamp |
| B | Monthly Income | Card Name |
| C | Monthly Credit Card Spending | Bank Name |
| D | Credit Score Range | Card Type |
| E | Current Cards Count | Joining Fee |
| F | Spending Categories | Annual Fee |
| G | Preferred Banks | Reward Rate |
| H | Joining Fee Preference | (empty) |
| I | Submission Type | Submission Type |
| J | User Agent | User Agent |

### Example Data:

**Form Submission Row:**
\`\`\`
2024-01-15 10:30:00 | 75000 | 35000 | 750-850 | 2 | dining,travel | HDFC Bank,ICICI | low_fee | enhanced_form | Mozilla/5.0...
\`\`\`

**Card Click Row:**
\`\`\`
2024-01-15 10:35:00 | HDFC Regalia Gold | HDFC Bank | Premium | 2500 | 2500 | 2-4% rewards | | card_application_click | Mozilla/5.0...
\`\`\`

## What Gets Tracked for Card Clicks:
- **Card Name**: Full name of the credit card
- **Bank Name**: Issuing bank
- **Card Type**: Category (Premium, Cashback, Travel, etc.)
- **Joining Fee**: One-time joining fee amount
- **Annual Fee**: Yearly fee amount
- **Reward Rate**: Reward percentage or description
- **Timestamp**: When the click occurred
- **User Agent**: Browser/device information
- **Session ID**: Unique session identifier

## Benefits:
✅ **Complete User Journey Tracking**: From form submission to card application
✅ **Click Analytics**: See which cards are most popular
✅ **Conversion Tracking**: Measure form-to-application conversion rates
✅ **Single Sheet Management**: All data in one place with clear differentiation
✅ **Real-time Data**: Immediate capture of both form and click events

## Analytics Possibilities:
- Most clicked cards
- Conversion rates by card type
- User journey from profile to application
- Popular cards by user demographics
- Time-based click patterns

## Next Steps:
1. Update your Apps Script with the new version
2. Test both form submissions and card clicks
3. Monitor the sheet to see both data types being captured
4. Use the analytics dashboard to view click tracking data

The system now provides comprehensive tracking of the entire user journey from initial form submission to final card application click!
