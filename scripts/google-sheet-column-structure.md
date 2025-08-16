# Google Sheet Column Structure for CredWise

## 18-Column Enhanced Structure

This document describes the complete column structure for the CredWise Google Sheet that captures both form submissions and card application clicks.

### Column Layout

| Column | Letter | Header Name | Data Type | Description | Example Values |
|--------|--------|-------------|-----------|-------------|----------------|
| 1 | A | Timestamp | DateTime | ISO timestamp of submission | 2024-01-15T10:30:00.000Z |
| 2 | B | Monthly_Income | Number | User's monthly income in rupees | 50000, 75000, 100000 |
| 3 | C | Monthly_Spending | Number | Monthly credit card spending | 25000, 30000, 40000 |
| 4 | D | Credit_Score_Range | Text | User's credit score range | 750-850, 650-749, 550-649 |
| 5 | E | Current_Cards | Text | Number of current credit cards | 0, 1, 2, 3 |
| 6 | F | Spending_Categories | Text | Comma-separated spending categories | dining, fuel, groceries |
| 7 | G | Preferred_Banks | Text | Comma-separated preferred banks | SBI, American Express |
| 8 | H | Joining_Fee_Preference | Text | Joining fee preference | no_fee, low_fee, any_amount |
| 9 | I | User_Agent | Text | Browser/device information | Mozilla/5.0... |
| 10 | J | Card_Name | Text | Name of clicked card (click tracking) | SBI Card Elite |
| 11 | K | Bank_Name | Text | Bank of clicked card | SBI |
| 12 | L | Card_Type | Text | Type of clicked card | Cashback, Travel, Rewards |
| 13 | M | Joining_Fee | Number | Joining fee of clicked card | 0, 500, 1000 |
| 14 | N | Annual_Fee | Number | Annual fee of clicked card | 0, 999, 2500 |
| 15 | O | Reward_Rate | Text | Reward rate of clicked card | 2%, 5%, 1.5% |
| 16 | P | Submission_Type | Text | Type of submission | enhanced_form, card_application_click |
| 17 | Q | Session_ID | Text | Session identifier for tracking | session_1642234200_abc123 |
| 18 | R | Notes | Text | Additional notes or metadata | Enhanced form submission |

## Data Flow Examples

### Form Submission Row
When a user submits the enhanced form, a row like this is created:

\`\`\`
A: 2024-01-15T10:30:00.000Z
B: 75000
C: 30000
D: 750-850
E: 2
F: dining, fuel, groceries
G: SBI, American Express
H: low_fee
I: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
J: (empty)
K: (empty)
L: (empty)
M: (empty)
N: (empty)
O: (empty)
P: enhanced_form
Q: (empty)
R: Enhanced form submission
\`\`\`

### Card Click Row
When a user clicks "Apply for Card", a row like this is created:

\`\`\`
A: 2024-01-15T10:35:00.000Z
B: (empty)
C: (empty)
D: (empty)
E: (empty)
F: (empty)
G: (empty)
H: (empty)
I: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
J: SBI Card Elite
K: SBI
L: Cashback
M: 0
N: 999
O: 5%
P: card_application_click
Q: session_1642234200_abc123
R: Card application click tracking
\`\`\`

## Analytics Possibilities

With this structure, you can analyze:

### User Behavior
- **Form Submissions**: Filter by `Submission_Type = "enhanced_form"`
- **Card Applications**: Filter by `Submission_Type = "card_application_click"`
- **Conversion Rate**: Compare form submissions to card clicks

### User Preferences
- **Income Distribution**: Analyze `Monthly_Income` column
- **Spending Patterns**: Analyze `Monthly_Spending` and `Spending_Categories`
- **Bank Preferences**: Analyze `Preferred_Banks` column
- **Fee Sensitivity**: Analyze `Joining_Fee_Preference` column

### Card Performance
- **Popular Cards**: Count clicks by `Card_Name`
- **Bank Performance**: Count clicks by `Bank_Name`
- **Card Type Preferences**: Analyze `Card_Type` distribution
- **Fee Impact**: Correlate `Joining_Fee`/`Annual_Fee` with click rates

### Technical Insights
- **Device Usage**: Analyze `User_Agent` patterns
- **Session Tracking**: Use `Session_ID` for user journey analysis
- **Time Patterns**: Analyze `Timestamp` for usage patterns

## Query Examples

### SQL-style queries you could run:

\`\`\`sql
-- Get all form submissions
SELECT * FROM sheet WHERE Submission_Type = 'enhanced_form'

-- Get all card clicks for SBI cards
SELECT * FROM sheet WHERE Submission_Type = 'card_application_click' AND Bank_Name = 'SBI'

-- Count clicks by card type
SELECT Card_Type, COUNT(*) FROM sheet 
WHERE Submission_Type = 'card_application_click' 
GROUP BY Card_Type

-- Average income of users who prefer no joining fee
SELECT AVG(Monthly_Income) FROM sheet 
WHERE Submission_Type = 'enhanced_form' AND Joining_Fee_Preference = 'no_fee'

-- Most popular spending categories
SELECT Spending_Categories, COUNT(*) FROM sheet 
WHERE Submission_Type = 'enhanced_form' 
GROUP BY Spending_Categories
\`\`\`

## Data Validation

### Expected Values:

**Credit_Score_Range**: 300-549, 550-649, 650-749, 750-850
**Current_Cards**: 0, 1, 2, 3
**Joining_Fee_Preference**: no_fee, low_fee, any_amount
**Card_Type**: Cashback, Travel, Rewards, Student, Business
**Submission_Type**: enhanced_form, card_application_click

### Data Quality Checks:

1. **Timestamp**: Should be valid ISO format
2. **Income/Spending**: Should be positive numbers
3. **Submission_Type**: Should always be populated
4. **Form vs Click Data**: Form submissions should have user data, clicks should have card data
5. **Bank Names**: Should match exactly with card database

This structure provides comprehensive tracking while maintaining data integrity and enabling powerful analytics capabilities.
\`\`\`

Now let me fix the card type eligibility issue. Looking at the logs, it shows "Card Type: FAIL" which means the card types in your Google Sheet don't match the expected values. Let me update the card type normalization:
