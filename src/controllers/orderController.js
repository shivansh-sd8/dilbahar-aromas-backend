import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Order from '../models/Order.js';

const FREE_SHIPPING_OVER = 999;
const FLAT_SHIPPING = 79;

const razorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

function computeTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
  const shipping = subtotal >= FREE_SHIPPING_OVER || subtotal === 0 ? 0 : FLAT_SHIPPING;
  return { subtotal, shipping, total: subtotal + shipping };
}

// POST /api/orders  (public)
export const createOrder = asyncHandler(async (req, res) => {
  const { customer, items = [], paymentMethod = 'cod', notes } = req.body;
  if (!items.length) throw ApiError.badRequest('Order must contain at least one item');

  const { subtotal, shipping, total } = computeTotals(items);

  const order = await Order.create({
    customer,
    items,
    subtotal,
    shipping,
    total,
    paymentMethod,
    notes,
  });

  // Optional Razorpay integration point.
  let razorpay = null;
  if (paymentMethod === 'razorpay' && razorpayConfigured()) {
    try {
      const { default: Razorpay } = await import('razorpay');
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const rzpOrder = await rzp.orders.create({
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: order.orderNumber,
      });
      order.razorpayOrderId = rzpOrder.id;
      await order.save();
      razorpay = { orderId: rzpOrder.id, keyId: process.env.RAZORPAY_KEY_ID, amount: rzpOrder.amount };
    } catch (err) {
      // Leave as pending; frontend can fall back to COD or contact.
      razorpay = { error: 'Razorpay unavailable', configured: false };
    }
  }

  res.status(201).json({
    success: true,
    data: {
      id: order._id,
      orderNumber: order.orderNumber,
      subtotal,
      shipping,
      total,
      paymentMethod,
      razorpay,
      razorpayConfigured: razorpayConfigured(),
    },
    message: 'Order placed',
  });
});

// POST /api/orders/verify  (public) — verify a Razorpay payment signature
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!razorpayConfigured()) throw ApiError.badRequest('Payments are not configured');

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expected !== razorpaySignature) throw ApiError.badRequest('Invalid payment signature');

  const order = await Order.findOneAndUpdate(
    { razorpayOrderId },
    { paymentStatus: 'paid', razorpayPaymentId, status: 'confirmed' },
    { new: true }
  );
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ success: true, data: { orderNumber: order.orderNumber } });
});

// GET /api/orders/track?orderNumber=&email=  (public) — customer order tracking
export const trackOrder = asyncHandler(async (req, res) => {
  const orderNumber = String(req.query.orderNumber || '').trim().toUpperCase();
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!orderNumber || !email) throw ApiError.badRequest('orderNumber and email are required');

  const order = await Order.findOne({ orderNumber });
  if (!order || order.customer.email.toLowerCase() !== email) {
    throw ApiError.notFound('No matching order found. Check the order number and email.');
  }

  res.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      createdAt: order.createdAt,
    },
  });
});

// GET /api/orders/mine  (authenticated customer) — orders matching the user's email
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'customer.email': req.user.email.toLowerCase() }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// GET /api/orders  (admin)  ?status=
export const listOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const items = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

// GET /api/orders/:id  (admin)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id  (admin: update status / paymentStatus)
export const updateOrder = asyncHandler(async (req, res) => {
  const update = {};
  if (req.body.status) update.status = req.body.status;
  if (req.body.paymentStatus) update.paymentStatus = req.body.paymentStatus;
  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ success: true, data: order });
});
