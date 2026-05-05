import { Router } from 'express';
import { VoucherController } from '../controllers/voucher.controller.js';
import { AuthMiddleware, authorize } from '../middleware/auth.middleware.js';
import { tenancyMiddleware } from '../middleware/tenancy.middleware.js';

const router = Router();

// Secure all voucher routes
router.use(AuthMiddleware.authenticate);
router.use(tenancyMiddleware);

// Voucher routes - all require company-id in headers
router.post('/', authorize('voucher:create'), VoucherController.createVoucher);
router.get('/', authorize('voucher:view'), VoucherController.listVouchers);
router.get('/:id', authorize('voucher:view'), VoucherController.getVoucherById);

export default router;