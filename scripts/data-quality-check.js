const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Quality check rules
const QualityRules = {
  // Required fields that should never be empty
  requiredFields: [
    'grant_name',
    'funding_organization',
    'focus_areas',
    'application_deadline'
  ],
  
  // Fields that should follow specific formats
  formatRules: {
    application_deadline: /^\d{4}-\d{2}-\d{2}$/,
    website_link: /^https?:\/\/.+/,
    contact_email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  // Fields with minimum length requirements
  minLengthRules: {
    grant_name: 10,
    detailed_description: 50,
    eligibility_criteria: 20,
    focus_areas: 10
  },
  
  // Fields that should have realistic values
  valueRangeRules: {
    view_count: { min: 0, max: 100000 },
    grant_amount: { 
      patterns: [
        /€[\d,]+/,
        /\$[\d,]+/,
        /£[\d,]+/
      ]
    }
  }
};

class DataQualityChecker {
  constructor() {
    this.issues = [];
    this.statistics = {
      totalGrants: 0,
      activeGrants: 0,
      expiredGrants: 0,
      grantsWithIssues: 0,
      issuesByType: {},
      fieldCompleteness: {}
    };
  }

  // Check for missing required fields
  checkRequiredFields(grant) {
    const issues = [];
    QualityRules.requiredFields.forEach(field => {
      if (!grant[field] || grant[field].trim() === '') {
        issues.push({
          grantId: grant.id,
          grantName: grant.grant_name,
          type: 'missing_required_field',
          field: field,
          message: `Missing required field: ${field}`
        });
      }
    });
    return issues;
  }

  // Check field formats
  checkFieldFormats(grant) {
    const issues = [];
    Object.entries(QualityRules.formatRules).forEach(([field, regex]) => {
      if (grant[field] && !regex.test(grant[field])) {
        issues.push({
          grantId: grant.id,
          grantName: grant.grant_name,
          type: 'invalid_format',
          field: field,
          value: grant[field],
          message: `Invalid format for ${field}: ${grant[field]}`
        });
      }
    });
    return issues;
  }

  // Check minimum lengths
  checkMinLengths(grant) {
    const issues = [];
    Object.entries(QualityRules.minLengthRules).forEach(([field, minLength]) => {
      if (grant[field] && grant[field].length < minLength) {
        issues.push({
          grantId: grant.id,
          grantName: grant.grant_name,
          type: 'insufficient_length',
          field: field,
          actualLength: grant[field].length,
          requiredLength: minLength,
          message: `${field} is too short (${grant[field].length} chars, minimum: ${minLength})`
        });
      }
    });
    return issues;
  }

  // Check for duplicate grants
  checkDuplicates(grants) {
    const issues = [];
    const seen = new Map();
    
    grants.forEach(grant => {
      // Check by name similarity
      const normalizedName = grant.grant_name.toLowerCase().replace(/\s+/g, ' ').trim();
      
      if (seen.has(normalizedName)) {
        issues.push({
          grantId: grant.id,
          grantName: grant.grant_name,
          type: 'potential_duplicate',
          duplicateOf: seen.get(normalizedName),
          message: `Potential duplicate of grant ID ${seen.get(normalizedName).id}`
        });
      } else {
        seen.set(normalizedName, grant);
      }
      
      // Check by website URL
      if (grant.website_link) {
        const normalizedUrl = grant.website_link.toLowerCase().replace(/\/$/, '');
        const existingGrant = Array.from(seen.values()).find(g => 
          g.website_link && g.website_link.toLowerCase().replace(/\/$/, '') === normalizedUrl && g.id !== grant.id
        );
        
        if (existingGrant) {
          issues.push({
            grantId: grant.id,
            grantName: grant.grant_name,
            type: 'duplicate_url',
            duplicateOf: existingGrant,
            message: `Same URL as grant ID ${existingGrant.id}: ${existingGrant.grant_name}`
          });
        }
      }
    });
    
    return issues;
  }

  // Check deadline validity
  checkDeadlines(grant) {
    const issues = [];
    const today = new Date();
    
    if (grant.application_deadline) {
      const deadline = new Date(grant.application_deadline);
      
      if (isNaN(deadline.getTime())) {
        issues.push({
          grantId: grant.id,
          grantName: grant.grant_name,
          type: 'invalid_deadline',
          field: 'application_deadline',
          value: grant.application_deadline,
          message: `Invalid deadline format: ${grant.application_deadline}`
        });
      } else if (deadline < today && grant.status === 'active') {
        issues.push({
          grantId: grant.id,
          grantName: grant.grant_name,
          type: 'expired_grant',
          field: 'application_deadline',
          value: grant.application_deadline,
          message: `Grant deadline has passed but status is still active`
        });
      }
    }
    
    return issues;
  }

  // Check data consistency
  checkConsistency(grant) {
    const issues = [];
    
    // Check if Ukrainian translations exist for grants with Ukrainian focus
    if ((grant.country_region?.includes('Ukraine') || grant.focus_areas?.includes('Ukraine')) &&
        (!grant.grant_name_uk || !grant.focus_areas_uk)) {
      issues.push({
        grantId: grant.id,
        grantName: grant.grant_name,
        type: 'missing_translation',
        message: 'Missing Ukrainian translation for Ukraine-focused grant'
      });
    }
    
    // Check if grant amount makes sense
    if (grant.grant_amount) {
      const hasAmount = /[\d,]+/.test(grant.grant_amount);
      if (!hasAmount) {
        issues.push({
          grantId: grant.id,
          grantName: grant.grant_name,
          type: 'invalid_amount',
          field: 'grant_amount',
          value: grant.grant_amount,
          message: 'Grant amount does not contain numeric values'
        });
      }
    }
    
    return issues;
  }

  // Calculate field completeness
  calculateCompleteness(grants) {
    const allFields = new Set();
    grants.forEach(grant => {
      Object.keys(grant).forEach(field => allFields.add(field));
    });
    
    allFields.forEach(field => {
      const filledCount = grants.filter(g => g[field] && g[field] !== '').length;
      this.statistics.fieldCompleteness[field] = {
        filled: filledCount,
        total: grants.length,
        percentage: ((filledCount / grants.length) * 100).toFixed(2)
      };
    });
  }

  // Main analysis function
  async analyzeGrants() {
    console.log('Starting data quality analysis...\n');
    
    // Fetch all grants
    const { data: grants, error } = await supabase
      .from('grants')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching grants:', error);
      return;
    }
    
    this.statistics.totalGrants = grants.length;
    
    // Run all checks
    grants.forEach(grant => {
      let grantIssues = [];
      
      // Individual grant checks
      grantIssues = grantIssues.concat(this.checkRequiredFields(grant));
      grantIssues = grantIssues.concat(this.checkFieldFormats(grant));
      grantIssues = grantIssues.concat(this.checkMinLengths(grant));
      grantIssues = grantIssues.concat(this.checkDeadlines(grant));
      grantIssues = grantIssues.concat(this.checkConsistency(grant));
      
      if (grantIssues.length > 0) {
        this.statistics.grantsWithIssues++;
        this.issues = this.issues.concat(grantIssues);
      }
      
      // Update statistics
      if (grant.status === 'active') {
        this.statistics.activeGrants++;
      } else {
        this.statistics.expiredGrants++;
      }
    });
    
    // Check for duplicates
    const duplicateIssues = this.checkDuplicates(grants);
    this.issues = this.issues.concat(duplicateIssues);
    
    // Calculate field completeness
    this.calculateCompleteness(grants);
    
    // Count issues by type
    this.issues.forEach(issue => {
      if (!this.statistics.issuesByType[issue.type]) {
        this.statistics.issuesByType[issue.type] = 0;
      }
      this.statistics.issuesByType[issue.type]++;
    });
    
    return {
      issues: this.issues,
      statistics: this.statistics
    };
  }

  // Generate report
  async generateReport() {
    const results = await this.analyzeGrants();
    
    if (!results) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalGrants: this.statistics.totalGrants,
        activeGrants: this.statistics.activeGrants,
        expiredGrants: this.statistics.expiredGrants,
        grantsWithIssues: this.statistics.grantsWithIssues,
        totalIssues: this.issues.length,
        dataQualityScore: ((1 - (this.statistics.grantsWithIssues / this.statistics.totalGrants)) * 100).toFixed(2) + '%'
      },
      issueBreakdown: this.statistics.issuesByType,
      fieldCompleteness: this.statistics.fieldCompleteness,
      criticalIssues: this.issues.filter(i => 
        ['missing_required_field', 'expired_grant', 'invalid_deadline'].includes(i.type)
      ),
      allIssues: this.issues
    };
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'reports', `data-quality-report-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('=== DATA QUALITY REPORT ===\n');
    console.log(`Total Grants: ${report.summary.totalGrants}`);
    console.log(`Active Grants: ${report.summary.activeGrants}`);
    console.log(`Expired Grants: ${report.summary.expiredGrants}`);
    console.log(`Grants with Issues: ${report.summary.grantsWithIssues}`);
    console.log(`Total Issues Found: ${report.summary.totalIssues}`);
    console.log(`Data Quality Score: ${report.summary.dataQualityScore}\n`);
    
    console.log('=== ISSUE BREAKDOWN ===');
    Object.entries(report.issueBreakdown).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });
    
    console.log('\n=== CRITICAL ISSUES ===');
    report.criticalIssues.slice(0, 10).forEach(issue => {
      console.log(`- Grant ${issue.grantId}: ${issue.message}`);
    });
    
    if (report.criticalIssues.length > 10) {
      console.log(`... and ${report.criticalIssues.length - 10} more critical issues`);
    }
    
    console.log(`\nFull report saved to: ${reportPath}`);
    
    return report;
  }
}

// Run the checker
if (require.main === module) {
  const checker = new DataQualityChecker();
  checker.generateReport().catch(console.error);
}

module.exports = DataQualityChecker;