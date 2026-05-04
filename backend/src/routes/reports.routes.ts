import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller.js';
import { tenancyMiddleware } from '../middleware/tenancy.middleware.js';

const router = Router();

// Reports routes - all require company-id in headers
router.get('/trial-balance', tenancyMiddleware, ReportsController.trialBalance);

export default router;