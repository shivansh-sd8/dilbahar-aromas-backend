// One-off migration: import blog posts from a WordPress mysqldump (.sql) into
// the BlogPost MongoDB collection.
//
// Usage:
//   node src/utils/importWordPress.js <dump.sql>            # dry-run (no writes)
//   node src/utils/importWordPress.js <dump.sql> --commit   # upsert into MongoDB
//
// It parses the wp_posts / wp_users / wp_terms / wp_term_taxonomy /
// wp_term_relationships / wp_postmeta tables directly from the dump — no MySQL
// server required — and maps published posts (post_type='post') to BlogPost docs.

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import env from '../config/env.js';
import logger from '../config/logger.js';
import connectDB from '../config/db.js';
import BlogPost from '../models/BlogPost.js';

const FILE = process.argv[2];
const COMMIT = process.argv.includes('--commit');

if (!FILE) {
  // eslint-disable-next-line no-console
  console.error('Usage: node src/utils/importWordPress.js <dump.sql> [--commit]');
  process.exit(1);
}

// ── Minimal, correct mysqldump VALUES parser ──────────────────────────────────
// Handles single-quoted strings with backslash escapes and doubled '' quotes,
// unquoted numbers, and NULL. Works across multi-row and multi-statement dumps.
function parseTable(sql, table) {
  const rows = [];
  const header = new RegExp('INSERT INTO `' + table + '` \\(([^)]*)\\) VALUES', 'g');
  let m;
  while ((m = header.exec(sql))) {
    const cols = m[1].split(',').map((c) => c.trim().replace(/`/g, ''));
    let i = header.lastIndex;
    const n = sql.length;
    const ws = () => { while (i < n && /\s/.test(sql[i])) i += 1; };
    let stop = false;
    while (!stop) {
      ws();
      if (sql[i] !== '(') break;
      i += 1;
      const vals = [];
      // read values until ')'
      // eslint-disable-next-line no-constant-condition
      while (true) {
        ws();
        let val;
        if (sql[i] === "'") {
          i += 1;
          let s = '';
          while (i < n) {
            const ch = sql[i];
            if (ch === '\\') {
              const nx = sql[i + 1];
              const map = { n: '\n', r: '\r', t: '\t', '0': '\0', Z: '\x1a', b: '\b' };
              s += nx in map ? map[nx] : nx;
              i += 2;
              continue;
            }
            if (ch === "'") {
              if (sql[i + 1] === "'") { s += "'"; i += 2; continue; }
              i += 1;
              break;
            }
            s += ch;
            i += 1;
          }
          val = s;
        } else {
          let s = '';
          while (i < n && sql[i] !== ',' && sql[i] !== ')') { s += sql[i]; i += 1; }
          s = s.trim();
          val = s === 'NULL' ? null : s;
        }
        vals.push(val);
        ws();
        if (sql[i] === ',') { i += 1; continue; }
        if (sql[i] === ')') { i += 1; break; }
        break;
      }
      const obj = {};
      cols.forEach((c, idx) => { obj[c] = vals[idx]; });
      rows.push(obj);
      ws();
      if (sql[i] === ',') { i += 1; continue; }
      if (sql[i] === ';') { i += 1; stop = true; }
      else stop = true;
    }
    header.lastIndex = i;
  }
  return rows;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const stripTags = (html) => (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
const decodeEntities = (s) =>
  (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&#039;|&#39;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '–');

const isHindi = (s) => /[\u0900-\u097F]/.test(s || '');

// Rewrite absolute/protocol-relative old-site image URLs to relative paths so
// they resolve wherever /wp-content/uploads/ is later served (Nginx/CDN).
const rewriteImageUrls = (s) =>
  (s || '').replace(
    /https?:\/\/(?:www\.)?dilbahararomas\.com(\/wp-content\/uploads\/)/g,
    '$1'
  ).replace(/\/\/(?:www\.)?dilbahararomas\.com(\/wp-content\/uploads\/)/g, '$1');

function readingMinutes(html) {
  const words = stripTags(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function excerptFrom(post) {
  const raw = post.post_excerpt && post.post_excerpt.trim()
    ? post.post_excerpt
    : stripTags(post.post_content);
  const clean = decodeEntities(raw).replace(/\s+/g, ' ').trim();
  return clean.slice(0, 300);
}

async function run() {
  const abs = path.resolve(FILE);
  logger.info(`Reading dump: ${abs}`);
  const sql = fs.readFileSync(abs, 'utf8');

  const posts = parseTable(sql, 'wp_posts');
  const users = parseTable(sql, 'wp_users');
  const terms = parseTable(sql, 'wp_terms');
  const taxonomy = parseTable(sql, 'wp_term_taxonomy');
  const relationships = parseTable(sql, 'wp_term_relationships');
  const postmeta = parseTable(sql, 'wp_postmeta');

  logger.info(
    `Parsed: posts=${posts.length} users=${users.length} terms=${terms.length} ` +
    `taxonomy=${taxonomy.length} relationships=${relationships.length} postmeta=${postmeta.length}`
  );

  // Lookups
  const userById = new Map(users.map((u) => [u.ID, u]));
  const termById = new Map(terms.map((t) => [t.term_id, t]));
  // term_taxonomy_id -> { taxonomy, term }
  const ttById = new Map(
    taxonomy.map((tt) => [tt.term_taxonomy_id, { taxonomy: tt.taxonomy, term: termById.get(tt.term_id) }])
  );
  // object_id -> [{taxonomy, name}]
  const termsByObject = new Map();
  for (const rel of relationships) {
    const tt = ttById.get(rel.term_taxonomy_id);
    if (!tt || !tt.term) continue;
    if (!termsByObject.has(rel.object_id)) termsByObject.set(rel.object_id, []);
    termsByObject.get(rel.object_id).push({ taxonomy: tt.taxonomy, name: tt.term.name, slug: tt.term.slug });
  }
  // attachment id -> url (guid)
  const attachmentUrl = new Map(
    posts.filter((p) => p.post_type === 'attachment').map((p) => [p.ID, p.guid])
  );
  // post_id -> thumbnail attachment id
  const thumbByPost = new Map();
  const rankTitle = new Map();
  const rankDesc = new Map();
  for (const meta of postmeta) {
    if (meta.meta_key === '_thumbnail_id') thumbByPost.set(meta.post_id, meta.meta_value);
    if (meta.meta_key === 'rank_math_title') rankTitle.set(meta.post_id, meta.meta_value);
    if (meta.meta_key === 'rank_math_description') rankDesc.set(meta.post_id, meta.meta_value);
  }

  const published = posts.filter((p) => p.post_type === 'post' && p.post_status === 'publish');
  logger.info(`Published posts to import: ${published.length}`);

  const docs = published.map((p) => {
    const tax = termsByObject.get(p.ID) || [];
    const categories = tax.filter((t) => t.taxonomy === 'category').map((t) => t.name);
    const tags = tax.filter((t) => t.taxonomy === 'post_tag').map((t) => t.name);
    const author = userById.get(p.post_author);
    const thumbId = thumbByPost.get(p.ID);
    const coverImage = thumbId ? attachmentUrl.get(thumbId) || '' : '';
    const title = decodeEntities(p.post_title).trim();
    const body = rewriteImageUrls(p.post_content || '');
    const dateStr = p.post_date_gmt && p.post_date_gmt !== '0000-00-00 00:00:00'
      ? p.post_date_gmt
      : p.post_date;
    return {
      title,
      slug: (p.post_name || '').toLowerCase(),
      excerpt: excerptFrom(p),
      body,
      coverImage: rewriteImageUrls(coverImage),
      author: author ? author.display_name || author.user_login : 'Dil Bahar Aromas',
      tags,
      category: categories[0] || 'Blog',
      language: isHindi(title + ' ' + stripTags(body).slice(0, 500)) ? 'hi' : 'en',
      status: 'published',
      readingMinutes: readingMinutes(body),
      publishedAt: dateStr ? new Date(dateStr.replace(' ', 'T') + 'Z') : new Date(),
      seo: {
        metaTitle: (rankTitle.get(p.ID) || title).slice(0, 60),
        metaDescription: (rankDesc.get(p.ID) || excerptFrom(p)).slice(0, 160),
      },
    };
  });

  // Report
  const cats = {};
  let missingCover = 0;
  let hindi = 0;
  for (const d of docs) {
    cats[d.category] = (cats[d.category] || 0) + 1;
    if (!d.coverImage) missingCover += 1;
    if (d.language === 'hi') hindi += 1;
  }
  logger.info(`Categories: ${JSON.stringify(cats)}`);
  logger.info(`Hindi posts: ${hindi} | English: ${docs.length - hindi}`);
  logger.info(`Posts without cover image: ${missingCover}`);
  logger.info('Sample (first 5):');
  docs.slice(0, 5).forEach((d) => {
    // eslint-disable-next-line no-console
    console.log(`  • [${d.language}] ${d.title}  (/${d.slug})  ${d.readingMinutes}min\n    cover: ${d.coverImage || 'NONE'}`);
  });

  if (!COMMIT) {
    logger.warn('DRY RUN — no database writes. Re-run with --commit to import.');
    process.exit(0);
  }

  await connectDB();
  let created = 0;
  let updated = 0;
  for (const d of docs) {
    const res = await BlogPost.findOneAndUpdate(
      { slug: d.slug },
      { $set: d },
      { upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true }
    );
    if (res.lastErrorObject && res.lastErrorObject.updatedExisting) updated += 1;
    else created += 1;
  }
  logger.info(`Import complete. Created: ${created}, Updated: ${updated}, Total: ${docs.length}`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  logger.error(err.stack || err.message);
  process.exit(1);
});
