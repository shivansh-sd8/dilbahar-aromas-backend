import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Product from '../models/Product.js';

// GET /api/products
export const listProducts = asyncHandler(async (req, res) => {
  const { category, audience, bestseller, q, limit = 100 } = req.query;
  const isPrivileged = req.user && ['admin', 'editor'].includes(req.user.role);

  const filter = {};
  if (!isPrivileged) filter.isActive = true;
  if (category) filter.categorySlugs = category;
  if (audience) filter.audience = { $in: [audience, 'Both'] };
  if (bestseller === 'true') filter.bestseller = true;
  if (q) filter.name = { $regex: q, $options: 'i' };

  const items = await Product.find(filter)
    .sort({ order: 1, name: 1 })
    .limit(Number(limit));
  res.json({ success: true, data: items });
});

// GET /api/products/:slug
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

// GET /api/products/admin/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  Object.assign(product, req.body);
  await product.save();
  res.json({ success: true, data: product });
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, message: 'Product deleted' });
});
