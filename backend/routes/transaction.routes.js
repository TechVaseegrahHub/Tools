import express from 'express';
const router = express.Router();
import { 
  getTransactions,
  checkoutTool,
  checkinTool
} from '../controllers/transaction.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

// All routes are protected
router.use(protect);

// GET /api/transactions - Get all transactions
router.route('/')
  .get(getTransactions);

// POST /api/transactions/checkout - Checkout a tool
router.route('/checkout')
  .post(authorize('Admin', 'Manager'), checkoutTool); // Manager or Admin role required

// PUT /api/transactions/:id/checkin - Checkin a tool
router.route('/:id/checkin')
  .put(authorize('Admin', 'Manager'), checkinTool); // Manager or Admin role required

export default router;