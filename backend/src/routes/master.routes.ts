import { Router } from 'express';
import { StateController } from '../controllers/state.controller.js';
import { HSNController } from '../controllers/hsn.controller.js';

import { GroupController } from '../controllers/group.controller.js';
import { TDSNatureController } from '../controllers/tds-nature.controller.js';

const router = Router();

// Master data routes
router.get('/states', StateController.listStates);
router.get('/hsn', HSNController.listHsnCodes);
router.get('/groups', GroupController.listGroups);
router.get('/tds-natures', TDSNatureController.listTdsNatures);

export default router;
