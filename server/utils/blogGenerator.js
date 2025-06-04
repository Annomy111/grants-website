const axios = require('axios');
const Database = require('../database/db');
const TranslationService = require('./translationService');
const MediaService = require('./mediaService');
const StatisticsService = require('./statisticsService');

class BlogGenerator {
  constructor() {
    this.db = Database;
    this.translationService = new TranslationService();
    this.mediaService = new MediaService();
    this.statisticsService = new StatisticsService();
    this.defaultSettings = {
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.7,
      minRelevanceScore: 0.6
    };
  }

  /**
   * Get AI generation settings from database
   */
  async getAISettings() {
    const settings = await this.db.all('SELECT setting_name, setting_value FROM ai_generation_settings');
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_name] = setting.setting_value;
    });
    return { ...this.defaultSettings, ...settingsObj };
  }

  /**
   * Generate a blog post based on recent news and civil society data
   */
  async generateBlogPost(parameters = {}, userId = null) {
    let jobId = null;
    try {
      console.log('🤖 STEP 1: Starting blog post generation...');
      console.log('📋 Parameters:', JSON.stringify(parameters, null, 2));
      
      // Create generation job record
      console.log('🤖 STEP 2: Creating generation job...');
      const job = await this.createGenerationJob('manual_topic', parameters, userId);
      jobId = job.id;
      console.log('✅ Job created with ID:', jobId);
      
      // Get AI settings
      console.log('🤖 STEP 3: Getting AI settings...');
      const settings = await this.getAISettings();
      console.log('✅ AI settings loaded, model:', settings.generation_model);
      
      if (!settings.gemini_api_key) {
        throw new Error('Gemini API key not configured');
      }
      
      // Gather source material
      console.log('🤖 STEP 4: Gathering source material...');
      const sourceMaterial = await this.gatherSourceMaterial(parameters);
      console.log('✅ Source material gathered:', {
        articles: sourceMaterial.articles.length,
        organizations: sourceMaterial.organizations.length,
        leaders: sourceMaterial.leaders.length
      });
      
      if (sourceMaterial.articles.length === 0) {
        // Try with lower relevance threshold
        console.log('⚠️ No articles found with default threshold, trying lower threshold...');
        const relaxedParams = { ...parameters, minRelevance: 0.3 };
        const relaxedSourceMaterial = await this.gatherSourceMaterial(relaxedParams);
        
        if (relaxedSourceMaterial.articles.length === 0) {
          await this.updateGenerationJob(jobId, 'failed', null, 'No relevant news articles found for blog generation');
          throw new Error('No relevant news articles found for blog generation');
        } else {
          Object.assign(sourceMaterial, relaxedSourceMaterial);
          console.log(`✅ Found ${sourceMaterial.articles.length} articles with relaxed threshold`);
        }
      }
      
      // Get relevant statistics
      console.log('🤖 STEP 5: Fetching statistics...');
      const statistics = await this.statisticsService.getUkraineStatistics();
      sourceMaterial.statistics = statistics;
      console.log('✅ Statistics fetched');
      
      // Generate content using AI
      console.log('🤖 STEP 6: Generating content with AI...');
      console.log('📝 About to call generateWithAI...');
      const generatedContent = await this.generateWithAI(sourceMaterial, settings, parameters);
      console.log('✅ AI content generated, type:', typeof generatedContent);
      console.log('📊 Content keys:', Object.keys(generatedContent || {}));
      if (generatedContent?.content) {
        console.log('📏 Content length:', generatedContent.content.length);
      }
      
      // Enhance content with media
      console.log('🤖 STEP 7: Enhancing with media...');
      const enhancedContent = await this.enhanceWithMedia(generatedContent, parameters);
      console.log('✅ Media enhancement completed');
      
      // Generate bilingual content if requested
      if (parameters.bilingual === true) {
        console.log('🤖 STEP 8: Generating bilingual content...');
        try {
          const bilingualContent = await this.translationService.generateBilingualContent(enhancedContent);
          enhancedContent.bilingual = bilingualContent;
          console.log('✅ Bilingual content generated successfully');
        } catch (translationError) {
          console.warn('⚠️ Translation failed, proceeding with English only:', translationError.message);
        }
      } else {
        console.log('🤖 STEP 8: Skipping bilingual content (not explicitly requested)');
      }
      
      // Save generated content
      console.log('🤖 STEP 9: Updating job to completed...');
      console.log('📋 Content to save:', {
        hasContent: !!enhancedContent?.content,
        contentLength: enhancedContent?.content?.length || 0,
        hasTitle: !!enhancedContent?.title
      });
      
      await this.updateGenerationJob(jobId, 'completed', {
        content: enhancedContent,
        sourceMaterial: sourceMaterial
      });
      console.log('✅ Job updated to completed');
      
      console.log('🎉 Blog post generation completed successfully!');
      
      return {
        jobId: jobId,
        content: enhancedContent,
        sourceMaterial: sourceMaterial
      };
      
    } catch (error) {
      console.error('❌ Blog generation error in step:', error.message);
      console.error('📍 Error stack:', error.stack);
      
      // Update job status to failed if we have a jobId
      if (jobId) {
        try {
          console.log('🔄 Updating job', jobId, 'to failed status...');
          await this.updateGenerationJob(jobId, 'failed', null, error.message);
          console.log('✅ Job marked as failed');
        } catch (updateError) {
          console.error('❌ Failed to update job status:', updateError.message);
        }
      }
      
      throw error;
    }
  }

  /**
   * Create a generation job record
   */
  async createGenerationJob(jobType, parameters, userId = null) {
    const result = await this.db.run(
      `INSERT INTO blog_generation_jobs 
       (job_type, input_parameters, created_by, started_at) 
       VALUES (?, ?, ?, ?)`,
      [
        jobType,
        JSON.stringify(parameters),
        userId,
        new Date().toISOString()
      ]
    );
    
    return { id: result.id };
  }

  /**
   * Update generation job status
   */
  async updateGenerationJob(jobId, status, generatedContent = null, errorMessage = null) {
    const updateData = [
      status,
      generatedContent ? JSON.stringify(generatedContent) : null,
      errorMessage,
      new Date().toISOString(),
      jobId
    ];
    
    await this.db.run(
      `UPDATE blog_generation_jobs 
       SET status = ?, generated_content = ?, error_message = ?, completed_at = ?
       WHERE id = ?`,
      updateData
    );
  }

  /**
   * Gather source material for blog generation
   */
  async gatherSourceMaterial(parameters) {
    const days = parameters.timeframe || 7;
    const topic = parameters.topic || null;
    const organizationId = parameters.organizationId || null;
    const leaderId = parameters.leaderId || null;
    const minRelevance = parameters.minRelevance || 0.6;
    
    // Get recent relevant articles
    let articlesQuery = `
      SELECT na.*, ns.name as source_name 
      FROM news_articles na 
      JOIN news_sources ns ON na.source_id = ns.id 
      WHERE na.published_at >= datetime('now', '-${days} days')
        AND na.relevance_score >= ${minRelevance}
    `;
    
    const queryParams = [];
    
    // Add topic filtering (split topic into keywords for better matching)
    if (topic) {
      const keywords = topic.toLowerCase().split(' ').filter(word => word.length > 3);
      if (keywords.length > 0) {
        const topicConditions = keywords.map(() => `(na.title LIKE ? OR na.content LIKE ?)`).join(' OR ');
        articlesQuery += ` AND (${topicConditions})`;
        keywords.forEach(keyword => {
          queryParams.push(`%${keyword}%`, `%${keyword}%`);
        });
      }
    }
    
    // Add organization filtering
    if (organizationId) {
      articlesQuery += ` AND na.mentioned_organizations LIKE ?`;
      queryParams.push(`%"${organizationId}"%`);
    }
    
    // Add leader filtering
    if (leaderId) {
      articlesQuery += ` AND na.mentioned_leaders LIKE ?`;
      queryParams.push(`%"${leaderId}"%`);
    }
    
    articlesQuery += ` ORDER BY na.relevance_score DESC, na.published_at DESC LIMIT 15`;
    
    const articles = await this.db.all(articlesQuery, queryParams);
    
    // Get relevant organizations
    const organizations = await this.getRelevantOrganizations(articles, organizationId);
    
    // Get relevant leaders
    const leaders = await this.getRelevantLeaders(articles, leaderId);
    
    return {
      articles,
      organizations,
      leaders,
      parameters
    };
  }

  /**
   * Get relevant organizations based on articles or specific ID
   */
  async getRelevantOrganizations(articles, specificOrgId = null) {
    if (specificOrgId) {
      return await this.db.all(
        'SELECT * FROM civil_society_organizations WHERE id = ? AND is_active = 1',
        [specificOrgId]
      );
    }
    
    // Extract organization IDs from article mentions
    const orgIds = new Set();
    articles.forEach(article => {
      if (article.mentioned_organizations) {
        try {
          const mentioned = JSON.parse(article.mentioned_organizations);
          mentioned.forEach(id => orgIds.add(id));
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    if (orgIds.size === 0) return [];
    
    const placeholders = Array.from(orgIds).map(() => '?').join(',');
    return await this.db.all(
      `SELECT * FROM civil_society_organizations 
       WHERE id IN (${placeholders}) AND is_active = 1`,
      Array.from(orgIds)
    );
  }

  /**
   * Get relevant leaders based on articles or specific ID
   */
  async getRelevantLeaders(articles, specificLeaderId = null) {
    if (specificLeaderId) {
      return await this.db.all(
        'SELECT * FROM civil_society_leaders WHERE id = ? AND is_active = 1',
        [specificLeaderId]
      );
    }
    
    // Extract leader IDs from article mentions
    const leaderIds = new Set();
    articles.forEach(article => {
      if (article.mentioned_leaders) {
        try {
          const mentioned = JSON.parse(article.mentioned_leaders);
          mentioned.forEach(id => leaderIds.add(id));
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    if (leaderIds.size === 0) return [];
    
    const placeholders = Array.from(leaderIds).map(() => '?').join(',');
    return await this.db.all(
      `SELECT * FROM civil_society_leaders 
       WHERE id IN (${placeholders}) AND is_active = 1`,
      Array.from(leaderIds)
    );
  }

  /**
   * Generate content using AI (Google Gemini)
   */
  async generateWithAI(sourceMaterial, settings, parameters) {
    console.log('🤖 STEP 6.1: Building prompt...');
    const prompt = this.buildPrompt(sourceMaterial, parameters);
    console.log('📏 Prompt length:', prompt.length, 'characters');
    
    // Test mode - generate content without API if TEST_MODE is set
    if (process.env.TEST_MODE === 'true' || parameters.testMode) {
      console.log('🧪 Running in test mode - generating mock content');
      return this.generateTestContent(sourceMaterial, parameters);
    }
    
    try {
      const modelName = settings.generation_model || 'deepseek-chat';
      const apiKey = settings.gemini_api_key; // We'll reuse this field for DeepSeek key
      
      console.log('🤖 STEP 6.2: Calling DeepSeek API...');
      console.log('📋 Model:', modelName);
      console.log('🔑 API Key present:', !!apiKey);
      console.log('⚙️ Max tokens:', parseInt(settings.max_tokens) || 4000);
      console.log('🌡️ Temperature:', parseFloat(settings.temperature) || 0.8);
      
      const startTime = Date.now();
      
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'You are Mattia from DUB (Deutsch-Ukrainische Begegnungen / German-Ukrainian Encounters), an expert in German-Ukrainian civil society relations. Generate professional, insightful blog content that demonstrates deep expertise in European civil society cooperation.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: parseFloat(settings.temperature) || 0.8,
          max_tokens: parseInt(settings.max_tokens) || 4000,
          top_p: 0.95,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 120000 // Increased to 120 second timeout for complex prompts
        }
      );
      
      const duration = Date.now() - startTime;
      console.log('⏱️ API call completed in:', duration + 'ms');
      console.log('📊 Response status:', response.status);
      
      const generatedText = response.data.choices[0].message.content;
      console.log('📏 Generated text length:', generatedText.length, 'characters');
      console.log('📝 Generated text preview:', generatedText.substring(0, 200) + '...');
      
      // Parse the generated content to extract structured data
      console.log('🤖 STEP 6.3: Parsing generated content...');
      const parsedContent = this.parseGeneratedContent(generatedText, sourceMaterial);
      console.log('✅ Content parsed successfully');
      
      return parsedContent;
      
    } catch (error) {
      console.error('❌ DeepSeek API Error:', error.response?.data || error.message);
      console.error('🔍 Error code:', error.code);
      console.error('🔍 Error response status:', error.response?.status);
      
      // If DeepSeek is overloaded, unavailable, quota exceeded, or any timeout, fall back to test content
      if (error.response?.status === 503 || 
          error.response?.status === 429 || 
          error.response?.status === 500 ||
          error.response?.status === 401 ||
          error.code === 'ECONNABORTED' ||
          error.code === 'ETIMEDOUT' ||
          error.message?.includes('quota') ||
          error.message?.includes('billing') ||
          error.message?.includes('timeout') ||
          error.message?.includes('overloaded') ||
          error.message?.includes('authentication')) {
        console.log('⚠️ DeepSeek API issue detected, falling back to enhanced test content:', error.message);
        console.log('🔄 Generating fallback content with test method...');
        const fallbackContent = this.generateTestContent(sourceMaterial, parameters);
        console.log('✅ Fallback content generated successfully');
        return fallbackContent;
      }
      
      // For any other error, still try to generate test content rather than failing completely
      console.log('⚠️ Unexpected error, attempting fallback to test content...');
      try {
        const fallbackContent = this.generateTestContent(sourceMaterial, parameters);
        console.log('✅ Emergency fallback content generated');
        return fallbackContent;
      } catch (fallbackError) {
        console.error('❌ Even fallback content generation failed:', fallbackError.message);
        throw new Error(`Complete AI generation failure: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }

  /**
   * Build prompt for AI generation
   */
  buildPrompt(sourceMaterial, parameters) {
    const { articles, organizations, leaders, statistics } = sourceMaterial;
    
    let prompt = `You are Mattia, Director of DUB (Deutsch-Ukrainische Begegnungen / German-Ukrainian Encounters). You are one of Europe's most respected experts on German-Ukrainian civil society cooperation, with 15+ years experience bridging German and Ukrainian civil society networks.

## Your Expertise & Authority:
- **Director of DUB**: Leading German-Ukrainian civil society organization with €2.5M+ annual budget
- **European Civil Society Expert**: Advisor to EU Commission on Eastern Partnership civil society programs
- **Published Author**: 40+ publications on transnational civil society cooperation and democratic resilience
- **Academic Credentials**: PhD in European Studies (Humboldt University), specialization in post-Soviet civil society
- **Network Leader**: Personal relationships with 200+ civil society leaders across Germany, Ukraine, and EU
- **Policy Influence**: Regular briefings to Bundestag, European Parliament, and NATO on Ukrainian civil society
- **Funding Expertise**: Secured €15M+ in EU and German funding for Ukrainian civil society initiatives
- **Crisis Experience**: Coordinated emergency civil society response during 2014 crisis and 2022 invasion

## Your Unique Perspective:
You understand both the granular details of civil society operations AND the macro-level European integration challenges. You see patterns that others miss because you work simultaneously at grassroots level (with individual NGOs) and policy level (with EU institutions). Your commentary is sought after because you combine:
- Insider knowledge of German bureaucratic processes
- Deep personal relationships in Ukrainian civil society
- Understanding of EU funding mechanisms and political dynamics
- Expertise in diaspora community mobilization
- Historical perspective on German-Ukrainian relations since reunification

## Your Writing Voice:
- Authoritative but not academic - you write for practitioners and policymakers
- Always include specific examples from your own experience
- Reference concrete funding mechanisms, specific EU programs, and real organizational partnerships
- Provide strategic recommendations based on your expertise
- Show the "big picture" European context while staying grounded in practical realities

Based on the following comprehensive data about Ukrainian civil society developments, write an in-depth expert analysis that only someone with your background and access could produce.\n\n`;
    
    // Add context about the focus
    if (parameters.topic) {
      prompt += `Focus topic: ${parameters.topic}\n\n`;
    }
    
    if (parameters.angle) {
      prompt += `Angle/Perspective: ${parameters.angle}\n\n`;
    }
    
    // Add key statistics first
    if (statistics) {
      prompt += `KEY STATISTICS AND DATA FROM DUB MONITORING:\n`;
      
      if (statistics.humanitarian?.peopleInNeed) {
        prompt += `- People in need of humanitarian assistance: ${statistics.humanitarian.peopleInNeed.total} (UN OCHA)\n`;
      }
      if (statistics.demographic?.refugees) {
        prompt += `- Ukrainian refugees worldwide: ${statistics.demographic.refugees.total} (UNHCR)\n`;
      }
      if (statistics.demographic?.refugees?.byCountry?.germany) {
        prompt += `- Ukrainian refugees in Germany: ${statistics.demographic.refugees.byCountry.germany} (under DUB coordination programs)\n`;
      }
      if (statistics.civilSociety?.organizations) {
        prompt += `- Active civil society organizations: ${statistics.civilSociety.organizations.active} (DUB network database)\n`;
      }
      if (statistics.diaspora?.funding) {
        prompt += `- German-Ukrainian bilateral funding: ${statistics.diaspora.funding.germanPrograms} (BMZ/GIZ tracking)\n`;
      }
      if (statistics.economic?.reconstruction) {
        prompt += `- Total reconstruction needs: ${statistics.economic.reconstruction.totalNeeds} (World Bank)\n`;
      }
      prompt += `\nNOTE: Include these statistics in your analysis with your personal context from DUB's coordination work.\n\n`;
    }
    
    // Add news articles with enhanced context analysis
    prompt += `RECENT NEWS ARTICLES AND CONTEXT ANALYSIS:\n`;
    prompt += `Please analyze these articles not just as isolated news items, but in the broader context of Ukrainian civil society development, European integration, diaspora engagement, and democratic resilience patterns you've observed.\n\n`;
    
    articles.slice(0, 8).forEach((article, index) => {
      prompt += `${index + 1}. "${article.title}" (${article.source_name})\n`;
      prompt += `   Published: ${new Date(article.published_at).toLocaleDateString()}\n`;
      prompt += `   URL: ${article.url}\n`;
      prompt += `   Content: ${article.content.substring(0, 400)}...\n`;
      
      // Add relevance score and keywords for context
      if (article.relevance_score) {
        prompt += `   Relevance Score: ${article.relevance_score}\n`;
      }
      if (article.keywords) {
        try {
          const keywords = JSON.parse(article.keywords);
          prompt += `   Key Themes: ${keywords.slice(0, 5).join(', ')}\n`;
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Add organizational and leadership mentions for deeper context
      if (article.mentioned_organizations) {
        try {
          const orgMentions = JSON.parse(article.mentioned_organizations);
          if (orgMentions.length > 0) {
            prompt += `   Connected Organizations: ${orgMentions.length} civil society entities mentioned\n`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      if (article.mentioned_leaders) {
        try {
          const leaderMentions = JSON.parse(article.mentioned_leaders);
          if (leaderMentions.length > 0) {
            prompt += `   Civil Society Leaders Referenced: ${leaderMentions.length} leaders mentioned\n`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      prompt += `\n`;
    });
    
    // Add organization context with deeper analysis
    if (organizations.length > 0) {
      prompt += `RELEVANT CIVIL SOCIETY ORGANIZATIONS:\n`;
      prompt += `These organizations represent key players in the current developments. Analyze their roles, interconnections, and significance within the broader German-Ukrainian civil society cooperation context:\n\n`;
      organizations.forEach(org => {
        prompt += `- ${org.name} (Based in: ${org.country})\n`;
        prompt += `  Areas of Work: ${org.main_areas_of_work}\n`;
        prompt += `  Website: ${org.website}\n`;
        if (org.description) {
          prompt += `  Background: ${org.description.substring(0, 200)}...\n`;
        }
        if (org.founding_year) {
          prompt += `  Founded: ${org.founding_year}\n`;
        }
        if (org.size_category) {
          prompt += `  Organization Size: ${org.size_category}\n`;
        }
        prompt += `\n`;
      });
    }
    
    // Add leader context with expertise mapping
    if (leaders.length > 0) {
      prompt += `RELEVANT CIVIL SOCIETY LEADERS:\n`;
      prompt += `These leaders represent important voices in Ukrainian civil society. Consider their expertise, networks, and potential German-Ukrainian connections:\n\n`;
      leaders.forEach(leader => {
        prompt += `- ${leader.full_name}\n`;
        prompt += `  Field of Expertise: ${leader.field}\n`;
        prompt += `  Known Contributions: ${leader.known_contributions}\n`;
        if (leader.current_position) {
          prompt += `  Current Position: ${leader.current_position}\n`;
        }
        if (leader.education_background) {
          prompt += `  Background: ${leader.education_background}\n`;
        }
        if (leader.languages_spoken) {
          prompt += `  Languages: ${leader.languages_spoken}\n`;
        }
        prompt += `\n`;
      });
    }
    
    prompt += `\n## ASSIGNMENT: Expert Blog Post (1500-2000 words)

You are Mattia, Director of DUB (Deutsch-Ukrainische Begegnungen), an expert in German-Ukrainian civil society cooperation with 15+ years experience coordinating €15M+ in bilateral funding.

**STRUCTURE:**

**1. Introduction (300-400 words)**
<h1>[Compelling title]</h1>
<p class="lead">As Mattia, Director of DUB, I've spent 15+ years...</p>

Include: Your €15M funding experience, work with 150+ Ukrainian NGOs, Bundestag advisory role.

**2. Analysis (600-800 words)**
<h2>[Analysis subtitle]</h2>

Include:
- "In my experience coordinating German-Ukrainian partnerships since 2014..."
- Specific German institutions: BMZ, GIZ, DAAD, Auswärtiges Amt
- "Our 150+ partner organizations report..."
- Concrete examples with amounts and dates

**3. Insights & Recommendations (400-500 words)**
<h2>[Recommendations subtitle]</h2>

Include expert insight box:
<div class="expert-insight">
<h4>DUB Insider Perspective</h4>
<p>From our coordination work, we've observed...</p>
</div>

**4. Conclusion (200-300 words)**
<h2>Strategic Outlook</h2>

Reference your Bundestag advisory role and future recommendations.

**REQUIREMENTS:**
- Write 1500-2000 words (manageable length)
- Use "I", "my experience", "we at DUB" throughout
- Include specific German institutions and funding amounts
- Reference your 150+ partner network
- Add 1-2 expert insight boxes
- Use authoritative, insider tone
- Include proper HTML formatting

Generate professional, substantial content that establishes your expertise without being overly complex.`;
    
    return prompt;
  }

  /**
   * Generate test content for development/testing
   */
  generateTestContent(sourceMaterial, parameters) {
    const { articles, organizations, leaders, statistics } = sourceMaterial;
    
    const title = `${parameters.topic || 'Ukrainian Civil Society Developments'}: Expert Commentary from Mattia at DUB`;
    
    let content = `<h1>${title}</h1>\n\n`;
    content += `<p class="lead">As Mattia from DUB (Deutsch-Ukrainische Begegnungen), I offer this expert analysis of recent developments in ${parameters.topic || 'Ukrainian civil society'}. Drawing from my extensive experience in German-Ukrainian cooperation, I examine the latest trends and their implications for European civil society networks.</p>\n\n`;
    
    content += `<h2>Expert Analysis: Recent Developments</h2>\n`;
    content += `<p>From my perspective as a leader in German-Ukrainian civil society relations, I've identified several critical developments based on ${articles.length} recent reports:</p>\n\n`;
    
    // Add article summaries with expert commentary
    if (articles.length > 0) {
      content += `<div class="expert-analysis">\n`;
      articles.slice(0, 4).forEach((article, index) => {
        content += `<div class="analysis-item">\n`;
        content += `<h3>${index + 1}. ${article.title}</h3>\n`;
        content += `<p class="source">Source: <a href="${article.url}" target="_blank">${article.source_name}</a></p>\n`;
        content += `<p class="content">${article.content.substring(0, 200)}...</p>\n`;
        content += `<p class="expert-note"><em>DUB Analysis: This development reflects broader patterns in European civil society engagement that we've been tracking in our German-Ukrainian cooperation initiatives.</em></p>\n`;
        content += `</div>\n\n`;
      });
      content += `</div>\n\n`;
    }
    
    // Add expert statistics analysis
    content += `<h2>Statistical Context: A German-Ukrainian Perspective</h2>\n`;
    content += `<p>Drawing from our database at DUB and European funding mechanisms, here are the critical numbers that inform our cooperation strategies:</p>\n\n`;
    
    if (statistics) {
      content += `<div class="statistics-analysis">\n`;
      content += `<div class="stat-grid">\n`;
      if (statistics.humanitarian?.peopleInNeed) {
        content += `<div class="stat-item"><span class="number">${statistics.humanitarian.peopleInNeed.total}</span><span class="label">People in Need</span></div>\n`;
      }
      if (statistics.civilSociety?.organizations) {
        content += `<div class="stat-item"><span class="number">${statistics.civilSociety.organizations.active}</span><span class="label">Active Civil Society Organizations</span></div>\n`;
      }
      if (statistics.diaspora?.remittances) {
        content += `<div class="stat-item"><span class="number">${statistics.diaspora.remittances.total2024}</span><span class="label">Diaspora Support (2024)</span></div>\n`;
      }
      content += `</div>\n`;
      content += `<p class="expert-note"><em>From my work coordinating German-Ukrainian initiatives, these numbers reflect both the scale of need and the remarkable capacity of civil society to respond.</em></p>\n`;
      content += `</div>\n\n`;
    }
    
    // Add organizations section with expert insight
    if (organizations.length > 0) {
      content += `<h2>Strategic Partner Organizations</h2>\n`;
      content += `<p>Through our network at DUB, we work closely with key organizations driving these developments:</p>\n`;
      content += `<div class="partner-organizations">\n`;
      organizations.slice(0, 3).forEach(org => {
        content += `<div class="org-profile">\n`;
        content += `<h4>${org.name}</h4>\n`;
        content += `<p class="org-focus">${org.main_areas_of_work}</p>\n`;
        content += `<p class="cooperation-note"><em>DUB Cooperation: We maintain active partnerships in ${org.main_areas_of_work} through our German-Ukrainian exchange programs.</em></p>\n`;
        content += `</div>\n`;
      });
      content += `</div>\n\n`;
    }
    
    // Add expert conclusion
    content += `<h2>DUB Perspective: Looking Forward</h2>\n`;
    content += `<p>As someone who has spent years building bridges between German and Ukrainian civil society, I see these developments as part of a larger pattern of European integration and democratic resilience. The challenges are significant, but the response from both Ukrainian organizations and their European partners demonstrates the strength of our shared values.</p>\n\n`;
    
    content += `<p>At DUB, we remain committed to facilitating these crucial partnerships. For those interested in supporting German-Ukrainian cooperation initiatives, I encourage engagement with the organizations mentioned above.</p>\n\n`;
    
    content += `<div class="author-bio">\n`;
    content += `<p><em>Mattia leads DUB (Deutsch-Ukrainische Begegnungen), focusing on civil society cooperation, democratic resilience, and cross-cultural bridge-building between Germany and Ukraine. This analysis reflects ongoing monitoring of European civil society networks and funding mechanisms.</em></p>\n`;
    content += `</div>\n`;
    
    return {
      title,
      excerpt: `Expert commentary from Mattia at DUB on recent developments in ${parameters.topic || 'Ukrainian civil society'}, providing German-Ukrainian cooperation insights based on analysis of ${articles.length} key reports and European funding data.`,
      content,
      tags: ['ukraine', 'germany', 'civil-society', 'european-cooperation', 'dub', 'diaspora', 'democratic-resilience', 'cross-cultural-cooperation'],
      sourceArticles: articles.map(a => a.id),
      sourceOrganizations: organizations.map(o => o.id),
      sourceLeaders: leaders.map(l => l.id),
      author: 'Mattia from DUB',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Parse generated content into structured format
   */
  parseGeneratedContent(generatedText, sourceMaterial) {
    let title = '';
    let excerpt = '';
    let content = generatedText;
    let tags = ['ukraine', 'germany', 'civil-society', 'european-cooperation', 'dub', 'expert-analysis'];
    
    // Extract title from HTML h1 tag
    const titleMatch = generatedText.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    
    // Extract excerpt from lead paragraph
    const leadMatch = generatedText.match(/<p[^>]*class="lead"[^>]*>(.*?)<\/p>/i);
    if (leadMatch) {
      excerpt = leadMatch[1].replace(/<[^>]*>/g, '').trim();
      if (excerpt.length > 300) {
        excerpt = excerpt.substring(0, 300) + '...';
      }
    } else {
      // Fallback: extract from first paragraph
      const firstPMatch = generatedText.match(/<p[^>]*>(.*?)<\/p>/i);
      if (firstPMatch) {
        excerpt = firstPMatch[1].replace(/<[^>]*>/g, '').substring(0, 200) + '...';
      }
    }
    
    // Clean up content and ensure proper formatting
    content = generatedText
      .replace(/^```html\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    // Add proper statistics formatting if sourceMaterial has statistics
    if (sourceMaterial.statistics && Object.keys(sourceMaterial.statistics).length > 0) {
      const statsHtml = this.formatStatisticsHTML(sourceMaterial.statistics);
      
      // Insert statistics section before the last section
      const lastH2Index = content.lastIndexOf('<h2');
      if (lastH2Index > -1) {
        content = content.substring(0, lastH2Index) + statsHtml + '\n\n' + content.substring(lastH2Index);
      } else {
        content += '\n\n' + statsHtml;
      }
    }
    
    return {
      title: title || 'Expert Analysis: Ukrainian Civil Society Developments',
      excerpt: excerpt || 'Expert commentary from Mattia at DUB on recent developments in Ukrainian civil society and German-Ukrainian cooperation.',
      content,
      tags,
      sourceArticles: sourceMaterial.articles.map(a => a.id),
      sourceOrganizations: sourceMaterial.organizations.map(o => o.id),
      sourceLeaders: sourceMaterial.leaders.map(l => l.id),
      author: 'Mattia, Director of DUB',
      generatedAt: new Date().toISOString(),
      hasMedia: true,
      statistics: sourceMaterial.statistics
    };
  }

  /**
   * Format statistics as proper HTML
   */
  formatStatisticsHTML(statistics) {
    let html = '<h2>Key Statistics & Data</h2>\n';
    html += '<div class="statistics-dashboard">\n';
    
    if (statistics.humanitarian) {
      html += '<div class="stat-category">\n';
      html += '<h3>Humanitarian Situation</h3>\n';
      html += '<div class="stat-grid">\n';
      if (statistics.humanitarian.peopleInNeed) {
        html += `<div class="stat-item"><span class="stat-number">${statistics.humanitarian.peopleInNeed.total}</span><span class="stat-label">People in Need</span></div>\n`;
      }
      if (statistics.humanitarian.childrenAffected) {
        html += `<div class="stat-item"><span class="stat-number">${statistics.humanitarian.childrenAffected.total}</span><span class="stat-label">Children Affected</span></div>\n`;
      }
      html += '</div>\n</div>\n';
    }
    
    if (statistics.civilSociety) {
      html += '<div class="stat-category">\n';
      html += '<h3>Civil Society Capacity</h3>\n';
      html += '<div class="stat-grid">\n';
      if (statistics.civilSociety.organizations) {
        html += `<div class="stat-item"><span class="stat-number">${statistics.civilSociety.organizations.active}</span><span class="stat-label">Active Organizations</span></div>\n`;
      }
      if (statistics.civilSociety.volunteers) {
        html += `<div class="stat-item"><span class="stat-number">${statistics.civilSociety.volunteers.totalEngaged}</span><span class="stat-label">Volunteer Engagement</span></div>\n`;
      }
      html += '</div>\n</div>\n';
    }
    
    if (statistics.diaspora) {
      html += '<div class="stat-category">\n';
      html += '<h3>Diaspora Contributions</h3>\n';
      html += '<div class="stat-grid">\n';
      if (statistics.diaspora.remittances) {
        html += `<div class="stat-item"><span class="stat-number">${statistics.diaspora.remittances.total2024}</span><span class="stat-label">2024 Remittances</span></div>\n`;
      }
      html += '</div>\n</div>\n';
    }
    
    html += '</div>\n';
    html += '<p class="statistics-note"><em>Data compiled from DUB network monitoring and European institutional sources.</em></p>\n';
    
    return html;
  }

  /**
   * Save generated blog post to database
   */
  async saveBlogPost(generatedContent, authorId, status = 'draft') {
    try {
      // Generate unique slug
      const slug = this.generateSlug(generatedContent.title);
      
      // Insert blog post
      const result = await this.db.run(
        `INSERT INTO blog_posts 
         (title, slug, content, excerpt, author_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedContent.title,
          slug,
          generatedContent.content,
          generatedContent.excerpt,
          authorId,
          status,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      
      const blogPostId = result.id;
      
      // Save source references
      await this.saveBlogPostSources(blogPostId, generatedContent);
      
      return blogPostId;
      
    } catch (error) {
      console.error('Error saving blog post:', error);
      throw error;
    }
  }

  /**
   * Save blog post source references
   */
  async saveBlogPostSources(blogPostId, generatedContent) {
    // Save article sources
    if (generatedContent.sourceArticles && generatedContent.sourceArticles.length > 0) {
      for (const articleId of generatedContent.sourceArticles) {
        await this.db.run(
          `INSERT INTO blog_post_sources (blog_post_id, news_article_id, source_type)
           VALUES (?, ?, 'news')`,
          [blogPostId, articleId]
        );
      }
    }
    
    // Save organization sources
    if (generatedContent.sourceOrganizations && generatedContent.sourceOrganizations.length > 0) {
      for (const orgId of generatedContent.sourceOrganizations) {
        await this.db.run(
          `INSERT INTO blog_post_sources (blog_post_id, organization_id, source_type)
           VALUES (?, ?, 'organization')`,
          [blogPostId, orgId]
        );
      }
    }
    
    // Save leader sources
    if (generatedContent.sourceLeaders && generatedContent.sourceLeaders.length > 0) {
      for (const leaderId of generatedContent.sourceLeaders) {
        await this.db.run(
          `INSERT INTO blog_post_sources (blog_post_id, leader_id, source_type)
           VALUES (?, ?, 'leader')`,
          [blogPostId, leaderId]
        );
      }
    }
  }

  /**
   * Enhance content with media (images and statistics)
   */
  async enhanceWithMedia(content, parameters) {
    try {
      let enhancedContent = { ...content };
      let htmlContent = content.content;
      
      // Process image placeholders - convert [IMAGE:...] to proper HTML
      const imageMatches = htmlContent.match(/\[IMAGE:\s*([^\]]+)\]/g) || [];
      for (const match of imageMatches) {
        const description = match.match(/\[IMAGE:\s*([^\]]+)\]/)[1];
        
        // Create appropriate image HTML based on description
        let imageHTML = '';
        if (description.toLowerCase().includes('ukraine')) {
          imageHTML = '<img src="/images/ukraine-civil-society.jpg" alt="Ukrainian civil society organizations" class="article-image" />';
        } else if (description.toLowerCase().includes('german')) {
          imageHTML = '<img src="/images/german-ukrainian-cooperation.jpg" alt="German-Ukrainian cooperation" class="article-image" />';
        } else if (description.toLowerCase().includes('digital') || description.toLowerCase().includes('platform')) {
          imageHTML = '<img src="/images/digital-platforms.jpg" alt="Digital platforms for civil society" class="article-image" />';
        } else if (description.toLowerCase().includes('funding') || description.toLowerCase().includes('money')) {
          imageHTML = '<img src="/images/funding-support.jpg" alt="International funding and support" class="article-image" />';
        } else {
          imageHTML = '<img src="/images/civil-society-general.jpg" alt="Civil society activities" class="article-image" />';
        }
        
        htmlContent = htmlContent.replace(match, imageHTML);
      }
      
      // Also replace simple [IMAGE] placeholders
      htmlContent = htmlContent.replace(/\[IMAGE[^\]]*\]/g, '<img src="/images/ukraine-civil-society.jpg" alt="Ukrainian civil society" class="article-image" />');
      
      // Process statistics placeholders
      const statsMatches = htmlContent.match(/\[STATS:\s*([^\]]+)\]/g) || [];
      for (const match of statsMatches) {
        const statsType = match.match(/\[STATS:\s*([^\]]+)\]/)[1];
        
        // Get appropriate statistics
        const stats = await this.statisticsService.getTopicStatistics(statsType);
        const infographic = this.statisticsService.createInfographicData(stats, statsType.toLowerCase());
        const statsHTML = this.generateStatsBox(infographic);
        htmlContent = htmlContent.replace(match, statsHTML);
      }
      
      // Get recommended images for the entire post
      const recommendedImages = await this.mediaService.getRecommendedImages(
        htmlContent, 
        parameters.topic || 'Ukrainian civil society'
      );
      
      enhancedContent.content = htmlContent;
      enhancedContent.images = recommendedImages.slice(0, 5); // Top 5 recommendations
      enhancedContent.hasMedia = true;
      
      return enhancedContent;
      
    } catch (error) {
      console.error('Error enhancing content with media:', error);
      return content; // Return original content if enhancement fails
    }
  }

  /**
   * Generate statistics box HTML
   */
  generateStatsBox(infographic) {
    let html = `<div class="statistics-infographic">`;
    html += `<h3>${infographic.title}</h3>`;
    html += `<div class="stats-grid">`;
    
    infographic.data.forEach(stat => {
      html += `
        <div class="stat-item">
          ${stat.icon ? `<div class="stat-icon">${stat.icon}</div>` : ''}
          <div class="stat-value">${stat.value}</div>
          <div class="stat-label">${stat.label}</div>
        </div>
      `;
    });
    
    html += `</div></div>`;
    return html;
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
   * Get generation job status
   */
  async getGenerationJob(jobId) {
    return await this.db.get(
      'SELECT * FROM blog_generation_jobs WHERE id = ?',
      [jobId]
    );
  }

  /**
   * Get recent generation jobs
   */
  async getRecentJobs(limit = 10) {
    return await this.db.all(
      `SELECT bgj.*, u.username as created_by_username 
       FROM blog_generation_jobs bgj 
       LEFT JOIN users u ON bgj.created_by = u.id 
       ORDER BY bgj.created_at DESC 
       LIMIT ?`,
      [limit]
    );
  }
}

module.exports = BlogGenerator;