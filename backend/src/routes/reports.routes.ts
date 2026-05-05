import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { AuthMiddleware, authorize } from '../middleware/auth.middleware.js';
import { tenancyMiddleware } from '../middleware/tenancy.middleware.js';

const router = Router();

// Secure all reports routes
router.use(AuthMiddleware.authenticate);
router.use(tenancyMiddleware);

// Reports routes - all require company-id in headers
router.get('/trial-balance', authorize('report:view'), ReportsController.trialBalance);
router.get('/dashboard-stats', authorize('report:view'), ReportsController.dashboardStats);

export default router;