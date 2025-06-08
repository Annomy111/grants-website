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

  // 1. Check Logo Mapping Coverage
  console.log('📸 STEP 1: Checking Logo Mapping Coverage\n');
  
  // Load logo mapping
  let logoMapping = {};
  try {
    const logoData = await fs.readFile(
      path.join(__dirname, '../client/public/data/organization-logos.json'),
      'utf8'
    );
    logoMapping = JSON.parse(logoData);
    console.log(`✅ Loaded logo mapping with ${Object.keys(logoMapping).length} organizations`);
  } catch (err) {
    console.log('❌ Could not load logo mapping');
  }
  
  // Get all unique organizations
  const { data: grants, error: orgsError } = await supabase
    .from('grants')
    .select('funding_organization');
    
  if (orgsError) {
    console.log(`❌ Error fetching organizations: ${orgsError.message}`);
    return;
  }
  
  const uniqueOrgs = [...new Set(grants.map(g => g.funding_organization))];
  const missingLogos = uniqueOrgs.filter(org => {
    const slug = org.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return !logoMapping[slug];
  });
  
  console.log(`Found ${missingLogos.length} organizations without logo mappings`);
  if (missingLogos.length > 0 && missingLogos.length < 20) {
    console.log('Organizations missing logos:', missingLogos);
  }
  
  // 2. Archive Expired Grants
  console.log('\n⏰ STEP 2: Handling Expired Grants\n');
  
  const today = new Date().toISOString().split('T')[0];
  const { data: expiredGrants, error: expiredError } = await supabase
    .from('grants')
    .select('id, grant_name, application_deadline')
    .lt('application_deadline', today)
    .not('application_deadline', 'is', null)
    .neq('status', 'expired'); // Don't re-process already expired ones
    
  if (expiredError) {
    console.log(`❌ Error fetching expired grants: ${expiredError.message}`);
  } else {
    console.log(`Found ${expiredGrants?.length || 0} newly expired grants`);
    
    // Update status to 'expired'
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
  }
  
  // 3. Fix Data Validation Issues
  console.log('\n🔧 STEP 3: Fixing Data Validation Issues\n');
  
  // Fix grants with min > max amounts
  const { data: invalidAmountGrants, error: amountError } = await supabase
    .from('grants')
    .select('id, grant_name, grant_amount_min, grant_amount_max')
    .not('grant_amount_min', 'is', null)
    .not('grant_amount_max', 'is', null);
    
  if (amountError) {
    console.log(`❌ Error fetching grants with amounts: ${amountError.message}`);
  } else {
    const amountIssues = (invalidAmountGrants || []).filter(g => 
      g.grant_amount_min > g.grant_amount_max
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
  }
  
  // 4. Standardize Organization Names
  console.log('\n🏢 STEP 4: Standardizing Organization Names\n');
  
  const orgStandardization = {
    'European Commission': ['European commission', 'EUROPEAN COMMISSION', 'EC'],
    'USAID': ['U.S. Agency for International Development', 'US AID', 'United States Agency for International Development'],
    'United Nations': ['UN', 'United nations', 'UNITED NATIONS'],
    'World Bank': ['World bank', 'WORLD BANK', 'The World Bank'],
    'German Federal Foreign Office': ['German Federal Foreign Office (AA)', 'German Foreign Office'],
    'Swiss Agency for Development and Cooperation': ['Swiss Agency for Development and Cooperation (SDC)', 'SDC']
  };
  
  for (const [standard, variations] of Object.entries(orgStandardization)) {
    for (const variation of variations) {
      const { data: varGrants, error: varError } = await supabase
        .from('grants')
        .select('id')
        .eq('funding_organization', variation);
        
      if (!varError && varGrants && varGrants.length > 0) {
        const { error } = await supabase
          .from('grants')
          .update({ funding_organization: standard })
          .eq('funding_organization', variation);
          
        if (!error) {
          totalUpdates += varGrants.length;
          console.log(`✅ Standardized ${varGrants.length} grants from "${variation}" to "${standard}"`);
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
    .select('id, grant_name, funding_organization')
    .or('description_en.is.null,description_en.eq.');
    
  if (descError) {
    console.log(`❌ Error fetching grants without descriptions: ${descError.message}`);
  } else {
    console.log(`Found ${noDescGrants?.length || 0} grants without descriptions`);
    
    for (const grant of (noDescGrants || []).slice(0, 5)) { // Process first 5
      const defaultDesc = `This grant opportunity is provided by ${grant.funding_organization}. Please visit the official website for detailed information about eligibility criteria, application procedures, and program objectives.`;
      
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
  }
  
  // 6. Remove Exact Duplicates
  console.log('\n🔍 STEP 6: Handling Duplicates\n');
  
  const { data: allGrants, error: allError } = await supabase
    .from('grants')
    .select('id, grant_name, funding_organization, application_deadline')
    .order('created_at', { ascending: true }); // Keep oldest
    
  if (allError) {
    console.log(`❌ Error fetching all grants: ${allError.message}`);
  } else {
    const seen = new Map();
    const duplicatesToRemove = [];
    
    for (const grant of (allGrants || [])) {
      const key = `${grant.grant_name.toLowerCase().trim()}_${grant.funding_organization}`;
      if (seen.has(key)) {
        duplicatesToRemove.push(grant.id);
      } else {
        seen.set(key, grant);
      }
    }
    
    console.log(`Found ${duplicatesToRemove.length} exact duplicates (same name & org)`);
    
    // Remove only first 5 duplicates for safety
    for (const duplicateId of duplicatesToRemove.slice(0, 5)) {
      const { error } = await supabase
        .from('grants')
        .delete()
        .eq('id', duplicateId);
        
      if (!error) {
        totalUpdates++;
        console.log(`✅ Removed duplicate grant ID: ${duplicateId}`);
      } else {
        totalErrors++;
        console.log(`❌ Error removing duplicate: ${error.message}`);
      }
    }
  }
  
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
      const { data: typeGrants, error: typeError } = await supabase
        .from('grants')
        .select('id')
        .or(`grant_name.ilike.%${keyword}%,focus_areas_en.ilike.%${keyword}%`)
        .is('grant_type', null);
        
      if (!typeError && typeGrants && typeGrants.length > 0) {
        const { error } = await supabase
          .from('grants')
          .update({ grant_type: grantType })
          .in('id', typeGrants.map(g => g.id));
          
        if (!error) {
          totalUpdates += typeGrants.length;
          console.log(`✅ Categorized ${typeGrants.length} grants as "${grantType}"`);
        }
      }
    }
  }
  
  // 8. Fix Translation Issues
  console.log('\n🌐 STEP 8: Fixing Translation Issues\n');
  
  // Fix grants where Ukrainian "translation" is same as English
  const { data: transGrants, error: transError } = await supabase
    .from('grants')
    .select('id, grant_name, description_en, description_uk')
    .not('description_en', 'is', null)
    .not('description_uk', 'is', null);
    
  if (!transError) {
    const identicalTrans = (transGrants || []).filter(g => 
      g.description_en === g.description_uk
    );
    
    console.log(`Found ${identicalTrans.length} grants with identical EN/UK descriptions`);
    
    // Clear the Ukrainian field for these (better to have no translation than wrong one)
    for (const grant of identicalTrans.slice(0, 5)) {
      const { error } = await supabase
        .from('grants')
        .update({ 
          description_uk: null,
          eligibility_criteria_uk: null,
          focus_areas_uk: null 
        })
        .eq('id', grant.id);
        
      if (!error) {
        totalUpdates++;
        console.log(`✅ Cleared invalid Ukrainian translation for: ${grant.grant_name}`);
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
      'Checked logo mapping coverage',
      'Marked expired grants',
      'Fixed invalid grant amounts',
      'Standardized organization names',
      'Added default descriptions',
      'Removed duplicate grants',
      'Categorized grant types',
      'Fixed translation issues'
    ]
  };
  
  const logPath = path.join(__dirname, `../cleanup-log-${Date.now()}.json`);
  await fs.writeFile(logPath, JSON.stringify(log, null, 2));
  console.log(`\n📄 Cleanup log saved to: ${logPath}`);
}

// Execute cleanup
executeCleanup().catch(console.error);