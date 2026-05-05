import { z } from 'zod';

/**
 * Indian Compliance Validation Schemas
 */

export const panSchema = z.string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)');

export const gstinSchema = z.string()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format (e.g. 27AAACR1234A1Z1)');

export const tanSchema = z.string()
  .regex(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/, 'Invalid TAN format (e.g. ABCD12345E)');

export const companySchema = z.object({
  name: z.string().min(3, 'Entity name must be at least 3 characters'),
  stateId: z.string().min(1, 'Please select a jurisdiction state'),
  pan: panSchema,
  gstin: gstinSchema.optional().or(z.literal('')),
  financialYearStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  booksBeginningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export const ledgerSchema = z.object({
  name: z.string().min(2, 'Account title is required'),
  groupId: z.string().min(1, 'Please select a classification group'),
  openingBalance: z.number().min(0, 'Balance cannot be negative'),
  openingBalanceType: z.enum(['Dr', 'Cr']),
  gstin: gstinSchema.optional().or(z.literal('')),
  stateId: z.string().optional().or(z.literal('')),
  hsnCodeId: z.string().optional().or(z.literal('')),
  tdsApplicable: z.boolean().optional(),
  tdsNatureCode: z.string().optional().or(z.literal('')),
});

export const voucherEntrySchema = z.object({
  ledgerId: z.string().min(1, 'Ledger identification required'),
  amount: z.number().gt(0, 'Magnitude must be greater than zero'),
  type: z.enum(['Dr', 'Cr']),
});

export const voucherSchema = z.object({
  voucherType: z.string(),
  date: z.string(),
  narration: z.string().optional(),
  entries: z.array(voucherEntrySchema).min(2, 'Voucher requires at least two line entries'),
}).refine((data) => {
  const drTotal = data.entries.filter(e => e.type === 'Dr').reduce((sum, e) => sum + e.amount, 0);
  const crTotal = data.entries.filter(e => e.type === 'Cr').reduce((sum, e) => sum + e.amount, 0);
  return Math.abs(drTotal - crTotal) < 0.01;
}, {
  message: 'Equilibrium failure: Aggregate Debit must equal Aggregate Credit',
  path: ['entries']
});
