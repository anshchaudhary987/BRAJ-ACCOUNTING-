/**
 * Indian Compliance Utilities
 */
export class ComplianceUtils {
  /**
   * Validate Indian PAN (Permanent Account Number)
   * Format: 5 letters, 4 digits, 1 letter
   */
  static validatePAN(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  }

  /**
   * Validate GSTIN (Goods and Services Tax Identification Number)
   * Format: 2 digits (State Code), 10 chars (PAN), 1 char (Entity Code), 1 char (Z), 1 char (Check digit)
   */
  static validateGSTIN(gstin: string): boolean {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin.toUpperCase());
  }

  /**
   * Validate Indian TAN (Tax Deduction and Collection Account Number)
   * Format: 4 letters, 5 digits, 1 letter
   */
  static validateTAN(tan: string): boolean {
    const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
    return tanRegex.test(tan.toUpperCase());
  }
}
