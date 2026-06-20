import { Router } from 'express';
import {
  listProducts,
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import validate from '../middleware/validate.js';
import { productSchemas } from '../validators/schemas.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

const staff = [protect, authorize('admin', 'editor')];

router.get('/', optionalAuth, listProducts);
router.get('/admin/:id', ...staff, getProductById);
router.post('/', ...staff, validate(productSchemas.create), createProduct);
router.put('/:id', ...staff, validate(productSchemas.update), updateProduct);
router.delete('/:id', ...staff, deleteProduct);
router.get('/:slug', getProduct);

export default router;
