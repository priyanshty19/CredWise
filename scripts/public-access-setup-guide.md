# Making Google Sheets Publicly Accessible

This guide explains how to make your Google Sheet publicly accessible for API access.

## Method 1: Share with Link (Recommended)

1. **Open your Google Sheet**
2. **Click the "Share" button** in the top-right corner
3. **Change access permissions:**
   - Click "Restricted" dropdown
   - Select "Anyone with the link"
   - Ensure permission is set to "Viewer"
4. **Copy the link** - it should look like:
   \`\`\`
   https://docs.google.com/spreadsheets/d/SHEET_ID/edit?usp=sharing
   \`\`\`
5. **Extract the Sheet ID** from the URL (the long string between `/d/` and `/edit`)

## Method 2: Publish to Web

1. **Open your Google Sheet**
2. **Go to File > Share > Publish to web**
3. **Select what to publish:**
   - Choose "Entire Document" or specific sheet
   - Select "Web page" or "CSV"
4. **Click "Publish"**
5. **Copy the published URL**

## Verifying Public Access

Test your sheet's public accessibility:

1. **Open an incognito/private browser window**
2. **Navigate to your sheet URL**
3. **Verify you can view the data without signing in**

## Security Considerations

- ✅ **Safe for public data** (card information, general data)
- ❌ **Not safe for sensitive data** (personal information, private data)
- 🔒 **Consider using Service Account** for sensitive data

## API Access URL Format

Once public, your sheet can be accessed via API:

\`\`\`
https://sheets.googleapis.com/v4/spreadsheets/SHEET_ID/values/RANGE?key=API_KEY
\`\`\`

Example:
\`\`\`
https://sheets.googleapis.com/v4/spreadsheets/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/values/Sheet1!A1:Z1000?key=YOUR_API_KEY
\`\`\`

## Troubleshooting

### Error: "The caller does not have permission"
- Ensure the sheet is shared publicly
- Check that the API key is valid
- Verify the Google Sheets API is enabled

### Error: "Unable to parse range"
- Check the range format (e.g., "Sheet1!A1:Z1000")
- Ensure the sheet name is correct
- Use single quotes for sheet names with spaces

### Error: "API key not valid"
- Verify the API key in Google Cloud Console
- Check that it's properly set in environment variables
- Ensure there are no extra spaces or characters
