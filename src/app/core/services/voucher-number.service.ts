/**
 * Service for generating automatic voucher numbers.
 */
export class VoucherNumberService {
  /**
   * Map to store the next serial number for a key composed of voucherType+financialYear.
   * Key format: `${abbreviation}|${financialYear}`
   */
  private counters: Map<string, number> = new Map();

  /**
   * Get the next voucher number for the given voucher type and date.
   * 
   * @param voucherType - The type of voucher (e.g., 'Sales', 'Purchase').
   * @param date - The date of the voucher in ISO string format (e.g., '2025-04-15').
   * @returns A formatted voucher number string like "SL/2025-26/001".
   */
  getNextNumber(voucherType: string, date: string): string {
    // 1. Extract financial year from date
    const fy = this.getFinancialYearFromDate(date);

    // 2. Map voucher type to abbreviation
    const abbr = this.getVoucherTypeAbbreviation(voucherType);

    // 3. Create key
    const key = `${abbr}|${fy}`;

    // 4. Get next number from counters (default 1)
    const nextNum = this.counters.get(key) ?? 1;

    // 5. Increment and store
    this.counters.set(key, nextNum + 1);

    // 6. Return formatted string
    return `${abbr}/${fy}/${String(nextNum).padStart(3, '0')}`;
  }

  /**
   * Set the next serial number for a given voucher type and date (for DB sync).
   * 
   * @param voucherType - The type of voucher.
   * @param date - The date in ISO string format.
   * @param nextNum - The next number to set.
   */
  setNextNumber(voucherType: string, date: string, nextNum: number): void {
    const fy = this.getFinancialYearFromDate(date);
    const abbr = this.getVoucherTypeAbbreviation(voucherType);
    const key = `${abbr}|${fy}`;
    this.counters.set(key, nextNum);
  }

  /**
   * Extract financial year from a date string (ISO format).
   * Financial year starts April 1.
   * If month >= 4, financial year is YYYY-(YY+1); else (YYYY-1)-YY.
   * 
   * @param dateStr - ISO date string (e.g., '2025-06-15').
   * @returns Financial year string (e.g., '2025-26').
   */
  private getFinancialYearFromDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11

    let fyStart: number;
    let fyEnd: number;

    if (month >= 4) {
      // Financial year starts in April of the same year
      fyStart = year;
      fyEnd = year + 1;
    } else {
      // Financial year started in April of the previous year
      fyStart = year - 1;
      fyEnd = year;
    }

    // Format as YYYY-YY (e.g., 2025-26)
    const fyStartStr = String(fyStart);
    const fyEndStr = String(fyEnd).substring(2); // Last two digits
    return `${fyStartStr}-${fyEndStr}`;
  }

  /**
   * Map voucher type to its standard abbreviation.
   * 
   * @param voucherType - The voucher type string.
   * @returns The abbreviation (e.g., 'Sales' -> 'SL').
   */
  private getVoucherTypeAbbreviation(voucherType: string): string {
    const map: Record<string, string> = {
      Sales: 'SL',
      Purchase: 'PR',
      Payment: 'PM',
      Receipt: 'RC',
      Contra: 'CT',
      Journal: 'JR',
      'Debit Note': 'DN',
      'Credit Note': 'CN'
    };

    return map[voucherType] || voucherType.substring(0, 2).toUpperCase();
  }
}