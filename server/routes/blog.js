const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/blog'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all blog posts (public)
router.get('/', async (req, res) => {
  const { status = 'published', category, limit = 20, offset = 0 } = req.query;

  try {
    let sql = `
      SELECT 
        bp.*,
        u.username as author_name,
        GROUP_CONCAT(bc.name) as categories
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      WHERE 1=1
    `;
    const params = [];

    if (status !== 'all') {
      sql += ' AND bp.status = ?';
      params.push(status);
    }

    if (category) {
      sql += ' AND bc.slug = ?';
      params.push(category);
    }

    sql += ' GROUP BY bp.id ORDER BY bp.published_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const posts = await db.all(sql, params);
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog post by ID (for editing)
router.get('/post/:id', async (req, res) => {
  try {
    const post = await db.get(`
      SELECT 
        bp.*,
        u.username as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.id = ?
    `, [req.params.id]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get categories
    const categories = await db.all(`
      SELECT bc.* FROM blog_categories bc
      JOIN blog_post_categories bpc ON bc.id = bpc.category_id
      WHERE bpc.post_id = ?
    `, [post.id]);

    post.categories = categories;
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog post by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await db.get(`
      SELECT 
        bp.*,
        u.username as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = ? AND bp.status = 'published'
    `, [req.params.slug]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get categories
    const categories = await db.all(`
      SELECT bc.* FROM blog_categories bc
      JOIN blog_post_categories bpc ON bc.id = bpc.category_id
      WHERE bpc.post_id = ?
    `, [post.id]);

    post.categories = categories;
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create blog post (admin only)
router.post('/', authMiddleware, upload.single('featured_image'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('slug').notEmpty().withMessage('Slug is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title, title_uk, slug, content, content_uk,
    excerpt, excerpt_uk, status = 'draft', categories
  } = req.body;

  try {
    // Check if slug already exists
    const existingPost = await db.get('SELECT id FROM blog_posts WHERE slug = ?', [slug]);
    if (existingPost) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const featured_image = req.file ? `/uploads/blog/${req.file.filename}` : null;
    const published_at = status === 'published' ? new Date().toISOString() : null;

    const result = await db.run(
      `INSERT INTO blog_posts (
        title, title_uk, slug, content, content_uk,
        excerpt, excerpt_uk, author_id, featured_image,
        status, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, title_uk, slug, content, content_uk,
        excerpt, excerpt_uk, req.user.id, featured_image,
        status, published_at
      ]
    );

    // Add categories
    if (categories && Array.isArray(categories)) {
      for (const categoryId of categories) {
        await db.run(
          'INSERT INTO blog_post_categories (post_id, category_id) VALUES (?, ?)',
          [result.id, categoryId]
        );
      }
    }

    const newPost = await db.get('SELECT * FROM blog_posts WHERE id = ?', [result.id]);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog post (admin only)
router.put('/:id', authMiddleware, upload.single('featured_image'), async (req, res) => {
  const {
    title, title_uk, slug, content, content_uk,
    excerpt, excerpt_uk, status, categories
  } = req.body;

  try {
    // Check if slug already exists (excluding current post)
    if (slug) {
      const existingPost = await db.get(
        'SELECT id FROM blog_posts WHERE slug = ? AND id != ?',
        [slug, req.params.id]
      );
      if (existingPost) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    let updateFields = [];
    let updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (title_uk !== undefined) {
      updateFields.push('title_uk = ?');
      updateValues.push(title_uk);
    }
    if (slug !== undefined) {
      updateFields.push('slug = ?');
      updateValues.push(slug);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (content_uk !== undefined) {
      updateFields.push('content_uk = ?');
      updateValues.push(content_uk);
    }
    if (excerpt !== undefined) {
      updateFields.push('excerpt = ?');
      updateValues.push(excerpt);
    }
    if (excerpt_uk !== undefined) {
      updateFields.push('excerpt_uk = ?');
      updateValues.push(excerpt_uk);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
      
      // Update published_at if publishing
      if (status === 'published') {
        const currentPost = await db.get('SELECT published_at FROM blog_posts WHERE id = ?', [req.params.id]);
        if (!currentPost.published_at) {
          updateFields.push('published_at = ?');
          updateValues.push(new Date().toISOString());
        }
      }
    }
    if (req.file) {
      updateFields.push('featured_image = ?');
      updateValues.push(`/uploads/blog/${req.file.filename}`);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(req.params.id);

    await db.run(
      `UPDATE blog_posts SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Update categories
    if (categories !== undefined && Array.isArray(categories)) {
      // Remove existing categories
      await db.run('DELETE FROM blog_post_categories WHERE post_id = ?', [req.params.id]);
      
      // Add new categories
      for (const categoryId of categories) {
        await db.run(
          'INSERT INTO blog_post_categories (post_id, category_id) VALUES (?, ?)',
          [req.params.id, categoryId]
        );
      }
    }

    const updatedPost = await db.get('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog post (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.run('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM blog_categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create category (admin only)
router.post('/categories', authMiddleware, [
  body('name').notEmpty().withMessage('Category name is required'),
  body('slug').notEmpty().withMessage('Slug is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, name_uk, slug, description } = req.body;

  try {
    const result = await db.run(
      'INSERT INTO blog_categories (name, name_uk, slug, description) VALUES (?, ?, ?, ?)',
      [name, name_uk, slug, description]
    );

    const newCategory = await db.get('SELECT * FROM blog_categories WHERE id = ?', [result.id]);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;