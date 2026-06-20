import mongoose from 'mongoose';

const { Schema } = mongoose;

const LineItemSchema = new Schema(
  {
    slug: { type: String, trim: true },
    name: { type: String, trim: true },
    size: { type: String, trim: true },
    qty: { type: Number, min: 1, default: 1 },
    price: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const EnquirySchema = new Schema(
  {
    type: {
      type: String,
      enum: ['quote', 'sample', 'b2b', 'wholesale', 'export'],
      default: 'quote',
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    gstin: { type: String, trim: true },
    city: { type: String, trim: true },
    message: { type: String, trim: true },
    items: { type: [LineItemSchema], default: [] },
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'closed'],
      default: 'new',
    },
    source: { type: String, trim: true, default: 'website' },
  },
  { timestamps: true }
);

export default mongoose.model('Enquiry', EnquirySchema);
