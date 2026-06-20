import { Router } from 'express';
import {
  listPosts,
  getPost,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/blogController.js';
import validate from '../middleware/validate.js';
import { blogSchemas } from '../validators/schemas.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

const staff = [protect, authorize('admin', 'editor')];

// Public (admins/editors see drafts via optionalAuth)
router.get('/', optionalAuth, listPosts);

// Admin
router.get('/admin/:id', ...staff, getPostById);
router.post('/', ...staff, validate(blogSchemas.create), createPost);
router.put('/:id', ...staff, validate(blogSchemas.update), updatePost);
router.delete('/:id', ...staff, deletePost);

// Public single (kept last so /admin/:id and others resolve first)
router.get('/:slug', optionalAuth, getPost);

export default router;
