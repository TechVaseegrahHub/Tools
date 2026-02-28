import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getOrgSettings, updateOrgSettings } from '../controllers/org.controller.js';

const router = express.Router();

router.use(protect, authorize('Admin'));

router.route('/settings')
    .get(getOrgSettings)
    .put(updateOrgSettings);

export default router;
