import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Category from '../models/Category.js';

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  const isPrivileged = req.user && ['admin', 'editor'].includes(req.user.role);
  const filter = isPrivileged ? {} : { isActive: true };
  const items = await Category.find(filter).sort({ order: 1, name: 1 });
  res.json({ success: true, data: items });
});

// GET /api/categories/:slug
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw ApiError.notFound('Category not found');
  res.json({ success: true, data: category });
});

// POST /api/categories
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

// PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  Object.assign(category, req.body);
  await category.save();
  res.json({ success: true, data: category });
});

// DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  res.json({ success: true, message: 'Category deleted' });
});
