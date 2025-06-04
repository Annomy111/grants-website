const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://adpddtbsstunjotxaldb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM'
);

async function createAndImport() {
  console.log('🚀 Simple schema creation and data import...');

  // Step 1: Try to check if grants table exists by querying it
  try {
    console.log('📋 Checking if grants table exists...');
    const { data, error } = await supabase
      .from('grants')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.log('❌ Grants table does not exist:', error.message);
      console.log('\n🔧 MANUAL SETUP REQUIRED:');
      console.log('1. Go to https://adpddtbsstunjotxaldb.supabase.co');
      console.log('2. Click "SQL Editor" in the sidebar');
      console.log('3. Copy and paste this SQL and click "Run":');
      console.log('\n' + '='.repeat(60));
      
      const schemaSQL = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
      console.log(schemaSQL);
      console.log('='.repeat(60));
      
      console.log('\n4. After running the SQL, run this script again with: node scripts/simple-schema-import.js');
      return false;
    } else {
      console.log('✅ Grants table exists!');
      console.log(`📊 Current grants count: ${data}`);
    }

  } catch (err) {
    console.log('❌ Error checking table:', err.message);
    return false;
  }

  // Step 2: Import grants data
  try {
    console.log('📦 Starting grants import...');
    
    const grantsPath = path.join(__dirname, '..', 'client', 'public', 'data', 'grants.json');
    const grantsData = JSON.parse(fs.readFileSync(grantsPath, 'utf8'));
    
    console.log(`📊 Found ${grantsData.length} grants to import`);

    // Clear existing data
    const { error: clearError } = await supabase
      .from('grants')
      .delete()
      .neq('id', 0);
    
    if (clearError) {
      console.log('⚠️  Could not clear existing data:', clearError.message);
    }

    // Transform data
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

    // Import in batches
    const batchSize = 10;
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

    // Verify
    const { data: verifyData, error: verifyError } = await supabase
      .from('grants')
      .select('id, grant_name')
      .limit(3);

    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    } else {
      console.log('✅ Verification successful - Sample grants:');
      verifyData.forEach(grant => {
        console.log(`   - ${grant.grant_name}`);
      });
    }

    return true;

  } catch (err) {
    console.error('❌ Import failed:', err.message);
    return false;
  }
}

// Run the function
createAndImport().then(success => {
  if (success) {
    console.log('\n🎉 Schema and data setup completed successfully!');
    console.log('✅ Ready to deploy Netlify functions and test the system');
  } else {
    console.log('\n🔧 Manual setup required - follow the instructions above');
  }
}).catch(err => {
  console.error('❌ Failed:', err.message);
});