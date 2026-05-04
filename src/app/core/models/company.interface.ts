export default interface ICompany {
  /**
   * Optional, auto-generated unique ID when fetched from DB.
   */
  id?: string;

  /**
   * Required, legal name of the business.
   */
  companyName: string;

  /**
   * Required, address of the company.
   */
  address: {
    line1: string;
    line2?: string;
    city: string;
    /**
     * Required, state code like "MH", "DL" — essential for GST determination.
     */
    state: string;
    pincode: string;
  };

  /**
   * Required, same as address.state but stored at top level for quick access by GST engine; must match address.state.
   */
  state: string;

  /**
   * Optional, GST Identification Number of the company. Format: 15 characters. Required for GST invoices.
   */
  gstin?: string;

  /**
   * Required, defaults to "Regular".
   * "Regular" | "Composition" | "Unregistered"
   */
  gstRegistrationType: 'Regular' | 'Composition' | 'Unregistered';

  /**
   * Required for TDS, format 10 characters.
   */
  pan: string;

  /**
   * Optional, Tax Deduction Account Number, format 10 characters.
   */
  tan?: string;

  /**
   * Required, ISO date like "2025-04-01". This is the start of the financial year for the company, typically April 1.
   * Used for period locking and financial year calculations.
   */
  financialYearStart: string;

  /**
   * Required, ISO date. The date from which accounting entries begin. Opening balances of ledgers are effective from this date.
   */
  booksBeginningDate: string;

  /**
   * Optional, contact details of the company.
   */
  contact?: {
    phone: string;
    email: string;
  };

  /**
   * Optional, defaults to true. Soft delete/flip for multi-company setup.
   */
  isActive?: boolean;
}