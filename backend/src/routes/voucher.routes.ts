import { Router } from 'express';
import { VoucherController } from '../controllers/voucher.controller.js';

const router = Router();

import { tenancyMiddleware } from '../middleware/tenancy.middleware.js';

// Voucher routes - all require company-id in headers
router.post('/', tenancyMiddleware, VoucherController.createVoucher);
router.get('/', tenancyMiddleware, VoucherController.listVouchers);
router.get('/:id', tenancyMiddleware, VoucherController.getVoucherById);

export default router;