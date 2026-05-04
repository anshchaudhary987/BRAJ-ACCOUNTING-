export default interface IFinancialYear {
  /**
   * Optional, auto-generated unique ID when fetched from DB.
   */
  id?: string;

  /**
   * Required, unique code/name for the financial year (e.g., "FY2025-26", "2025-26").
   */
  code: string;

  /**
   * Required, description of the financial year.
   */
  description: string;

  /**
   * Required, start date of the financial year in ISO format (e.g., "2025-04-01").
   * In India, financial year typically starts on April 1.
   */
  startDate: string;

  /**
   * Required, end date of the financial year in ISO format (e.g., "2026-03-31").
   * In India, financial year typically ends on March 31 of the following year.
   */
  endDate: string;

  /**
   * Required, indicates if this financial year is currently active.
   * Only one financial year should be active at a time.
   */
  isActive: boolean;
}