const axios = require('axios');
const Database = require('../database/db');

class SocialMediaAggregator {
  constructor() {
    this.db = Database;
    this.twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.blueSkyCredentials = {
      handle: process.env.BLUESKY_HANDLE,
      password: process.env.BLUESKY_PASSWORD
    };
  }

  /**
   * Aggregate content from all social media sources
   */
  async aggregateAllSocialMedia() {
    try {
      console.log('🐦 Starting social media aggregation...');
      
      const socialSources = await this.db.all(
        'SELECT * FROM news_sources WHERE source_type = "social" AND is_active = 1'
      );
      
      console.log(`Found ${socialSources.length} active social media sources`);
      
      const results = await Promise.allSettled(
        socialSources.map(source => this.processSocialSource(source))
      );
      
      let totalPosts = 0;
      let successfulSources = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulSources++;
          totalPosts += result.value.postCount;
          console.log(`✅ ${socialSources[index].name}: ${result.value.postCount} posts`);
        } else {
          console.error(`❌ ${socialSources[index].name}: ${result.reason}`);
        }
      });
      
      return {
        totalPosts,
        successfulSources,
        totalSources: socialSources.length
      };
      
    } catch (error) {
      console.error('Error in social media aggregation:', error);
      throw error;
    }
  }

  /**
   * Process a single social media source
   */
  async processSocialSource(source) {
    try {
      let posts = [];
      
      if (source.url.includes('twitter.com') || source.url.includes('x.com')) {
        posts = await this.fetchTwitterPosts(source);
      } else if (source.url.includes('bsky.app')) {
        posts = await this.fetchBlueskyPosts(source);
      }
      
      // Filter and score posts for relevance
      const relevantPosts = await this.filterRelevantPosts(posts, source);
      
      // Save posts to database
      const savedCount = await this.savePostsToDB(relevantPosts, source.id);
      
      return { postCount: savedCount };
      
    } catch (error) {
      console.error(`Error processing social source ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Fetch Twitter/X posts using Twitter API v2
   */
  async fetchTwitterPosts(source) {
    if (!this.twitterBearerToken) {
      console.log('Twitter Bearer Token not configured, skipping Twitter sources');
      return [];
    }

    try {
      // Extract username from Twitter URL
      const username = this.extractTwitterUsername(source.url);
      if (!username) return [];

      // Get user ID first
      const userResponse = await axios.get(
        `https://api.twitter.com/2/users/by/username/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${this.twitterBearerToken}`
          }
        }
      );

      if (!userResponse.data.data) return [];

      const userId = userResponse.data.data.id;

      // Get recent tweets
      const tweetsResponse = await axios.get(
        `https://api.twitter.com/2/users/${userId}/tweets`,
        {
          headers: {
            'Authorization': `Bearer ${this.twitterBearerToken}`
          },
          params: {
            'tweet.fields': 'created_at,public_metrics,context_annotations,lang',
            'max_results': 10,
            'exclude': 'retweets,replies'
          }
        }
      );

      if (!tweetsResponse.data.data) return [];

      return tweetsResponse.data.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        author: username,
        createdAt: new Date(tweet.created_at),
        url: `https://twitter.com/${username}/status/${tweet.id}`,
        metrics: tweet.public_metrics,
        platform: 'twitter',
        rawData: tweet
      }));

    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Twitter API authentication failed - check bearer token');
      } else if (error.response?.status === 429) {
        console.log('Twitter API rate limit exceeded');
      } else {
        console.error(`Twitter API error: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Fetch Bluesky posts using AT Protocol
   */
  async fetchBlueskyPosts(source) {
    try {
      // Extract handle from Bluesky URL
      const handle = this.extractBlueskyHandle(source.url);
      if (!handle) return [];

      // For now, return empty array as Bluesky API integration is complex
      // This is a placeholder for future implementation
      console.log(`Bluesky integration for ${handle} pending full AT Protocol implementation`);
      return [];

    } catch (error) {
      console.error(`Bluesky API error: ${error.message}`);
      return [];
    }
  }

  /**
   * Filter posts for relevance to Ukraine civil society
   */
  async filterRelevantPosts(posts, source) {
    const sourceTopics = source.topics ? JSON.parse(source.topics) : [];
    const civilSocietyKeywords = [
      'ukraine', 'ukrainian', 'civil society', 'human rights',
      'democracy', 'corruption', 'transparency', 'activism',
      'crimea', 'kyiv', 'kiev', 'euromaidan', 'freedom',
      'war crimes', 'humanitarian', 'refugees', 'ngo'
    ];
    
    return posts.filter(post => {
      const text = post.text.toLowerCase();
      
      // Calculate relevance score
      let score = 0;
      
      // Check for civil society keywords
      civilSocietyKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 0.2;
        }
      });
      
      // Check for source-specific topics
      sourceTopics.forEach(topic => {
        if (text.includes(topic.toLowerCase())) {
          score += 0.3;
        }
      });
      
      // Boost score for Ukraine-related content
      if (text.includes('ukraine') || text.includes('ukrainian')) {
        score += 0.3;
      }
      
      // Boost score for engagement metrics (if available)
      if (post.metrics) {
        const engagementScore = (post.metrics.like_count + post.metrics.retweet_count) / 100;
        score += Math.min(engagementScore, 0.3);
      }
      
      post.relevanceScore = Math.min(score, 1.0);
      
      // Return posts with relevance score above threshold
      return post.relevanceScore >= 0.4;
    });
  }

  /**
   * Save posts to database (extend news_articles table for social media)
   */
  async savePostsToDB(posts, sourceId) {
    let savedCount = 0;
    
    for (const post of posts) {
      try {
        // Check if post already exists
        const existing = await this.db.get(
          'SELECT id FROM news_articles WHERE url = ?',
          [post.url]
        );
        
        if (!existing) {
          // Extract keywords from post text
          const keywords = this.extractKeywords(post.text);
          
          await this.db.run(
            `INSERT INTO news_articles 
             (title, content, url, source_id, author, published_at, relevance_score, 
              keywords, mentioned_organizations, mentioned_leaders) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              post.text.substring(0, 100) + '...', // Use first part as title
              post.text,
              post.url,
              sourceId,
              post.author,
              post.createdAt.toISOString(),
              post.relevanceScore,
              JSON.stringify(keywords),
              JSON.stringify([]), // TODO: Implement mention detection
              JSON.stringify([])  // TODO: Implement mention detection
            ]
          );
          
          savedCount++;
        }
      } catch (error) {
        console.error(`Error saving post ${post.url}:`, error);
      }
    }
    
    return savedCount;
  }

  /**
   * Extract Twitter username from URL
   */
  extractTwitterUsername(url) {
    const match = url.match(/twitter\.com\/([^\/\?]+)|x\.com\/([^\/\?]+)/);
    return match ? (match[1] || match[2]) : null;
  }

  /**
   * Extract Bluesky handle from URL
   */
  extractBlueskyHandle(url) {
    const match = url.match(/bsky\.app\/profile\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s#@]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 || word.startsWith('#') || word.startsWith('@'));
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Get recent relevant social media posts
   */
  async getRecentRelevantPosts(days = 7, minRelevanceScore = 0.5) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await this.db.all(
      `SELECT na.*, ns.name as source_name 
       FROM news_articles na 
       JOIN news_sources ns ON na.source_id = ns.id 
       WHERE na.published_at >= ? 
         AND na.relevance_score >= ? 
         AND ns.source_type = 'social'
         AND na.is_processed = 0
       ORDER BY na.relevance_score DESC, na.published_at DESC 
       LIMIT 30`,
      [cutoffDate.toISOString(), minRelevanceScore]
    );
  }

  /**
   * Enable/disable social media sources
   */
  async toggleSocialSource(sourceId, isActive) {
    await this.db.run(
      'UPDATE news_sources SET is_active = ? WHERE id = ? AND source_type = "social"',
      [isActive ? 1 : 0, sourceId]
    );
  }

  /**
   * Get social media source statistics
   */
  async getSocialMediaStats() {
    const stats = await this.db.get(`
      SELECT 
        COUNT(CASE WHEN ns.source_type = 'social' AND ns.is_active = 1 THEN 1 END) as active_sources,
        COUNT(CASE WHEN ns.source_type = 'social' AND ns.is_active = 0 THEN 1 END) as inactive_sources,
        COUNT(CASE WHEN ns.source_type = 'social' AND na.published_at >= date('now', '-7 days') THEN 1 END) as this_week_posts,
        AVG(CASE WHEN ns.source_type = 'social' THEN na.relevance_score END) as avg_relevance
      FROM news_sources ns
      LEFT JOIN news_articles na ON ns.id = na.source_id
      WHERE ns.source_type = 'social'
    `);

    return stats;
  }
}

module.exports = SocialMediaAggregator;