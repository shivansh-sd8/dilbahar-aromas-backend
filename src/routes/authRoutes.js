import { Router } from 'express';
import { login, register, signup, me } from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { authSchemas } from '../validators/schemas.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/login', validate(authSchemas.login), login);
// Public storefront customer signup (role forced to 'customer').
router.post('/signup', validate(authSchemas.signup), signup);
// Staff account creation is admin-gated.
router.post('/register', protect, authorize('admin'), validate(authSchemas.register), register);
router.get('/me', protect, me);

export default router;
