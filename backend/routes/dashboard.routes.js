import express from 'express';
import { getDashboardStats, getOverdueTools, getRecentActivity } from '../controllers/dashboard.controller.js';

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

// @desc    Get overdue tools
// @route   GET /api/dashboard/overdue
router.get('/overdue', getOverdueTools);

// @desc    Get recent activity
// @route   GET /api/dashboard/recent
router.get('/recent', getRecentActivity);

export default router;