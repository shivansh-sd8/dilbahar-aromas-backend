import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  trackOrder,
  myOrders,
  listOrders,
  getOrder,
  updateOrder,
} from '../controllers/orderController.js';
import validate from '../middleware/validate.js';
import { orderSchemas } from '../validators/schemas.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

const staff = [protect, authorize('admin', 'editor')];

router.post('/', validate(orderSchemas.create), createOrder);
router.post('/verify', validate(orderSchemas.verify), verifyPayment);
router.get('/track', trackOrder);
router.get('/mine', protect, myOrders);
router.get('/', ...staff, listOrders);
router.get('/:id', ...staff, getOrder);
router.patch('/:id', ...staff, validate(orderSchemas.update), updateOrder);

export default router;
