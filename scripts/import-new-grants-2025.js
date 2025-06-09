const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse grant entry from text
function parseGrantEntry(grantText) {
  const grant = {};
  
  // Extract fields using regex patterns
  const patterns = {
    name: /Grant \d+\.\s*(.+?)(?=\n|$)/,
    fundingOrganization: /Funding Organization:\s*(.+?)(?=<sup>|$)/,
    countryRegion: /Country\/Region:\s*(.+?)(?=<sup>|$)/,
    eligibilityCriteria: /Eligibility Criteria:\s*(.+?)(?=<sup>|$)/,
    focusAreas: /Focus Areas:\s*(.+?)(?=<sup>|$)/,
    grantAmount: /Grant Amount:\s*(.+?)(?=<sup>|$)/,
    applicationDeadline: /Application Deadline:\s*(.+?)(?=<sup>|$)/,
    duration: /Duration:\s*(.+?)(?=<sup>|$)/,
    websiteLink: /Website Link:\s*(.+?)(?=<sup>|$)/,
    contact: /Contact:\s*(.+?)(?=<sup>|$)/,
    applicationLanguages: /Application Language\(s\):\s*(.+?)(?=<sup>|$)/,
    coFundingRequired: /Co[‑-]funding Required:\s*(.+?)(?=<sup>|$)/,
    recurrence: /Recurrence:\s*(.+?)(?=<sup>|$)/,
    primaryTheme: /Primary Theme:\s*(.+?)(?=\n|$)/,
    grantSizeBand: /Grant Size Band:\s*(.+?)(?=\n|$)/,
  };
  
  // Extract each field
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = grantText.match(pattern);
    if (match) {
      grant[key] = match[1].trim().replace(/<sup>\d+<\/sup>/g, '');
    }
  }
  
  return grant;
}

// Convert parsed grant to database format
function convertToDbFormat(parsedGrant) {
  // Extract grant size range
  let grantSizeMin = null;
  let grantSizeMax = null;
  
  if (parsedGrant.grantAmount) {
    // Try to extract numeric values
    const amountText = parsedGrant.grantAmount;
    
    // Pattern for ranges like "€10,000 - €50,000" or "$25,000"
    const rangeMatch = amountText.match(/[€$£]?\s*([\d,]+)\s*(?:-|to)\s*[€$£]?\s*([\d,]+)/);
    const singleMatch = amountText.match(/(?:up to\s*)?[€$£]\s*([\d,]+)/i);
    
    if (rangeMatch) {
      grantSizeMin = parseInt(rangeMatch[1].replace(/,/g, ''));
      grantSizeMax = parseInt(rangeMatch[2].replace(/,/g, ''));
    } else if (singleMatch) {
      grantSizeMax = parseInt(singleMatch[1].replace(/,/g, ''));
    }
    
    // Convert currency if needed (rough estimates)
    if (amountText.includes('$')) {
      // Convert USD to EUR (approximate)
      if (grantSizeMin) grantSizeMin = Math.round(grantSizeMin * 0.92);
      if (grantSizeMax) grantSizeMax = Math.round(grantSizeMax * 0.92);
    } else if (amountText.includes('£')) {
      // Convert GBP to EUR (approximate)
      if (grantSizeMin) grantSizeMin = Math.round(grantSizeMin * 1.17);
      if (grantSizeMax) grantSizeMax = Math.round(grantSizeMax * 1.17);
    } else if (amountText.includes('CAD')) {
      // Convert CAD to EUR (approximate)
      if (grantSizeMin) grantSizeMin = Math.round(grantSizeMin * 0.68);
      if (grantSizeMax) grantSizeMax = Math.round(grantSizeMax * 0.68);
    }
  }
  
  // Determine grant type based on name and focus areas
  let grantType = 'Project Grant';
  const combinedText = `${parsedGrant.name || ''} ${parsedGrant.focusAreas || ''}`.toLowerCase();
  
  if (combinedText.includes('fellowship')) grantType = 'Fellowship';
  else if (combinedText.includes('scholarship')) grantType = 'Scholarship';
  else if (combinedText.includes('innovation') || combinedText.includes('startup')) grantType = 'Innovation Grant';
  else if (combinedText.includes('research')) grantType = 'Research Grant';
  else if (combinedText.includes('emergency') || combinedText.includes('humanitarian')) grantType = 'Emergency Relief';
  else if (combinedText.includes('capacity') || combinedText.includes('training')) grantType = 'Capacity Building';
  else if (combinedText.includes('small grant')) grantType = 'Small Grant';
  
  // Clean up website link
  let websiteUrl = parsedGrant.websiteLink;
  if (websiteUrl && !websiteUrl.startsWith('http')) {
    // Try to extract URL from text
    const urlMatch = websiteUrl.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      websiteUrl = urlMatch[0];
    }
  }
  
  return {
    grant_name: parsedGrant.name || 'Unnamed Grant',
    funding_organization: parsedGrant.fundingOrganization || '',
    country_region: parsedGrant.countryRegion || '',
    eligibility_criteria: parsedGrant.eligibilityCriteria || '',
    eligibility_criteria_en: parsedGrant.eligibilityCriteria || '',
    focus_areas: parsedGrant.focusAreas || '',
    focus_areas_en: parsedGrant.focusAreas || '',
    grant_amount: parsedGrant.grantAmount || '',
    grant_size_min: grantSizeMin,
    grant_size_max: grantSizeMax,
    application_deadline: parsedGrant.applicationDeadline || '',
    deadline: parsedGrant.applicationDeadline || '',
    duration: parsedGrant.duration || '',
    website_link: websiteUrl || '',
    website: websiteUrl || '',
    application_url: websiteUrl || '',
    contact_person: parsedGrant.contact ? parsedGrant.contact.split(',')[0] : '',
    contact_email: parsedGrant.contact ? (parsedGrant.contact.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/) || [''])[0] : '',
    contact_phone: parsedGrant.contact ? (parsedGrant.contact.match(/(\+?\d[\d\s-]+)/) || [''])[0] : '',
    type: grantType,
    geographic_focus: parsedGrant.countryRegion || 'Ukraine',
    description_en: parsedGrant.focusAreas || '',
    status: 'active',
    program_type: grantType,
    language_requirements: parsedGrant.applicationLanguages || '',
    renewable: parsedGrant.recurrence ? true : false,
    detailed_description: parsedGrant.focusAreas || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function importNewGrants() {
  console.log('🚀 Starting import of new grants from June 2025 report...\n');
  
  try {
    // Read the converted text file
    const textContent = fs.readFileSync(path.join(__dirname, '..', 'update_db_grants.txt'), 'utf8');
    
    // Find all grant entries using pattern matching
    const grantPattern = /Grant \d+\.[^]+?(?=Grant \d+\.|$)/g;
    const grantMatches = textContent.match(grantPattern) || [];
    
    console.log(`📋 Found ${grantMatches.length} grant entries to process\n`);
    
    const newGrants = [];
    const errors = [];
    
    // Process each grant entry
    for (let i = 0; i < grantMatches.length; i++) {
      const grantText = grantMatches[i];
      
      try {
        // Parse the grant entry
        const parsedGrant = parseGrantEntry(grantText);
        
        if (!parsedGrant.name || !parsedGrant.fundingOrganization) {
          console.log(`⚠️  Skipping grant ${i + 1}: Missing required fields`);
          continue;
        }
        
        // Convert to database format
        const dbGrant = convertToDbFormat(parsedGrant);
        
        console.log(`✅ Parsed grant ${i + 1}: ${dbGrant.grant_name}`);
        newGrants.push(dbGrant);
        
      } catch (error) {
        console.error(`❌ Error parsing grant ${i + 1}:`, error.message);
        errors.push({ grant: i + 1, error: error.message });
      }
    }
    
    console.log(`\n📊 Summary: ${newGrants.length} grants ready for import\n`);
    
    // Check for existing grants to avoid duplicates
    console.log('🔍 Checking for existing grants...');
    
    const { data: existingGrants, error: fetchError } = await supabase
      .from('grants')
      .select('grant_name, funding_organization');
    
    if (fetchError) {
      console.error('❌ Error fetching existing grants:', fetchError);
      return;
    }
    
    // Create a set of existing grant identifiers
    const existingSet = new Set(
      existingGrants.map(g => `${g.grant_name}|${g.funding_organization}`)
    );
    
    // Filter out duplicates
    const grantsToInsert = newGrants.filter(grant => {
      const identifier = `${grant.grant_name}|${grant.funding_organization}`;
      return !existingSet.has(identifier);
    });
    
    console.log(`📝 ${grantsToInsert.length} new grants to insert (${newGrants.length - grantsToInsert.length} duplicates found)\n`);
    
    if (grantsToInsert.length === 0) {
      console.log('✨ No new grants to insert. Database is up to date!');
      return;
    }
    
    // Insert new grants in batches
    const batchSize = 10;
    let inserted = 0;
    
    for (let i = 0; i < grantsToInsert.length; i += batchSize) {
      const batch = grantsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('grants')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        continue;
      }
      
      inserted += data.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data.length} grants`);
    }
    
    console.log(`\n🎉 Import complete! Successfully inserted ${inserted} new grants.`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} errors encountered during parsing:`);
      errors.forEach(e => console.log(`   - Grant ${e.grant}: ${e.error}`));
    }
    
    // Update static JSON files as fallback
    console.log('\n📄 Updating static JSON files...');
    
    const { data: allGrants, error: allError } = await supabase
      .from('grants')
      .select('*')
      .eq('status', 'active')
      .order('application_deadline', { ascending: true });
    
    if (!allError && allGrants) {
      const jsonPath = path.join(__dirname, '..', 'client', 'public', 'data', 'grants.json');
      fs.writeFileSync(jsonPath, JSON.stringify(allGrants, null, 2));
      console.log('✅ Updated grants.json');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the import
importNewGrants();