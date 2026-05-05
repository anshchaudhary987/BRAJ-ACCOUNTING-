# 🇮🇳 Braj Accounting: Pan-India Compliance Summary

The Braj Accounting backend has been transformed into a fully compliant, professional-grade Indian accounting engine. Below is the summary of the structural and logical enhancements implemented.

## 1. Master Data (Source of Truth)
- **Indian States & UTs**: Embedded all **36 States/UTs** with official GST state codes (e.g., 27-Maharashtra, 07-Delhi).
- **HSN/SAC Master**: Integrated over **100 common codes** for goods and services with pre-configured GST rates.
- **TDS Sections (FY 2024-25)**: Embedded sections **192, 194C, 194J, 194I, 194H** with their latest rates and threshold limits.

## 2. Automated Compliance Logic
- **State-Wise GST Engine**: 
  - Automatically determines **Intra-State (CGST+SGST)** vs **Inter-State (IGST)** by comparing Company and Party state codes.
  - Handles **Reverse Charge (RCM)** and **Composition Scheme** flags.
- **Threshold-Aware TDS**:
  - Automatically checks if total payments to a party exceed the section threshold (e.g., ₹30,000 for 194C single bill).
  - Automatically generates **TDS Payable** ledger entries.
- **Financial Year Management**:
  - Implemented strict FY tracking (April 1 to March 31).
  - **Voucher Sequence Reset**: Voucher numbers now reset every financial year (e.g., `SL/2024-25/001`).

## 3. Data Integrity & Validations
- **Strict Master Reference**: State and HSN/SAC fields are now foreign keys, preventing spelling errors and invalid tax rates.
- **Compliance Utilities**: Integrated regex-based validation for:
  - **PAN** (Permanent Account Number)
  - **GSTIN** (GST Identification Number)
  - **TAN** (Tax Deduction Account Number)

## 4. API Enhancements
- **`/api/master/states`**: Fetch official state codes for selection.
- **`/api/master/hsn`**: Search and apply HSN codes with correct tax rates.
- **`/api/voucher`**: Refactored to automatically inject tax entries based on compliance rules.

---
**Braj Accounting is now ready for launch across every state and union territory in India.**
