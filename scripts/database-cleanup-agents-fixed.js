const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Agent 1: Duplicate Detection Agent
async function duplicateDetectionAgent() {
  console.log('\n🔍 AGENT 1: Duplicate Detection Agent\n');
  console.log('Scanning for duplicate grants...\n');
  
  const { data: grants, error } = await supabase
    .from('grants')
    .select('*')
    .order('grant_name');
    
  if (error) {
    console.error('Error fetching grants:', error);
    return { duplicates: [], issues: ['Database connection error'] };
  }
  
  const duplicates = [];
  const seen = new Map();
  
  for (const grant of grants) {
    // Check for exact name duplicates
    const normalizedName = (grant.grant_name || '').toLowerCase().trim();
    if (seen.has(normalizedName)) {
      duplicates.push({
        type: 'exact_name',
        grant1: seen.get(normalizedName),
        grant2: grant,
        reason: 'Identical grant names'
      });
    } else {
      seen.set(normalizedName, grant);
    }
    
    // Check for similar names (potential duplicates)
    for (const [seenName, seenGrant] of seen.entries()) {
      if (seenGrant.id !== grant.id && normalizedName && seenName) {
        const similarity = calculateSimilarity(normalizedName, seenName);
        if (similarity > 0.85 && similarity < 1) {
          duplicates.push({
            type: 'similar_name',
            grant1: seenGrant,
            grant2: grant,
            similarity: Math.round(similarity * 100),
            reason: `Names are ${Math.round(similarity * 100)}% similar`
          });
        }
      }
    }
  }
  
  // Check for same organization + similar deadlines
  const orgGroups = {};
  for (const grant of grants) {
    const org = grant.funding_organization || 'Unknown';
    if (!orgGroups[org]) {
      orgGroups[org] = [];
    }
    orgGroups[org].push(grant);
  }
  
  for (const [org, orgGrants] of Object.entries(orgGroups)) {
    if (orgGrants.length > 1) {
      for (let i = 0; i < orgGrants.length - 1; i++) {
        for (let j = i + 1; j < orgGrants.length; j++) {
          const grant1 = orgGrants[i];
          const grant2 = orgGrants[j];
          
          if (grant1.application_deadline === grant2.application_deadline && 
              grant1.grant_name !== grant2.grant_name) {
            duplicates.push({
              type: 'same_org_deadline',
              grant1,
              grant2,
              reason: 'Same organization and deadline'
            });
          }
        }
      }
    }
  }
  
  console.log(`Found ${duplicates.length} potential duplicates`);
  
  return {
    totalGrants: grants.length,
    duplicatesFound: duplicates.length,
    duplicates: duplicates.slice(0, 10), // First 10 for review
    recommendation: duplicates.length > 0 ? 'Manual review needed for duplicates' : 'No duplicates found'
  };
}

// Agent 2: Data Validation Agent
async function dataValidationAgent() {
  console.log('\n✅ AGENT 2: Data Validation Agent\n');
  console.log('Validating grant data integrity...\n');
  
  const { data: grants, error } = await supabase
    .from('grants')
    .select('*');
    
  if (error) {
    console.error('Error fetching grants:', error);
    return { issues: ['Database connection error'] };
  }
  
  const issues = [];
  const stats = {
    total: grants.length,
    missingFields: {},
    invalidData: [],
    outdatedGrants: 0,
    noDescription: 0,
    noEligibility: 0,
    invalidAmounts: 0,
    invalidUrls: 0
  };
  
  const today = new Date();
  
  for (const grant of grants) {
    const grantIssues = [];
    
    // Check required fields
    const requiredFields = ['grant_name', 'funding_organization', 'description_en', 'eligibility_criteria_en'];
    for (const field of requiredFields) {
      if (!grant[field] || grant[field].trim() === '') {
        grantIssues.push(`Missing ${field}`);
        stats.missingFields[field] = (stats.missingFields[field] || 0) + 1;
      }
    }
    
    // Check descriptions
    if (!grant.description_en || grant.description_en.length < 50) {
      stats.noDescription++;
      grantIssues.push('Description too short (< 50 chars)');
    }
    
    if (!grant.eligibility_criteria_en || grant.eligibility_criteria_en.length < 30) {
      stats.noEligibility++;
      grantIssues.push('Eligibility criteria too short');
    }
    
    // Check deadlines
    if (grant.application_deadline) {
      const deadline = new Date(grant.application_deadline);
      if (deadline < today) {
        stats.outdatedGrants++;
        grantIssues.push('Deadline has passed');
      }
    }
    
    // Check grant amounts
    if (grant.grant_amount_min && grant.grant_amount_max) {
      if (grant.grant_amount_min > grant.grant_amount_max) {
        stats.invalidAmounts++;
        grantIssues.push('Min amount > Max amount');
      }
      if (grant.grant_amount_max > 10000000) {
        grantIssues.push('Unusually high max amount (> €10M)');
      }
    }
    
    // Check URLs
    const urlFields = ['website_url', 'application_url', 'logo_url'];
    for (const field of urlFields) {
      if (grant[field] && !isValidUrl(grant[field])) {
        stats.invalidUrls++;
        grantIssues.push(`Invalid ${field}`);
      }
    }
    
    if (grantIssues.length > 0) {
      issues.push({
        id: grant.id,
        name: grant.grant_name,
        issues: grantIssues
      });
    }
  }
  
  return {
    stats,
    issues: issues.slice(0, 20), // First 20 issues
    recommendation: issues.length > 0 ? 
      `Found ${issues.length} grants with validation issues` : 
      'All grants pass validation'
  };
}

// Agent 3: Translation Consistency Agent
async function translationConsistencyAgent() {
  console.log('\n🌐 AGENT 3: Translation Consistency Agent\n');
  console.log('Checking English/Ukrainian translation consistency...\n');
  
  const { data: grants, error } = await supabase
    .from('grants')
    .select('*');
    
  if (error) {
    console.error('Error fetching grants:', error);
    return { issues: ['Database connection error'] };
  }
  
  const issues = [];
  const stats = {
    total: grants.length,
    missingUkrainian: 0,
    onlyEnglish: 0,
    suspiciousTranslations: 0,
    emptyTranslations: 0
  };
  
  for (const grant of grants) {
    const grantIssues = [];
    
    // Check if Ukrainian translations exist
    const translationFields = [
      { en: 'description_en', uk: 'description_uk' },
      { en: 'eligibility_criteria_en', uk: 'eligibility_criteria_uk' },
      { en: 'focus_areas_en', uk: 'focus_areas_uk' }
    ];
    
    for (const field of translationFields) {
      if (grant[field.en] && !grant[field.uk]) {
        stats.missingUkrainian++;
        grantIssues.push(`Missing Ukrainian translation for ${field.en}`);
      }
      
      if (grant[field.uk] === '') {
        stats.emptyTranslations++;
        grantIssues.push(`Empty Ukrainian translation for ${field.en}`);
      }
      
      // Check if Ukrainian "translation" is actually English
      if (grant[field.en] && grant[field.uk]) {
        if (grant[field.en] === grant[field.uk]) {
          stats.suspiciousTranslations++;
          grantIssues.push(`Ukrainian translation identical to English for ${field.en}`);
        }
        
        // Check if Ukrainian contains Latin characters (suspicious)
        if (grant[field.uk] && /[a-zA-Z]/.test(grant[field.uk]) && !/[а-яА-ЯіїєґІЇЄҐ]/.test(grant[field.uk])) {
          grantIssues.push(`Ukrainian translation contains only Latin characters for ${field.en}`);
        }
      }
    }
    
    if (grantIssues.length > 0) {
      issues.push({
        id: grant.id,
        name: grant.grant_name,
        issues: grantIssues
      });
    }
  }
  
  return {
    stats,
    issues: issues.slice(0, 20),
    recommendation: stats.missingUkrainian > 10 ? 
      'Consider batch translation for missing Ukrainian content' : 
      'Translation coverage is good'
  };
}

// Agent 4: Organization & Logo Agent
async function organizationLogoAgent() {
  console.log('\n🏢 AGENT 4: Organization & Logo Agent\n');
  console.log('Checking organization data and logos...\n');
  
  const { data: grants, error } = await supabase
    .from('grants')
    .select('*');
    
  if (error) {
    console.error('Error fetching grants:', error);
    return { issues: ['Database connection error'] };
  }
  
  // Load logo mapping
  let logoMapping = {};
  try {
    const logoData = await fs.readFile(
      path.join(__dirname, '../client/public/data/organization-logos.json'),
      'utf8'
    );
    logoMapping = JSON.parse(logoData);
  } catch (err) {
    console.log('Could not load logo mapping');
  }
  
  const issues = [];
  const stats = {
    total: grants.length,
    missingLogos: 0,
    brokenLogos: 0,
    inconsistentOrgNames: 0,
    organizations: new Set()
  };
  
  const orgVariations = new Map();
  
  for (const grant of grants) {
    const grantIssues = [];
    const org = grant.funding_organization || 'Unknown';
    stats.organizations.add(org);
    
    // Check logo
    if (!grant.logo_url || grant.logo_url === '') {
      stats.missingLogos++;
      grantIssues.push('Missing logo URL');
      
      // Check if we have a logo in mapping
      if (logoMapping[org]) {
        grantIssues.push(`Logo available in mapping: ${logoMapping[org]}`);
      }
    } else if (!grant.logo_url.endsWith('.svg') && !grant.logo_url.endsWith('.png')) {
      grantIssues.push('Logo URL does not point to SVG or PNG file');
    }
    
    // Check for organization name variations
    const normalizedOrg = org.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!orgVariations.has(normalizedOrg)) {
      orgVariations.set(normalizedOrg, []);
    }
    orgVariations.get(normalizedOrg).push(org);
    
    if (grantIssues.length > 0) {
      issues.push({
        id: grant.id,
        name: grant.grant_name,
        organization: org,
        issues: grantIssues
      });
    }
  }
  
  // Find inconsistent organization names
  const inconsistentOrgs = [];
  for (const [normalized, variations] of orgVariations.entries()) {
    const uniqueVariations = [...new Set(variations)];
    if (uniqueVariations.length > 1) {
      inconsistentOrgs.push({
        variations: uniqueVariations,
        count: variations.length
      });
      stats.inconsistentOrgNames += variations.length;
    }
  }
  
  return {
    stats: {
      ...stats,
      organizations: stats.organizations.size,
      inconsistentOrgs: inconsistentOrgs.length
    },
    issues: issues.slice(0, 20),
    inconsistentOrgs: inconsistentOrgs.slice(0, 10),
    recommendation: stats.missingLogos > 20 ? 
      'Many missing logos - consider bulk logo assignment' : 
      'Logo coverage is acceptable'
  };
}

// Agent 5: Performance & Optimization Agent
async function performanceOptimizationAgent() {
  console.log('\n⚡ AGENT 5: Performance & Optimization Agent\n');
  console.log('Analyzing database performance and optimization opportunities...\n');
  
  const { data: grants, error } = await supabase
    .from('grants')
    .select('*');
    
  if (error) {
    console.error('Error fetching grants:', error);
    return { issues: ['Database connection error'] };
  }
  
  const stats = {
    total: grants.length,
    activeGrants: 0,
    expiredGrants: 0,
    upcomingDeadlines: 0,
    largeDescriptions: 0,
    totalDataSize: 0,
    avgDescriptionLength: 0,
    indexingRecommendations: []
  };
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  let totalDescLength = 0;
  
  for (const grant of grants) {
    // Calculate data size (rough estimate)
    const grantSize = JSON.stringify(grant).length;
    stats.totalDataSize += grantSize;
    
    // Check deadline status
    if (grant.application_deadline) {
      const deadline = new Date(grant.application_deadline);
      if (deadline < today) {
        stats.expiredGrants++;
      } else {
        stats.activeGrants++;
        if (deadline <= thirtyDaysFromNow) {
          stats.upcomingDeadlines++;
        }
      }
    } else {
      stats.activeGrants++; // No deadline = always active
    }
    
    // Check description lengths
    const descLength = (grant.description_en || '').length + (grant.description_uk || '').length;
    totalDescLength += descLength;
    if (descLength > 2000) {
      stats.largeDescriptions++;
    }
  }
  
  stats.avgDescriptionLength = Math.round(totalDescLength / grants.length);
  stats.totalDataSizeMB = (stats.totalDataSize / 1024 / 1024).toFixed(2);
  
  // Recommendations
  const recommendations = [];
  
  if (stats.expiredGrants > stats.activeGrants * 0.3) {
    recommendations.push({
      type: 'cleanup',
      priority: 'high',
      action: 'Archive or remove expired grants',
      impact: `Could remove ${stats.expiredGrants} expired grants`
    });
  }
  
  if (stats.avgDescriptionLength > 1000) {
    recommendations.push({
      type: 'optimization',
      priority: 'medium',
      action: 'Consider implementing description summaries',
      impact: 'Faster initial page loads'
    });
  }
  
  if (grants.length > 100) {
    recommendations.push({
      type: 'indexing',
      priority: 'high',
      action: 'Ensure proper indexes on application_deadline, funding_organization, and grant_type fields',
      impact: 'Faster filtering and sorting'
    });
  }
  
  recommendations.push({
    type: 'caching',
    priority: 'medium',
    action: 'Implement Redis or edge caching for grant listings',
    impact: 'Reduce database load by 80%'
  });
  
  return {
    stats,
    recommendations,
    summary: {
      health: stats.expiredGrants < stats.activeGrants * 0.2 ? 'Good' : 'Needs attention',
      activeRatio: `${Math.round(stats.activeGrants / grants.length * 100)}% active`,
      dataSize: `${stats.totalDataSizeMB} MB total`
    }
  };
}

// Utility functions
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Main execution
async function runAllAgents() {
  console.log('🤖 GRANTS DATABASE CLEANUP AGENTS ACTIVATED');
  console.log('=========================================\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    agents: {}
  };
  
  // Run all agents
  results.agents.duplicateDetection = await duplicateDetectionAgent();
  results.agents.dataValidation = await dataValidationAgent();
  results.agents.translationConsistency = await translationConsistencyAgent();
  results.agents.organizationLogo = await organizationLogoAgent();
  results.agents.performanceOptimization = await performanceOptimizationAgent();
  
  // Generate summary report
  console.log('\n📊 SUMMARY REPORT');
  console.log('================\n');
  
  console.log('1. Duplicate Detection:');
  console.log(`   - ${results.agents.duplicateDetection.duplicatesFound} potential duplicates found`);
  console.log(`   - ${results.agents.duplicateDetection.recommendation}`);
  
  console.log('\n2. Data Validation:');
  console.log(`   - ${results.agents.dataValidation.stats.outdatedGrants} expired grants`);
  console.log(`   - ${Object.keys(results.agents.dataValidation.stats.missingFields).length} fields with missing data`);
  console.log(`   - ${results.agents.dataValidation.recommendation}`);
  
  console.log('\n3. Translation Consistency:');
  console.log(`   - ${results.agents.translationConsistency.stats.missingUkrainian} missing translations`);
  console.log(`   - ${results.agents.translationConsistency.recommendation}`);
  
  console.log('\n4. Organization & Logos:');
  console.log(`   - ${results.agents.organizationLogo.stats.organizations} unique organizations`);
  console.log(`   - ${results.agents.organizationLogo.stats.missingLogos} missing logos`);
  console.log(`   - ${results.agents.organizationLogo.recommendation}`);
  
  console.log('\n5. Performance Optimization:');
  console.log(`   - Database health: ${results.agents.performanceOptimization.summary.health}`);
  console.log(`   - ${results.agents.performanceOptimization.summary.activeRatio}`);
  console.log(`   - Data size: ${results.agents.performanceOptimization.summary.dataSize}`);
  
  // Save detailed report
  const reportPath = path.join(__dirname, `../grants-cleanup-report-${Date.now()}.json`);
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 Detailed report saved to: ${reportPath}`);
  
  return results;
}

// Execute if run directly
if (require.main === module) {
  runAllAgents().catch(console.error);
}

module.exports = { runAllAgents };