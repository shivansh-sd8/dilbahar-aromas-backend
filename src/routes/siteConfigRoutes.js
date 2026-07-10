import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getSiteConfig,
  updateSiteConfig,
  getLlmsTxt,
  getRobotsTxt,
} from '../controllers/siteConfigController.js';

const router = Router();

// Public: full SEO config used by frontend layout and routes
router.get('/', getSiteConfig);

// Public: plain-text overrides for robots/llms routes
router.get('/llms.txt', getLlmsTxt);
router.get('/robots.txt', getRobotsTxt);

// Protected: admin/editor can update the full site config
router.put('/', protect, authorize('admin', 'editor'), updateSiteConfig);

export default router;
