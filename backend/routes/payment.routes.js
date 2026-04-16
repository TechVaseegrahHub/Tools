import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes (require user to be logged in and typically Admin/Manager)
router.post('/create-subscription', protect, authorize('Admin', 'Manager'), paymentController.createSubscription);
router.post('/verify', protect, authorize('Admin', 'Manager'), paymentController.verifySubscription);

// Webhook route (must be raw body or express parsed body depending on Razorpay signature verification)
// We will use standard express parser in server.js, but Razorpay needs the raw signature to match.
router.post('/webhook', paymentController.handleWebhook);

export default router;
