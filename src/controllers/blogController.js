import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import BlogPost from '../models/BlogPost.js';

// GET /api/blog  (public: published only) | ?all=true for admin
// ?fields=slug,title to return only selected fields (lightweight for SSG)
export const listPosts = asyncHandler(async (req, res) => {
  const { language, tag, category, status, page = 1, limit = 12, q, fields } = req.query;
  const filter = {};

  // Public listing returns published only. Admins/editors see every status,
  // or a specific status when explicitly requested.
  const isPrivileged = req.user && ['admin', 'editor'].includes(req.user.role);
  if (isPrivileged) {
    if (status) filter.status = status;
  } else {
    filter.status = 'published';
  }

  if (language) filter.language = language;
  if (tag) filter.tags = tag;
  if (category) filter.category = category;
  if (q) filter.title = { $regex: q, $options: 'i' };

  // Build projection if fields param provided (e.g., fields=slug,title)
  let projection = null;
  if (fields) {
    projection = {};
    fields.split(',').forEach((f) => {
      const field = f.trim();
      if (field) projection[field] = 1;
    });
  }

  const skip = (Number(page) - 1) * Number(limit);
  const query = BlogPost.find(filter, projection).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(Number(limit));
  const [items, total] = await Promise.all([
    query,
    BlogPost.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

// GET /api/blog/:slug
export const getPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug });
  if (!post) throw ApiError.notFound('Blog post not found');

  const isPrivileged = req.user && ['admin', 'editor'].includes(req.user.role);
  if (post.status !== 'published' && !isPrivileged) {
    throw ApiError.notFound('Blog post not found');
  }
  res.json({ success: true, data: post });
});

// GET /api/blog/admin/:id
export const getPostById = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw ApiError.notFound('Blog post not found');
  res.json({ success: true, data: post });
});

// POST /api/blog
export const createPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.create(req.body);
  res.status(201).json({ success: true, data: post });
});

// PUT /api/blog/:id
export const updatePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw ApiError.notFound('Blog post not found');
  Object.assign(post, req.body);
  if (post.status === 'published' && !post.publishedAt) post.publishedAt = new Date();
  await post.save();
  res.json({ success: true, data: post });
});

// DELETE /api/blog/:id
export const deletePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) throw ApiError.notFound('Blog post not found');
  res.json({ success: true, message: 'Blog post deleted' });
});
