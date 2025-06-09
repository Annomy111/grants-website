const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Maps Supabase grant fields to the static JSON format
 * @param {Object} grant - Grant object from Supabase
 * @returns {Object} Formatted grant for static JSON
 */
function formatGrantForJSON(grant) {
  return {
    id: grant.id,
    grant_name: grant.grant_name || '',
    funding_organization: grant.funding_organization || '',
    country_region: grant.country_region || '',
    eligibility_criteria: grant.eligibility_criteria || '',
    focus_areas: grant.focus_areas || '',
    grant_amount: grant.grant_amount || '',
    application_deadline: grant.application_deadline || '',
    duration: grant.duration || '',
    website_link: grant.website_link || '',
    status: grant.status || 'active',
    featured: grant.featured || false,
    view_count: grant.view_count || 0,
    created_at: grant.created_at || '',
    updated_at: grant.updated_at || '',
    detailed_description: grant.detailed_description || '',
    contact_email: grant.contact_email || null,
    contact_phone: grant.contact_phone || null,
    contact_person: grant.contact_person || null,
    application_procedure: grant.application_procedure || '',
    required_documents: grant.required_documents || '',
    additional_requirements: grant.additional_requirements || '',
    program_type: grant.program_type || '',
    target_beneficiaries: grant.target_beneficiaries || '',
    geographical_scope: grant.geographical_scope || '',
    language_requirements: grant.language_requirements || '',
    partnership_requirements: grant.partnership_requirements || false,
    renewable: grant.renewable || false,
    application_fee: grant.application_fee || null,
    reporting_requirements: grant.reporting_requirements || '',
    evaluation_criteria: grant.evaluation_criteria || '',
    keywords: grant.keywords || [],
    last_updated: grant.last_updated || grant.updated_at || '',
    // Ukrainian fields
    grant_name_uk: grant.grant_name_uk || grant.grant_name || '',
    funding_organization_uk: grant.funding_organization_uk || grant.funding_organization || '',
    country_region_uk: grant.country_region_uk || grant.country_region || '',
    eligibility_criteria_uk: grant.eligibility_criteria_uk || grant.eligibility_criteria || '',
    focus_areas_uk: grant.focus_areas_uk || grant.focus_areas || '',
    grant_amount_uk: grant.grant_amount_uk || grant.grant_amount || '',
    duration_uk: grant.duration_uk || grant.duration || '',
    application_procedure_uk: grant.application_procedure_uk || grant.application_procedure || '',
    detailed_description_uk: grant.detailed_description_uk || grant.detailed_description || '',
    target_beneficiaries_uk: grant.target_beneficiaries_uk || grant.target_beneficiaries || '',
    geographical_scope_uk: grant.geographical_scope_uk || grant.geographical_scope || '',
    required_documents_uk: grant.required_documents_uk || grant.required_documents || '',
    language_requirements_uk: grant.language_requirements_uk || grant.language_requirements || '',
    reporting_requirements_uk: grant.reporting_requirements_uk || grant.reporting_requirements || '',
    evaluation_criteria_uk: grant.evaluation_criteria_uk || grant.evaluation_criteria || '',
    additional_requirements_uk: grant.additional_requirements_uk || grant.additional_requirements || '',
    // Logo URL
    logo_url: grant.logo_url || null,
    application_url: grant.application_url || grant.website_link || ''
  };
}

/**
 * Maps grant to Ukrainian JSON format (simplified structure)
 * @param {Object} grant - Grant object from Supabase
 * @returns {Object} Formatted grant for Ukrainian static JSON
 */
function formatGrantForUkrainianJSON(grant) {
  return {
    "Grant Name": grant.grant_name_uk || grant.grant_name || '',
    "Funding Organization": grant.funding_organization_uk || grant.funding_organization || '',
    "Country/Region": grant.country_region_uk || grant.country_region || '',
    "Eligibility Criteria": grant.eligibility_criteria_uk || grant.eligibility_criteria || '',
    "Focus Areas": grant.focus_areas_uk || grant.focus_areas || '',
    "Grant Amount": grant.grant_amount_uk || grant.grant_amount || '',
    "Application Deadline": grant.application_deadline || '',
    "Duration": grant.duration_uk || grant.duration || '',
    "Website Link": grant.website_link || ''
  };
}

async function updateStaticGrants(dryRun = false) {
  console.log('🚀 Starting static grants JSON update...');
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
  }
  console.log('📊 Fetching grants from Supabase database...');

  try {
    // Fetch all active grants from Supabase
    const { data: grants, error } = await supabase
      .from('grants')
      .select('*')
      .eq('status', 'active')
      .order('application_deadline', { ascending: true });

    if (error) {
      console.error('❌ Error fetching grants from Supabase:', error);
      process.exit(1);
    }

    console.log(`✅ Fetched ${grants.length} active grants from database`);

    // Format grants for English JSON
    const formattedGrants = grants.map(formatGrantForJSON);
    
    // Format grants for Ukrainian JSON
    const formattedGrantsUk = grants.map(formatGrantForUkrainianJSON);

    // Define file paths
    const grantsJsonPath = path.join(__dirname, '..', 'client', 'public', 'data', 'grants.json');
    const grantsUkJsonPath = path.join(__dirname, '..', 'client', 'public', 'data', 'grants_uk.json');

    // Backup existing files
    if (fs.existsSync(grantsJsonPath)) {
      const backupPath = grantsJsonPath.replace('.json', `.backup-${Date.now()}.json`);
      fs.copyFileSync(grantsJsonPath, backupPath);
      console.log(`📦 Created backup: ${path.basename(backupPath)}`);
    }

    if (fs.existsSync(grantsUkJsonPath)) {
      const backupPath = grantsUkJsonPath.replace('.json', `.backup-${Date.now()}.json`);
      fs.copyFileSync(grantsUkJsonPath, backupPath);
      console.log(`📦 Created backup: ${path.basename(backupPath)}`);
    }

    // Write updated grants to JSON files
    if (!dryRun) {
      fs.writeFileSync(grantsJsonPath, JSON.stringify(formattedGrants, null, 2), 'utf8');
      console.log(`✅ Updated grants.json with ${formattedGrants.length} grants`);

      fs.writeFileSync(grantsUkJsonPath, JSON.stringify(formattedGrantsUk, null, 2), 'utf8');
      console.log(`✅ Updated grants_uk.json with ${formattedGrantsUk.length} grants`);
    } else {
      console.log(`🔍 [DRY RUN] Would update grants.json with ${formattedGrants.length} grants`);
      console.log(`🔍 [DRY RUN] Would update grants_uk.json with ${formattedGrantsUk.length} grants`);
    }

    // Also update filters.json with current organizations, countries, and focus areas
    const organizations = [...new Set(grants.map(g => g.funding_organization).filter(Boolean))].sort();
    const countries = [...new Set(grants.map(g => g.country_region).filter(Boolean))].sort();
    const focusAreas = [...new Set(
      grants.flatMap(g => 
        g.focus_areas ? g.focus_areas.split(',').map(area => area.trim()) : []
      ).filter(Boolean)
    )].sort();

    const filters = {
      organizations,
      countries,
      focusAreas
    };

    const filtersJsonPath = path.join(__dirname, '..', 'client', 'public', 'data', 'filters.json');
    if (!dryRun) {
      fs.writeFileSync(filtersJsonPath, JSON.stringify(filters, null, 2), 'utf8');
      console.log(`✅ Updated filters.json`);
    } else {
      console.log(`🔍 [DRY RUN] Would update filters.json`);
    }

    // Update Ukrainian filters
    const organizationsUk = [...new Set(grants.map(g => g.funding_organization_uk || g.funding_organization).filter(Boolean))].sort();
    const countriesUk = [...new Set(grants.map(g => g.country_region_uk || g.country_region).filter(Boolean))].sort();
    const focusAreasUk = [...new Set(
      grants.flatMap(g => {
        const areas = g.focus_areas_uk || g.focus_areas || '';
        return areas.split(',').map(area => area.trim());
      }).filter(Boolean)
    )].sort();

    const filtersUk = {
      organizations: organizationsUk,
      countries: countriesUk,
      focusAreas: focusAreasUk
    };

    const filtersUkJsonPath = path.join(__dirname, '..', 'client', 'public', 'data', 'filters_uk.json');
    if (!dryRun) {
      fs.writeFileSync(filtersUkJsonPath, JSON.stringify(filtersUk, null, 2), 'utf8');
      console.log(`✅ Updated filters_uk.json`);
    } else {
      console.log(`🔍 [DRY RUN] Would update filters_uk.json`);
    }

    // Summary statistics
    console.log('\n📊 Update Summary:');
    console.log(`- Total active grants: ${grants.length}`);
    console.log(`- Organizations: ${organizations.length}`);
    console.log(`- Countries/Regions: ${countries.length}`);
    console.log(`- Focus Areas: ${focusAreas.length}`);
    
    // Show upcoming deadlines
    const upcomingDeadlines = grants
      .filter(g => g.application_deadline && new Date(g.application_deadline) > new Date())
      .slice(0, 5);
    
    if (upcomingDeadlines.length > 0) {
      console.log('\n📅 Next 5 upcoming deadlines:');
      upcomingDeadlines.forEach(g => {
        console.log(`  - ${g.grant_name}: ${g.application_deadline}`);
      });
    }

    console.log('\n✅ Static JSON files successfully updated!');
    console.log('📝 Files updated:');
    console.log('  - client/public/data/grants.json');
    console.log('  - client/public/data/grants_uk.json');
    console.log('  - client/public/data/filters.json');
    console.log('  - client/public/data/filters_uk.json');

  } catch (error) {
    console.error('❌ Error updating static grants:', error);
    process.exit(1);
  }
}

// Run the update if executed directly
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  updateStaticGrants(isDryRun);
}

module.exports = { updateStaticGrants };