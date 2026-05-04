/**
 * Voucher Number Service for generating formatted voucher numbers.
 * Generates numbers in format like 'SL/2025-26/001'.
 */
export class VoucherNumberService {
  /**
   * Generate a formatted voucher number based on type, date, and sequence.
   * 
   * @param type - Voucher type (e.g., 'SALES', 'PURCHASE', 'JOURNAL')
   * @param date - Date of the voucher
   * @param sequence - Sequence number for this voucher type in the financial year
   * @returns Formatted voucher number string
   * 
   * Format: [TYPE PREFIX]/[FINANCIAL YEAR]/[SEQUENCE]
   * Example: SL/2025-26/001
   * 
   * Financial year calculation:
   *   If month >= April: FY starts in current year (e.g., April 2025 -> 2025-26)
   *   If month < April: FY starts in previous year (e.g., March 2026 -> 2025-26)
   */
  generateFormattedNumber(
    type: string,
    date: Date,
    sequence: number
  ): string {
    // Get financial year based on date
    const financialYear = this.getFinancialYear(date);
    
    // Create type prefix (first 2 letters uppercase, or first letter if type is short)
    const typePrefix = this.getTypePrefix(type);
    
    // Format sequence with leading zeros (minimum 3 digits)
    const formattedSequence = sequence.toString().padStart(3, '0');
    
    return `${typePrefix}/${financialYear}/${formattedSequence}`;
  }

  /**
   * Determine financial year from a date.
   * Indian financial year: April 1 to March 31
   * 
   * @param date - Date to evaluate
   * @returns Financial year string in format 'YYYY-YY'
   */
  private getFinancialYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    let fyStartYear: number;
    let fyEndYear: number;
    
    if (month >= 4) {
      // April to December: financial year starts in current year
      fyStartYear = year;
      fyEndYear = year + 1;
    } else {
      // January to March: financial year starts in previous year
      fyStartYear = year - 1;
      fyEndYear = year;
    }
    
    // Format as 'YYYY-YY' (e.g., '2025-26')
    const startStr = fyStartYear.toString();
    const endStr = fyEndYear.toString().substring(2); // Last 2 digits
    
    return `${startStr}-${endStr}`;
  }

  /**
   * Get a prefix for the voucher type.
   * Takes first 2 letters of the type, or first letter if type is very short.
   * 
   * @param type - Voucher type string
   * @returns Prefix string (uppercase)
   */
  private getTypePrefix(type: string): string {
    if (!type) return 'XX';
    
    const cleanedType = type.trim().toUpperCase();
    
    if (cleanedType.length >= 2) {
      return cleanedType.substring(0, 2);
    } else {
      // If type is only 1 character, repeat it or pad
      return cleanedType.padEnd(2, cleanedType.charAt(0) || 'X');
    }
  }
}