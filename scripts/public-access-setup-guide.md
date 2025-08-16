# Google Sheets Public Access Setup Guide

## 🎯 Goal
Configure Google Sheets to work for **any user/device** without requiring Google account login.

## 📋 Step-by-Step Setup

### 1. Make Google Sheet Public

1. **Open your Google Sheet**
   - Go to: https://docs.google.com/spreadsheets/d/1rHR5xzCmZZAlIjahAcpXrxwgYMcItVPckTCiOCSZfSo/edit

2. **Change Sharing Settings**
   - Click the "Share" button (top right corner)
   - Click "Change to anyone with the link"
   - Set permission to "Viewer" (not Editor)
   - Click "Copy link"

### 2. Extract Sheet ID
From the copied link, extract the Sheet ID:
\`\`\`
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit#gid=0
\`\`\`

The SHEET_ID_HERE part is what you need.

### 3. Google Cloud Console Setup

1. **Enable Google Sheets API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project (or create one)
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

2. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - **Important:** Choose "API Key" NOT "OAuth 2.0" or "Service Account"

3. **Configure API Key (Optional but Recommended)**
   - Click on your API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Under "Application restrictions", you can:
     - Leave unrestricted for maximum compatibility
     - Or add your domain for security

### 4. Environment Variables

Add to your `.env.local`:
\`\`\`
NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key
NEXT_PUBLIC_SHEET_ID=your_sheet_id
\`\`\`

**Note:** We use `NEXT_PUBLIC_` because this runs in the browser for all users.

### 5. Sheet Structure Requirements

Your sheet must have:
- **Tab name:** "Card-Data" (exact match)
- **Headers in row 1:** A1 to K1
- **Data starting from row 2**

Expected columns:
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Card Name | Bank | Card Type | Joining Fee | Annual Fee | Credit Score Requirement | Income Requirement | Rewards Rate | Sign Up Bonus | Features | Description |

## 🧪 Testing Public Access

### Test 1: Incognito Browser Test
1. Open incognito/private browser window
2. Go to your sheet URL
3. Verify you can view the sheet without logging in

### Test 2: Different Device Test
1. Use a different computer/phone
2. Use a different internet connection
3. Test the CredWise app
4. Verify recommendations load properly

### Test 3: API Test
Try accessing this URL in an incognito window:
\`\`\`
https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/Sheet1!A1:O100?key=YOUR_API_KEY
\`\`\`

Use the built-in test component in the CredWise app to verify:
- ✅ Public access working
- ✅ No authentication required
- ✅ Works for all users
- ✅ Data loads correctly

## 🔧 Troubleshooting

### Common Issues:

**403 Forbidden Error:**
- Sheet is not public → Make it "Anyone with link can view"
- API key restrictions → Remove or adjust restrictions
- API not enabled → Enable Google Sheets API

**404 Not Found Error:**
- Wrong sheet ID → Check the URL
- Wrong tab name → Must be "Card-Data"
- Sheet deleted → Restore or recreate

**400 Bad Request Error:**
- Check the range format (Sheet1!A1:O100)

**Empty Data:**
- Wrong range → Should be "Card-Data!A:K"
- No data in sheet → Add sample data
- Headers missing → Add headers in row 1

## ✅ Success Criteria

Your setup is correct when:
- ✅ Sheet opens in incognito browser without login
- ✅ CredWise app loads data for any user
- ✅ Test component shows "Public access: ✅"
- ✅ No authentication errors in console
- ✅ Works on different devices/networks

## 🔒 Security Notes

- **Public sheets are read-only** for viewers
- **API keys in NEXT_PUBLIC_ are visible** in browser (this is normal for public data)
- **No sensitive data** should be in public sheets
- **Rate limits apply** to API key usage
- Consider using server-side API calls for production
- Restrict API key to specific domains in Google Cloud Console

## 📞 Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Use the built-in test component
3. Verify each step in this guide
4. Test from multiple devices/browsers
