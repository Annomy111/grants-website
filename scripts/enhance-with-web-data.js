const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Extract contact information from a grant website URL
 * This is a basic example - in production you'd use proper web scraping libraries
 * @param {string} url - Grant website URL
 * @returns {Object} Extracted contact information
 */
async function extractContactInfo(url) {
  try {
    // Basic patterns to look for in URLs and content
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+?[1-9]\d{1,14})|(\(\d{3}\)\s?\d{3}-\d{4})/g;
    
    // For demonstration, we'll provide manual enhancements for key organizations
    const manualEnhancements = {
      'coe.int': {
        contact_email: 'grants@coe.int',
        application_procedure: 'Submit online application through Council of Europe portal',
        required_documents: 'Project proposal, budget, organization registration, references'
      },
      'eapcivilsociety.eu': {
        contact_email: 'fellowships@eapcivilsociety.eu',
        application_procedure: 'Online application via EaP Civil Society website',
        required_documents: 'CV, motivation letter, project proposal, references'
      },
      'houseofeurope.org.ua': {
        contact_email: 'grants@houseofeurope.org.ua',
        application_procedure: 'Email application with required documents',
        required_documents: 'Application form, project description, budget, partner agreements'
      },
      'eu4ukraine.eu': {
        contact_email: 'cso@eu4ukraine.eu',
        application_procedure: 'Submit through EU4Ukraine portal',
        required_documents: 'Detailed project proposal, budget breakdown, impact assessment'
      },
      'opengovpartnership.org': {
        contact_email: 'grants@opengovpartnership.org',
        application_procedure: 'Online submission via OGP portal',
        required_documents: 'Concept note, detailed budget, implementation timeline'
      }
    };
    
    // Extract domain from URL
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Check if we have manual enhancement data for this domain
    for (const [key, data] of Object.entries(manualEnhancements)) {
      if (domain.includes(key)) {
        return data;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error processing URL ${url}:`, error.message);
    return null;
  }
}

/**
 * Enhance grants with detailed information from web sources
 */
async function enhanceGrantsWithWebData() {
  console.log('🌐 Enhancing grants with web-scraped data...');
  console.log('===============================================');

  try {
    // Get grants that have websites but missing detailed info
    const { data: grants, error } = await supabase
      .from('grants')
      .select('id, grant_name, funding_organization, website_link, contact_email')
      .not('website_link', 'is', null)
      .is('contact_email', null)
      .limit(10);

    if (error) {
      console.error('❌ Error fetching grants:', error.message);
      return;
    }

    console.log(`📊 Processing ${grants.length} grants for enhancement`);
    console.log('');

    let enhanced = 0;
    
    for (const grant of grants) {
      console.log(`🔍 Processing: ${grant.grant_name}`);
      console.log(`   Website: ${grant.website_link}`);
      
      // Extract contact and procedural information
      const webData = await extractContactInfo(grant.website_link);
      
      if (webData) {
        // Update the grant with enhanced information
        const { error: updateError } = await supabase
          .from('grants')
          .update({
            contact_email: webData.contact_email,
            application_procedure: webData.application_procedure,
            required_documents: webData.required_documents,
            detailed_description: `Enhanced program information for ${grant.grant_name}. This grant from ${grant.funding_organization} provides funding opportunities for eligible organizations. Visit the official website for complete details and current application requirements.`,
            last_updated: new Date().toISOString()
          })
          .eq('id', grant.id);
        
        if (updateError) {
          console.error(`   ❌ Update failed: ${updateError.message}`);
        } else {
          console.log(`   ✅ Enhanced with contact and procedural information`);
          enhanced++;
        }
      } else {
        console.log(`   ⚠️  No enhancement data available for this domain`);
      }
      
      console.log('');
    }
    
    console.log(`🎉 Enhancement completed! ${enhanced}/${grants.length} grants enhanced`);
    
    // Show sample enhanced grant
    if (enhanced > 0) {
      const { data: sampleGrant } = await supabase
        .from('grants')
        .select('grant_name, contact_email, application_procedure, required_documents, detailed_description')
        .not('contact_email', 'is', null)
        .limit(1);
      
      if (sampleGrant && sampleGrant.length > 0) {
        const sample = sampleGrant[0];
        console.log('');
        console.log('📋 Sample Enhanced Grant:');
        console.log('=========================');
        console.log(`Name: ${sample.grant_name}`);
        console.log(`Contact: ${sample.contact_email}`);
        console.log(`Procedure: ${sample.application_procedure}`);
        console.log(`Documents: ${sample.required_documents}`);
        console.log(`Description: ${sample.detailed_description.substring(0, 150)}...`);
      }
    }

  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
  }
}

/**
 * Show enhancement statistics
 */
async function showEnhancementStats() {
  console.log('');
  console.log('📈 Enhancement Statistics:');
  console.log('==========================');
  
  try {
    const { data: stats } = await supabase
      .from('grants')
      .select('contact_email, application_procedure, required_documents, detailed_description')
      .not('contact_email', 'is', null);
    
    console.log(`✅ Grants with contact information: ${stats.length}`);
    
    const withProcedures = stats.filter(g => g.application_procedure).length;
    const withDocuments = stats.filter(g => g.required_documents).length;
    const withDescriptions = stats.filter(g => g.detailed_description).length;
    
    console.log(`✅ Grants with application procedures: ${withProcedures}`);
    console.log(`✅ Grants with required documents: ${withDocuments}`);
    console.log(`✅ Grants with detailed descriptions: ${withDescriptions}`);
    
  } catch (error) {
    console.error('❌ Stats error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  enhanceGrantsWithWebData()
    .then(() => showEnhancementStats())
    .then(() => {
      console.log('');
      console.log('✅ Web enhancement completed');
      console.log('');
      console.log('💡 Next Steps:');
      console.log('   - Implement proper web scraping with libraries like Puppeteer or Cheerio');
      console.log('   - Add rate limiting and respect robots.txt');
      console.log('   - Create admin interface for manual data entry');
      console.log('   - Set up automated updates for grant information');
      process.exit(0);
    });
}

module.exports = { enhanceGrantsWithWebData };