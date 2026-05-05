import { Router } from 'express';
import { LedgerController } from '../controllers/ledger.controller.js';
import { AuthMiddleware, authorize } from '../middleware/auth.middleware.js';
import { tenancyMiddleware } from '../middleware/tenancy.middleware.js';

const router = Router();

// Secure all ledger routes
router.use(AuthMiddleware.authenticate);
router.use(tenancyMiddleware);

// Ledger routes - all require company-id in headers
router.post('/', authorize('ledger:create'), LedgerController.createLedger);
router.get('/', authorize('ledger:view'), LedgerController.getLedgersByCompany);
router.get('/:id', authorize('ledger:view'), LedgerController.getLedgerById);
router.put('/:id', authorize('ledger:edit'), LedgerController.updateLedger);
// Note: Delete method not required in task, but keeping if needed
// router.delete('/:id', ledgerController.deleteLedger);

export default router;