import mongoose from 'mongoose';
import slugify from 'slugify';
import SeoSchema from './seoSchema.js';

const { Schema } = mongoose;

/**
 * City-wise SEO landing pages.
 * Strategy: TEMPLATE + ADMIN OVERRIDES. The page renders from a shared template
 * with the city name interpolated. Any non-empty override field below replaces
 * the corresponding template default, and `seo` can fully override meta tags.
 */
const CityPageSchema = new Schema(
  {
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: 'India' },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },

    // Optional content overrides (blank => template default used)
    headingOverride: { type: String, trim: true },
    introOverride: { type: String, trim: true },
    bodyOverride: { type: String, trim: true },

    // Targeting data used by the template
    areasServed: { type: [String], default: [] }, // localities / nearby cities
    featuredCategorySlugs: { type: [String], default: [] },

    isActive: { type: Boolean, default: true },
    seo: { type: SeoSchema, default: () => ({ structuredDataType: 'LocalBusiness' }) },
  },
  { timestamps: true }
);

CityPageSchema.pre('validate', function preValidate(next) {
  if (this.city && !this.slug) {
    this.slug = slugify(`essential-oils-in-${this.city}`, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('CityPage', CityPageSchema);
