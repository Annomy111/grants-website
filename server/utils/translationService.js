const axios = require('axios');
const Database = require('../database/db');

class TranslationService {
  constructor() {
    this.db = Database;
    // Using Google Translate API (you can use the same Gemini API key)
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GEMINI_API_KEY;
  }

  /**
   * Translate text from English to Ukrainian using Gemini API (fallback from Google Translate)
   */
  async translateToUkrainian(text) {
    if (!this.apiKey) {
      console.warn('Translation API key not configured');
      return text; // Return original text if no API key
    }

    try {
      // First try Google Translate API
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          q: text,
          source: 'en',
          target: 'uk',
          format: 'text'
        }
      );

      if (response.data && response.data.data && response.data.data.translations) {
        return response.data.data.translations[0].translatedText;
      }
      
      return text; // Return original if translation fails
    } catch (error) {
      // If Google Translate fails (not enabled), use Gemini as fallback
      console.log('🔄 Google Translate not available, using Gemini for translation...');
      return await this.translateWithGemini(text);
    }
  }

  /**
   * Translate text using Gemini API as fallback
   */
  async translateWithGemini(text) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Translate the following English text to Ukrainian. Return ONLY the Ukrainian translation, no explanations or additional text:

"${text}"`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 10,
            topP: 0.8,
            maxOutputTokens: 1000,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const translatedText = response.data.candidates[0].content.parts[0].text.trim();
      
      // Remove any quotes or extra formatting that Gemini might add
      const cleanedText = translatedText.replace(/^["']|["']$/g, '').trim();
      
      return cleanedText;
      
    } catch (error) {
      console.error('Gemini translation error:', error.response?.data || error.message);
      return text; // Return original text on error
    }
  }

  /**
   * Translate blog content to Ukrainian with HTML preservation
   */
  async translateBlogContent(content) {
    // Split content into translatable chunks while preserving HTML structure
    const chunks = this.splitContentForTranslation(content);
    const translatedChunks = [];

    for (const chunk of chunks) {
      if (chunk.translatable) {
        const translated = await this.translateToUkrainian(chunk.text);
        translatedChunks.push(translated);
      } else {
        translatedChunks.push(chunk.text); // Keep HTML tags as-is
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return translatedChunks.join('');
  }

  /**
   * Split content into translatable chunks while preserving HTML
   */
  splitContentForTranslation(content) {
    const chunks = [];
    const htmlTagPattern = /<[^>]+>/g;
    let lastIndex = 0;
    let match;

    while ((match = htmlTagPattern.exec(content)) !== null) {
      // Add text before the HTML tag
      if (match.index > lastIndex) {
        const text = content.substring(lastIndex, match.index).trim();
        if (text) {
          chunks.push({ text, translatable: true });
        }
      }
      
      // Add the HTML tag
      chunks.push({ text: match[0], translatable: false });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last HTML tag
    if (lastIndex < content.length) {
      const text = content.substring(lastIndex).trim();
      if (text) {
        chunks.push({ text, translatable: true });
      }
    }

    return chunks;
  }

  /**
   * Generate bilingual blog post content
   */
  async generateBilingualContent(englishContent) {
    try {
      console.log('🌍 Generating bilingual content...');
      
      const bilingualContent = {
        title_en: englishContent.title,
        title_uk: await this.translateToUkrainian(englishContent.title),
        excerpt_en: englishContent.excerpt,
        excerpt_uk: await this.translateToUkrainian(englishContent.excerpt),
        content_en: englishContent.content,
        content_uk: await this.translateBlogContent(englishContent.content),
        tags_en: englishContent.tags,
        tags_uk: []
      };

      // Translate tags
      for (const tag of englishContent.tags) {
        const translatedTag = await this.translateToUkrainian(tag);
        bilingualContent.tags_uk.push(translatedTag);
      }

      console.log('✅ Bilingual content generated successfully');
      return bilingualContent;
      
    } catch (error) {
      console.error('Error generating bilingual content:', error);
      throw error;
    }
  }

  /**
   * Cultural context adaptation for Ukrainian audience
   */
  adaptCulturalContext(content, targetRegion = 'ukraine') {
    let adaptedContent = content;

    const culturalAdaptations = {
      ukraine: {
        // Date format preferences
        datePatterns: [
          { pattern: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, replacement: '$1.$2.$3' }, // US to EU format
        ],
        // Currency adaptations
        currencyPatterns: [
          { pattern: /\$(\d+)/g, replacement: '$1 доларів США' },
          { pattern: /€(\d+)/g, replacement: '$1 євро' },
        ],
        // Cultural references
        contextualReplacements: [
          { pattern: /\bCongress\b/g, replacement: 'Верховна Рада' },
          { pattern: /\bSenate\b/g, replacement: 'Сенат' },
          { pattern: /\bPresident Biden\b/g, replacement: 'Президент Байден' },
        ]
      },
      eu: {
        datePatterns: [
          { pattern: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, replacement: '$1/$2/$3' },
        ],
        currencyPatterns: [
          { pattern: /\$(\d+)/g, replacement: '€$1' },
        ]
      }
    };

    const adaptations = culturalAdaptations[targetRegion] || {};

    // Apply date adaptations
    if (adaptations.datePatterns) {
      adaptations.datePatterns.forEach(({ pattern, replacement }) => {
        adaptedContent = adaptedContent.replace(pattern, replacement);
      });
    }

    // Apply currency adaptations
    if (adaptations.currencyPatterns) {
      adaptations.currencyPatterns.forEach(({ pattern, replacement }) => {
        adaptedContent = adaptedContent.replace(pattern, replacement);
      });
    }

    // Apply contextual replacements
    if (adaptations.contextualReplacements) {
      adaptations.contextualReplacements.forEach(({ pattern, replacement }) => {
        adaptedContent = adaptedContent.replace(pattern, replacement);
      });
    }

    return adaptedContent;
  }

  /**
   * Generate region-specific content variations
   */
  async generateRegionalVariations(content) {
    const variations = {
      ukraine: {
        title: content.title,
        content: this.adaptCulturalContext(content.content, 'ukraine'),
        focus: 'domestic_perspective',
        audience: 'ukrainian_citizens'
      },
      diaspora: {
        title: `${content.title} - Diaspora Perspective`,
        content: this.adaptCulturalContext(content.content, 'diaspora'),
        focus: 'international_support',
        audience: 'ukrainian_diaspora'
      },
      international: {
        title: `Global Perspective: ${content.title}`,
        content: this.adaptCulturalContext(content.content, 'international'),
        focus: 'global_implications',
        audience: 'international_community'
      }
    };

    return variations;
  }

  /**
   * Detect language of input text
   */
  async detectLanguage(text) {
    if (!this.apiKey) {
      return 'en'; // Default to English
    }

    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${this.apiKey}`,
        {
          q: text
        }
      );

      if (response.data && response.data.data && response.data.data.detections) {
        return response.data.data.detections[0][0].language;
      }
      
      return 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }

  /**
   * Save bilingual blog post to database
   */
  async saveBilingualPost(bilingualContent, authorId, status = 'draft') {
    try {
      const slug = this.generateSlug(bilingualContent.title_en);
      
      const result = await this.db.run(
        `INSERT INTO blog_posts 
         (title, title_uk, slug, content, content_uk, excerpt, excerpt_uk, 
          author_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bilingualContent.title_en,
          bilingualContent.title_uk,
          slug,
          bilingualContent.content_en,
          bilingualContent.content_uk,
          bilingualContent.excerpt_en,
          bilingualContent.excerpt_uk,
          authorId,
          status,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );

      return result.id;
    } catch (error) {
      console.error('Error saving bilingual post:', error);
      throw error;
    }
  }

  /**
   * Generate URL-friendly slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      + '-' + Date.now();
  }

  /**
   * Get translation statistics
   */
  async getTranslationStats() {
    const stats = await this.db.get(`
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN title_uk IS NOT NULL AND title_uk != '' THEN 1 END) as translated_posts,
        COUNT(CASE WHEN content_uk IS NOT NULL AND content_uk != '' THEN 1 END) as translated_content
      FROM blog_posts
    `);

    return {
      ...stats,
      translation_coverage: stats.total_posts > 0 ? (stats.translated_posts / stats.total_posts * 100).toFixed(1) : 0
    };
  }
}

module.exports = TranslationService;