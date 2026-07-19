import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Reusable SEO sub-document shared across Blog posts, City pages and Categories.
 * Powers <title>, meta description, canonical, OpenGraph and JSON-LD output.
 */
export const SeoSchema = new Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 320 },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    noIndex: { type: Boolean, default: false },
    structuredDataType: {
      type: String,
      enum: ['Article', 'BlogPosting', 'Product', 'LocalBusiness', 'FAQPage', 'WebPage', 'None'],
      default: 'WebPage',
    },
    // Raw JSON-LD pasted by an editor. When set, it overrides the auto-generated
    // primary schema for that page (breadcrumbs/FAQ are still auto-added).
    jsonLd: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

export default SeoSchema;
