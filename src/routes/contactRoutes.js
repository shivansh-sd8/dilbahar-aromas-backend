import { Router } from 'express';
import {
  createMessage,
  listMessages,
  updateMessage,
} from '../controllers/contactController.js';
import validate from '../middleware/validate.js';
import { contactSchemas } from '../validators/schemas.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

const staff = [protect, authorize('admin', 'editor')];

router.post('/', validate(contactSchemas.create), createMessage);
router.get('/', ...staff, listMessages);
router.patch('/:id', ...staff, updateMessage);

export default router;
