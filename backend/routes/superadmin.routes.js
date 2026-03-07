import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { listOrgs, getOrgDetails, toggleOrgStatus, resetUserPassword, getSubscriptionStats, getFinanceStats } from '../controllers/superadmin.controller.js';

const router = express.Router();

// All routes require SuperAdmin role
router.use(protect, authorize('SuperAdmin'));

router.get('/orgs', listOrgs);
router.get('/orgs/:orgId', getOrgDetails);
router.put('/orgs/:orgId/toggle', toggleOrgStatus);
router.put('/users/:userId/reset-password', resetUserPassword);
router.get('/subscriptions', getSubscriptionStats);
router.get('/finance', getFinanceStats);

export default router;
