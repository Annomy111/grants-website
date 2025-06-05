const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Analyze what detailed information is missing from grants
 */
async function analyzeMissingDetails() {
  console.log('🔍 Analyzing grants database for missing detailed information...');
  console.log('================================================================');

  try {
    // Get all grants with current data
    const { data: grants, error } = await supabase
      .from('grants')
      .select('*')
      .limit(1000);

    if (error) {
      console.error('❌ Error fetching grants:', error.message);
      return;
    }

    console.log(`📊 Analyzing ${grants.length} grants in database`);
    console.log('');

    // Analyze field completeness
    const fieldAnalysis = {
      // Basic fields (should be mostly complete)
      grant_name: 0,
      funding_organization: 0,
      website_link: 0,
      eligibility_criteria: 0,
      focus_areas: 0,
      grant_amount: 0,
      application_deadline: 0,
      
      // Enhanced fields (newly added)
      detailed_description: 0,
      contact_email: 0,
      contact_phone: 0,
      contact_person: 0,
      application_procedure: 0,
      required_documents: 0,
      additional_requirements: 0,
      program_type: 0,
      keywords: 0,
    };

    grants.forEach(grant => {
      Object.keys(fieldAnalysis).forEach(field => {
        if (grant[field] && grant[field] !== 'Not specified' && grant[field] !== '') {
          if (field === 'keywords' && Array.isArray(grant[field]) && grant[field].length > 0) {
            fieldAnalysis[field]++;
          } else if (field !== 'keywords') {
            fieldAnalysis[field]++;
          }
        }
      });
    });

    console.log('📈 Field Completeness Report:');
    console.log('=============================');
    
    Object.entries(fieldAnalysis).forEach(([field, count]) => {
      const percentage = ((count / grants.length) * 100).toFixed(1);
      const status = percentage > 80 ? '✅' : percentage > 50 ? '⚠️ ' : '❌';
      console.log(`${status} ${field.padEnd(25)} ${count.toString().padStart(3)}/${grants.length} (${percentage}%)`);
    });

    console.log('');
    console.log('🎯 Enhancement Opportunities:');
    console.log('==============================');
    
    // Identify grants with websites but missing contact info
    const grantsWithWebsites = grants.filter(g => g.website_link && g.website_link.startsWith('http'));
    const missingContactInfo = grantsWithWebsites.filter(g => !g.contact_email && !g.contact_phone);
    
    console.log(`📞 Contact Information:`);
    console.log(`   - ${grantsWithWebsites.length} grants have websites`);
    console.log(`   - ${missingContactInfo.length} of these lack contact information`);
    console.log(`   - Opportunity: Web scraping could extract contact details`);
    console.log('');

    // Analyze website quality
    const websiteAnalysis = grants
      .filter(g => g.website_link)
      .map(g => ({
        name: g.grant_name,
        url: g.website_link,
        isClean: g.website_link.startsWith('http'),
        hasPrefix: g.website_link.includes(':') && !g.website_link.startsWith('http')
      }));

    const cleanUrls = websiteAnalysis.filter(w => w.isClean).length;
    const prefixedUrls = websiteAnalysis.filter(w => w.hasPrefix).length;

    console.log(`🔗 Website Link Quality:`);
    console.log(`   - ${cleanUrls}/${websiteAnalysis.length} URLs are clean`);
    console.log(`   - ${prefixedUrls} URLs still have prefixes (need cleaning)`);
    console.log('');

    // Sample grants missing detailed info
    const sampleMissingDetails = grants
      .filter(g => !g.detailed_description && !g.application_procedure)
      .slice(0, 5);

    console.log(`📝 Sample Grants Missing Detailed Information:`);
    console.log(`=============================================`);
    sampleMissingDetails.forEach((grant, index) => {
      console.log(`${index + 1}. ${grant.grant_name}`);
      console.log(`   Organization: ${grant.funding_organization}`);
      console.log(`   Website: ${grant.website_link || 'None'}`);
      console.log(`   Missing: Detailed description, application procedure, contact info`);
      console.log('');
    });

    // Generate recommendations
    console.log('💡 Recommendations for Enhancement:');
    console.log('====================================');
    console.log('1. 🤖 Automated Web Scraping:');
    console.log('   - Extract contact information from grant websites');
    console.log('   - Parse application procedures and requirements');
    console.log('   - Gather detailed program descriptions');
    console.log('');
    console.log('2. 📝 Manual Data Entry Priority:');
    console.log('   - Focus on high-value grants (large amounts, popular organizations)');
    console.log('   - Contact information for most accessed grants');
    console.log('   - Application deadlines and procedures for urgent grants');
    console.log('');
    console.log('3. 🔄 Data Source Integration:');
    console.log('   - Connect with grant databases APIs');
    console.log('   - Import from government funding portals');
    console.log('   - Sync with organization newsletters and announcements');
    console.log('');
    console.log('4. 👥 Community Contribution:');
    console.log('   - Allow users to submit missing information');
    console.log('   - Implement verification system for user contributions');
    console.log('   - Create admin interface for data validation');

    // Field importance scoring
    console.log('');
    console.log('⭐ Field Priority for Enhancement:');
    console.log('===================================');
    const fieldPriority = [
      { field: 'contact_email', priority: 'HIGH', reason: 'Essential for applications' },
      { field: 'application_procedure', priority: 'HIGH', reason: 'Critical user need' },
      { field: 'required_documents', priority: 'HIGH', reason: 'Saves user time' },
      { field: 'detailed_description', priority: 'MEDIUM', reason: 'Better grant understanding' },
      { field: 'contact_phone', priority: 'MEDIUM', reason: 'Alternative contact method' },
      { field: 'evaluation_criteria', priority: 'MEDIUM', reason: 'Improves application quality' },
      { field: 'application_fee', priority: 'LOW', reason: 'Budget planning' },
      { field: 'reporting_requirements', priority: 'LOW', reason: 'Post-award information' }
    ];

    fieldPriority.forEach(item => {
      const coverage = fieldAnalysis[item.field] || 0;
      const percentage = ((coverage / grants.length) * 100).toFixed(1);
      console.log(`   ${item.priority.padEnd(6)} ${item.field.padEnd(25)} ${percentage}% - ${item.reason}`);
    });

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  analyzeMissingDetails().then(() => {
    console.log('');
    console.log('✅ Analysis completed');
    process.exit(0);
  });
}

module.exports = { analyzeMissingDetails };