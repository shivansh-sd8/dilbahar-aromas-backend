import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import CityPage from '../models/CityPage.js';
import resolveCityPage from '../utils/cityTemplate.js';

// GET /api/city-pages  (public: resolved + active only)
export const listCityPages = asyncHandler(async (req, res) => {
  const isPrivileged = req.user && ['admin', 'editor'].includes(req.user.role);
  const filter = isPrivileged ? {} : { isActive: true };
  const items = await CityPage.find(filter).sort({ city: 1 });
  const data = isPrivileged ? items : items.map(resolveCityPage);
  res.json({ success: true, data });
});

// GET /api/city-pages/:slug  (public: template-resolved)
export const getCityPage = asyncHandler(async (req, res) => {
  const page = await CityPage.findOne({ slug: req.params.slug });
  if (!page || (!page.isActive && !(req.user && ['admin', 'editor'].includes(req.user.role)))) {
    throw ApiError.notFound('City page not found');
  }
  res.json({ success: true, data: resolveCityPage(page) });
});

// GET /api/city-pages/admin/:id  (raw doc for editing)
export const getCityPageById = asyncHandler(async (req, res) => {
  const page = await CityPage.findById(req.params.id);
  if (!page) throw ApiError.notFound('City page not found');
  res.json({ success: true, data: page });
});

// POST /api/city-pages
export const createCityPage = asyncHandler(async (req, res) => {
  const page = await CityPage.create(req.body);
  res.status(201).json({ success: true, data: page });
});

// PUT /api/city-pages/:id
export const updateCityPage = asyncHandler(async (req, res) => {
  const page = await CityPage.findById(req.params.id);
  if (!page) throw ApiError.notFound('City page not found');
  Object.assign(page, req.body);
  await page.save();
  res.json({ success: true, data: page });
});

// DELETE /api/city-pages/:id
export const deleteCityPage = asyncHandler(async (req, res) => {
  const page = await CityPage.findByIdAndDelete(req.params.id);
  if (!page) throw ApiError.notFound('City page not found');
  res.json({ success: true, message: 'City page deleted' });
});
