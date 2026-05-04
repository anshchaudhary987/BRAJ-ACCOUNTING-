/**
 * GST Service for computing Goods and Services Tax amounts.
 * Implements Indian GST rules for intra-state and inter-state transactions.
 */
export class GstService {
  /**
   * Compute GST amounts based on seller and buyer states.
   * 
   * @param sellerState - State of the seller (place of supply)
   * @param buyerState - State of the buyer (place of consumption)
   * @param taxableAmount - The amount on which GST is to be calculated
   * @param gstRate - GST rate (e.g., 18 for 18%)
   * @param isReverseCharge - Whether reverse charge is applicable
   * @returns Object containing cgst, sgst, igst amounts
   * 
   * Rules:
   * - If reverse charge: buyer is liable, typically no GST entries in voucher (return zeros for simplicity)
   * - Else if sellerState === buyerState (intra-state): 
   *     CGST = taxableAmount * gstRate / 200
   *     SGST = taxableAmount * gstRate / 200
   *     IGST = 0
   * - Else (inter-state):
   *     IGST = taxableAmount * gstRate / 100
   *     CGST = 0
   *     SGST = 0
   */
  computeGst(
    sellerState: string,
    buyerState: string,
    taxableAmount: number,
    gstRate: number,
    isReverseCharge: boolean = false
  ): { cgst: number; sgst: number; igst: number } {
    if (isReverseCharge) {
      // In reverse charge, the buyer pays tax directly to government.
      // For simplicity, we return zero tax amounts to be added to voucher.
      // The actual tax liability is handled separately (buyer pays via RCM).
      return { cgst: 0, sgst: 0, igst: 0 };
    }

    // Normalize state strings for comparison (trim and uppercase)
    const normalizedSellerState = sellerState.trim().toUpperCase();
    const normalizedBuyerState = buyerState.trim().toUpperCase();

    if (normalizedSellerState === normalizedBuyerState) {
      // Intra-state supply: CGST + SGST
      const gstAmount = (taxableAmount * gstRate) / 200;
      return {
        cgst: parseFloat(gstAmount.toFixed(2)),
        sgst: parseFloat(gstAmount.toFixed(2)),
        igst: 0
      };
    } else {
      // Inter-state supply: IGST
      const gstAmount = (taxableAmount * gstRate) / 100;
      return {
        cgst: 0,
        sgst: 0,
        igst: parseFloat(gstAmount.toFixed(2))
      };
    }
  }
}