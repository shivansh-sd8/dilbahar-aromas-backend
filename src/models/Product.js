import mongoose from 'mongoose';
import slugify from 'slugify';
import SeoSchema from './seoSchema.js';

const { Schema } = mongoose;

const VariantSchema = new Schema(
  {
    size: { type: String, required: true, trim: true }, // e.g. "5ml", "15ml", "100ml"
    sku: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 }, // selling price (INR)
    mrp: { type: Number, min: 0 }, // strike-through MRP
    stock: { type: Number, default: 0, min: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const FaqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    localName: { type: String, trim: true }, // Hindi / regional name
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    botanicalName: { type: String, trim: true },

    emoji: { type: String, trim: true },
    images: { type: [String], default: [] },

    tagline: { type: String, trim: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true }, // HTML long-form

    origin: { type: String, trim: true, default: 'Kannauj, India' },
    extractionMethod: { type: String, trim: true, default: 'Steam distillation (deg-bhapka)' },

    useTags: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    howToUse: { type: String, trim: true },
    ingredients: { type: String, trim: true },
    safetyNotes: { type: String, trim: true },

    audience: { type: String, enum: ['D2C', 'B2B', 'Both'], default: 'Both' },
    categorySlugs: { type: [String], default: [], index: true },

    variants: { type: [VariantSchema], default: [] },

    faqs: { type: [FaqSchema], default: [] },
    relatedSlugs: { type: [String], default: [] },

    ratingAvg: { type: Number, default: 4.8, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },

    bestseller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Lowest variant price for cards / listings.
ProductSchema.virtual('priceFrom').get(function priceFrom() {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((min, v) => (v.price < min ? v.price : min), this.variants[0].price);
});

ProductSchema.pre('validate', function preValidate(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // Guarantee one default variant if any exist.
  if (this.variants && this.variants.length && !this.variants.some((v) => v.isDefault)) {
    this.variants[0].isDefault = true;
  }
  next();
});

export default mongoose.model('Product', ProductSchema);
