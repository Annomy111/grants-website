const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Clean and validate website URLs
 */
function cleanWebsiteLink(url) {
  if (!url || url.trim() === '' || url === 'Not specified') {
    return null;
  }
  
  // Remove footnote references like [1], [2], etc.
  url = url.replace(/\[\d+\]?\s*$/, '').trim();
  
  // Extract URL if it's embedded in text
  const urlMatch = url.match(/https?:\/\/[^\s\]]+/);
  if (urlMatch) {
    return urlMatch[0];
  }
  
  // If it starts with http, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  return url;
}

/**
 * Extract grant type from name and organization
 */
function extractGrantType(name, organization) {
  const nameLower = name.toLowerCase();
  const orgLower = (organization || '').toLowerCase();
  
  if (nameLower.includes('rapid response') || nameLower.includes('emergency')) {
    return 'Emergency Grant';
  }
  if (nameLower.includes('fellowship')) return 'Fellowship';
  if (nameLower.includes('scholarship')) return 'Scholarship';
  if (nameLower.includes('innovation') || nameLower.includes('startup')) return 'Innovation Grant';
  if (nameLower.includes('research')) return 'Research Grant';
  if (nameLower.includes('capacity')) return 'Capacity Building';
  if (nameLower.includes('small grant')) return 'Small Grant';
  if (nameLower.includes('democracy') || nameLower.includes('governance')) return 'Democracy Grant';
  if (nameLower.includes('humanitarian')) return 'Humanitarian Grant';
  if (nameLower.includes('women') || nameLower.includes('gender')) return 'Gender Equality Grant';
  
  return 'Project Grant';
}

/**
 * Parse grant amount to extract min/max values
 */
function parseGrantAmount(amountText) {
  if (!amountText) return { min: null, max: null };
  
  const amounts = {
    min: null,
    max: null
  };
  
  // Remove commas and convert common currency symbols
  const cleaned = amountText.replace(/,/g, '');
  
  // Look for patterns like "$10,000-$50,000" or "up to €50,000"
  const rangeMatch = cleaned.match(/[€$£]\s*(\d+(?:\.\d+)?)[kKmM]?\s*[-–]\s*[€$£]?\s*(\d+(?:\.\d+)?)[kKmM]?/);
  const upToMatch = cleaned.match(/up to\s*[€$£]\s*(\d+(?:\.\d+)?)[kKmM]?/i);
  const singleMatch = cleaned.match(/[€$£]\s*(\d+(?:\.\d+)?)[kKmM]?/);
  
  if (rangeMatch) {
    amounts.min = parseAmount(rangeMatch[1], cleaned);
    amounts.max = parseAmount(rangeMatch[2], cleaned);
  } else if (upToMatch) {
    amounts.max = parseAmount(upToMatch[1], cleaned);
  } else if (singleMatch) {
    amounts.max = parseAmount(singleMatch[1], cleaned);
  }
  
  return amounts;
}

/**
 * Parse individual amount values
 */
function parseAmount(value, context) {
  let amount = parseFloat(value);
  
  // Check for k/K (thousands) or m/M (millions)
  if (context.toLowerCase().includes(value + 'k')) {
    amount *= 1000;
  } else if (context.toLowerCase().includes(value + 'm')) {
    amount *= 1000000;
  }
  
  // Convert to EUR if needed (rough estimates)
  if (context.includes('$')) {
    amount *= 0.92; // USD to EUR
  } else if (context.includes('£')) {
    amount *= 1.17; // GBP to EUR
  }
  
  return Math.round(amount);
}

/**
 * Generate keywords from grant data
 */
function generateKeywords(grant) {
  const keywords = new Set();
  
  // Extract from focus areas
  if (grant.focus_areas) {
    const words = grant.focus_areas
      .toLowerCase()
      .split(/[\s,;]+/)
      .filter(word => word.length > 4 && !['areas', 'support', 'projects'].includes(word));
    words.forEach(word => keywords.add(word));
  }
  
  // Extract from grant name
  if (grant.grant_name) {
    const nameWords = grant.grant_name
      .toLowerCase()
      .split(/[\s-]+/)
      .filter(word => word.length > 4 && !['grant', 'program', 'fund', 'call'].includes(word));
    nameWords.forEach(word => keywords.add(word));
    
    // Add specific keywords based on content
    const nameLower = grant.grant_name.toLowerCase();
    if (nameLower.includes('democracy')) keywords.add('democracy');
    if (nameLower.includes('women')) keywords.add('women');
    if (nameLower.includes('humanitarian')) keywords.add('humanitarian');
    if (nameLower.includes('emergency')) keywords.add('emergency');
    if (nameLower.includes('rapid')) keywords.add('rapid response');
  }
  
  return Array.from(keywords).slice(0, 10);
}

/**
 * Import grants from CSV file
 */
async function importNewGrants() {
  console.log('🚀 Starting import of new grants from CSV...');
  
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'data', 'ukraine_grants_2025.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`📊 Found ${records.length} grants in CSV`);
    
    // Filter out empty or duplicate entries
    const validGrants = records.filter(record => 
      record['Grant Name'] && 
      record['Grant Name'].trim() !== '' &&
      !record['Grant Name'].includes('(Expired)') // Skip expired grants for now
    );
    
    console.log(`✅ ${validGrants.length} valid active grants to import`);
    
    // Transform grants to database format
    const transformedGrants = validGrants.map(record => {
      const grantData = {
        grant_name: record['Grant Name']?.trim() || '',
        focus_areas: record['Focus Areas']?.trim() || null
      };
      
      const grantAmounts = parseGrantAmount(record['Grant Amount']);
      const cleanedWebsite = cleanWebsiteLink(record['Website Link']);
      const grantType = extractGrantType(record['Grant Name'], record['Funding Organization']);
      const keywords = generateKeywords(grantData);
      
      return {
        // Basic fields from CSV
        grant_name: record['Grant Name'].trim(),
        funding_organization: record['Funding Organization']?.trim() || null,
        country_region: record['Country/Region']?.trim() || null,
        eligibility_criteria: record['Eligibility Criteria']?.trim() || null,
        focus_areas: record['Focus Areas']?.trim() || null,
        grant_amount: record['Grant Amount']?.trim() || null,
        application_deadline: record['Application Deadline']?.trim() || 'Rolling',
        duration: record['Duration']?.trim() || null,
        website_link: cleanedWebsite,
        
        // Enhanced fields
        grant_size_min: grantAmounts.min,
        grant_size_max: grantAmounts.max,
        type: grantType,
        program_type: grantType,
        keywords: keywords,
        status: 'active',
        featured: false,
        view_count: 0,
        
        // Multilingual fields (to be enhanced later)
        description_en: record['Focus Areas']?.trim() || null,
        eligibility_criteria_en: record['Eligibility Criteria']?.trim() || null,
        focus_areas_en: record['Focus Areas']?.trim() || null,
        
        // Additional metadata
        geographical_scope: record['Country/Region']?.trim() || null,
        target_beneficiaries: record['Eligibility Criteria']?.trim() || null,
        
        // Default values for fields not in CSV
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
        evaluation_criteria: null
      };
    });
    
    // Check for existing grants to avoid duplicates
    console.log('🔍 Checking for existing grants...');
    const { data: existingGrants, error: fetchError } = await supabase
      .from('grants')
      .select('grant_name, id');
    
    if (fetchError) {
      console.error('Error fetching existing grants:', fetchError);
    }
    
    const existingGrantNames = new Set(
      (existingGrants || []).map(g => g.grant_name ? g.grant_name.toLowerCase() : '')
    );
    
    // Filter out duplicates
    const newGrants = transformedGrants.filter(grant => 
      !existingGrantNames.has(grant.grant_name.toLowerCase())
    );
    
    console.log(`✅ ${newGrants.length} new grants to add (${transformedGrants.length - newGrants.length} duplicates skipped)`);
    
    if (newGrants.length === 0) {
      console.log('No new grants to import.');
      return;
    }
    
    // Insert new grants in batches
    const batchSize = 10;
    let imported = 0;
    
    for (let i = 0; i < newGrants.length; i += batchSize) {
      const batch = newGrants.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('grants')
        .insert(batch)
        .select('id, grant_name');
      
      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        continue;
      }
      
      imported += data.length;
      console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${data.length} grants`);
    }
    
    console.log(`\n🎉 Import completed! ${imported} new grants added successfully`);
    
    // Verify import
    const { count, error: countError } = await supabase
      .from('grants')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`📊 Total grants in database: ${count}`);
    }
    
    // Display sample of imported grants
    console.log('\n📋 Sample of imported grants:');
    newGrants.slice(0, 3).forEach((grant, index) => {
      console.log(`\n${index + 1}. ${grant.grant_name}`);
      console.log(`   Type: ${grant.type}`);
      console.log(`   Amount: ${grant.grant_amount}`);
      if (grant.grant_size_min || grant.grant_size_max) {
        console.log(`   Parsed amounts: €${grant.grant_size_min || 0} - €${grant.grant_size_max || 'unlimited'}`);
      }
      console.log(`   Keywords: ${grant.keywords.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Check if csv-parse is installed
try {
  require('csv-parse/sync');
} catch (e) {
  console.log('📦 Installing csv-parse dependency...');
  require('child_process').execSync('npm install csv-parse', { stdio: 'inherit' });
}

// Run if called directly
if (require.main === module) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }
  
  importNewGrants().then(() => {
    console.log('✅ Import script completed');
    process.exit(0);
  });
}

module.exports = { importNewGrants };