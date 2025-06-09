const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class GrantDataEnricher {
  constructor() {
    this.enrichmentStats = {
      totalProcessed: 0,
      enriched: 0,
      failed: 0,
      updates: []
    };
  }

  // Extract organization type from name
  detectOrganizationType(orgName) {
    const patterns = {
      foundation: /foundation|stiftung|fondation|fund/i,
      government: /embassy|ministry|government|agency|commission|council/i,
      ngo: /ngo|organization|association|institute|society/i,
      corporation: /corporation|company|inc\.|ltd\.|gmbh/i,
      international: /united nations|un|world|international|global/i,
      academic: /university|college|academy|school/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(orgName)) {
        return type;
      }
    }
    return 'other';
  }

  // Extract currency and normalize amounts
  normalizeGrantAmount(amountString) {
    if (!amountString) return null;

    const currencies = {
      '€': 'EUR',
      '$': 'USD',
      '£': 'GBP',
      'грн': 'UAH'
    };

    let currency = null;
    let minAmount = null;
    let maxAmount = null;

    // Find currency
    for (const [symbol, code] of Object.entries(currencies)) {
      if (amountString.includes(symbol)) {
        currency = code;
        break;
      }
    }

    // Extract amounts
    const amountPattern = /[\d,]+(?:\.\d{2})?/g;
    const amounts = amountString.match(amountPattern);
    
    if (amounts) {
      const parsedAmounts = amounts.map(a => parseFloat(a.replace(/,/g, '')));
      if (parsedAmounts.length === 1) {
        maxAmount = parsedAmounts[0];
      } else if (parsedAmounts.length >= 2) {
        minAmount = Math.min(...parsedAmounts);
        maxAmount = Math.max(...parsedAmounts);
      }
    }

    return {
      currency,
      minAmount,
      maxAmount,
      originalText: amountString
    };
  }

  // Extract keywords from text
  extractKeywords(text, minFreq = 2) {
    if (!text) return [];

    const stopWords = new Set([
      'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may',
      'might', 'must', 'can', 'a', 'an', 'their', 'them', 'they', 'this',
      'that', 'these', 'those', 'such', 'some', 'any', 'all', 'each', 'every'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .filter(([word, freq]) => freq >= minFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);
  }

  // Categorize focus areas
  categorizeFocusAreas(focusAreas) {
    if (!focusAreas) return [];

    const categories = {
      'Human Rights': ['human rights', 'civil rights', 'freedom', 'justice', 'equality'],
      'Democracy': ['democracy', 'democratic', 'governance', 'civic', 'political'],
      'Environment': ['environment', 'climate', 'sustainability', 'green', 'ecological'],
      'Gender': ['gender', 'women', 'girls', 'feminist', 'equality'],
      'Education': ['education', 'training', 'capacity', 'learning', 'skills'],
      'Health': ['health', 'medical', 'healthcare', 'mental health', 'wellness'],
      'Economic Development': ['economic', 'business', 'entrepreneurship', 'employment', 'financial'],
      'Technology': ['technology', 'digital', 'innovation', 'tech', 'cyber'],
      'Media': ['media', 'journalism', 'information', 'communication', 'press'],
      'Youth': ['youth', 'young', 'adolescent', 'children', 'teenager'],
      'Culture': ['culture', 'cultural', 'arts', 'heritage', 'creative'],
      'Humanitarian': ['humanitarian', 'emergency', 'relief', 'crisis', 'refugee']
    };

    const foundCategories = new Set();
    const lowerFocusAreas = focusAreas.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerFocusAreas.includes(keyword))) {
        foundCategories.add(category);
      }
    }

    return Array.from(foundCategories);
  }

  // Calculate grant score based on completeness and quality
  calculateGrantScore(grant) {
    let score = 0;
    const weights = {
      grant_name: 5,
      funding_organization: 5,
      detailed_description: 10,
      eligibility_criteria: 8,
      focus_areas: 8,
      grant_amount: 7,
      application_deadline: 10,
      application_procedure: 7,
      website_link: 5,
      contact_email: 5,
      required_documents: 5,
      evaluation_criteria: 5,
      keywords: 5,
      grant_name_uk: 5,
      focus_areas_uk: 5,
      reporting_requirements: 5
    };

    for (const [field, weight] of Object.entries(weights)) {
      if (grant[field] && grant[field].toString().trim() !== '') {
        score += weight;
      }
    }

    // Bonus points for detailed content
    if (grant.detailed_description && grant.detailed_description.length > 200) {
      score += 5;
    }
    if (grant.keywords && grant.keywords.length > 5) {
      score += 3;
    }

    return Math.min(100, score);
  }

  // Estimate deadline if missing
  estimateDeadline(grant) {
    // If deadline is missing but we have other info
    if (!grant.application_deadline || grant.application_deadline === 'Open') {
      const today = new Date();
      
      // Check if it's a recurring grant
      if (grant.grant_name?.toLowerCase().includes('annual') || 
          grant.grant_name?.toLowerCase().includes('yearly')) {
        // Set to end of current year
        return new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      }
      
      // Check if it's quarterly
      if (grant.grant_name?.toLowerCase().includes('quarterly')) {
        // Set to end of current quarter
        const quarter = Math.floor(today.getMonth() / 3);
        const endMonth = (quarter + 1) * 3 - 1;
        return new Date(today.getFullYear(), endMonth + 1, 0).toISOString().split('T')[0];
      }
      
      // Default: assume 6 months from now
      const sixMonthsLater = new Date(today);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      return sixMonthsLater.toISOString().split('T')[0];
    }
    
    return grant.application_deadline;
  }

  // Generate search-friendly description
  generateSearchDescription(grant) {
    const parts = [];
    
    if (grant.funding_organization) {
      parts.push(`Grant opportunity from ${grant.funding_organization}`);
    }
    
    if (grant.focus_areas) {
      parts.push(`focusing on ${grant.focus_areas.toLowerCase()}`);
    }
    
    if (grant.country_region) {
      parts.push(`available in ${grant.country_region}`);
    }
    
    if (grant.grant_amount) {
      parts.push(`with funding of ${grant.grant_amount}`);
    }
    
    return parts.join(' ') + '.';
  }

  // Main enrichment function
  async enrichGrant(grant) {
    const updates = {};
    
    try {
      // 1. Organization type
      if (grant.funding_organization && !grant.organization_type) {
        updates.organization_type = this.detectOrganizationType(grant.funding_organization);
      }
      
      // 2. Normalize grant amounts
      if (grant.grant_amount && (!grant.grant_size_min || !grant.grant_size_max)) {
        const normalized = this.normalizeGrantAmount(grant.grant_amount);
        if (normalized) {
          updates.grant_size_min = normalized.minAmount;
          updates.grant_size_max = normalized.maxAmount;
          updates.currency = normalized.currency;
        }
      }
      
      // 3. Extract keywords if missing
      if (!grant.keywords || grant.keywords.length === 0) {
        const textContent = [
          grant.grant_name,
          grant.detailed_description,
          grant.focus_areas,
          grant.eligibility_criteria
        ].filter(Boolean).join(' ');
        
        updates.keywords = this.extractKeywords(textContent);
      }
      
      // 4. Categorize focus areas
      if (grant.focus_areas && !grant.focus_categories) {
        updates.focus_categories = this.categorizeFocusAreas(grant.focus_areas);
      }
      
      // 5. Calculate quality score
      updates.quality_score = this.calculateGrantScore({ ...grant, ...updates });
      
      // 6. Estimate deadline if needed
      if (!grant.application_deadline || grant.application_deadline === 'Open') {
        updates.estimated_deadline = this.estimateDeadline(grant);
      }
      
      // 7. Generate search description if missing
      if (!grant.search_description) {
        updates.search_description = this.generateSearchDescription(grant);
      }
      
      // 8. Set program type if missing
      if (!grant.program_type) {
        if (grant.grant_name?.toLowerCase().includes('fellowship')) {
          updates.program_type = 'Fellowship';
        } else if (grant.grant_name?.toLowerCase().includes('scholarship')) {
          updates.program_type = 'Scholarship';
        } else if (grant.grant_name?.toLowerCase().includes('award')) {
          updates.program_type = 'Award';
        } else {
          updates.program_type = 'Project Grant';
        }
      }
      
      // 9. Add metadata
      updates.last_enriched = new Date().toISOString();
      updates.enrichment_version = '1.0';
      
      return updates;
      
    } catch (error) {
      console.error(`Error enriching grant ${grant.id}:`, error);
      return null;
    }
  }

  // Process all grants
  async processAllGrants() {
    console.log('Starting grant data enrichment...\n');
    
    // Fetch all grants
    const { data: grants, error } = await supabase
      .from('grants')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching grants:', error);
      return;
    }
    
    console.log(`Found ${grants.length} grants to process\n`);
    
    for (const grant of grants) {
      this.enrichmentStats.totalProcessed++;
      
      const updates = await this.enrichGrant(grant);
      
      if (updates && Object.keys(updates).length > 0) {
        // Update grant in database
        const { error: updateError } = await supabase
          .from('grants')
          .update(updates)
          .eq('id', grant.id);
        
        if (updateError) {
          console.error(`Failed to update grant ${grant.id}:`, updateError);
          this.enrichmentStats.failed++;
        } else {
          console.log(`✓ Enriched grant ${grant.id}: ${grant.grant_name}`);
          this.enrichmentStats.enriched++;
          this.enrichmentStats.updates.push({
            grantId: grant.id,
            grantName: grant.grant_name,
            updates: Object.keys(updates)
          });
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Print summary
    console.log('\n=== ENRICHMENT SUMMARY ===');
    console.log(`Total Processed: ${this.enrichmentStats.totalProcessed}`);
    console.log(`Successfully Enriched: ${this.enrichmentStats.enriched}`);
    console.log(`Failed: ${this.enrichmentStats.failed}`);
    console.log(`Success Rate: ${((this.enrichmentStats.enriched / this.enrichmentStats.totalProcessed) * 100).toFixed(2)}%`);
    
    return this.enrichmentStats;
  }
}

// Run enrichment
if (require.main === module) {
  const enricher = new GrantDataEnricher();
  enricher.processAllGrants()
    .then(() => console.log('\nEnrichment complete!'))
    .catch(console.error);
}

module.exports = GrantDataEnricher;