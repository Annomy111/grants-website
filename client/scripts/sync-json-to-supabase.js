const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Compare grants from JSON with Supabase and sync any differences
 */
async function syncJsonToSupabase() {
  console.log('🔄 Starting JSON to Supabase sync...');
  
  try {
    // Read grants from JSON file
    const jsonPath = path.join(__dirname, '..', 'public', 'data', 'grants.json');
    const jsonGrants = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📊 Found ${jsonGrants.length} grants in JSON file`);

    // Fetch all grants from Supabase
    const { data: supabaseGrants, error: fetchError } = await supabase
      .from('grants')
      .select('*')
      .order('id');

    if (fetchError) {
      console.error('❌ Error fetching grants from Supabase:', fetchError);
      return;
    }

    console.log(`🗄️  Found ${supabaseGrants ? supabaseGrants.length : 0} grants in Supabase`);

    // Create maps for easy lookup
    const jsonMap = new Map(jsonGrants.map(g => [g.id, g]));
    const supabaseMap = new Map(supabaseGrants ? supabaseGrants.map(g => [g.id, g]) : []);

    // Find grants to insert, update, or delete
    const toInsert = [];
    const toUpdate = [];
    const toDelete = [];

    // Check each grant in JSON
    for (const [id, jsonGrant] of jsonMap) {
      const supabaseGrant = supabaseMap.get(id);
      
      if (!supabaseGrant) {
        // Grant exists in JSON but not in Supabase - INSERT
        toInsert.push(jsonGrant);
      } else {
        // Grant exists in both - check if update needed
        if (needsUpdate(jsonGrant, supabaseGrant)) {
          toUpdate.push(jsonGrant);
        }
      }
    }

    // Check for grants in Supabase but not in JSON
    for (const [id, supabaseGrant] of supabaseMap) {
      if (!jsonMap.has(id)) {
        toDelete.push(id);
      }
    }

    console.log(`\n📋 Sync Summary:`);
    console.log(`   - Grants to insert: ${toInsert.length}`);
    console.log(`   - Grants to update: ${toUpdate.length}`);
    console.log(`   - Grants to delete: ${toDelete.length}`);

    // Perform insertions
    if (toInsert.length > 0) {
      console.log('\n➕ Inserting new grants...');
      const batchSize = 50;
      
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize).map(grant => transformGrant(grant));
        
        const { data, error } = await supabase
          .from('grants')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Error inserting batch:`, error);
        } else {
          console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}`);
        }
      }
    }

    // Perform updates
    if (toUpdate.length > 0) {
      console.log('\n🔄 Updating existing grants...');
      
      for (const grant of toUpdate) {
        const transformed = transformGrant(grant);
        const { error } = await supabase
          .from('grants')
          .update(transformed)
          .eq('id', grant.id);
        
        if (error) {
          console.error(`❌ Error updating grant ${grant.id}:`, error);
        }
      }
      console.log(`✅ Updated ${toUpdate.length} grants`);
    }

    // Perform deletions
    if (toDelete.length > 0) {
      console.log('\n🗑️  Deleting obsolete grants...');
      
      const { error } = await supabase
        .from('grants')
        .delete()
        .in('id', toDelete);
      
      if (error) {
        console.error(`❌ Error deleting grants:`, error);
      } else {
        console.log(`✅ Deleted ${toDelete.length} grants`);
      }
    }

    // Verify final count
    const { count } = await supabase
      .from('grants')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✨ Sync completed! Total grants in Supabase: ${count}`);
    
    // Show some examples
    const { data: examples } = await supabase
      .from('grants')
      .select('id, grant_name, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (examples) {
      console.log('\n📌 Recent updates:');
      examples.forEach(grant => {
        console.log(`   - [${grant.id}] ${grant.grant_name} (${grant.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

/**
 * Transform grant from JSON format to Supabase format
 */
function transformGrant(jsonGrant) {
  // Map JSON fields to Supabase columns
  return {
    id: jsonGrant.id,
    grant_name: jsonGrant.grant_name,
    funding_organization: jsonGrant.funding_organization,
    country_region: jsonGrant.country_region,
    eligibility_criteria: jsonGrant.eligibility_criteria,
    focus_areas: jsonGrant.focus_areas,
    grant_amount: jsonGrant.grant_amount,
    application_deadline: jsonGrant.application_deadline,
    duration: jsonGrant.duration,
    website_link: jsonGrant.website_link,
    status: jsonGrant.status || 'active',
    featured: jsonGrant.featured || false,
    view_count: jsonGrant.view_count || 0,
    created_at: jsonGrant.created_at,
    updated_at: jsonGrant.updated_at || new Date().toISOString(),
    
    // Detailed fields
    detailed_description: jsonGrant.detailed_description,
    contact_email: jsonGrant.contact_email,
    contact_phone: jsonGrant.contact_phone,
    contact_person: jsonGrant.contact_person,
    application_procedure: jsonGrant.application_procedure,
    required_documents: jsonGrant.required_documents,
    additional_requirements: jsonGrant.additional_requirements,
    program_type: jsonGrant.program_type,
    target_beneficiaries: jsonGrant.target_beneficiaries,
    geographical_scope: jsonGrant.geographical_scope,
    language_requirements: jsonGrant.language_requirements,
    partnership_requirements: jsonGrant.partnership_requirements || false,
    renewable: jsonGrant.renewable || false,
    application_fee: jsonGrant.application_fee,
    reporting_requirements: jsonGrant.reporting_requirements,
    evaluation_criteria: jsonGrant.evaluation_criteria,
    keywords: jsonGrant.keywords || [],
    last_updated: jsonGrant.last_updated || new Date().toISOString(),
    
    // Ukrainian translations
    grant_name_uk: jsonGrant.grant_name_uk,
    funding_organization_uk: jsonGrant.funding_organization_uk,
    country_region_uk: jsonGrant.country_region_uk,
    eligibility_criteria_uk: jsonGrant.eligibility_criteria_uk,
    focus_areas_uk: jsonGrant.focus_areas_uk,
    grant_amount_uk: jsonGrant.grant_amount_uk,
    duration_uk: jsonGrant.duration_uk,
    application_procedure_uk: jsonGrant.application_procedure_uk,
    required_documents_uk: jsonGrant.required_documents_uk,
    evaluation_criteria_uk: jsonGrant.evaluation_criteria_uk,
    additional_requirements_uk: jsonGrant.additional_requirements_uk,
    reporting_requirements_uk: jsonGrant.reporting_requirements_uk,
    detailed_description_uk: jsonGrant.detailed_description_uk
  };
}

/**
 * Check if a grant needs updating
 */
function needsUpdate(jsonGrant, supabaseGrant) {
  // Compare key fields to determine if update is needed
  const fieldsToCheck = [
    'grant_name', 'funding_organization', 'eligibility_criteria',
    'focus_areas', 'grant_amount', 'application_deadline',
    'website_link', 'status', 'detailed_description',
    'contact_email', 'application_procedure', 'required_documents',
    'grant_name_uk', 'funding_organization_uk', 'eligibility_criteria_uk'
  ];

  for (const field of fieldsToCheck) {
    if (jsonGrant[field] !== supabaseGrant[field]) {
      return true;
    }
  }

  // Check arrays
  if (JSON.stringify(jsonGrant.keywords || []) !== JSON.stringify(supabaseGrant.keywords || [])) {
    return true;
  }

  return false;
}

// Run the sync
if (require.main === module) {
  if (!process.env.REACT_APP_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - REACT_APP_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nMake sure your .env file is configured properly.');
    process.exit(1);
  }

  syncJsonToSupabase()
    .then(() => {
      console.log('\n✅ Sync completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncJsonToSupabase };