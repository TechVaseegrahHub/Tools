import express from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All category routes are protected

router.route('/')
  .get(getCategories)
  .post(authorize('Admin', 'Manager'), createCategory);
  
export default router;