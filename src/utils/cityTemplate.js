/**
 * City page template engine.
 * Produces a fully-resolved city landing page from a CityPage document by
 * interpolating the city name into shared template copy. Any non-empty
 * override on the document takes precedence over the template default.
 */

const BRAND = 'Dil Bahar Aromas';
const ORIGIN = 'Kannauj, Uttar Pradesh';
const FOUNDED = 1959;

export function resolveCityPage(doc) {
  const city = doc.city;
  const state = doc.state || 'India';

  const heading =
    doc.headingOverride ||
    `Buy Pure Essential Oils in ${city} — Kannauj-Distilled, GC-MS Verified`;

  const intro =
    doc.introOverride ||
    `Looking for 100% pure essential oils in ${city}? ${BRAND} distils every oil in ` +
      `the copper degs of ${ORIGIN} and has done so since ${FOUNDED}. We ship GC-MS ` +
      `verified essential oils, floral waters and carrier oils across ${city} and ` +
      `${state} with Cash on Delivery, fast dispatch and per-batch lab reports.`;

  const body =
    doc.bodyOverride ||
    `Customers in ${city} choose ${BRAND} because we do not source or re-blend — we ` +
      `distil at origin in Kannauj. Whether you need essential oils for hair growth, ` +
      `skincare, aromatherapy or pooja rituals, every order shipped to ${city} carries a ` +
      `unique batch code you can verify online. We also serve agarbatti, cosmetic and ` +
      `perfumery manufacturers in and around ${city} with bulk and wholesale pricing.`;

  const areasServed = doc.areasServed?.length ? doc.areasServed : [city];

  // SEO defaults (overridden by any populated seo fields)
  const seo = doc.seo || {};
  const resolvedSeo = {
    metaTitle: seo.metaTitle || `Essential Oils in ${city} | ${BRAND} — Since ${FOUNDED}`,
    metaDescription:
      seo.metaDescription ||
      `Buy 100% pure, GC-MS verified essential oils in ${city}. Kannauj-distilled by ` +
        `${BRAND} since ${FOUNDED}. COD available, fast delivery across ${city}, ${state}.`,
    keywords:
      seo.keywords?.length
        ? seo.keywords
        : [
            `essential oils ${city}`,
            `buy essential oils in ${city}`,
            `pure essential oils ${city}`,
            `essential oil supplier ${city}`,
          ],
    canonicalUrl: seo.canonicalUrl || '',
    ogImage: seo.ogImage || '',
    noIndex: seo.noIndex || false,
    structuredDataType: seo.structuredDataType || 'LocalBusiness',
  };

  return {
    _id: doc._id,
    city,
    state,
    slug: doc.slug,
    heading,
    intro,
    body,
    areasServed,
    featuredCategorySlugs: doc.featuredCategorySlugs || [],
    isActive: doc.isActive,
    seo: resolvedSeo,
    updatedAt: doc.updatedAt,
  };
}

export default resolveCityPage;
