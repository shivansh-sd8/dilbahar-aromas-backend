import { Router } from 'express';
import {
  createEnquiry,
  listEnquiries,
  getEnquiry,
  updateEnquiry,
} from '../controllers/enquiryController.js';
import validate from '../middleware/validate.js';
import { enquirySchemas } from '../validators/schemas.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

const staff = [protect, authorize('admin', 'editor')];

router.post('/', validate(enquirySchemas.create), createEnquiry);
router.get('/', ...staff, listEnquiries);
router.get('/:id', ...staff, getEnquiry);
router.patch('/:id', ...staff, validate(enquirySchemas.update), updateEnquiry);

export default router;
