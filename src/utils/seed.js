import mongoose from 'mongoose';
import env from '../config/env.js';
import logger from '../config/logger.js';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import BlogPost from '../models/BlogPost.js';
import CityPage from '../models/CityPage.js';
import Product from '../models/Product.js';
import { products as seedProductsData } from './seedCatalog.js';

const categories = [
  {
    name: 'Essential Oils',
    slug: 'essential-oils',
    heading: 'Pure Essential Oils from Kannauj — GC-MS Verified Every Batch',
    introCopy:
      'Explore our complete range of Kannauj essential oils, steam-distilled in copper degs since 1959. Every oil is single-origin, never re-blended, and carries a per-batch GC-MS report you can verify online.',
    seoCopy:
      'Our essential oils are distilled at source in Kannauj, the perfume capital of India. From eucalyptus and nilgiri to ruh khus and sandalwood, each oil is traceable to its batch. Learn how to dilute, store and use them safely in our guides.',
    icon: 'droplet',
    order: 1,
    faqs: [
      { question: 'Are your essential oils 100% pure?', answer: 'Yes. Every batch is steam-distilled in-house and accompanied by a GC-MS report you can verify with your batch code.' },
      { question: 'Do you offer Cash on Delivery?', answer: 'Yes, COD is available across India on orders up to ₹10,000.' },
    ],
    seo: { metaTitle: 'Buy Pure Essential Oils Online | Dil Bahar Aromas', metaDescription: 'Shop 100% pure, GC-MS verified essential oils distilled in Kannauj since 1959. COD available, free shipping over ₹999.', structuredDataType: 'WebPage' },
  },
  {
    name: 'Hair Growth Oils',
    slug: 'hair-growth-oils',
    heading: 'Pure Hair Growth Oils — Ruh Khus, Nilgiri & Laung from Kannauj',
    introCopy:
      'Nourish your scalp with single-origin oils traditionally used for hair growth and strength. Cold-handled, GC-MS verified and distilled in Kannauj.',
    seoCopy:
      'Ruh khus, nilgiri and laung oils have long been used in Indian hair-care rituals. Always dilute with a carrier oil before scalp application — see our dilution guide for exact ratios.',
    icon: 'sprout',
    order: 2,
    seo: { metaTitle: 'Hair Growth Essential Oils | Dil Bahar Aromas', structuredDataType: 'WebPage' },
  },
  {
    name: 'Skin Care Oils',
    slug: 'skin-care-oils',
    heading: 'Skin Care Essential Oils — Sandalwood, Kesar & Hina',
    introCopy:
      'Luxurious, single-origin oils for radiant skin — distilled in Kannauj and verified per batch.',
    seoCopy:
      'Sandalwood, kesar and hina have been part of Ayurvedic skincare for centuries. Patch-test and dilute before use.',
    icon: 'sparkles',
    order: 3,
    seo: { structuredDataType: 'WebPage' },
  },
  {
    name: 'Pooja & Ritual Oils',
    slug: 'pooja-ritual-oils',
    heading: 'Pooja & Ritual Oils — Sandalwood, Hina, Kewra & Kesar',
    introCopy:
      'Sacred, traditional fragrances for daily worship, festivals and ceremonies — distilled in Kannauj since 1959.',
    seoCopy:
      'Our pooja oils carry the authentic aromas of Kannauj used in temples and homes across India for generations.',
    icon: 'flame',
    order: 4,
    seo: { structuredDataType: 'WebPage' },
  },
  {
    name: 'Floral Waters',
    slug: 'floral-waters',
    heading: 'Floral Waters — Food & Cosmetic Grade Kewra Water',
    introCopy:
      'Authentic Kannauj kewra (kewda) water for biryani, sweets and skincare. Available in food-grade and cosmetic-grade.',
    seoCopy:
      'Kewra water adds a signature aroma to biryani and Indian sweets, and soothes skin as a natural toner. Distilled in Kannauj.',
    icon: 'flower',
    order: 5,
    seo: { structuredDataType: 'WebPage' },
  },
  {
    name: 'Luxury Oils',
    slug: 'luxury-oils',
    heading: 'Luxury Oils — Ruh Khus, Mysore Sandalwood & Kesar',
    introCopy:
      'Our rarest, most precious distillations — the heritage oils Kannauj is famous for worldwide.',
    seoCopy:
      'Ruh khus, Mysore sandalwood and kesar represent the pinnacle of Kannauj distillation. Limited batches, fully traceable.',
    icon: 'gem',
    order: 6,
    seo: { structuredDataType: 'WebPage' },
  },
  {
    name: 'Aroma Compounds',
    slug: 'compounds',
    heading: 'Aroma & Fragrance Compounds — Agarbatti, Gudaku & Gundi',
    introCopy:
      'Ready-to-use fragrance compounds formulated in Kannauj for incense (agarbatti) and tobacco (gudaku, gundi) manufacturing — consistent aroma, supplied in bulk per kg.',
    seoCopy:
      'Our aroma compounds are blended for manufacturers who need a consistent, long-lasting fragrance base for agarbatti and tobacco products. Available wholesale, per kg.',
    icon: 'flask',
    order: 7,
    seo: { metaTitle: 'Aroma & Fragrance Compounds — Wholesale | Dil Bahar Aromas', structuredDataType: 'WebPage' },
  },
];

const blogPosts = [
  {
    title: 'Ruh Khus: The Oil of Tranquility from Kannauj',
    slug: 'ruh-khus-oil-of-tranquility-kannauj',
    excerpt: 'Discover ruh khus (wild vetiver) — its cooling aroma, traditional uses, and why Kannauj distillation is unmatched.',
    body: '<p>Ruh khus, distilled from wild vetiver roots, is one of Kannauj\u2019s most prized oils. Known as the \u201coil of tranquility\u201d, it carries a deep, earthy, cooling aroma...</p>',
    coverImage: '',
    tags: ['ruh khus', 'vetiver', 'kannauj'],
    category: 'Heritage',
    language: 'en',
    status: 'published',
    seo: { metaTitle: 'Ruh Khus Oil from Kannauj — Benefits & Uses', metaDescription: 'Learn about ruh khus (wild vetiver) oil from Kannauj: aroma, benefits, traditional uses and how it is distilled.', structuredDataType: 'BlogPosting' },
  },
  {
    title: 'Nilgiri Tel ke Fayde — Sardi-Zukam aur Sehat ke Liye',
    slug: 'nilgiri-tel-ke-fayde',
    excerpt: 'Nilgiri (eucalyptus) tel ke fayde, istemal ka tarika aur safety — Hindi mein vistaar se.',
    body: '<p>Nilgiri tel (eucalyptus oil) sardi-zukam, band naak aur steam inhalation ke liye paramparik roop se istemal hota hai...</p>',
    coverImage: '',
    tags: ['nilgiri', 'eucalyptus', 'fayde'],
    category: 'Guides',
    language: 'hi',
    status: 'published',
    seo: { metaTitle: 'Nilgiri Tel ke Fayde | Dil Bahar Aromas', metaDescription: 'Nilgiri (eucalyptus) tel ke fayde, sardi-zukam ke liye istemal aur safety. Kannauj se shudh nilgiri tel.', structuredDataType: 'BlogPosting' },
  },
  {
    title: 'Kewra Water Uses — From Biryani to Skincare',
    slug: 'kewra-water-uses-biryani-skincare',
    excerpt: 'How to use Kannauj kewra water in cooking and skincare, plus food-grade vs cosmetic-grade differences.',
    body: '<p>Kewra (kewda) water is a fragrant distillate used in biryani, Indian sweets and as a gentle skin toner...</p>',
    coverImage: '',
    tags: ['kewra', 'kewda', 'biryani'],
    category: 'Guides',
    language: 'en',
    status: 'published',
    seo: { metaTitle: 'Kewra Water Uses for Biryani & Skincare', structuredDataType: 'BlogPosting' },
  },
];

const cityPages = [
  { city: 'Lucknow', state: 'Uttar Pradesh', areasServed: ['Hazratganj', 'Gomti Nagar', 'Aliganj'] },
  { city: 'Kanpur', state: 'Uttar Pradesh', areasServed: ['Civil Lines', 'Swaroop Nagar'] },
  { city: 'Delhi', state: 'Delhi NCR', areasServed: ['South Delhi', 'Dwarka', 'Rohini'] },
  { city: 'Mumbai', state: 'Maharashtra', areasServed: ['Andheri', 'Bandra', 'Thane'] },
];

const RESET = process.argv.includes('--reset');

async function seed() {
  await connectDB();

  if (RESET) {
    await mongoose.connection.dropDatabase();
    logger.warn(`Dropped database "${mongoose.connection.name}" (--reset)`);
  }

  const adminExists = await User.findOne({ email: env.adminEmail });
  if (!adminExists) {
    const admin = new User({ name: 'Site Admin', email: env.adminEmail, role: 'admin' });
    await admin.setPassword(env.adminPassword);
    await admin.save();
    logger.info(`Created admin user: ${env.adminEmail}`);
  } else {
    logger.info('Admin user already exists — skipping');
  }

  for (const c of categories) {
    await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  logger.info(`Seeded ${categories.length} categories`);

  for (const p of blogPosts) {
    await BlogPost.findOneAndUpdate({ slug: p.slug }, { ...p, publishedAt: new Date() }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  logger.info(`Seeded ${blogPosts.length} blog posts`);

  for (const city of cityPages) {
    const slug = `essential-oils-in-${city.city.toLowerCase()}`;
    await CityPage.findOneAndUpdate({ slug }, { ...city, slug, isActive: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  logger.info(`Seeded ${cityPages.length} city pages`);

  // Replace the catalog with the current wholesale price list.
  const keepSlugs = seedProductsData.map((p) => p.slug);
  await Product.deleteMany({ slug: { $nin: keepSlugs } });
  for (const p of seedProductsData) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  logger.info(`Seeded ${seedProductsData.length} products (catalog replaced)`);

  await mongoose.connection.close();
  logger.info('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  logger.error(err.stack || err.message);
  process.exit(1);
});
