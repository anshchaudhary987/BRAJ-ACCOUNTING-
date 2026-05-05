import type { IGSTCalculationInput, IGSTCalculationOutput } from '../models/gst-engine.model.js';

/**
 * GST Engine Service for calculating GST on transactions.
 * Uses exact state comparison for PAN-India compliance.
 */
export class GstEngineService {
  /**
   * Calculate GST based on the input.
   * Follows Indian GST rules for intra-state and inter-state transactions.
   */
  calculate(input: IGSTCalculationInput): IGSTCalculationOutput {
    // 1. If company is composition dealer, no GST applicable (as they cannot collect tax)
    if (input.companyRegistrationType === 'Composition') {
      return {
        entries: [],
        gstType: 'NONE',
        totalTaxAmount: 0
      };
    }

    // 2. Determine GST type based on state comparison
    // In India, intra-state = CGST + SGST, inter-state = IGST
    const isSameState = input.companyStateId === input.partyStateId;
    const gstType: 'CGST+SGST' | 'IGST' = isSameState ? 'CGST+SGST' : 'IGST';

    // 3. Calculate total tax amount
    const totalTax = Math.round((input.taxableAmount * input.taxRate / 100) * 100) / 100;

    // 4. Determine ledger prefix based on voucher type
    const getLedgerPrefix = (): 'Input' | 'Output' => {
      if (input.voucherType === 'Sales' || input.voucherType === 'Debit Note') {
        return 'Output';
      } else {
        return 'Input';
      }
    };
    const ledgerPrefix = getLedgerPrefix();

    // 5. Calculate tax amounts per head
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (gstType === 'CGST+SGST') {
      const totalTaxPaisa = Math.round(totalTax * 100);
      const cgstPaisa = Math.floor(totalTaxPaisa / 2);
      const sgstPaisa = totalTaxPaisa - cgstPaisa;
      cgstAmount = cgstPaisa / 100;
      sgstAmount = sgstPaisa / 100;
    } else {
      igstAmount = totalTax;
    }

    // 6. Build entries array
    const entries: IGSTCalculationOutput['entries'] = [];

    const addEntry = (ledgerName: string, isDebit: boolean, amount: number, description: string, taxHead: 'CGST' | 'SGST' | 'IGST') => {
      if (amount > 0) {
        entries.push({
          ledgerName,
          isDebit,
          amount,
          narration: description,
          [taxHead.toLowerCase() + 'Amount']: amount
        });
      }
    };

    const taxRatePerHead = gstType === 'CGST+SGST' ? input.taxRate / 2 : input.taxRate;

    if (gstType === 'CGST+SGST') {
      const cgstDesc = `CGST @ ${taxRatePerHead.toFixed(2)}% on ${input.taxableAmount}`;
      const sgstDesc = `SGST @ ${taxRatePerHead.toFixed(2)}% on ${input.taxableAmount}`;

      if (input.isReverseCharge && ledgerPrefix === 'Input') {
        addEntry(`${ledgerPrefix} CGST`, true, cgstAmount, cgstDesc, 'CGST');
        addEntry(`${ledgerPrefix} SGST`, true, sgstAmount, sgstDesc, 'SGST');
        addEntry(`Output CGST`, false, cgstAmount, cgstDesc, 'CGST');
        addEntry(`Output SGST`, false, sgstAmount, sgstDesc, 'SGST');
      } else {
        const isDebit = ledgerPrefix === 'Output' ? false : true;
        addEntry(`${ledgerPrefix} CGST`, isDebit, cgstAmount, cgstDesc, 'CGST');
        addEntry(`${ledgerPrefix} SGST`, isDebit, sgstAmount, sgstDesc, 'SGST');
      }
    } else {
      const igstDesc = `IGST @ ${taxRatePerHead.toFixed(2)}% on ${input.taxableAmount}`;

      if (input.isReverseCharge && ledgerPrefix === 'Input') {
        addEntry(`${ledgerPrefix} IGST`, true, igstAmount, igstDesc, 'IGST');
        addEntry(`Output IGST`, false, igstAmount, igstDesc, 'IGST');
      } else {
        const isDebit = ledgerPrefix === 'Output' ? false : true;
        addEntry(`${ledgerPrefix} IGST`, isDebit, igstAmount, igstDesc, 'IGST');
      }
    }

    return {
      entries,
      gstType,
      totalTaxAmount: totalTax
    };
  }
}