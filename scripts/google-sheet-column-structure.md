# Google Sheet Column Structure Guide

## 18-Column Structure for Enhanced CredWise Card Page

This document outlines the complete column structure used by the CredWise Card Page for capturing both form submissions and card application clicks.

### Column Layout (A-R)

| Column | Field Name | Data Type | Description | Example Values |
|--------|------------|-----------|-------------|----------------|
| **A** | Timestamp | DateTime | ISO timestamp of submission | 2024-01-15T10:30:00.000Z |
| **B** | Monthly Income | Number | User's monthly income in ₹ | 50000, 75000, 100000 |
| **C** | Monthly Spending | Number | User's monthly spending in ₹ | 25000, 35000, 45000 |
| **D** | Credit Score Range | Text | User's credit score range | 750-850, 650-749, 550-649 |
| **E** | Current Cards | Text | Number of current credit cards | 0, 1, 2, 3, 4+ |
| **F** | Spending Categories | Text | Comma-separated spending categories | dining, grocery, fuel |
| **G** | Preferred Banks | Text | Comma-separated preferred banks | SBI, HDFC Bank, ICICI Bank |
| **H** | Joining Fee Preference | Text | User's joining fee preference | free, low, medium, any_amount |
| **I** | Submission Type | Text | Type of submission | enhanced_personalization, card_application_click |
| **J** | User Agent | Text | Browser/device information | Mozilla/5.0... |
| **K** | Card Name | Text | Name of clicked card (for clicks only) | SBI Card CashBack |
| **L** | Bank Name | Text | Bank of clicked card (for clicks only) | SBI, HDFC Bank |
| **M** | Card Type | Text | Type of clicked card (for clicks only) | Cashback, Rewards, Premium |
| **N** | Joining Fee | Number | Joining fee of clicked card | 0, 500, 1000, 2500 |
| **O** | Annual Fee | Number | Annual fee of clicked card | 0, 500, 999, 2500 |
| **P** | Reward Rate | Text | Reward rate of clicked card | 5%, 2.5%, 4X points |
| **Q** | Session ID | Text | Unique session identifier | session_1642234200_abc123 |
| **R** | Additional Data | Text | JSON string with extra data | {"formType":"enhanced_personalization"} |

### Data Flow Types

#### 1. Form Submission Data
When a user submits the personalization form:
- **Columns A-J, Q-R**: Populated with form data
- **Columns K-P**: Empty (not applicable for form submissions)

#### 2. Card Click Data
When a user clicks "Apply Now" on a recommended card:
- **Columns A, I-R**: Populated with click data
- **Columns B-H**: Empty (not applicable for card clicks)

### Sample Data Examples

#### Form Submission Row
\`\`\`
A: 2024-01-15T10:30:00.000Z
B: 75000
C: 30000
D: 750-850
E: 2
F: dining, grocery, fuel, online_shopping
G: SBI, HDFC Bank
H: any_amount
I: enhanced_personalization
J: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
K: (empty)
L: (empty)
M: (empty)
N: (empty)
O: (empty)
P: (empty)
Q: session_1642234200_abc123
R: {"formType":"enhanced_personalization","totalCategories":4,"totalBanks":2}
\`\`\`

#### Card Click Row
\`\`\`
A: 2024-01-15T10:35:00.000Z
B: (empty)
C: (empty)
D: (empty)
E: (empty)
F: (empty)
G: (empty)
H: (empty)
I: card_application_click
J: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
K: SBI Card CashBack
L: SBI
M: Cashback
N: 500
O: 999
P: 5% cashback
Q: click_1642234500_def456
R: {"clickType":"card_application","cardDetails":{"name":"SBI Card CashBack","bank":"SBI","type":"Cashback"}}
\`\`\`

### Analytics Insights

This structure enables comprehensive analytics:

#### User Behavior Analysis
- **Form completion rates**: Track submissions vs. clicks
- **Bank preferences**: Most selected banks
- **Category preferences**: Popular spending categories
- **Income distribution**: User income ranges

#### Card Performance Analysis
- **Click-through rates**: Which cards get clicked most
- **Bank performance**: Which banks' cards are most popular
- **Card type preferences**: Cashback vs. Rewards vs. Premium
- **Fee sensitivity**: Impact of joining/annual fees on clicks

#### Refined Algorithm Validation
- **Score correlation**: Do higher-scored cards get more clicks?
- **Category matching effectiveness**: Do category matches drive clicks?
- **Bank bonus impact**: Effect of bank preference bonus
- **Fee threshold analysis**: Optimal fee ranges for different user segments

### Setup Instructions

1. **Create Google Sheet** with 18 columns (A-R)
2. **Add headers** using the field names above
3. **Set permissions** to allow Apps Script to write
4. **Run setupCompleteColumnStructure()** in Apps Script to auto-create structure
5. **Verify data flow** using test functions

### Maintenance Notes

- **Column order is fixed**: Do not rearrange columns A-R
- **Data types matter**: Ensure numbers are stored as numbers, not text
- **Empty cells**: Use empty strings, not null values
- **JSON formatting**: Additional Data should be valid JSON
- **Timestamp format**: Always use ISO 8601 format

This structure supports the refined scoring algorithm and provides comprehensive data for analyzing user preferences and card performance.
