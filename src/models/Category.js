import mongoose from 'mongoose';
import slugify from 'slugify';
import SeoSchema from './seoSchema.js';

const { Schema } = mongoose;

const FaqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    heading: { type: String, trim: true }, // benefit-led H1
    introCopy: { type: String, trim: true }, // 100-150 words above grid
    seoCopy: { type: String, trim: true }, // 300-word educational block below grid
    image: { type: String, trim: true },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    faqs: { type: [FaqSchema], default: [] },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

CategorySchema.pre('validate', function preValidate(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Category', CategorySchema);
