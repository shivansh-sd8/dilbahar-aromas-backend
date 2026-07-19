import Joi from 'joi';

const seo = Joi.object({
  metaTitle: Joi.string().max(70).allow(''),
  metaDescription: Joi.string().max(320).allow(''),
  keywords: Joi.array().items(Joi.string()),
  canonicalUrl: Joi.string().uri().allow(''),
  ogImage: Joi.string().allow(''),
  noIndex: Joi.boolean(),
  structuredDataType: Joi.string().valid(
    'Article',
    'BlogPosting',
    'Product',
    'LocalBusiness',
    'FAQPage',
    'WebPage',
    'None'
  ),
  jsonLd: Joi.string().allow(''),
});

const faq = Joi.object({
  question: Joi.string().required(),
  answer: Joi.string().required(),
});

export const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  register: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'editor', 'b2b', 'customer'),
  }),
  signup: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

export const blogSchemas = {
  create: Joi.object({
    title: Joi.string().required(),
    slug: Joi.string().allow(''),
    excerpt: Joi.string().max(320).allow(''),
    body: Joi.string().required(),
    coverImage: Joi.string().allow(''),
    author: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string()),
    category: Joi.string().allow(''),
    language: Joi.string().valid('en', 'hi'),
    status: Joi.string().valid('draft', 'published'),
    readingMinutes: Joi.number().min(1),
    seo,
  }),
  update: Joi.object({
    title: Joi.string(),
    slug: Joi.string(),
    excerpt: Joi.string().max(320).allow(''),
    body: Joi.string(),
    coverImage: Joi.string().allow(''),
    author: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string()),
    category: Joi.string().allow(''),
    language: Joi.string().valid('en', 'hi'),
    status: Joi.string().valid('draft', 'published'),
    readingMinutes: Joi.number().min(1),
    seo,
  }).min(1),
};

export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    slug: Joi.string().allow(''),
    heading: Joi.string().allow(''),
    introCopy: Joi.string().allow(''),
    seoCopy: Joi.string().allow(''),
    image: Joi.string().allow(''),
    icon: Joi.string().allow(''),
    order: Joi.number(),
    isActive: Joi.boolean(),
    faqs: Joi.array().items(faq),
    seo,
  }),
  update: Joi.object({
    name: Joi.string(),
    slug: Joi.string(),
    heading: Joi.string().allow(''),
    introCopy: Joi.string().allow(''),
    seoCopy: Joi.string().allow(''),
    image: Joi.string().allow(''),
    icon: Joi.string().allow(''),
    order: Joi.number(),
    isActive: Joi.boolean(),
    faqs: Joi.array().items(faq),
    seo,
  }).min(1),
};

export const citySchemas = {
  create: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().allow(''),
    slug: Joi.string().allow(''),
    headingOverride: Joi.string().allow(''),
    introOverride: Joi.string().allow(''),
    bodyOverride: Joi.string().allow(''),
    areasServed: Joi.array().items(Joi.string()),
    featuredCategorySlugs: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
    seo,
  }),
  update: Joi.object({
    city: Joi.string(),
    state: Joi.string().allow(''),
    slug: Joi.string(),
    headingOverride: Joi.string().allow(''),
    introOverride: Joi.string().allow(''),
    bodyOverride: Joi.string().allow(''),
    areasServed: Joi.array().items(Joi.string()),
    featuredCategorySlugs: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
    seo,
  }).min(1),
};

const variant = Joi.object({
  size: Joi.string().required(),
  sku: Joi.string().allow(''),
  price: Joi.number().min(0).required(),
  mrp: Joi.number().min(0),
  stock: Joi.number().min(0),
  isDefault: Joi.boolean(),
});

const productBase = {
  name: Joi.string(),
  localName: Joi.string().allow(''),
  slug: Joi.string().allow(''),
  botanicalName: Joi.string().allow(''),
  emoji: Joi.string().allow(''),
  images: Joi.array().items(Joi.string()),
  tagline: Joi.string().allow(''),
  shortDescription: Joi.string().allow(''),
  description: Joi.string().allow(''),
  origin: Joi.string().allow(''),
  extractionMethod: Joi.string().allow(''),
  useTags: Joi.array().items(Joi.string()),
  benefits: Joi.array().items(Joi.string()),
  howToUse: Joi.string().allow(''),
  ingredients: Joi.string().allow(''),
  safetyNotes: Joi.string().allow(''),
  audience: Joi.string().valid('D2C', 'B2B', 'Both'),
  categorySlugs: Joi.array().items(Joi.string()),
  variants: Joi.array().items(variant),
  faqs: Joi.array().items(faq),
  relatedSlugs: Joi.array().items(Joi.string()),
  ratingAvg: Joi.number().min(0).max(5),
  ratingCount: Joi.number().min(0),
  bestseller: Joi.boolean(),
  isActive: Joi.boolean(),
  order: Joi.number(),
  seo,
};

export const productSchemas = {
  create: Joi.object({ ...productBase, name: Joi.string().required() }),
  update: Joi.object(productBase).min(1),
};

export const contactSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(''),
    subject: Joi.string().allow(''),
    message: Joi.string().min(5).required(),
    type: Joi.string().valid('general', 'b2b', 'export', 'wholesale'),
  }),
};

const lineItem = Joi.object({
  slug: Joi.string().allow(''),
  name: Joi.string().allow(''),
  size: Joi.string().allow(''),
  qty: Joi.number().min(1),
  price: Joi.number().min(0),
});

export const enquirySchemas = {
  create: Joi.object({
    type: Joi.string().valid('quote', 'sample', 'b2b', 'wholesale', 'export'),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(''),
    company: Joi.string().allow(''),
    gstin: Joi.string().allow(''),
    city: Joi.string().allow(''),
    message: Joi.string().allow(''),
    items: Joi.array().items(lineItem),
    source: Joi.string().allow(''),
  }),
  update: Joi.object({
    status: Joi.string().valid('new', 'contacted', 'quoted', 'closed').required(),
  }),
};

export const orderSchemas = {
  create: Joi.object({
    customer: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      address: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      pincode: Joi.string().allow(''),
    }).required(),
    items: Joi.array().items(lineItem).min(1).required(),
    paymentMethod: Joi.string().valid('cod', 'razorpay'),
    notes: Joi.string().allow(''),
  }),
  verify: Joi.object({
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
  }),
  update: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'failed'),
  }).min(1),
};
