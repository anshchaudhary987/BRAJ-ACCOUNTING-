import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller.js';

const router = Router();

// Company routes
router.post('/', CompanyController.create);
router.get('/', CompanyController.list);
router.get('/:id', CompanyController.getById);
router.put('/:id', CompanyController.update);

export default router;