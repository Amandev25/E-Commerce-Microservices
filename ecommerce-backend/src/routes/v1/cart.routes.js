import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../../controllers/cart.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Every cart route requires login, but NOT admin — users manage their own carts.
router.use(authenticate); // applies to all routes below

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;