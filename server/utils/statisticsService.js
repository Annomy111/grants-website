const axios = require('axios');
const Database = require('../database/db');

class StatisticsService {
  constructor() {
    this.db = Database;
    this.cache = new Map(); // Simple in-memory cache
    this.cacheTimeout = 3600000; // 1 hour
  }

  /**
   * Get comprehensive Ukraine statistics from multiple sources
   */
  async getUkraineStatistics(categories = []) {
    const stats = {
      demographic: {},
      humanitarian: {},
      economic: {},
      social: {},
      diaspora: {},
      civilSociety: {},
      lastUpdated: new Date().toISOString()
    };

    // Get statistics from various sources
    try {
      if (!categories.length || categories.includes('demographic')) {
        stats.demographic = await this.getDemographicStats();
      }
      
      if (!categories.length || categories.includes('humanitarian')) {
        stats.humanitarian = await this.getHumanitarianStats();
      }
      
      if (!categories.length || categories.includes('economic')) {
        stats.economic = await this.getEconomicStats();
      }
      
      if (!categories.length || categories.includes('social')) {
        stats.social = await this.getSocialStats();
      }
      
      if (!categories.length || categories.includes('diaspora')) {
        stats.diaspora = await this.getDiasporaStats();
      }
      
      if (!categories.length || categories.includes('civilSociety')) {
        stats.civilSociety = await this.getCivilSocietyStats();
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }

    return stats;
  }

  /**
   * Get demographic statistics
   */
  async getDemographicStats() {
    // Check cache first
    const cacheKey = 'demographic_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const stats = {
      population: {
        total: "41 million",
        preWar: "44 million",
        source: "World Bank 2023 estimate",
        note: "Excluding temporarily occupied territories"
      },
      refugees: {
        total: "6.2 million",
        byCountry: {
          poland: "1.6 million",
          germany: "1.1 million",
          czechia: "500,000",
          uk: "210,000",
          spain: "190,000",
          italy: "175,000"
        },
        source: "UNHCR Data Portal",
        lastUpdated: "December 2024"
      },
      idps: {
        total: "3.7 million",
        source: "IOM Ukraine",
        lastUpdated: "December 2024"
      }
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  /**
   * Get humanitarian statistics
   */
  async getHumanitarianStats() {
    const cacheKey = 'humanitarian_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const stats = {
      peopleInNeed: {
        total: "14.6 million",
        children: "3.3 million",
        source: "UN OCHA",
        year: "2024"
      },
      humanitarianAssistance: {
        reached: "8.5 million",
        cashAssistance: "2.1 million",
        foodAssistance: "3.8 million",
        healthcareProvided: "5.2 million",
        source: "UN OCHA Ukraine"
      },
      funding: {
        required: "$3.1 billion",
        received: "$1.8 billion",
        gap: "$1.3 billion",
        percentFunded: "58%",
        source: "UN OCHA Financial Tracking Service",
        year: "2024"
      }
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  /**
   * Get economic statistics
   */
  async getEconomicStats() {
    const cacheKey = 'economic_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const stats = {
      gdp: {
        growth2024: "+3.5%",
        growth2023: "+5.3%",
        decline2022: "-29.1%",
        source: "World Bank",
        note: "Real GDP growth rate"
      },
      unemployment: {
        rate: "18.5%",
        youth: "23.1%",
        source: "State Statistics Service of Ukraine",
        quarter: "Q3 2024"
      },
      inflation: {
        rate: "9.7%",
        source: "National Bank of Ukraine",
        month: "November 2024"
      },
      reconstruction: {
        totalNeeds: "$486 billion",
        housingDamage: "$56 billion",
        infrastructureDamage: "$35 billion",
        source: "World Bank Rapid Damage Assessment",
        asOf: "December 2024"
      }
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  /**
   * Get social statistics
   */
  async getSocialStats() {
    const cacheKey = 'social_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const stats = {
      education: {
        schoolsDestroyed: "365",
        schoolsDamaged: "3,790",
        studentsAffected: "1.7 million",
        onlineLearning: "67%",
        source: "Ministry of Education and Science",
        lastUpdated: "December 2024"
      },
      healthcare: {
        facilitiesDestroyed: "201",
        facilitiesDamaged: "1,589",
        healthWorkersDisplaced: "25,000+",
        source: "WHO Ukraine",
        lastUpdated: "November 2024"
      },
      culture: {
        sitesDestroyed: "123",
        sitesDamaged: "428",
        museumsAffected: "176",
        source: "UNESCO",
        verified: "December 2024"
      }
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  /**
   * Get diaspora statistics
   */
  async getDiasporaStats() {
    const cacheKey = 'diaspora_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const stats = {
      global: {
        total: "15-20 million",
        largestCommunities: {
          canada: "1.4 million",
          usa: "1 million",
          brazil: "600,000",
          argentina: "305,000",
          germany: "250,000",
          italy: "235,000"
        },
        source: "Ukrainian World Congress estimate"
      },
      remittances: {
        total2024: "$14.2 billion",
        percentGDP: "7.8%",
        growth: "+8.5%",
        source: "National Bank of Ukraine",
        period: "Jan-Nov 2024"
      },
      organizations: {
        registered: "1,200+",
        countries: "65",
        umbrellaOrgs: "35",
        source: "Ukrainian World Congress"
      }
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  /**
   * Get civil society statistics
   */
  async getCivilSocietyStats() {
    const cacheKey = 'civil_society_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Get data from our database
    const dbStats = await this.getLocalCivilSocietyStats();

    const stats = {
      organizations: {
        total: "85,000+",
        active: "35,000+",
        humanitarian: "8,500+",
        humanRights: "1,200+",
        veterans: "3,500+",
        source: "Ministry of Justice registry",
        year: "2024"
      },
      volunteers: {
        regular: "19%",
        occasional: "38%",
        totalEngaged: "57%",
        source: "Democratic Initiatives Foundation",
        survey: "October 2024"
      },
      funding: {
        internationalDonors: "$2.3 billion",
        localFundraising: "$450 million",
        crowdfunding: "$180 million",
        source: "Ukrainian Philanthropists Forum",
        year: "2024"
      },
      trust: {
        volunteers: "87%",
        ngos: "72%",
        internationalOrgs: "68%",
        source: "Razumkov Centre",
        date: "November 2024"
      },
      // Add our local database stats
      inOurDatabase: dbStats
    };

    this.setCache(cacheKey, stats);
    return stats;
  }

  /**
   * Get civil society stats from local database
   */
  async getLocalCivilSocietyStats() {
    try {
      const orgCount = await this.db.get('SELECT COUNT(*) as count FROM civil_society_organizations WHERE is_active = 1');
      const leaderCount = await this.db.get('SELECT COUNT(*) as count FROM civil_society_leaders WHERE is_active = 1');
      const articleCount = await this.db.get('SELECT COUNT(*) as count FROM news_articles');
      
      return {
        organizations: orgCount.count,
        leaders: leaderCount.count,
        newsArticles: articleCount.count,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching local stats:', error);
      return {};
    }
  }

  /**
   * Generate statistics visualization HTML
   */
  generateStatsHTML(stats, options = {}) {
    const { title, showSource = true, className = 'statistics-box' } = options;
    
    return `
      <div class="${className}">
        ${title ? `<h4>${title}</h4>` : ''}
        <div class="stats-content">
          ${this.formatStatistics(stats)}
        </div>
        ${showSource && stats.source ? `
          <div class="stats-source">
            Source: ${stats.source} ${stats.lastUpdated || stats.year || stats.date || ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Format statistics for display
   */
  formatStatistics(stats) {
    if (typeof stats === 'string' || typeof stats === 'number') {
      return `<div class="stat-value">${stats}</div>`;
    }

    let html = '<dl class="statistics-list">';
    
    for (const [key, value] of Object.entries(stats)) {
      if (key === 'source' || key === 'lastUpdated' || key === 'year' || key === 'date' || key === 'note') continue;
      
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      if (typeof value === 'object') {
        html += `<dt>${label}:</dt><dd>${this.formatStatistics(value)}</dd>`;
      } else {
        html += `<dt>${label}:</dt><dd>${value}</dd>`;
      }
    }
    
    html += '</dl>';
    return html;
  }

  /**
   * Get statistics for specific topic
   */
  async getTopicStatistics(topic) {
    const topicMap = {
      'humanitarian': ['humanitarian', 'demographic'],
      'civil society': ['civilSociety', 'social'],
      'economy': ['economic'],
      'diaspora': ['diaspora'],
      'education': ['social'],
      'reconstruction': ['economic', 'humanitarian']
    };

    // Find relevant categories for the topic
    const relevantCategories = Object.entries(topicMap)
      .filter(([key]) => topic.toLowerCase().includes(key))
      .flatMap(([, categories]) => categories);

    if (relevantCategories.length === 0) {
      relevantCategories.push('civilSociety', 'humanitarian'); // Default
    }

    return await this.getUkraineStatistics([...new Set(relevantCategories)]);
  }

  /**
   * Create infographic data
   */
  createInfographicData(stats, type = 'summary') {
    const infographics = {
      summary: {
        title: 'Ukraine at a Glance',
        data: [
          { label: 'Population', value: stats.demographic?.population?.total || 'N/A', icon: 'people' },
          { label: 'Refugees', value: stats.demographic?.refugees?.total || 'N/A', icon: 'refugee' },
          { label: 'People in Need', value: stats.humanitarian?.peopleInNeed?.total || 'N/A', icon: 'help' },
          { label: 'Civil Society Orgs', value: stats.civilSociety?.organizations?.active || 'N/A', icon: 'organization' }
        ]
      },
      humanitarian: {
        title: 'Humanitarian Crisis',
        data: [
          { label: 'People in Need', value: stats.humanitarian?.peopleInNeed?.total || 'N/A' },
          { label: 'Children Affected', value: stats.humanitarian?.peopleInNeed?.children || 'N/A' },
          { label: 'People Reached', value: stats.humanitarian?.humanitarianAssistance?.reached || 'N/A' },
          { label: 'Funding Gap', value: stats.humanitarian?.funding?.gap || 'N/A' }
        ]
      },
      diaspora: {
        title: 'Ukrainian Diaspora Impact',
        data: [
          { label: 'Global Diaspora', value: stats.diaspora?.global?.total || 'N/A' },
          { label: 'Remittances 2024', value: stats.diaspora?.remittances?.total2024 || 'N/A' },
          { label: 'Organizations', value: stats.diaspora?.organizations?.registered || 'N/A' },
          { label: 'Countries', value: stats.diaspora?.organizations?.countries || 'N/A' }
        ]
      }
    };

    return infographics[type] || infographics.summary;
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

module.exports = StatisticsService;