import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser); // You may want to make this admin-only
router.post('/login', loginUser);

// Private route
router.get('/me', protect, getMe);

export default router;