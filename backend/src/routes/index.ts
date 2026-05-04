import { Router } from 'express';
import companyRoutes from './company.routes.js';
import ledgerRoutes from './ledger.routes.js';
import voucherRoutes from './voucher.routes.js';
import reportsRoutes from './reports.routes.js';

/**
 * Main API router.
 * All routes require tenancy middleware except company creation (handled in controller).
 */
const router = Router();

// Apply tenancy middleware to all routes
// Note: We apply it here so all routes inherit it
// However, company creation doesn't require tenancy (it creates the tenant)
// So we'll apply tenancy middleware selectively

// Company routes - creation doesn't require tenancy, but get/update do
router.use('/api/company', companyRoutes);

// Ledger routes - all require tenancy
router.use('/api/ledger', ledgerRoutes);

// Voucher routes - all require tenancy
router.use('/api/voucher', voucherRoutes);

// Reports routes - all require tenancy
router.use('/api/reports', reportsRoutes);

export default router;