import { Router } from 'express';
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../../controllers/wishlist.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate); // all wishlist routes require login

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);

export default router;