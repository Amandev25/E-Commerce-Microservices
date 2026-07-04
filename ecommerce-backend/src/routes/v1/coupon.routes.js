import { Router } from 'express';
import {
  applyCoupon,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} from '../../controllers/coupon.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const router = Router();

// User: apply a coupon to their own cart (login required, not admin).
router.post('/apply', authenticate, applyCoupon);

// Admin: manage coupons.
router.post('/', authenticate, isAdmin, createCoupon);
router.get('/', authenticate, isAdmin, getCoupons);
router.put('/:id', authenticate, isAdmin, updateCoupon);
router.delete('/:id', authenticate, isAdmin, deleteCoupon);

export default router;