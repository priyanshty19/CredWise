# Sample Google Sheets Data Structure

This document outlines the expected data structure for the Google Sheets integration.

## Sheet: "Card-Database"

### Headers (Row 1):
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Card Name | Bank | Type | Annual Fee | Joining Fee | Reward Rate | Welcome Bonus | Key Features | Best For | Min Income | Credit Score | Status |

### Sample Data:
\`\`\`
HDFC Regalia Gold,HDFC Bank,Premium,2500,2500,2-4% on dining & travel,10000 reward points,Airport lounge access; Dining offers; Travel insurance,Dining;Travel,500000,750,Active
SBI Cashback,SBI,Cashback,999,999,5% on online shopping,2000 cashback,High cashback rates; No reward point hassle; Online shopping benefits,Shopping;Online,300000,700,Active
ICICI Amazon Pay,ICICI Bank,Co-branded,500,500,2-5% on Amazon,2000 Amazon Pay balance,Amazon Prime membership; High Amazon rewards; Fuel surcharge waiver,Shopping;Amazon,250000,650,Active
\`\`\`

## Sheet: "User-Submissions" (Optional)

### Headers (Row 1):
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Timestamp | Monthly Income | Spending Categories | Monthly Spending | Current Cards | Credit Score | Preferred Banks | Joining Fee Preference |

## Data Types:

- **Card Name**: Text
- **Bank**: Text
- **Type**: Text (Premium, Cashback, Travel, Co-branded, etc.)
- **Annual Fee**: Number
- **Joining Fee**: Number
- **Reward Rate**: Text
- **Welcome Bonus**: Text
- **Key Features**: Text (semicolon separated)
- **Best For**: Text (semicolon separated)
- **Min Income**: Number
- **Credit Score**: Number
- **Status**: Text (Active, Inactive)

## Notes:

1. Use semicolons (;) to separate multiple values in Key Features and Best For columns
2. All fee amounts should be in INR
3. Reward rates can be text descriptions (e.g., "2-4% on dining")
4. Status should be "Active" for cards currently available
