const axios = require('axios');
const Database = require('../database/db');

class MediaService {
  constructor() {
    this.db = Database;
    // API keys can be set in environment variables
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
  }

  /**
   * Search for relevant images from multiple sources
   */
  async searchImages(query, options = {}) {
    const results = {
      unsplash: [],
      pexels: [],
      wikimedia: []
    };

    // Search Unsplash if API key is available
    if (this.unsplashAccessKey) {
      try {
        results.unsplash = await this.searchUnsplash(query, options);
      } catch (error) {
        console.error('Unsplash search error:', error.message);
      }
    }

    // Search Pexels if API key is available
    if (this.pexelsApiKey) {
      try {
        results.pexels = await this.searchPexels(query, options);
      } catch (error) {
        console.error('Pexels search error:', error.message);
      }
    }

    // Always search Wikimedia Commons (no API key required)
    try {
      results.wikimedia = await this.searchWikimedia(query, options);
    } catch (error) {
      console.error('Wikimedia search error:', error.message);
    }

    return this.combineAndRankImages(results);
  }

  /**
   * Search Unsplash for images
   */
  async searchUnsplash(query, options = {}) {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: query,
        per_page: options.limit || 10,
        orientation: options.orientation || 'landscape',
        content_filter: 'high' // Safe content only
      },
      headers: {
        'Authorization': `Client-ID ${this.unsplashAccessKey}`
      }
    });

    return response.data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnail: photo.urls.small,
      description: photo.description || photo.alt_description,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      source: 'unsplash',
      license: 'Unsplash License',
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      downloadUrl: photo.links.download
    }));
  }

  /**
   * Search Pexels for images
   */
  async searchPexels(query, options = {}) {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query: query,
        per_page: options.limit || 10,
        orientation: options.orientation || 'landscape'
      },
      headers: {
        'Authorization': this.pexelsApiKey
      }
    });

    return response.data.photos.map(photo => ({
      id: photo.id,
      url: photo.src.large,
      thumbnail: photo.src.medium,
      description: photo.alt,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
      license: 'Pexels License',
      attribution: `Photo by ${photo.photographer} from Pexels`,
      downloadUrl: photo.src.original
    }));
  }

  /**
   * Search Wikimedia Commons for images
   */
  async searchWikimedia(query, options = {}) {
    const response = await axios.get('https://commons.wikimedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        generator: 'search',
        gsrsearch: `${query} Ukraine`,
        gsrnamespace: 6, // File namespace
        gsrlimit: options.limit || 10,
        prop: 'imageinfo|pageimages',
        iiprop: 'url|extmetadata',
        iiurlwidth: 800
      }
    });

    const pages = response.data.query?.pages || {};
    return Object.values(pages).map(page => {
      const imageInfo = page.imageinfo?.[0] || {};
      const metadata = imageInfo.extmetadata || {};
      
      return {
        id: page.pageid,
        url: imageInfo.url,
        thumbnail: imageInfo.thumburl,
        description: metadata.ImageDescription?.value || page.title,
        photographer: metadata.Artist?.value || 'Unknown',
        source: 'wikimedia',
        license: metadata.License?.value || 'CC BY-SA',
        attribution: metadata.Attribution?.value || `From Wikimedia Commons`,
        downloadUrl: imageInfo.url
      };
    }).filter(img => img.url); // Filter out entries without images
  }

  /**
   * Combine and rank images from different sources
   */
  combineAndRankImages(results) {
    const allImages = [
      ...results.unsplash,
      ...results.pexels,
      ...results.wikimedia
    ];

    // Rank by relevance (you can implement more sophisticated ranking)
    return allImages.sort((a, b) => {
      // Prioritize images with descriptions
      if (a.description && !b.description) return -1;
      if (!a.description && b.description) return 1;
      
      // Then by source preference
      const sourceOrder = { unsplash: 1, pexels: 2, wikimedia: 3 };
      return (sourceOrder[a.source] || 4) - (sourceOrder[b.source] || 4);
    });
  }

  /**
   * Get Ukraine-specific images for common topics
   */
  async getUkraineTopicImages(topic) {
    const topicQueries = {
      'civil society': 'Ukraine civil society volunteers community',
      'democracy': 'Ukraine democracy protest Maidan freedom',
      'humanitarian': 'Ukraine humanitarian aid help support',
      'culture': 'Ukraine culture tradition vyshyvanka folk',
      'education': 'Ukraine education students university school',
      'technology': 'Ukraine technology IT startup innovation',
      'diaspora': 'Ukrainian diaspora community abroad international',
      'reconstruction': 'Ukraine reconstruction rebuilding recovery',
      'women': 'Ukrainian women leaders activists entrepreneurs',
      'youth': 'Ukraine youth young people students activists'
    };

    // Find the best matching topic
    const matchedTopic = Object.keys(topicQueries).find(key => 
      topic.toLowerCase().includes(key)
    ) || 'civil society';

    return await this.searchImages(topicQueries[matchedTopic]);
  }

  /**
   * Download and store image locally
   */
  async downloadImage(imageUrl, attribution) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      const filename = `blog-image-${Date.now()}.jpg`;
      const fs = require('fs');
      const path = require('path');
      const filepath = path.join(__dirname, '../../client/public/blog-images', filename);

      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filepath, response.data);

      // Store image metadata in database
      const result = await this.db.run(`
        INSERT INTO blog_images (
          filename, original_url, attribution, created_at
        ) VALUES (?, ?, ?, ?)
      `, [filename, imageUrl, attribution, new Date().toISOString()]);

      return {
        id: result.id,
        url: `/blog-images/${filename}`,
        attribution
      };
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Generate image HTML with proper attribution
   */
  generateImageHTML(image, options = {}) {
    const { width = '100%', caption = true, className = 'blog-image' } = options;
    
    return `
      <figure class="${className}">
        <img src="${image.url}" alt="${image.description}" style="width: ${width};" />
        ${caption ? `
          <figcaption>
            ${image.description ? `<span class="image-description">${image.description}</span>` : ''}
            <span class="image-attribution">${image.attribution}</span>
          </figcaption>
        ` : ''}
      </figure>
    `;
  }

  /**
   * Get recommended images for a blog post
   */
  async getRecommendedImages(blogContent, topic) {
    // Extract key concepts from the blog content
    const concepts = this.extractKeyConcepts(blogContent);
    
    // Search for images based on topic and concepts
    const topicImages = await this.getUkraineTopicImages(topic);
    
    // Additional searches for specific concepts
    const conceptImages = [];
    for (const concept of concepts.slice(0, 3)) { // Limit to top 3 concepts
      const images = await this.searchImages(`Ukraine ${concept}`);
      conceptImages.push(...images.slice(0, 3)); // Take top 3 from each
    }

    // Combine and deduplicate
    const allImages = [...topicImages, ...conceptImages];
    const uniqueImages = this.deduplicateImages(allImages);

    return uniqueImages.slice(0, 10); // Return top 10 recommendations
  }

  /**
   * Extract key concepts from blog content
   */
  extractKeyConcepts(content) {
    // Simple concept extraction - can be enhanced with NLP
    const commonWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'been', 'by', 'for', 'from', 'has', 'had', 'have', 'in', 'of', 'that', 'to', 'was', 'were', 'will', 'with']);
    
    const words = content.toLowerCase()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 4 && !commonWords.has(word));

    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Sort by frequency and return top concepts
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Deduplicate images based on URL
   */
  deduplicateImages(images) {
    const seen = new Set();
    return images.filter(img => {
      if (seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    });
  }
}

module.exports = MediaService;