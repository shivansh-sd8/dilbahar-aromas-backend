import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ContactMessage from '../models/ContactMessage.js';

// POST /api/contact  (public)
export const createMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.body);
  res.status(201).json({ success: true, data: { id: message._id }, message: 'Message received' });
});

// GET /api/contact  (admin)
export const listMessages = asyncHandler(async (req, res) => {
  const items = await ContactMessage.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

// PATCH /api/contact/:id  (admin: mark handled)
export const updateMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { handled: req.body.handled ?? true },
    { new: true }
  );
  if (!message) throw ApiError.notFound('Message not found');
  res.json({ success: true, data: message });
});
