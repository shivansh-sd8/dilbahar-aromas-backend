import { Router } from 'express';
import authRoutes from './authRoutes.js';
import blogRoutes from './blogRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cityRoutes from './cityRoutes.js';
import contactRoutes from './contactRoutes.js';
import productRoutes from './productRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import orderRoutes from './orderRoutes.js';
import siteConfigRoutes from './siteConfigRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/blog', blogRoutes);
router.use('/categories', categoryRoutes);
router.use('/city-pages', cityRoutes);
router.use('/contact', contactRoutes);
router.use('/products', productRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/orders', orderRoutes);
router.use('/site-config', siteConfigRoutes);

export default router;
