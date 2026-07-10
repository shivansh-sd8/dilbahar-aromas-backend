import asyncHandler from '../utils/asyncHandler.js';
import SiteConfig from '../models/SiteConfig.js';

const DEFAULT_ROBOTS = `User-agent: *\nAllow: /\n\nSitemap: https://dilbahararomas.com/sitemap.xml`;

/**
 * Get the full SEO / site configuration (public).
 * Used by the frontend layout to inject metadata, schemas and social links.
 */
export const getSiteConfig = asyncHandler(async (req, res) => {
  const config = await SiteConfig.findOne({ key: 'default' }).lean();
  res.json({
    success: true,
    data: {
      siteUrl: config?.siteUrl || '',
      defaultMetaTitle: config?.defaultMetaTitle || '',
      defaultMetaDescription: config?.defaultMetaDescription || '',
      defaultOgImage: config?.defaultOgImage || '',
      twitterHandle: config?.twitterHandle || '',
      canonicalBaseUrl: config?.canonicalBaseUrl || '',
      robotsTxt: config?.robotsTxt || '',
      llmsTxt: config?.llmsTxt || '',
      jsonLdSchema: config?.jsonLdSchema || '',
      socialLinks: config?.socialLinks || {},
    },
  });
});

/**
 * Update the full site configuration (admin/editor only).
 */
export const updateSiteConfig = asyncHandler(async (req, res) => {
  const {
    siteUrl,
    defaultMetaTitle,
    defaultMetaDescription,
    defaultOgImage,
    twitterHandle,
    canonicalBaseUrl,
    robotsTxt,
    llmsTxt,
    jsonLdSchema,
    socialLinks,
  } = req.body;

  const update = {};
  if (typeof siteUrl === 'string') update.siteUrl = siteUrl;
  if (typeof defaultMetaTitle === 'string') update.defaultMetaTitle = defaultMetaTitle;
  if (typeof defaultMetaDescription === 'string') update.defaultMetaDescription = defaultMetaDescription;
  if (typeof defaultOgImage === 'string') update.defaultOgImage = defaultOgImage;
  if (typeof twitterHandle === 'string') update.twitterHandle = twitterHandle;
  if (typeof canonicalBaseUrl === 'string') update.canonicalBaseUrl = canonicalBaseUrl;
  if (typeof robotsTxt === 'string') update.robotsTxt = robotsTxt;
  if (typeof llmsTxt === 'string') update.llmsTxt = llmsTxt;
  if (typeof jsonLdSchema === 'string') update.jsonLdSchema = jsonLdSchema;
  if (socialLinks && typeof socialLinks === 'object') update.socialLinks = socialLinks;

  const config = await SiteConfig.findOneAndUpdate(
    { key: 'default' },
    { $set: update },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, data: config });
});

/**
 * Get the uploaded llms.txt content (public).
 */
export const getLlmsTxt = asyncHandler(async (req, res) => {
  const config = await SiteConfig.findOne({ key: 'default' }).lean();
  res.json({ success: true, data: { content: config?.llmsTxt || '' } });
});

/**
 * Get the uploaded robots.txt content (public).
 */
export const getRobotsTxt = asyncHandler(async (req, res) => {
  const config = await SiteConfig.findOne({ key: 'default' }).lean();
  res.json({ success: true, data: { content: config?.robotsTxt || DEFAULT_ROBOTS } });
});
