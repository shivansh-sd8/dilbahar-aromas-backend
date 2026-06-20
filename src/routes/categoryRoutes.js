import { Router } from 'express';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import validate from '../middleware/validate.js';
import { categorySchemas } from '../validators/schemas.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

const staff = [protect, authorize('admin', 'editor')];

router.get('/', optionalAuth, listCategories);
router.post('/', ...staff, validate(categorySchemas.create), createCategory);
router.put('/:id', ...staff, validate(categorySchemas.update), updateCategory);
router.delete('/:id', ...staff, deleteCategory);
router.get('/:slug', getCategory);

export default router;
