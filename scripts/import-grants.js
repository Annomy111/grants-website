const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importGrants() {
  console.log('🚀 Starting grants import...');

  try {
    // Read grants JSON file
    const grantsPath = path.join(__dirname, '..', 'client', 'public', 'data', 'grants.json');
    const grantsData = JSON.parse(fs.readFileSync(grantsPath, 'utf8'));
    
    console.log(`📊 Found ${grantsData.length} grants to import`);

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

    // Transform and insert grants
    const transformedGrants = grantsData.map(grant => ({
      grant_name: grant["Grant Name"],
      funding_organization: grant["Funding Organization"],
      country_region: grant["Country/Region"],
      eligibility_criteria: grant["Eligibility Criteria"],
      focus_areas: grant["Focus Areas"],
      grant_amount: grant["Grant Amount"],
      application_deadline: grant["Application Deadline"],
      duration: grant["Duration"],
      website_link: grant["Website Link"],
      status: 'active',
      featured: false,
      view_count: 0
    }));

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

    console.log(`🎉 Import completed! ${imported} grants imported successfully`);

    // Verify import
    const { data: verifyData, error: verifyError } = await supabase
      .from('grants')
      .select('id, grant_name')
      .limit(5);

    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    } else {
      console.log('✅ Verification successful - Sample grants:');
      verifyData.forEach(grant => {
        console.log(`   - ${grant.grant_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  
  importGrants().then(() => {
    console.log('✅ Import script completed');
    process.exit(0);
  });
}

module.exports = { importGrants };