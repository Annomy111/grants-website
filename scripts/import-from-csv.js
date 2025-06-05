const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Parse CSV file into JavaScript objects
 * @param {string} csvPath - Path to CSV file
 * @returns {Array} Array of grant objects
 */
function parseCSV(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }
  
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    // Parse CSV line handling quoted values that contain commas
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim()); // Add the last value
    
    if (values.length === headers.length) {
      const grant = {};
      headers.forEach((header, index) => {
        grant[header] = values[index] || '';
      });
      data.push(grant);
    }
  }
  
  return data;
}

/**
 * Clean website link by removing descriptive prefixes
 * @param {string} websiteLink - Raw website link with potential prefix
 * @returns {string} Clean URL
 */
function cleanWebsiteLink(websiteLink) {
  if (!websiteLink || websiteLink.trim() === '' || websiteLink === 'Not specified') {
    return null;
  }
  
  // Extract URL after colon if there's a prefix
  const colonIndex = websiteLink.indexOf(':');
  if (colonIndex !== -1 && websiteLink.includes('http')) {
    const urlPart = websiteLink.substring(colonIndex + 1).trim();
    if (urlPart.startsWith('http')) {
      return urlPart;
    }
  }
  
  // If it already starts with http, return as is
  if (websiteLink.startsWith('http')) {
    return websiteLink;
  }
  
  return websiteLink;
}

/**
 * Extract program type from grant name and organization
 * @param {string} grantName - Name of the grant
 * @param {string} organization - Funding organization
 * @returns {string} Program type
 */
function extractProgramType(grantName, organization) {
  const name = grantName.toLowerCase();
  
  if (name.includes('fellowship')) return 'Fellowship';
  if (name.includes('scholarship')) return 'Scholarship';
  if (name.includes('innovation') || name.includes('startup')) return 'Innovation Grant';
  if (name.includes('research')) return 'Research Grant';
  if (name.includes('emergency') || name.includes('humanitarian')) return 'Emergency Relief';
  if (name.includes('capacity') || name.includes('training')) return 'Capacity Building';
  if (name.includes('small grants') || name.includes('micro')) return 'Small Grant';
  if (name.includes('cooperation') || name.includes('partnership')) return 'Partnership Grant';
  
  return 'Project Grant'; // Default
}

/**
 * Generate keywords from grant information
 * @param {Object} grant - Grant data object
 * @returns {Array} Array of keywords
 */
function generateKeywords(grant) {
  const keywords = new Set();
  
  // Extract from focus areas
  if (grant['Focus Areas']) {
    const focusWords = grant['Focus Areas'].toLowerCase()
      .split(/[,;]/)
      .map(word => word.trim())
      .filter(word => word.length > 3);
    focusWords.forEach(word => keywords.add(word));
  }
  
  // Extract from organization type
  if (grant['Funding Organization']) {
    const org = grant['Funding Organization'].toLowerCase();
    if (org.includes('eu') || org.includes('european')) keywords.add('european union');
    if (org.includes('un ') || org.includes('united nations')) keywords.add('united nations');
    if (org.includes('usaid')) keywords.add('usaid');
    if (org.includes('council')) keywords.add('council');
  }
  
  // Extract from country/region
  if (grant['Country/Region']) {
    const region = grant['Country/Region'].toLowerCase();
    if (region.includes('international')) keywords.add('international');
    if (region.includes('ukraine')) keywords.add('ukraine');
    if (region.includes('eu')) keywords.add('european union');
  }
  
  return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
}

/**
 * Import grants directly from CSV file
 */
async function importFromCSV() {
  console.log('🚀 Starting direct CSV import...');
  console.log('📁 Source: ukraine_grants_expanded.csv');

  try {
    // Parse CSV file
    const csvPath = path.join(__dirname, '..', 'ukraine_grants_expanded.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    const grantsData = parseCSV(csvPath);
    console.log(`📊 Found ${grantsData.length} grants in CSV`);

    // Clear existing grants
    const { error: deleteError } = await supabase
      .from('grants')
      .delete()
      .neq('id', 0); // Delete all
    
    if (deleteError) {
      console.log('⚠️  No existing grants to clear or error:', deleteError.message);
    } else {
      console.log('🗑️  Cleared existing grants');
    }

    // Transform and insert grants with enhanced data processing
    const transformedGrants = grantsData.map(grant => {
      const cleanedWebsiteLink = cleanWebsiteLink(grant["Website Link"]);
      const programType = extractProgramType(grant["Grant Name"], grant["Funding Organization"]);
      const keywords = generateKeywords(grant);
      
      return {
        grant_name: grant["Grant Name"],
        funding_organization: grant["Funding Organization"],
        country_region: grant["Country/Region"],
        eligibility_criteria: grant["Eligibility Criteria"],
        focus_areas: grant["Focus Areas"],
        grant_amount: grant["Grant Amount"],
        application_deadline: grant["Application Deadline"],
        duration: grant["Duration"],
        website_link: cleanedWebsiteLink,
        
        // Enhanced fields
        program_type: programType,
        target_beneficiaries: grant["Eligibility Criteria"], // Use eligibility as target beneficiaries for now
        geographical_scope: grant["Country/Region"],
        keywords: keywords,
        
        // Default values for new fields (can be enhanced later)
        detailed_description: null,
        contact_email: null,
        contact_phone: null,
        contact_person: null,
        application_procedure: null,
        required_documents: null,
        additional_requirements: null,
        language_requirements: null,
        partnership_requirements: false,
        renewable: false,
        application_fee: null,
        reporting_requirements: null,
        evaluation_criteria: null,
        
        // Standard fields
        status: 'active',
        featured: false,
        view_count: 0
      };
    });

    // Insert in batches of 50
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < transformedGrants.length; i += batchSize) {
      const batch = transformedGrants.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('grants')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        continue;
      }
      
      imported += data.length;
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${data.length} grants`);
    }

    console.log(`🎉 CSV import completed! ${imported} grants imported successfully`);
    console.log('✨ Enhancements applied:');
    console.log('   - Cleaned website links (removed prefixes)');
    console.log('   - Added program type classification');
    console.log('   - Generated searchable keywords');
    console.log('   - Enhanced data structure ready for expansion');

    // Verify import with enhanced data
    const { data: verifyData, error: verifyError } = await supabase
      .from('grants')
      .select('id, grant_name, website_link, program_type, keywords')
      .limit(3);

    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    } else {
      console.log('✅ Verification successful - Sample grants:');
      verifyData.forEach(grant => {
        console.log(`   - ${grant.grant_name}`);
        console.log(`     Type: ${grant.program_type}`);
        console.log(`     Website: ${grant.website_link}`);
        console.log(`     Keywords: ${grant.keywords ? grant.keywords.join(', ') : 'None'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ CSV import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  importFromCSV().then(() => {
    console.log('✅ CSV import script completed');
    process.exit(0);
  });
}

module.exports = { importFromCSV };