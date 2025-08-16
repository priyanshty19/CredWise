# Google Sheet Column Structure Guide

## 📊 Complete 18-Column Structure for Form Submissions

This document outlines the complete column structure for the CredWise form submissions Google Sheet.

### Column Layout

| Column | Letter | Name | Data Type | Description | Example |
|--------|--------|------|-----------|-------------|---------|
| 1 | A | Timestamp | DateTime | When the submission occurred | 2024-01-15T10:30:00.000Z |
| 2 | B | Monthly Income | Number | User's monthly income in INR | 100000 |
| 3 | C | Monthly Spending | Number | Monthly credit card spending | 25000 |
| 4 | D | Credit Score Range | Text | User's credit score range | 750-850 |
| 5 | E | Current Cards | Text | Number of current credit cards | 3 or more |
| 6 | F | Spending Categories | Text | Comma-separated categories | dining, fuel, shopping |
| 7 | G | Preferred Banks | Text | Comma-separated bank names | SBI, HDFC Bank |
| 8 | H | Joining Fee Preference | Text | Fee preference selection | any_amount |
| 9 | I | Submission Type | Text | Type of data submission | enhanced_form |
| 10 | J | User Agent | Text | Browser/device information | Mozilla/5.0... |
| 11 | K | Card Name | Text | Name of clicked card | SBI Card CashBack |
| 12 | L | Bank Name | Text | Bank of clicked card | SBI |
| 13 | M | Card Type | Text | Type of clicked card | Cashback |
| 14 | N | Joining Fee | Number | Joining fee of clicked card | 500 |
| 15 | O | Annual Fee | Number | Annual fee of clicked card | 999 |
| 16 | P | Reward Rate | Text | Reward rate description | 5% cashback |
| 17 | Q | Session ID | Text | Unique session identifier | session_1642234567_abc123 |
| 18 | R | Additional Data | Text | JSON string with extra data | {"formType":"enhanced"} |

### Data Types by Submission Type

#### Form Submissions
**Columns Used:** A, B, C, D, E, F, G, H, I, J, Q, R
**Empty Columns:** K, L, M, N, O, P

#### Card Application Clicks
**Columns Used:** A, I, J, K, L, M, N, O, P, Q, R
**Empty Columns:** B, C, D, E, F, G, H

### Sample Data

#### Form Submission Row
\`\`\`
2024-01-15T10:30:00.000Z | 100000 | 25000 | 750-850 | 3 or more | dining,fuel,shopping | SBI,HDFC Bank | any_amount | enhanced_form | Mozilla/5.0... | | | | | | | session_123 | {"formType":"enhanced"}
\`\`\`

#### Card Click Row
\`\`\`
2024-01-15T10:35:00.000Z | | | | | | | | card_application_click | Mozilla/5.0... | SBI Card CashBack | SBI | Cashback | 500 | 999 | 5% cashback | click_456 | {"clickType":"application"}
\`\`\`

### Setup Instructions

1. **Create Headers**
   \`\`\`javascript
   // Run this in Google Apps Script
   setupCompleteColumnStructure()
   \`\`\`

2. **Format Headers**
   - Bold text
   - Blue background (#4285f4)
   - White text color
   - Frozen first row

3. **Auto-resize Columns**
   - All columns auto-sized to content
   - Minimum width for readability

### Data Validation

#### Required Fields
- **All Submissions:** Timestamp, Submission Type
- **Form Submissions:** Monthly Income, Monthly Spending, Credit Score Range
- **Card Clicks:** Card Name, Bank Name, Card Type

#### Optional Fields
- User Agent (auto-populated)
- Session ID (auto-generated)
- Additional Data (JSON metadata)

### Analytics Queries

#### Count Form Submissions
\`\`\`sql
=COUNTIF(I:I, "enhanced_form")
\`\`\`

#### Count Card Clicks
\`\`\`sql
=COUNTIF(I:I, "card_application_click")
\`\`\`

#### Average Monthly Income
\`\`\`sql
=AVERAGE(FILTER(B:B, B:B<>"", I:I="enhanced_form"))
\`\`\`

#### Most Popular Banks
\`\`\`sql
=QUERY(G:G, "SELECT G, COUNT(G) WHERE G<>'' GROUP BY G ORDER BY COUNT(G) DESC")
\`\`\`

#### Most Clicked Cards
\`\`\`sql
=QUERY(K:K, "SELECT K, COUNT(K) WHERE K<>'' GROUP BY K ORDER BY COUNT(K) DESC")
\`\`\`

### Maintenance

#### Regular Tasks
1. **Weekly:** Check for data quality issues
2. **Monthly:** Archive old data if needed
3. **Quarterly:** Analyze trends and patterns

#### Data Cleanup
- Remove test submissions (Submission Type contains "test")
- Validate data formats
- Check for duplicate sessions

### Troubleshooting

#### Common Issues
1. **Missing Data:** Check Apps Script logs
2. **Wrong Format:** Verify column mapping
3. **Duplicate Headers:** Clear sheet and re-run setup

#### Debug Queries
\`\`\`javascript
// Check sheet structure
checkSheetStructure()

// Test data submission
testScriptDirectly()

// Test click tracking
testCardClickTracking()
\`\`\`

---

This structure supports comprehensive tracking of user interactions and provides rich data for analysis and optimization.
