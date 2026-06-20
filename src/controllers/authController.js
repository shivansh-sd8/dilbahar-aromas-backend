import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import signToken from '../utils/token.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const token = signToken(user);
  res.json({ success: true, data: { token, user: user.toJSON() } });
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  const user = new User({ name, email, role: role || 'customer' });
  await user.setPassword(password);
  await user.save();

  const token = signToken(user);
  res.status(201).json({ success: true, data: { token, user: user.toJSON() } });
});

// Public storefront customer signup (always role 'customer').
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered. Please log in instead.');

  const user = new User({ name, email, role: 'customer' });
  await user.setPassword(password);
  await user.save();

  const token = signToken(user);
  res.status(201).json({ success: true, data: { token, user: user.toJSON() } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toJSON() });
});
