/**
 * TDS Service for computing Tax Deducted at Source amounts.
 * Implements common TDS rates under the Income Tax Act.
 */
export class TdsService {
  /**
   * Compute TDS amount based on the nature of payment.
   * 
   * @param amount - The gross amount on which TDS is to be calculated
   * @param tdsNature - The section code (e.g., '194C', '194J', '194A')
   * @returns Object containing tdsAmount and rate applied
   * 
   * Rates (for simplicity, assuming non-individual/HUF where applicable):
   *   '194C' (Payments to contractors): 2%
   *   '194J' (Fees for professional or technical services): 10%
   *   '194A' (Interest other than interest on securities): 10%
   *   For any other nature, TDS is 0.
   */
  computeTds(amount: number, tdsNature: string): { tdsAmount: number; rate: number } {
    let rate = 0;

    // Normalize the tdsNature string (trim and uppercase)
    const nature = tdsNature.trim().toUpperCase();

    switch (nature) {
      case '194C':
        // Payments to contractors: 2% (assuming not individual/HUF)
        rate = 2;
        break;
      case '194J':
        // Fees for professional or technical services: 10%
        rate = 10;
        break;
      case '194A':
        // Interest other than interest on securities: 10%
        rate = 10;
        break;
      default:
        // For any other section, no TDS (or rate not defined)
        rate = 0;
    }

    const tdsAmount = (amount * rate) / 100;
    return {
      tdsAmount: parseFloat(tdsAmount.toFixed(2)),
      rate
    };
  }
}