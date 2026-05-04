import { Router } from 'express';
import { LedgerController } from '../controllers/ledger.controller.js';

const router = Router();

// Ledger routes - all require company-id in headers
router.post('/', LedgerController.createLedger);
router.get('/', LedgerController.getLedgersByCompany);
router.get('/:id', LedgerController.getLedgerById);
router.put('/:id', LedgerController.updateLedger);
// Note: Delete method not required in task, but keeping if needed
// router.delete('/:id', ledgerController.deleteLedger);

export default router;