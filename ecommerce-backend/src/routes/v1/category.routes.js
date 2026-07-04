import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/category.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const router = Router();

// Public — anyone can read
router.get('/', getCategories);
router.get('/:slug', getCategory);

// Admin only — must be logged in AND an admin
router.post('/', authenticate, isAdmin, createCategory);
router.put('/:id', authenticate, isAdmin, updateCategory);
router.delete('/:id', authenticate, isAdmin, deleteCategory);

export default router;
