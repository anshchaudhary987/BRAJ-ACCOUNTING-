import { Router } from 'express';
import { listCompanyUsers, listRoles, inviteUser, removeUser } from '../controllers/user.controller.js';
import { authorize } from '../middleware/auth.middleware.js';
import { tenancyMiddleware } from '../middleware/tenancy.middleware.js';

const router = Router();

router.use(tenancyMiddleware);

router.get('/', authorize('user:manage'), listCompanyUsers);
router.get('/roles', authorize('user:manage'), listRoles);
router.post('/invite', authorize('user:manage'), inviteUser);
router.delete('/:userId', authorize('user:manage'), removeUser);

export default router;
