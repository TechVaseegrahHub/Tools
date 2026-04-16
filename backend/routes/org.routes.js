import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getOrgSettings, updateOrgSettings, cancelSubscription } from '../controllers/org.controller.js';

const router = express.Router();

router.use(protect, authorize('Admin'));

router.route('/settings')
    .get(getOrgSettings)
    .put(updateOrgSettings);

router.delete('/subscription', cancelSubscription);

export default router;
