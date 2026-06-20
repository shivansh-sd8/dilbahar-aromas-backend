import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    slug: { type: String, trim: true },
    name: { type: String, trim: true },
    size: { type: String, trim: true },
    qty: { type: Number, min: 1, default: 1 },
    price: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, min: 0, default: 0 },
    shipping: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
    paymentMethod: { type: String, enum: ['cod', 'razorpay'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

OrderSchema.pre('validate', function setOrderNumber(next) {
  if (!this.orderNumber) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `DBA-${Date.now().toString(36).toUpperCase()}-${rand}`;
  }
  next();
});

export default mongoose.model('Order', OrderSchema);
