import express from 'express';
import {
  getTools,
  createTool,
  getToolById,
  updateTool,
  deleteTool,
} from '../controllers/tool.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All tool routes are protected

router.route('/')
  .get(getTools)
  .post(authorize('Admin', 'Manager'), createTool);

router.route('/:id')
  .get(getToolById)
  .put(authorize('Admin', 'Manager'), updateTool)
  .delete(authorize('Admin'), deleteTool);
  
export default router;