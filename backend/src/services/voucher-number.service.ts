/**
 * Voucher Number Service for generating formatted voucher numbers.
 * Generates numbers in format like 'SL/2024-25/001'.
 */
export class VoucherNumberService {
  /**
   * Generate a formatted voucher number based on type, date, and sequence.
   * 
   * @param type - Voucher type (e.g., 'SALES', 'PURCHASE', 'JOURNAL')
   * @param date - Date of the voucher
   * @param sequence - Sequence number for this voucher type in the financial year
   * @returns Formatted voucher number string
   */
  generateFormattedNumber(
    type: string,
    date: Date,
    sequence: number
  ): string {
    const financialYear = this.getFinancialYear(date);
    const typePrefix = this.getTypePrefix(type);
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
  getFinancialYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    let fyStartYear: number;
    let fyEndYear: number;
    
    if (month >= 4) {
      fyStartYear = year;
      fyEndYear = year + 1;
    } else {
      fyStartYear = year - 1;
      fyEndYear = year;
    }
    
    const startStr = fyStartYear.toString();
    const endStr = fyEndYear.toString().substring(2); 
    
    return `${startStr}-${endStr}`;
  }

  /**
   * Get a prefix for the voucher type.
   */
  private getTypePrefix(type: string): string {
    if (!type) return 'XX';
    const cleanedType = type.trim().toUpperCase();
    if (cleanedType.length >= 2) {
      return cleanedType.substring(0, 2);
    } else {
      return cleanedType.padEnd(2, cleanedType.charAt(0) || 'X');
    }
  }
}