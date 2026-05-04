import type { IGSTCalculationInput, IGSTCalculationOutput } from '../models/gst-engine.model.js';
import type { IVoucherEntry } from '../models/voucher.model.js';

/**
 * GST Engine Service for calculating GST on transactions.
 */
export class GstEngineService {
  /**
   * Calculate GST based on the input.
   * Follows Indian GST rules for intra-state and inter-state transactions.
   * 
   * @param input - The GST calculation input.
   * @returns The GST calculation output containing tax entries, GST type, and total tax amount.
   */
  calculate(input: IGSTCalculationInput): IGSTCalculationOutput {
    // 1. If company is composition dealer, no GST applicable
    if (input.companyRegistrationType === 'Composition') {
      return {
        entries: [],
        gstType: 'NONE',
        totalTaxAmount: 0
      };
    }

    // 2. Determine GST type based on state comparison (case-insensitive, trimmed)
    const companyState = input.companyState.trim().toUpperCase();
    const partyState = input.partyState.trim().toUpperCase();
    const isSameState = companyState === partyState;
    const gstType: 'CGST+SGST' | 'IGST' = isSameState ? 'CGST+SGST' : 'IGST';

    // 3. Calculate total tax amount (rounded to two decimal places)
    const totalTax = Math.round((input.taxableAmount * input.taxRate / 100) * 100) / 100;

    // 4. Determine ledger prefix based on voucher type
    const getLedgerPrefix = (): 'Input' | 'Output' => {
      if (input.voucherType === 'Sales' || input.voucherType === 'Debit Note') {
        return 'Output';
      }
      else { // Purchase or Credit Note
        return 'Input';
      }
    };
    const ledgerPrefix = getLedgerPrefix();

    // 5. Calculate tax amounts for each head
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (gstType === 'CGST+SGST') {
      // Use integer paisa calculation to avoid floating point issues and ensure proper rounding
      const totalTaxPaisa = Math.round(totalTax * 100);
      const cgstPaisa = Math.floor(totalTaxPaisa / 2); // Round down CGST
      const sgstPaisa = totalTaxPaisa - cgstPaisa;     // Remainder goes to SGST
      cgstAmount = cgstPaisa / 100;
      sgstAmount = sgstPaisa / 100;
    }
    else { // IGST
      igstAmount = totalTax;
    }

    // 6. Build entries array
    const entries: {
      ledgerName: string;
      amount: number;
      isDebit: boolean;
      narration?: string;
    }[] = [];

    const addEntry = (ledgerName: string, isDebit: boolean, amount: number, description: string) => {
      if (amount > 0) {
        entries.push({
          ledgerName,
          isDebit,
          amount,
          narration: description
        });
      }
    };

    const taxRatePerHead = gstType === 'CGST+SGST' ? input.taxRate / 2 : input.taxRate;

    if (gstType === 'CGST+SGST') {
      const cgstDesc = `Auto-calculated CGST @ ${taxRatePerHead.toFixed(2)}%`;
      const sgstDesc = `Auto-calculated SGST @ ${taxRatePerHead.toFixed(2)}%`;

      if (input.isReverseCharge && ledgerPrefix === 'Input') {
        // Reverse charge on purchase: Dr Input CGST/SGST, Cr Output CGST/SGST
        addEntry(`${ledgerPrefix} CGST`, true, cgstAmount, cgstDesc);
        addEntry(`${ledgerPrefix} SGST`, true, sgstAmount, sgstDesc);
        addEntry(`Output CGST`, false, cgstAmount, cgstDesc);
        addEntry(`Output SGST`, false, sgstAmount, sgstDesc);
      }
      else {
        // Normal: Sales -> Cr Output, Purchase -> Dr Input
        const isDebit = ledgerPrefix === 'Output' ? false : true;
        addEntry(`${ledgerPrefix} CGST`, isDebit, cgstAmount, cgstDesc);
        addEntry(`${ledgerPrefix} SGST`, isDebit, sgstAmount, sgstDesc);
      }
    }
    else { // IGST
      const igstDesc = `Auto-calculated IGST @ ${taxRatePerHead.toFixed(2)}%`;

      if (input.isReverseCharge && ledgerPrefix === 'Input') {
        // Reverse charge on purchase: Dr Input IGST, Cr Output IGST
        addEntry(`${ledgerPrefix} IGST`, true, igstAmount, igstDesc);
        addEntry(`Output IGST`, false, igstAmount, igstDesc);
      }
      else {
        // Normal: Sales -> Cr Output, Purchase -> Dr Input
        const isDebit = ledgerPrefix === 'Output' ? false : true;
        addEntry(`${ledgerPrefix} IGST`, isDebit, igstAmount, igstDesc);
      }
    }

    // 7. Return output
    return {
      entries,
      gstType,
      totalTaxAmount: totalTax
    };
  }
}