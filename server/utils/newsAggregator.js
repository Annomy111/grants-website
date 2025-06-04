const Parser = require('rss-parser');
const axios = require('axios');
const Database = require('../database/db');

class NewsAggregator {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['media:content', 'media:thumbnail', 'content:encoded']
      }
    });
    this.db = Database;
  }

  /**
   * Fetch and parse RSS feeds from all active news sources
   */
  async aggregateAllNews() {
    try {
      console.log('🔍 Starting news aggregation...');
      
      // Get all active news sources
      const sources = await this.db.all(
        'SELECT * FROM news_sources WHERE is_active = 1'
      );
      
      console.log(`Found ${sources.length} active news sources`);
      
      const results = await Promise.allSettled(
        sources.map(source => this.processSingleSource(source))
      );
      
      let totalArticles = 0;
      let successfulSources = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulSources++;
          totalArticles += result.value.articleCount;
          console.log(`✅ ${sources[index].name}: ${result.value.articleCount} articles`);
        } else {
          console.error(`❌ ${sources[index].name}: ${result.reason}`);
        }
      });
      
      console.log(`\n📊 Aggregation complete: ${totalArticles} articles from ${successfulSources}/${sources.length} sources`);
      
      // Update last_checked timestamp for all sources
      await this.updateSourcesLastChecked();
      
      return {
        totalArticles,
        successfulSources,
        totalSources: sources.length
      };
      
    } catch (error) {
      console.error('Error in news aggregation:', error);
      throw error;
    }
  }

  /**
   * Process a single news source
   */
  async processSingleSource(source) {
    try {
      let articles = [];
      
      if (source.source_type === 'rss') {
        articles = await this.fetchRSSFeed(source);
      } else if (source.source_type === 'api') {
        articles = await this.fetchAPINews(source);
      }
      
      // Filter and score articles for relevance
      const relevantArticles = await this.filterRelevantArticles(articles, source);
      
      // Save articles to database
      const savedCount = await this.saveArticlesToDB(relevantArticles, source.id);
      
      return { articleCount: savedCount };
      
    } catch (error) {
      console.error(`Error processing source ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Fetch RSS feed
   */
  async fetchRSSFeed(source) {
    try {
      const feed = await this.parser.parseURL(source.url);
      
      return feed.items.map(item => ({
        title: item.title || '',
        content: item.contentSnippet || item.content || item['content:encoded'] || '',
        url: item.link || item.guid || '',
        author: item.creator || item.author || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        rawData: item
      }));
      
    } catch (error) {
      console.error(`Error fetching RSS from ${source.url}:`, error);
      throw error;
    }
  }

  /**
   * Fetch from API sources (placeholder for future implementation)
   */
  async fetchAPINews(source) {
    // Placeholder for API-based news sources
    // Could integrate with Twitter API, News API, etc.
    console.log(`API source ${source.name} not yet implemented`);
    return [];
  }

  /**
   * Filter articles for relevance to Ukraine civil society
   */
  async filterRelevantArticles(articles, source) {
    const sourceTopics = source.topics ? JSON.parse(source.topics) : [];
    const civilSocietyKeywords = [
      'ukraine', 'ukrainian', 'civil society', 'ngo', 'human rights',
      'democracy', 'corruption', 'transparency', 'diaspora',
      'crimea', 'kyiv', 'kiev', 'euromaidan', 'revolution of dignity',
      'war crimes', 'humanitarian', 'refugees', 'reconstruction'
    ];
    
    // Get organization and leader names for matching
    const [organizations, leaders] = await Promise.all([
      this.db.all('SELECT name FROM civil_society_organizations WHERE is_active = 1'),
      this.db.all('SELECT full_name FROM civil_society_leaders WHERE is_active = 1')
    ]);
    
    const orgNames = organizations.map(org => org.name.toLowerCase());
    const leaderNames = leaders.map(leader => leader.full_name.toLowerCase());
    
    return articles.filter(article => {
      const text = `${article.title} ${article.content}`.toLowerCase();
      
      // Calculate relevance score
      let score = 0;
      
      // Check for civil society keywords
      civilSocietyKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 0.1;
        }
      });
      
      // Check for source-specific topics
      sourceTopics.forEach(topic => {
        if (text.includes(topic.toLowerCase())) {
          score += 0.2;
        }
      });
      
      // Check for organization mentions
      orgNames.forEach(orgName => {
        if (text.includes(orgName)) {
          score += 0.3;
        }
      });
      
      // Check for leader mentions
      leaderNames.forEach(leaderName => {
        if (text.includes(leaderName)) {
          score += 0.3;
        }
      });
      
      // Boost score for Ukraine-related content
      if (text.includes('ukraine') || text.includes('ukrainian')) {
        score += 0.2;
      }
      
      article.relevanceScore = Math.min(score, 1.0); // Cap at 1.0
      
      // Return articles with relevance score above threshold
      return article.relevanceScore >= 0.3;
    });
  }

  /**
   * Save articles to database
   */
  async saveArticlesToDB(articles, sourceId) {
    let savedCount = 0;
    
    for (const article of articles) {
      try {
        // Check if article already exists
        const existing = await this.db.get(
          'SELECT id FROM news_articles WHERE url = ?',
          [article.url]
        );
        
        if (!existing) {
          // Extract keywords for search
          const keywords = this.extractKeywords(article.title + ' ' + article.content);
          
          // Find mentioned organizations and leaders
          const mentionedOrgs = await this.findMentionedOrganizations(article.title + ' ' + article.content);
          const mentionedLeaders = await this.findMentionedLeaders(article.title + ' ' + article.content);
          
          await this.db.run(
            `INSERT INTO news_articles 
             (title, content, url, source_id, author, published_at, relevance_score, 
              keywords, mentioned_organizations, mentioned_leaders) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              article.title,
              article.content,
              article.url,
              sourceId,
              article.author,
              article.publishedAt.toISOString(),
              article.relevanceScore,
              JSON.stringify(keywords),
              JSON.stringify(mentionedOrgs),
              JSON.stringify(mentionedLeaders)
            ]
          );
          
          savedCount++;
        }
      } catch (error) {
        console.error(`Error saving article ${article.url}:`, error);
      }
    }
    
    return savedCount;
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
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
   * Find mentioned organizations in text
   */
  async findMentionedOrganizations(text) {
    const organizations = await this.db.all(
      'SELECT id, name FROM civil_society_organizations WHERE is_active = 1'
    );
    
    const mentioned = [];
    const textLower = text.toLowerCase();
    
    organizations.forEach(org => {
      if (textLower.includes(org.name.toLowerCase())) {
        mentioned.push(org.id);
      }
    });
    
    return mentioned;
  }

  /**
   * Find mentioned leaders in text
   */
  async findMentionedLeaders(text) {
    const leaders = await this.db.all(
      'SELECT id, full_name FROM civil_society_leaders WHERE is_active = 1'
    );
    
    const mentioned = [];
    const textLower = text.toLowerCase();
    
    leaders.forEach(leader => {
      if (textLower.includes(leader.full_name.toLowerCase())) {
        mentioned.push(leader.id);
      }
    });
    
    return mentioned;
  }

  /**
   * Update last_checked timestamp for all sources
   */
  async updateSourcesLastChecked() {
    await this.db.run(
      'UPDATE news_sources SET last_checked = ? WHERE is_active = 1',
      [new Date().toISOString()]
    );
  }

  /**
   * Get recent relevant articles for blog generation
   */
  async getRecentRelevantArticles(days = 7, minRelevanceScore = 0.6) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await this.db.all(
      `SELECT na.*, ns.name as source_name 
       FROM news_articles na 
       JOIN news_sources ns ON na.source_id = ns.id 
       WHERE na.published_at >= ? 
         AND na.relevance_score >= ? 
         AND na.is_processed = 0
       ORDER BY na.relevance_score DESC, na.published_at DESC 
       LIMIT 50`,
      [cutoffDate.toISOString(), minRelevanceScore]
    );
  }

  /**
   * Mark articles as processed
   */
  async markArticlesAsProcessed(articleIds) {
    if (articleIds.length === 0) return;
    
    const placeholders = articleIds.map(() => '?').join(',');
    await this.db.run(
      `UPDATE news_articles SET is_processed = 1 WHERE id IN (${placeholders})`,
      articleIds
    );
  }
}

module.exports = NewsAggregator;