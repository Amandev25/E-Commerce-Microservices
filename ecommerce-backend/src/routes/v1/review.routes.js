// src/routes/v1/review.routes.js  — handles /reviews/:id
import { Router } from 'express';
import { updateReview, deleteReview } from '../../controllers/review.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
export default router;
