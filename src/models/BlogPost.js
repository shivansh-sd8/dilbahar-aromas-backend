import mongoose from 'mongoose';
import slugify from 'slugify';
import SeoSchema from './seoSchema.js';

const { Schema } = mongoose;

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true, maxlength: 320 },
    body: { type: String, required: true }, // rich HTML / markdown
    coverImage: { type: String, trim: true },
    author: { type: String, trim: true, default: 'Dil Bahar Aromas' },
    tags: { type: [String], default: [], index: true },
    category: { type: String, trim: true }, // editorial grouping
    language: { type: String, enum: ['en', 'hi'], default: 'en', index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    readingMinutes: { type: Number, default: 4 },
    publishedAt: { type: Date },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

BlogPostSchema.index({ status: 1, language: 1, publishedAt: -1 });

BlogPostSchema.pre('validate', function preValidate(next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.model('BlogPost', BlogPostSchema);
