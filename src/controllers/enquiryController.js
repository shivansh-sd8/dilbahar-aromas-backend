import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Enquiry from '../models/Enquiry.js';

// POST /api/enquiries  (public)
export const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.create(req.body);
  res.status(201).json({
    success: true,
    data: { id: enquiry._id, type: enquiry.type },
    message: 'Enquiry received',
  });
});

// GET /api/enquiries  (admin)  ?type=&status=
export const listEnquiries = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  const items = await Enquiry.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

// GET /api/enquiries/:id  (admin)
export const getEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  res.json({ success: true, data: enquiry });
});

// PATCH /api/enquiries/:id  (admin: update status)
export const updateEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  res.json({ success: true, data: enquiry });
});
