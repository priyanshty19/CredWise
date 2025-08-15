# Google Sheets Submissions Setup Guide

## 🎯 Objective
Configure Google Sheets to store all user form submissions from the CredWise recommendation system.

## 📋 Sheet Setup

### 1. Create/Access Your Submissions Sheet
- **Sheet URL**: https://docs.google.com/spreadsheets/d/1iBfu1LFBEo4BpAdnrOEKa5_LcsQMfJ0csX7uXbT-ZCw/edit?usp=sharing
- **Tab Name**: "Form-Submissions" (will be created automatically if it doesn't exist)

### 2. Expected Column Structure
The system will automatically create these headers if they don't exist:

| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | When the form was submitted |
| B | Credit Score | User's credit score (300-850) |
| C | Monthly Income | User's monthly income in INR |
| D | Card Type | Preferred card type (Cashback, Travel, etc.) |
| E | Preferred Brand | Selected bank (optional) |
| F | Max Joining Fee | Maximum joining fee preference (optional) |
| G | Number of Recommendations | How many recommendations requested |
| H | Submission Type | "basic" or "enhanced" |
| I | User Agent | Browser/device information |

### 3. Permissions Setup

#### Option A: Public Sheet (Recommended for Testing)
1. Open your Google Sheet
2. Click "Share" button (top right)
3. Click "Change to anyone with the link"
4. Set permission to "Editor" (required for writing data)
5. Click "Done"

#### Option B: Service Account (Recommended for Production)
1. Create a service account in Google Cloud Console
2. Download the service account JSON key
3. Share the sheet with the service account email
4. Grant "Editor" permissions

### 4. Environment Variables

For public sheet access:
\`\`\`
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
\`\`\`

For service account access (add these server-side):
\`\`\`
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your_private_key_here
\`\`\`

## 🔧 Features Implemented

### ✅ Data Storage
- All form submissions automatically saved to Google Sheets
- Automatic header creation if sheet is empty
- Handles both basic and enhanced recommendation submissions
- Captures timestamp, user agent, and all form fields

### ✅ Error Handling
- Graceful handling of API errors
- User-friendly error messages
- Submission continues even if logging fails
- Detailed console logging for debugging

### ✅ Analytics
- Real-time analytics from Google Sheets data
- Card type distribution charts
- Average credit score and income calculations
- Recent submissions display
- Admin dashboard with Google Sheets integration

### ✅ Security
- API key properly configured
- No sensitive data exposed client-side
- Minimal sheet permissions required
- Public access option for testing

## 🧪 Testing Checklist

### Test Scenarios:
1. **Basic Submission**: Fill out main form and submit
2. **Enhanced Submission**: Use enhanced personalization options
3. **Multiple Devices**: Test from different browsers/devices
4. **Error Handling**: Test with invalid sheet permissions
5. **Analytics**: Check admin dashboard for data visualization

### Verification Steps:
1. ✅ New rows appear in Google Sheets after form submission
2. ✅ All form fields are correctly mapped to columns
3. ✅ Both basic and enhanced submissions are captured
4. ✅ Analytics dashboard shows real-time data
5. ✅ Error messages are user-friendly
6. ✅ No Supabase dependencies remain

## 📊 Data Flow

\`\`\`
User Form Submission
        ↓
Card Recommendation Logic
        ↓
Google Sheets API Call
        ↓
New Row Added to Sheet
        ↓
Analytics Dashboard Updates
\`\`\`

## 🔍 Troubleshooting

### Common Issues:

**403 Forbidden Error:**
- Sheet permissions not set correctly
- API key restrictions preventing access
- Sheet not shared with service account (if using)

**400 Bad Request Error:**
- Invalid sheet ID or tab name
- Malformed data being sent
- Sheet structure doesn't match expected format

**Empty Data in Sheet:**
- Check console logs for submission errors
- Verify API key is configured correctly
- Ensure sheet has proper write permissions

**Analytics Not Loading:**
- Verify sheet contains data with correct headers
- Check browser console for API errors
- Confirm sheet ID matches in both submission and analytics code

### Debug Steps:
1. Check browser console for detailed error messages
2. Verify sheet permissions and sharing settings
3. Test API key with a simple GET request
4. Confirm sheet structure matches expected columns
5. Use the test component to verify connectivity

## 🚀 Success Criteria

Your implementation is successful when:
- ✅ All form submissions appear as new rows in Google Sheets
- ✅ No data is stored in Supabase
- ✅ Analytics dashboard shows real-time Google Sheets data
- ✅ Error handling provides clear user feedback
- ✅ System works across different devices and users
- ✅ All Supabase code has been removed
- ✅ Sheet structure is consistent and well-organized

## 📞 Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Google Sheets API setup
3. Test sheet permissions from an incognito browser
4. Review the troubleshooting section above
5. Ensure all environment variables are properly configured
