# Apps Script Testing Guide

## The Error Explained
The error `Cannot read properties of undefined (reading 'postData')` occurs because:
- The `doPost` function expects to receive HTTP POST data
- When you run it directly in the Apps Script editor, there's no POST data
- The `e` parameter is undefined when running directly

## How to Test Your Apps Script

### Method 1: Use the Direct Test Function
1. Copy the updated script with the `testScriptDirectly()` function
2. In Apps Script editor, select `testScriptDirectly` from the function dropdown
3. Click the "Run" button
4. Check the logs and your Google Sheet

### Method 2: Use the Mock POST Test
1. Select `testWithMockPostData` from the function dropdown
2. Click "Run"
3. This simulates a real POST request

### Method 3: Check Sheet Structure
1. Select `checkSheetStructure` from the function dropdown
2. Click "Run"
3. This verifies your headers are correct

### Method 4: Test via HTTP (Real Test)
1. Deploy your script as a web app
2. Use the debugger page at `/debug` in your app
3. Or use a tool like Postman to send a POST request

## Step-by-Step Testing Process:

### 1. First, Check Sheet Structure
\`\`\`
Run: checkSheetStructure()
Expected: Should show your headers match the expected structure
\`\`\`

### 2. Test Direct Write to Sheet
\`\`\`
Run: testScriptDirectly()
Expected: Should add a test row to your sheet
\`\`\`

### 3. Test Mock POST Request
\`\`\`
Run: testWithMockPostData()
Expected: Should simulate a real POST and add data
\`\`\`

### 4. Test Real HTTP POST
\`\`\`
Use: /debug page or external tool
Expected: Should work like a real form submission
\`\`\`

## What Each Test Does:

- **checkSheetStructure()**: Verifies your Google Sheet has the correct headers
- **testScriptDirectly()**: Tests writing data directly to the sheet (bypasses POST)
- **testWithMockPostData()**: Tests the full doPost function with simulated data
- **doPost()**: The actual function that handles real HTTP requests

## Common Issues and Solutions:

1. **"Sheet not found"**: Check that your sheet is named "Sheet1" or update the script
2. **"Permission denied"**: Make sure the script has access to your spreadsheet
3. **"Headers don't match"**: Update your Google Sheet headers to match the expected structure
4. **"No data appearing"**: Check the Apps Script logs for errors

## Debugging Tips:

1. Always check the Apps Script logs (View > Logs)
2. Use console.log statements to track execution
3. Test functions individually before testing the full flow
4. Verify permissions and sheet access
5. Check that your deployment is up to date

## Next Steps After Testing:

1. If direct tests work, deploy as web app
2. Test via the /debug page
3. Test via the actual form
4. Monitor the logs for any issues
