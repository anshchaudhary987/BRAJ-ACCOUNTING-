import { Router } from 'express';
import authRoutes from './auth.routes.js';
import companyRoutes from './company.routes.js';
import ledgerRoutes from './ledger.routes.js';
import voucherRoutes from './voucher.routes.js';
import reportsRoutes from './reports.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import masterRoutes from './master.routes.js';
import userRoutes from './user.routes.js';
import inventoryRoutes from './inventory.routes.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Auth routes - public
router.use('/api/auth', authRoutes);

// Protected routes - require JWT
router.use('/api/company', AuthMiddleware.authenticate, companyRoutes);
router.use('/api/user', AuthMiddleware.authenticate, userRoutes);
router.use('/api/ledger', AuthMiddleware.authenticate, ledgerRoutes);
router.use('/api/voucher', AuthMiddleware.authenticate, voucherRoutes);
router.use('/api/inventory', AuthMiddleware.authenticate, inventoryRoutes);
router.use('/api/reports', AuthMiddleware.authenticate, reportsRoutes);
router.use('/api/dashboard', AuthMiddleware.authenticate, dashboardRoutes);
router.use('/api/master', AuthMiddleware.authenticate, masterRoutes);

export default router;