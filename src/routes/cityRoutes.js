import { Router } from 'express';
import {
  listCityPages,
  getCityPage,
  getCityPageById,
  createCityPage,
  updateCityPage,
  deleteCityPage,
} from '../controllers/cityController.js';
import validate from '../middleware/validate.js';
import { citySchemas } from '../validators/schemas.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

const staff = [protect, authorize('admin', 'editor')];

router.get('/', optionalAuth, listCityPages);
router.get('/admin/:id', ...staff, getCityPageById);
router.post('/', ...staff, validate(citySchemas.create), createCityPage);
router.put('/:id', ...staff, validate(citySchemas.update), updateCityPage);
router.delete('/:id', ...staff, deleteCityPage);
router.get('/:slug', optionalAuth, getCityPage);

export default router;
