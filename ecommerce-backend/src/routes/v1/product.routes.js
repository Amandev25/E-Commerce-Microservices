// src/routes/v1/product.routes.js
import { Router } from 'express';
import {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from '../../controllers/product.controller.js';
import { getProductReviews, createReview } from '../../controllers/review.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin } from '../../middleware/isAdmin.js';
import upload from '../../middleware/upload.js';

const router = Router();

// Public — anyone can browse
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin only — must be logged in AND an admin
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

// Image upload (admin). .array('images', 5) = up to 5 files from a field named "images".
// Multer catches the files -> req.files
router.post(
  '/:id/images',
  authenticate,
  isAdmin,
  upload.array('images', 5),
  uploadProductImages
);

// Nested reviews for a product
router.get('/:productId/reviews', getProductReviews);           // public
router.post('/:productId/reviews', authenticate, createReview); // login required

export default router;
