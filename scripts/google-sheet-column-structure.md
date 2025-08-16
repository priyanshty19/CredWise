# Google Sheet Column Structure for CredWise

## Recommended Column Headers

To properly organize both form submissions and card application clicks, here are the suggested column names:

### Column Headers (Row 1):
| Column | Header Name | Description |
|--------|-------------|-------------|
| A | **Timestamp** | Date and time of submission/click |
| B | **Data_Type_1** | Monthly Income OR Card Name |
| C | **Data_Type_2** | Monthly Spending OR Bank Name |
| D | **Data_Type_3** | Credit Score Range OR Card Type |
| E | **Data_Type_4** | Current Cards Count OR Joining Fee |
| F | **Data_Type_5** | Spending Categories OR Annual Fee |
| G | **Data_Type_6** | Preferred Banks OR Reward Rate |
| H | **Data_Type_7** | Joining Fee Preference OR Session ID |
| I | **Submission_Type** | Type of data (enhanced_form/card_application_click) |
| J | **User_Agent** | Browser/device information |
| K | **IP_Address** | User's IP address (optional) |

## Better Alternative: Separate Columns for Each Data Type

For clearer analytics, I recommend these specific column headers:

### Enhanced Column Structure:
| Column | Header Name | Form Data | Click Data |
|--------|-------------|-----------|------------|
| A | **Timestamp** | Submission time | Click time |
| B | **Monthly_Income** | User's income | (empty) |
| C | **Monthly_Spending** | Credit card spending | (empty) |
| D | **Credit_Score_Range** | Score range | (empty) |
| E | **Current_Cards_Count** | Number of cards | (empty) |
| F | **Spending_Categories** | Categories list | (empty) |
| G | **Preferred_Banks** | Bank preferences | (empty) |
| H | **Joining_Fee_Preference** | Fee preference | (empty) |
| I | **Card_Name** | (empty) | Full card name |
| J | **Bank_Name** | (empty) | Issuing bank |
| K | **Card_Type** | (empty) | Card category |
| L | **Joining_Fee** | (empty) | One-time fee |
| M | **Annual_Fee** | (empty) | Yearly fee |
| N | **Reward_Rate** | (empty) | Reward description |
| O | **Session_ID** | (empty) | Unique session |
| P | **Submission_Type** | enhanced_form | card_application_click |
| Q | **User_Agent** | Browser info | Browser info |
| R | **IP_Address** | User IP | User IP |

This structure provides:
✅ **Clear Data Separation**: Form data vs Click data in separate columns
✅ **Easy Analytics**: Filter by Submission_Type to analyze each data type
✅ **Complete Tracking**: All relevant information captured
✅ **Future-Proof**: Easy to add more columns as needed
