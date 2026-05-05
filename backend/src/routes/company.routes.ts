import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Apply authentication to all company routes
router.use(AuthMiddleware.authenticate);

// Company routes
router.post('/', CompanyController.create);
router.get('/', CompanyController.list);
router.get('/:id', CompanyController.getById);
router.put('/:id', CompanyController.update);

export default router;