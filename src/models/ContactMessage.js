import mongoose from 'mongoose';

const { Schema } = mongoose;

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['general', 'b2b', 'export', 'wholesale'], default: 'general' },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', ContactMessageSchema);
