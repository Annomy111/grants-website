const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://adpddtbsstunjotxaldb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM'
);

async function testAndImport() {
  console.log('🚀 Testing schema and importing grants...');

  // Test table existence with a simple select
  try {
    console.log('📋 Testing grants table...');
    const { data, error } = await supabase
      .from('grants')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Table test failed:', error.message);
      return false;
    } else {
      console.log('✅ Grants table exists and accessible!');
    }

  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return false;
  }

  // Import grants data
  try {
    console.log('📦 Starting grants import...');
    
    const grantsPath = path.join(__dirname, '..', 'client', 'public', 'data', 'grants.json');
    const grantsData = JSON.parse(fs.readFileSync(grantsPath, 'utf8'));
    
    console.log(`📊 Found ${grantsData.length} grants to import`);

    // Clear existing data first
    const { error: clearError } = await supabase
      .from('grants')
      .delete()
      .gte('id', 0); // Delete all records
    
    if (clearError) {
      console.log('⚠️  Could not clear existing data:', clearError.message);
    } else {
      console.log('🗑️  Cleared existing grants');
    }

    // Transform data to match our schema
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

    // Import in small batches to avoid timeout
    const batchSize = 5;
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
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${data.length} grants (Total: ${imported})`);
    }

    console.log(`🎉 Import completed! ${imported}/${grantsData.length} grants imported`);

    // Verify the import
    const { data: countData, error: countError } = await supabase
      .from('grants')
      .select('id');

    if (countError) {
      console.error('❌ Verification error:', countError.message);
    } else {
      console.log(`✅ Verification successful: ${countData.length} grants in database`);
      
      // Show sample grants
      const { data: sampleData } = await supabase
        .from('grants')
        .select('id, grant_name, funding_organization')
        .limit(3);
      
      console.log('📋 Sample grants:');
      sampleData.forEach(grant => {
        console.log(`   - ${grant.grant_name} (${grant.funding_organization})`);
      });
    }

    return true;

  } catch (err) {
    console.error('❌ Import failed:', err.message);
    return false;
  }
}

// Run the function
testAndImport().then(success => {
  if (success) {
    console.log('\n🎉 Database setup completed successfully!');
    console.log('✅ Ready to set up Netlify environment variables and deploy');
  } else {
    console.log('\n❌ Setup failed - check errors above');
  }
}).catch(err => {
  console.error('❌ Script failed:', err.message);
});