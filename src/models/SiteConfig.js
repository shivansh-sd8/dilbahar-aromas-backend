import mongoose from 'mongoose';

const { Schema } = mongoose;

const SocialLinksSchema = new Schema(
  {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    x: { type: String, default: '' },
    pinterest: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },
  { _id: false }
);

/**
 * Site-level configuration singleton.
 * Stores SEO globals, social links, llms.txt, robots.txt and JSON-LD schema.
 * Use findOne({ key: 'default' }) / upsert to maintain a single document.
 */
const SiteConfigSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true, index: true },
    siteUrl: { type: String, default: '' },
    defaultMetaTitle: { type: String, default: '' },
    defaultMetaDescription: { type: String, default: '' },
    defaultOgImage: { type: String, default: '' },
    twitterHandle: { type: String, default: '' },
    canonicalBaseUrl: { type: String, default: '' },
    robotsTxt: { type: String, default: '' },
    llmsTxt: { type: String, default: '' },
    jsonLdSchema: { type: String, default: '' },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model('SiteConfig', SiteConfigSchema);
