import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} from '../../controllers/order.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin } from '../../middleware/isAdmin.js';

const router = Router();

router.use(authenticate); // all order routes need login

router.post('/', placeOrder);
router.get('/my', getMyOrders);            // BEFORE /:id
router.get('/', isAdmin, getAllOrders);    // admin: all orders
router.get('/:id', getOrder);              // owner or admin
router.put('/:id/status', isAdmin, updateOrderStatus);

export default router;