const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeCleanup() {
  console.log('🧹 EXECUTING DATABASE CLEANUP');
  console.log('============================\n');
  
  let totalUpdates = 0;
  let totalErrors = 0;

  // 1. Fix Missing Logos
  console.log('📸 STEP 1: Fixing Missing Logos\n');
  
  // Load logo mapping
  let logoMapping = {};
  try {
    const logoData = await fs.readFile(
      path.join(__dirname, '../client/public/data/organization-logos.json'),
      'utf8'
    );
    logoMapping = JSON.parse(logoData);
  } catch (err) {
    console.log('❌ Could not load logo mapping');
  }
  
  const { data: grantsWithoutLogos, error: logoError } = await supabase
    .from('grants')
    .select('id, funding_organization, logo_url')
    .or('logo_url.is.null,logo_url.eq.');
    
  if (logoError) {
    console.log(`❌ Error fetching grants: ${logoError.message}`);
    return;
  }
  
  console.log(`Found ${grantsWithoutLogos?.length || 0} grants without logos`);
  
  for (const grant of (grantsWithoutLogos || [])) {
    if (logoMapping[grant.funding_organization]) {
      const { error } = await supabase
        .from('grants')
        .update({ logo_url: logoMapping[grant.funding_organization] })
        .eq('id', grant.id);
        
      if (!error) {
        totalUpdates++;
        console.log(`✅ Added logo for ${grant.funding_organization}`);
      } else {
        totalErrors++;
        console.log(`❌ Error adding logo for grant ${grant.id}: ${error.message}`);
      }
    }
  }
  
  // 2. Archive Expired Grants
  console.log('\n⏰ STEP 2: Handling Expired Grants\n');
  
  const today = new Date().toISOString().split('T')[0];
  const { data: expiredGrants, error: expiredError } = await supabase
    .from('grants')
    .select('id, grant_name, application_deadline')
    .lt('application_deadline', today)
    .not('application_deadline', 'is', null);
    
  if (expiredError) {
    console.log(`❌ Error fetching expired grants: ${expiredError.message}`);
    return;
  }
  
  console.log(`Found ${expiredGrants?.length || 0} expired grants`);
  
  // Update status to 'expired' instead of deleting
  for (const grant of (expiredGrants || []).slice(0, 10)) { // Process first 10
    const { error } = await supabase
      .from('grants')
      .update({ status: 'expired' })
      .eq('id', grant.id);
      
    if (!error) {
      totalUpdates++;
      console.log(`✅ Marked as expired: ${grant.grant_name}`);
    } else {
      totalErrors++;
      console.log(`❌ Error updating grant ${grant.id}: ${error.message}`);
    }
  }
  
  // 3. Fix Data Validation Issues
  console.log('\n🔧 STEP 3: Fixing Data Validation Issues\n');
  
  // Fix grants with min > max amounts
  const { data: invalidAmountGrants, error: amountError } = await supabase
    .from('grants')
    .select('id, grant_name, grant_amount_min, grant_amount_max')
    .filter('grant_amount_min', 'gt', 0)
    .filter('grant_amount_max', 'gt', 0);
    
  if (amountError) {
    console.log(`❌ Error fetching grants with amounts: ${amountError.message}`);
    return;
  }
  
  const amountIssues = (invalidAmountGrants || []).filter(g => 
    g.grant_amount_min && g.grant_amount_max && g.grant_amount_min > g.grant_amount_max
  );
  
  console.log(`Found ${amountIssues.length} grants with invalid amounts`);
  
  for (const grant of amountIssues) {
    // Swap min and max
    const { error } = await supabase
      .from('grants')
      .update({ 
        grant_amount_min: grant.grant_amount_max,
        grant_amount_max: grant.grant_amount_min 
      })
      .eq('id', grant.id);
      
    if (!error) {
      totalUpdates++;
      console.log(`✅ Fixed amounts for: ${grant.grant_name}`);
    } else {
      totalErrors++;
      console.log(`❌ Error fixing amounts for grant ${grant.id}: ${error.message}`);
    }
  }
  
  // 4. Standardize Organization Names
  console.log('\n🏢 STEP 4: Standardizing Organization Names\n');
  
  const orgStandardization = {
    'European Commission': ['European commission', 'EUROPEAN COMMISSION', 'EC'],
    'USAID': ['U.S. Agency for International Development', 'US AID', 'United States Agency for International Development'],
    'United Nations': ['UN', 'United nations', 'UNITED NATIONS'],
    'World Bank': ['World bank', 'WORLD BANK', 'The World Bank']
  };
  
  for (const [standard, variations] of Object.entries(orgStandardization)) {
    for (const variation of variations) {
      const { data: grants } = await supabase
        .from('grants')
        .select('id')
        .eq('funding_organization', variation);
        
      if (grants && grants.length > 0) {
        const { error } = await supabase
          .from('grants')
          .update({ funding_organization: standard })
          .eq('funding_organization', variation);
          
        if (!error) {
          totalUpdates += grants.length;
          console.log(`✅ Standardized ${grants.length} grants from "${variation}" to "${standard}"`);
        } else {
          totalErrors++;
          console.log(`❌ Error standardizing organization name: ${error.message}`);
        }
      }
    }
  }
  
  // 5. Fill Missing Required Fields with Defaults
  console.log('\n📝 STEP 5: Filling Missing Required Fields\n');
  
  // Add default descriptions for grants missing them
  const { data: noDescGrants, error: descError } = await supabase
    .from('grants')
    .select('id, grant_name')
    .or('description_en.is.null,description_en.eq.');
    
  if (descError) {
    console.log(`❌ Error fetching grants without descriptions: ${descError.message}`);
    return;
  }
  
  console.log(`Found ${noDescGrants?.length || 0} grants without descriptions`);
  
  for (const grant of (noDescGrants || []).slice(0, 5)) { // Process first 5
    const defaultDesc = `Grant opportunity provided by the funding organization. Please visit the official website for detailed information about this grant program.`;
    
    const { error } = await supabase
      .from('grants')
      .update({ description_en: defaultDesc })
      .eq('id', grant.id);
      
    if (!error) {
      totalUpdates++;
      console.log(`✅ Added default description for: ${grant.grant_name}`);
    } else {
      totalErrors++;
      console.log(`❌ Error adding description: ${error.message}`);
    }
  }
  
  // 6. Remove Suspicious Duplicates
  console.log('\n🔍 STEP 6: Handling Duplicates\n');
  
  // For now, just report duplicates - manual review recommended
  const { data: allGrants, error: allError } = await supabase
    .from('grants')
    .select('id, grant_name, funding_organization, application_deadline')
    .order('grant_name');
    
  if (allError) {
    console.log(`❌ Error fetching all grants: ${allError.message}`);
    return;
  }
  
  const seen = new Map();
  const duplicates = [];
  
  for (const grant of (allGrants || [])) {
    const key = `${grant.grant_name.toLowerCase()}_${grant.funding_organization}`;
    if (seen.has(key)) {
      duplicates.push({
        keep: seen.get(key),
        duplicate: grant
      });
    } else {
      seen.set(key, grant);
    }
  }
  
  console.log(`Found ${duplicates.length} exact duplicates (same name & org)`);
  console.log('⚠️  Manual review recommended before deletion');
  
  // 7. Update grant_type field for better categorization
  console.log('\n🏷️  STEP 7: Categorizing Grant Types\n');
  
  const typeKeywords = {
    'Project Grant': ['project', 'implementation', 'pilot'],
    'Operating Grant': ['operating', 'core', 'institutional'],
    'Emergency Grant': ['emergency', 'crisis', 'urgent'],
    'Capacity Building': ['capacity', 'training', 'development'],
    'Research Grant': ['research', 'study', 'analysis']
  };
  
  for (const [grantType, keywords] of Object.entries(typeKeywords)) {
    for (const keyword of keywords) {
      const { data: grants } = await supabase
        .from('grants')
        .select('id')
        .or(`grant_name.ilike.%${keyword}%,focus_areas_en.ilike.%${keyword}%`)
        .is('grant_type', null);
        
      if (grants && grants.length > 0) {
        const { error } = await supabase
          .from('grants')
          .update({ grant_type: grantType })
          .in('id', grants.map(g => g.id));
          
        if (!error) {
          totalUpdates += grants.length;
          console.log(`✅ Categorized ${grants.length} grants as "${grantType}"`);
        }
      }
    }
  }
  
  // Final Summary
  console.log('\n📊 CLEANUP SUMMARY');
  console.log('==================');
  console.log(`✅ Total successful updates: ${totalUpdates}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  console.log(`📁 Database cleanup completed!`);
  
  // Generate cleanup log
  const log = {
    timestamp: new Date().toISOString(),
    totalUpdates,
    totalErrors,
    actions: [
      'Added missing logos from mapping',
      'Marked expired grants',
      'Fixed invalid grant amounts',
      'Standardized organization names',
      'Added default descriptions',
      'Identified duplicates for review',
      'Categorized grant types'
    ]
  };
  
  const logPath = path.join(__dirname, `../cleanup-log-${Date.now()}.json`);
  await fs.writeFile(logPath, JSON.stringify(log, null, 2));
  console.log(`\n📄 Cleanup log saved to: ${logPath}`);
}

// Execute cleanup
executeCleanup().catch(console.error);