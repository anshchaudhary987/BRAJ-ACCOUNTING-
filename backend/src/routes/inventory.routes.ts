import { Router } from 'express';
import { 
  listUnits, createUnit, 
  listGodowns, createGodown, 
  listStockItems, createStockItem, 
  createStockJournal 
} from '../controllers/inventory.controller.js';
import { AuthMiddleware, authorize } from '../middleware/auth.middleware.js';
import { tenancyMiddleware } from '../middleware/tenancy.middleware.js';

const router = Router();

// Secure all inventory routes
router.use(AuthMiddleware.authenticate);
router.use(tenancyMiddleware);

router.get('/units', authorize('inventory:view'), listUnits);
router.post('/units', authorize('inventory:manage'), createUnit);

router.get('/godowns', authorize('inventory:view'), listGodowns);
router.post('/godowns', authorize('inventory:manage'), createGodown);

router.get('/items', authorize('inventory:view'), listStockItems);
router.post('/items', authorize('inventory:manage'), createStockItem);

router.post('/journal', authorize('inventory:manage'), createStockJournal);

export default router;
