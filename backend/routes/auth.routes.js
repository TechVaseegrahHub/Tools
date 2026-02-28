import express from 'express';
import { registerUser, registerOrg, loginUser, getMe, forgotPassword, verifyOtp, resetPassword, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/register-org', registerOrg);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Private routes
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

export default router;