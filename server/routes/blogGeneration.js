const express = require('express');
const router = express.Router();
const NewsAggregator = require('../utils/newsAggregator');
const BlogGenerator = require('../utils/blogGenerator');
const SocialMediaAggregator = require('../utils/socialMediaAggregator');
const TranslationService = require('../utils/translationService');
const MediaService = require('../utils/mediaService');
const StatisticsService = require('../utils/statisticsService');
const Database = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

const newsAggregator = new NewsAggregator();
const socialMediaAggregator = new SocialMediaAggregator();
const blogGenerator = new BlogGenerator();
const translationService = new TranslationService();
const mediaService = new MediaService();
const statisticsService = new StatisticsService();

/**
 * GET /api/blog-generation/dashboard
 * Get dashboard data for blog generation
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get recent jobs
    const recentJobs = await blogGenerator.getRecentJobs(5);
    
    // Get news article stats
    const newsStats = await Database.get(`
      SELECT 
        COUNT(*) as total_articles,
        COUNT(CASE WHEN published_at >= date('now', '-7 days') THEN 1 END) as this_week,
        COUNT(CASE WHEN is_processed = 0 THEN 1 END) as unprocessed,
        AVG(relevance_score) as avg_relevance
      FROM news_articles
    `);
    
    // Get source stats
    const sourceStats = await Database.all(`
      SELECT ns.name, ns.last_checked, COUNT(na.id) as article_count
      FROM news_sources ns
      LEFT JOIN news_articles na ON ns.id = na.source_id
      WHERE ns.is_active = 1
      GROUP BY ns.id, ns.name, ns.last_checked
      ORDER BY article_count DESC
    `);
    
    // Get organization and leader counts
    const orgCount = await Database.get('SELECT COUNT(*) as count FROM civil_society_organizations WHERE is_active = 1');
    const leaderCount = await Database.get('SELECT COUNT(*) as count FROM civil_society_leaders WHERE is_active = 1');
    
    res.json({
      recentJobs,
      newsStats,
      sourceStats,
      organizationCount: orgCount.count,
      leaderCount: leaderCount.count
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * POST /api/blog-generation/aggregate-news
 * Manually trigger news aggregation
 */
router.post('/aggregate-news', async (req, res) => {
  try {
    console.log('Manual news aggregation triggered by user:', req.user.username);
    
    const result = await newsAggregator.aggregateAllNews();
    
    res.json({
      success: true,
      message: 'News aggregation completed',
      result
    });
    
  } catch (error) {
    console.error('Error in manual news aggregation:', error);
    res.status(500).json({ 
      error: 'News aggregation failed',
      details: error.message 
    });
  }
});

/**
 * POST /api/blog-generation/generate
 * Generate a new blog post
 */
router.post('/generate', async (req, res) => {
  try {
    const { parameters } = req.body;
    
    console.log('🔍 Blog generation triggered by user:', req.user.username);
    console.log('📋 Parameters received:', JSON.stringify(parameters, null, 2));
    
    // Map new parameter format to existing format
    const generationParams = {
      topic: parameters.topic,
      keywords: parameters.keywords,
      tone: parameters.tone,
      length: parameters.length,
      language: parameters.language,
      includeStatistics: parameters.includeStatistics,
      includeMedia: parameters.includeMedia,
      organizationIds: parameters.organizationIds,
      leaderIds: parameters.leaderIds,
      timeframe: 7 // Default to last 7 days
    };
    
    console.log('🚀 Starting blog generation with params:', JSON.stringify(generationParams, null, 2));
    
    const result = await blogGenerator.generateBlogPost(generationParams, req.user.id);
    
    console.log('✅ Blog generation completed successfully');
    console.log('📄 Result type:', typeof result, 'keys:', Object.keys(result || {}));
    
    // Extract the actual content from the result
    const generatedContent = result.content || result;
    console.log('📋 Generated content type:', typeof generatedContent);
    console.log('📋 Generated content keys:', Object.keys(generatedContent || {}));
    
    // Automatically save the generated content as a draft in the blog system
    console.log('💾 Saving generated content as draft blog post...');
    try {
      // Generate a unique slug
      const baseSlug = (generatedContent.title || 'generated-post')
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      const timestamp = Date.now();
      const slug = `${baseSlug}-${timestamp}`;
      
      // Extract word count for summary statistics
      const wordCount = generatedContent.content ? 
        generatedContent.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
      
      // Create excerpt if not already present
      const excerpt = generatedContent.excerpt || 
        (generatedContent.content ? 
          generatedContent.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 
          'AI-generated analysis of German-Ukrainian civil society cooperation.');
      
      // Save to blog_posts table as draft
      const blogPostResult = await Database.run(`
        INSERT INTO blog_posts (
          title, slug, content, excerpt, author_id, status, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)
      `, [
        generatedContent.title || 'AI-Generated Analysis',
        slug,
        generatedContent.content || '',
        excerpt,
        req.user.id,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      
      const blogPostId = blogPostResult.id;
      console.log(`✅ Blog post saved as draft with ID: ${blogPostId}`);
      
      // Add generation metadata as tags or in a separate table if needed
      if (generationParams.topic) {
        try {
          // You could extend this to save generation metadata
          console.log(`📝 Generated post metadata: Topic="${generationParams.topic}", Words=${wordCount}`);
        } catch (metaError) {
          console.warn('⚠️ Could not save generation metadata:', metaError.message);
        }
      }
      
      res.json({
        success: true,
        message: 'Blog post generated and saved as draft successfully',
        title: generatedContent.title || 'Untitled Post',
        content: generatedContent.content || generatedContent.generatedText || '',
        summary: excerpt,
        author: generatedContent.author || 'AI Blog Generator',
        media: generatedContent.images || generatedContent.media || [],
        statistics: generatedContent.statistics || result.sourceMaterial?.statistics || {},
        socialMedia: generatedContent.socialMedia || {},
        jobId: result.jobId,
        blogPostId: blogPostId,
        slug: slug,
        wordCount: wordCount,
        status: 'draft'
      });
      
    } catch (saveError) {
      console.error('❌ Failed to save blog post as draft:', saveError);
      // Still return the generated content even if saving failed
      res.json({
        success: true,
        message: 'Blog post generated successfully (manual save required)',
        title: generatedContent.title || 'Untitled Post',
        content: generatedContent.content || generatedContent.generatedText || '',
        summary: generatedContent.excerpt || generatedContent.summary || '',
        author: generatedContent.author || 'AI Blog Generator',
        media: generatedContent.images || generatedContent.media || [],
        statistics: generatedContent.statistics || result.sourceMaterial?.statistics || {},
        socialMedia: generatedContent.socialMedia || {},
        jobId: result.jobId,
        saveError: saveError.message
      });
    }
    
  } catch (error) {
    console.error('Error in blog generation:', error);
    res.status(500).json({ 
      error: 'Blog generation failed',
      details: error.message 
    });
  }
});

/**
 * POST /api/blog-generation/save-post
 * Save generated content as blog post
 */
router.post('/save-post', async (req, res) => {
  try {
    const { generatedContent, status = 'draft' } = req.body;
    
    const blogPostId = await blogGenerator.saveBlogPost(
      generatedContent, 
      req.user.id, 
      status
    );
    
    res.json({
      success: true,
      message: 'Blog post saved successfully',
      blogPostId
    });
    
  } catch (error) {
    console.error('Error saving blog post:', error);
    res.status(500).json({ 
      error: 'Failed to save blog post',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/job/:jobId
 * Get generation job status and results
 */
router.get('/job/:jobId', async (req, res) => {
  try {
    const job = await blogGenerator.getGenerationJob(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
    
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

/**
 * GET /api/blog-generation/recent-articles
 * Get recent relevant articles for preview
 */
router.get('/recent-articles', async (req, res) => {
  try {
    const { days = 7, minScore = 0.6, limit = 20 } = req.query;
    
    const articles = await newsAggregator.getRecentRelevantArticles(
      parseInt(days), 
      parseFloat(minScore)
    );
    
    res.json(articles.slice(0, parseInt(limit)));
    
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

/**
 * GET /api/blog-generation/organizations
 * Get all active organizations for selection
 */
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Database.all(`
      SELECT id, name, country, main_areas_of_work, website
      FROM civil_society_organizations 
      WHERE is_active = 1 
      ORDER BY name
    `);
    
    res.json({ organizations });
    
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

/**
 * GET /api/blog-generation/leaders
 * Get all active leaders for selection
 */
router.get('/leaders', async (req, res) => {
  try {
    const leaders = await Database.all(`
      SELECT id, full_name, country_affiliation, field, known_contributions
      FROM civil_society_leaders 
      WHERE is_active = 1 
      ORDER BY full_name
    `);
    
    res.json({ leaders });
    
  } catch (error) {
    console.error('Error fetching leaders:', error);
    res.status(500).json({ error: 'Failed to fetch leaders' });
  }
});

/**
 * GET /api/blog-generation/settings
 * Get AI generation settings
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await Database.all(`
      SELECT setting_name, setting_value, description 
      FROM ai_generation_settings 
      ORDER BY setting_name
    `);
    
    res.json(settings);
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/blog-generation/settings
 * Update AI generation settings
 */
router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body;
    
    for (const [settingName, settingValue] of Object.entries(settings)) {
      await Database.run(`
        UPDATE ai_generation_settings 
        SET setting_value = ?, updated_by = ?, updated_at = ?
        WHERE setting_name = ?
      `, [settingValue, req.user.id, new Date().toISOString(), settingName]);
    }
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      error: 'Failed to update settings',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/sources
 * Get news sources with statistics
 */
router.get('/sources', async (req, res) => {
  try {
    const sources = await Database.all(`
      SELECT 
        ns.*,
        COUNT(na.id) as article_count,
        MAX(na.published_at) as latest_article
      FROM news_sources ns
      LEFT JOIN news_articles na ON ns.id = na.source_id
      GROUP BY ns.id
      ORDER BY ns.is_active DESC, ns.name
    `);
    
    res.json(sources);
    
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

/**
 * POST /api/blog-generation/sources
 * Add new news source
 */
router.post('/sources', async (req, res) => {
  try {
    const { name, source_type, url, topics, check_frequency } = req.body;
    
    const result = await Database.run(`
      INSERT INTO news_sources (name, source_type, url, topics, check_frequency)
      VALUES (?, ?, ?, ?, ?)
    `, [name, source_type, url, JSON.stringify(topics || []), check_frequency || 3600]);
    
    res.json({
      success: true,
      message: 'News source added successfully',
      sourceId: result.id
    });
    
  } catch (error) {
    console.error('Error adding source:', error);
    res.status(500).json({ 
      error: 'Failed to add source',
      details: error.message 
    });
  }
});

/**
 * PUT /api/blog-generation/sources/:sourceId
 * Update news source
 */
router.put('/sources/:sourceId', async (req, res) => {
  try {
    const { name, source_type, url, topics, check_frequency, is_active } = req.body;
    
    await Database.run(`
      UPDATE news_sources 
      SET name = ?, source_type = ?, url = ?, topics = ?, check_frequency = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `, [
      name, 
      source_type, 
      url, 
      JSON.stringify(topics || []), 
      check_frequency || 3600, 
      is_active ? 1 : 0,
      new Date().toISOString(),
      req.params.sourceId
    ]);
    
    res.json({
      success: true,
      message: 'News source updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating source:', error);
    res.status(500).json({ 
      error: 'Failed to update source',
      details: error.message 
    });
  }
});

/**
 * DELETE /api/blog-generation/sources/:sourceId
 * Delete news source
 */
router.delete('/sources/:sourceId', async (req, res) => {
  try {
    await Database.run('DELETE FROM news_sources WHERE id = ?', [req.params.sourceId]);
    
    res.json({
      success: true,
      message: 'News source deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({ 
      error: 'Failed to delete source',
      details: error.message 
    });
  }
});

/**
 * POST /api/blog-generation/aggregate-social
 * Manually trigger social media aggregation
 */
router.post('/aggregate-social', async (req, res) => {
  try {
    console.log('Manual social media aggregation triggered by user:', req.user.username);
    
    const result = await socialMediaAggregator.aggregateAllSocialMedia();
    
    res.json({
      success: true,
      message: 'Social media aggregation completed',
      result
    });
    
  } catch (error) {
    console.error('Error in manual social media aggregation:', error);
    res.status(500).json({ 
      error: 'Social media aggregation failed',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/social-posts
 * Get recent relevant social media posts
 */
router.get('/social-posts', async (req, res) => {
  try {
    const { days = 7, minScore = 0.5, limit = 30 } = req.query;
    
    const posts = await socialMediaAggregator.getRecentRelevantPosts(
      parseInt(days), 
      parseFloat(minScore)
    );
    
    res.json(posts.slice(0, parseInt(limit)));
    
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    res.status(500).json({ error: 'Failed to fetch social media posts' });
  }
});

/**
 * GET /api/blog-generation/social-stats
 * Get social media monitoring statistics
 */
router.get('/social-stats', async (req, res) => {
  try {
    const stats = await socialMediaAggregator.getSocialMediaStats();
    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching social media stats:', error);
    res.status(500).json({ error: 'Failed to fetch social media statistics' });
  }
});

/**
 * PUT /api/blog-generation/social-sources/:sourceId/toggle
 * Enable/disable social media source
 */
router.put('/social-sources/:sourceId/toggle', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    await socialMediaAggregator.toggleSocialSource(req.params.sourceId, isActive);
    
    res.json({
      success: true,
      message: `Social media source ${isActive ? 'enabled' : 'disabled'} successfully`
    });
    
  } catch (error) {
    console.error('Error toggling social media source:', error);
    res.status(500).json({ 
      error: 'Failed to toggle social media source',
      details: error.message 
    });
  }
});

/**
 * POST /api/blog-generation/translate
 * Translate existing blog post to Ukrainian
 */
router.post('/translate/:postId', async (req, res) => {
  try {
    // Get the blog post
    const post = await Database.get('SELECT * FROM blog_posts WHERE id = ?', [req.params.postId]);
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Generate bilingual content
    const bilingualContent = await translationService.generateBilingualContent({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: []
    });
    
    // Update the post with Ukrainian translations
    await Database.run(`
      UPDATE blog_posts 
      SET title_uk = ?, excerpt_uk = ?, content_uk = ?, updated_at = ?
      WHERE id = ?
    `, [
      bilingualContent.title_uk,
      bilingualContent.excerpt_uk, 
      bilingualContent.content_uk,
      new Date().toISOString(),
      req.params.postId
    ]);
    
    res.json({
      success: true,
      message: 'Blog post translated successfully',
      translations: {
        title_uk: bilingualContent.title_uk,
        excerpt_uk: bilingualContent.excerpt_uk
      }
    });
    
  } catch (error) {
    console.error('Error translating blog post:', error);
    res.status(500).json({ 
      error: 'Failed to translate blog post',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/translation-stats
 * Get translation statistics
 */
router.get('/translation-stats', async (req, res) => {
  try {
    const stats = await translationService.getTranslationStats();
    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching translation stats:', error);
    res.status(500).json({ error: 'Failed to fetch translation statistics' });
  }
});

/**
 * POST /api/blog-generation/generate-bilingual
 * Generate bilingual blog post from scratch
 */
router.post('/generate-bilingual', async (req, res) => {
  try {
    const { topic, timeframe, angle, organizationId, leaderId } = req.body;
    
    console.log('Bilingual blog generation triggered by user:', req.user.username);
    
    const parameters = {
      topic,
      timeframe: timeframe || 7,
      angle,
      organizationId,
      leaderId,
      bilingual: true
    };
    
    const result = await blogGenerator.generateBlogPost(parameters);
    
    // Save bilingual post if translation was successful
    if (result.content.bilingual) {
      const bilingualPostId = await translationService.saveBilingualPost(
        result.content.bilingual,
        req.user.id,
        'draft'
      );
      
      result.bilingualPostId = bilingualPostId;
    }
    
    res.json({
      success: true,
      message: 'Bilingual blog post generated successfully',
      jobId: result.jobId,
      content: result.content,
      bilingualPostId: result.bilingualPostId
    });
    
  } catch (error) {
    console.error('Error in bilingual blog generation:', error);
    res.status(500).json({ 
      error: 'Bilingual blog generation failed',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/search-images
 * Search for relevant images
 */
router.get('/search-images', async (req, res) => {
  try {
    const { query, limit = 10, orientation = 'landscape' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const images = await mediaService.searchImages(query, { limit, orientation });
    
    res.json({
      success: true,
      query,
      count: images.length,
      images
    });
    
  } catch (error) {
    console.error('Error searching images:', error);
    res.status(500).json({ 
      error: 'Image search failed',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/statistics/:category
 * Get statistics for a specific category
 */
router.get('/statistics/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['demographic', 'humanitarian', 'economic', 'social', 'diaspora', 'civilSociety'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category',
        validCategories 
      });
    }
    
    const stats = await statisticsService.getUkraineStatistics([category]);
    
    res.json({
      success: true,
      category,
      statistics: stats[category],
      lastUpdated: stats.lastUpdated
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      error: 'Statistics fetch failed',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/statistics
 * Get all available statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const { categories } = req.query;
    const categoryList = categories ? categories.split(',') : [];
    
    const stats = await statisticsService.getUkraineStatistics(categoryList);
    
    res.json({
      success: true,
      statistics: stats,
      lastUpdated: stats.lastUpdated
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      error: 'Statistics fetch failed',
      details: error.message 
    });
  }
});

/**
 * POST /api/blog-generation/download-image
 * Download and store an image locally
 */
router.post('/download-image', async (req, res) => {
  try {
    const { imageUrl, attribution } = req.body;
    
    if (!imageUrl || !attribution) {
      return res.status(400).json({ 
        error: 'Image URL and attribution are required' 
      });
    }
    
    const result = await mediaService.downloadImage(imageUrl, attribution);
    
    res.json({
      success: true,
      message: 'Image downloaded successfully',
      image: result
    });
    
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ 
      error: 'Image download failed',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/recommended-images/:postId
 * Get recommended images for a specific blog post
 */
router.get('/recommended-images/:postId', async (req, res) => {
  try {
    const post = await Database.get('SELECT * FROM blog_posts WHERE id = ?', [req.params.postId]);
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    const images = await mediaService.getRecommendedImages(post.content, post.title);
    
    res.json({
      success: true,
      postId: req.params.postId,
      recommendations: images
    });
    
  } catch (error) {
    console.error('Error getting recommended images:', error);
    res.status(500).json({ 
      error: 'Failed to get image recommendations',
      details: error.message 
    });
  }
});

/**
 * GET /api/blog-generation/topic-images/:topic
 * Get Ukraine-specific images for common topics
 */
router.get('/topic-images/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const images = await mediaService.getUkraineTopicImages(topic);
    
    res.json({
      success: true,
      topic,
      images
    });
    
  } catch (error) {
    console.error('Error fetching topic images:', error);
    res.status(500).json({ 
      error: 'Failed to fetch topic images',
      details: error.message 
    });
  }
});

module.exports = router;