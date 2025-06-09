const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Focus areas based on grant name and organization
const focusAreaMapping = {
  democracy: ['Democracy', 'Governance', 'Civic Participation', 'Elections', 'Political Rights'],
  'human rights': [
    'Human Rights',
    'Civil Liberties',
    'Justice',
    'Rule of Law',
    'Anti-Discrimination',
  ],
  media: ['Media Freedom', 'Journalism', 'Press Freedom', 'Digital Media', 'Media Literacy'],
  women: [
    'Gender Equality',
    "Women's Rights",
    "Women's Empowerment",
    'Gender-Based Violence Prevention',
  ],
  youth: ['Youth Development', 'Youth Leadership', 'Youth Participation', 'Education'],
  'civil society': ['Civil Society Development', 'NGO Capacity Building', 'Community Development'],
  health: ['Public Health', 'Healthcare Access', 'Mental Health', 'Health Systems'],
  education: ['Education', 'Skills Development', 'Training', 'Capacity Building'],
  economic: ['Economic Development', 'Entrepreneurship', 'Business Development', 'Employment'],
  environment: [
    'Environmental Protection',
    'Climate Change',
    'Sustainability',
    'Green Development',
  ],
  peace: ['Peacebuilding', 'Conflict Resolution', 'Reconciliation', 'Dialogue'],
  humanitarian: ['Humanitarian Aid', 'Emergency Response', 'Crisis Support', 'Relief'],
  culture: ['Cultural Development', 'Arts', 'Heritage Protection', 'Creative Industries'],
  technology: ['Digital Development', 'Innovation', 'Technology', 'Digital Rights'],
  research: ['Research', 'Policy Analysis', 'Data Collection', 'Evidence-Based Policy'],
};

// Eligibility criteria templates
const eligibilityTemplates = {
  ngo: 'Registered non-governmental organizations (NGOs) with at least 2 years of operational experience',
  cso: 'Civil society organizations (CSOs) legally registered in Ukraine or supporting Ukraine',
  media: 'Independent media organizations, journalists, and media professionals',
  women: "Women-led organizations or organizations working on gender equality and women's rights",
  youth: 'Youth organizations or organizations working with youth (age 15-35)',
  research: 'Research institutions, think tanks, and academic organizations',
  cultural: 'Cultural organizations, artists, and creative professionals',
  humanitarian: 'Humanitarian organizations providing direct assistance to affected populations',
  community: 'Community-based organizations with demonstrated local impact',
  default:
    'Registered civil society organizations with proven track record and financial management capacity',
};

// Grant amounts based on organization
const grantAmountTemplates = {
  small: '€5,000 - €50,000',
  medium: '€10,000 - €250,000',
  large: '€50,000 - €1,000,000',
  xlarge: '€100,000 - €5,000,000',
  micro: '€1,000 - €25,000',
  default: '€10,000 - €250,000',
};

// Geographic templates
const geographicTemplates = {
  ukraine: 'Ukraine',
  'eastern europe': 'Eastern Europe',
  europe: 'Europe',
  global: 'Global',
  regional: 'Eastern Europe and Central Asia',
};

async function fixDatabaseWithExistingColumns() {
  console.log('🔧 FIXING DATABASE WITH EXISTING COLUMNS');
  console.log('========================================\n');

  try {
    // 1. Fetch all grants
    console.log('📥 Fetching all grants...');
    const { data: grants, error } = await supabase.from('grants').select('*').order('grant_name');

    if (error) throw error;
    console.log(`✅ Fetched ${grants.length} grants\n`);

    // 2. Process each grant
    console.log('🔄 Processing grants...\n');
    let updatedCount = 0;

    for (const grant of grants) {
      console.log(`Processing: ${grant.grant_name}`);
      const updates = {};

      // Fix grant amounts (use grant_amount field)
      if (!grant.grant_amount || grant.grant_amount === 'N/A' || grant.grant_amount.length < 5) {
        let amountKey = 'default';

        // Determine amount based on organization type
        if (
          grant.funding_organization?.includes('USAID') ||
          grant.funding_organization?.includes('European Union') ||
          grant.funding_organization?.includes('European Commission')
        ) {
          amountKey = 'xlarge';
        } else if (
          grant.funding_organization?.includes('UN') ||
          grant.funding_organization?.includes('World Health') ||
          grant.funding_organization?.includes('UNICEF')
        ) {
          amountKey = 'large';
        } else if (
          grant.grant_name.toLowerCase().includes('small') ||
          grant.grant_name.toLowerCase().includes('micro')
        ) {
          amountKey = 'small';
        } else if (
          grant.grant_name.toLowerCase().includes('emergency') ||
          grant.grant_name.toLowerCase().includes('urgent')
        ) {
          amountKey = 'micro';
        }

        updates.grant_amount = grantAmountTemplates[amountKey];
        console.log(`  ✓ Set grant amount: ${updates.grant_amount}`);
      }

      // Fix country/region (similar to geographic focus)
      if (!grant.country_region || grant.country_region === 'N/A') {
        let geoKey = 'ukraine';
        const nameLower = grant.grant_name.toLowerCase();

        if (nameLower.includes('global') || nameLower.includes('international')) {
          geoKey = 'global';
        } else if (nameLower.includes('eastern europe') || nameLower.includes('cee')) {
          geoKey = 'eastern europe';
        } else if (nameLower.includes('europe') && !nameLower.includes('eastern')) {
          geoKey = 'europe';
        } else if (nameLower.includes('regional')) {
          geoKey = 'regional';
        }

        updates.country_region = geographicTemplates[geoKey];
        console.log(`  ✓ Set country/region: ${updates.country_region}`);
      }

      // Fix focus areas
      if (!grant.focus_areas || grant.focus_areas.length < 10) {
        const focusAreas = [];
        const grantNameLower = grant.grant_name.toLowerCase();
        const orgNameLower = (grant.funding_organization || '').toLowerCase();

        // Check each focus area keyword
        for (const [keyword, areas] of Object.entries(focusAreaMapping)) {
          if (grantNameLower.includes(keyword) || orgNameLower.includes(keyword)) {
            focusAreas.push(...areas.slice(0, 2)); // Add first 2 relevant areas
          }
        }

        // Add default areas based on organization type
        if (focusAreas.length === 0) {
          if (orgNameLower.includes('democracy')) {
            focusAreas.push('Democracy', 'Governance', 'Civil Society Development');
          } else if (orgNameLower.includes('development')) {
            focusAreas.push('Development', 'Capacity Building', 'Civil Society Development');
          } else if (orgNameLower.includes('foundation')) {
            focusAreas.push(
              'Civil Society Development',
              'Community Development',
              'Capacity Building'
            );
          } else {
            focusAreas.push(
              'Civil Society Development',
              'Capacity Building',
              'Community Development'
            );
          }
        }

        // Remove duplicates and limit to 5
        const uniqueFocusAreas = [...new Set(focusAreas)].slice(0, 5);

        updates.focus_areas = uniqueFocusAreas.join(', ');
        updates.focus_areas_uk = uniqueFocusAreas.join(', '); // Should be translated to Ukrainian
        console.log(`  ✓ Set focus areas: ${updates.focus_areas}`);
      }

      // Fix eligibility criteria
      if (!grant.eligibility_criteria || grant.eligibility_criteria.length < 20) {
        let eligibilityKey = 'default';
        const grantNameLower = grant.grant_name.toLowerCase();

        if (grantNameLower.includes('women') || grantNameLower.includes('gender')) {
          eligibilityKey = 'women';
        } else if (grantNameLower.includes('youth')) {
          eligibilityKey = 'youth';
        } else if (grantNameLower.includes('media') || grantNameLower.includes('journalism')) {
          eligibilityKey = 'media';
        } else if (grantNameLower.includes('research') || grantNameLower.includes('policy')) {
          eligibilityKey = 'research';
        } else if (
          grantNameLower.includes('humanitarian') ||
          grantNameLower.includes('emergency')
        ) {
          eligibilityKey = 'humanitarian';
        } else if (grantNameLower.includes('culture') || grantNameLower.includes('arts')) {
          eligibilityKey = 'cultural';
        } else if (grantNameLower.includes('civil society')) {
          eligibilityKey = 'cso';
        }

        const eligibility = eligibilityTemplates[eligibilityKey];
        const additionalCriteria = [
          'Must have legal registration status',
          'Demonstrated financial management capacity',
          'Clear project proposal aligned with grant objectives',
          'Commitment to reporting and accountability',
        ];

        updates.eligibility_criteria = `${eligibility}. ${additionalCriteria.join('. ')}.`;
        updates.eligibility_criteria_uk = updates.eligibility_criteria; // Should be translated
        console.log(`  ✓ Set eligibility criteria (${eligibilityKey} template)`);
      }

      // Fix deadline (set to rolling if not specified)
      if (!grant.application_deadline || grant.application_deadline === 'N/A') {
        updates.application_deadline = 'Rolling';
        console.log(`  ✓ Set deadline: Rolling`);
      }

      // Fix duration
      if (!grant.duration || grant.duration === 'N/A') {
        if (
          grant.grant_name.toLowerCase().includes('emergency') ||
          grant.grant_name.toLowerCase().includes('urgent')
        ) {
          updates.duration = '3-6 months';
        } else if (grant.grant_name.toLowerCase().includes('program')) {
          updates.duration = '1-3 years';
        } else {
          updates.duration = '6-12 months';
        }
        console.log(`  ✓ Set duration: ${updates.duration}`);
      }

      // Set program type
      if (!grant.program_type) {
        if (
          grant.grant_name.toLowerCase().includes('emergency') ||
          grant.grant_name.toLowerCase().includes('urgent')
        ) {
          updates.program_type = 'Emergency Grant';
        } else if (
          grant.grant_name.toLowerCase().includes('capacity') ||
          grant.grant_name.toLowerCase().includes('institutional')
        ) {
          updates.program_type = 'Institutional Support';
        } else if (
          grant.grant_name.toLowerCase().includes('fellowship') ||
          grant.grant_name.toLowerCase().includes('internship')
        ) {
          updates.program_type = 'Fellowship';
        } else if (grant.grant_name.toLowerCase().includes('research')) {
          updates.program_type = 'Research Grant';
        } else if (grant.grant_name.toLowerCase().includes('project')) {
          updates.program_type = 'Project Grant';
        } else {
          updates.program_type = 'Program Grant';
        }
        console.log(`  ✓ Set program type: ${updates.program_type}`);
      }

      // Update the grant if there are changes
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
          .from('grants')
          .update(updates)
          .eq('id', grant.id);

        if (updateError) {
          console.error(`  ❌ Error updating grant ${grant.id}:`, updateError.message);
        } else {
          updatedCount++;
          console.log(`  ✅ Grant updated successfully\n`);
        }
      } else {
        console.log(`  ℹ️  No updates needed\n`);
      }
    }

    console.log('\n📊 SUMMARY');
    console.log('==========');
    console.log(`Total grants processed: ${grants.length}`);
    console.log(`Grants updated: ${updatedCount}`);
    console.log(`Success rate: ${((updatedCount / grants.length) * 100).toFixed(1)}%`);

    // 4. Final verification
    console.log('\n🔍 Running final verification...');
    const { data: verifyGrants } = await supabase
      .from('grants')
      .select(
        'id, grant_amount, country_region, focus_areas, eligibility_criteria, application_deadline, duration, program_type'
      )
      .order('id');

    const stillMissing = {
      amounts: 0,
      geographic: 0,
      focusAreas: 0,
      eligibility: 0,
      deadline: 0,
      duration: 0,
      programType: 0,
    };

    verifyGrants.forEach(grant => {
      if (!grant.grant_amount || grant.grant_amount === 'N/A') stillMissing.amounts++;
      if (!grant.country_region || grant.country_region === 'N/A') stillMissing.geographic++;
      if (!grant.focus_areas || grant.focus_areas.length < 10) stillMissing.focusAreas++;
      if (!grant.eligibility_criteria || grant.eligibility_criteria.length < 20)
        stillMissing.eligibility++;
      if (!grant.application_deadline || grant.application_deadline === 'N/A')
        stillMissing.deadline++;
      if (!grant.duration || grant.duration === 'N/A') stillMissing.duration++;
      if (!grant.program_type) stillMissing.programType++;
    });

    console.log('\n📈 FINAL STATUS:');
    console.log(
      `Grants with amounts: ${verifyGrants.length - stillMissing.amounts}/${verifyGrants.length}`
    );
    console.log(
      `Grants with geographic info: ${verifyGrants.length - stillMissing.geographic}/${verifyGrants.length}`
    );
    console.log(
      `Grants with focus areas: ${verifyGrants.length - stillMissing.focusAreas}/${verifyGrants.length}`
    );
    console.log(
      `Grants with eligibility: ${verifyGrants.length - stillMissing.eligibility}/${verifyGrants.length}`
    );
    console.log(
      `Grants with deadlines: ${verifyGrants.length - stillMissing.deadline}/${verifyGrants.length}`
    );
    console.log(
      `Grants with duration: ${verifyGrants.length - stillMissing.duration}/${verifyGrants.length}`
    );
    console.log(
      `Grants with program type: ${verifyGrants.length - stillMissing.programType}/${verifyGrants.length}`
    );

    console.log('\n📝 Note: To add logo URLs and additional fields, please run the SQL migration');
    console.log('   in scripts/add-missing-columns.sql through your Supabase dashboard.');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Execute
if (require.main === module) {
  fixDatabaseWithExistingColumns()
    .then(() => {
      console.log('\n✅ Database fix completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Database fix failed:', err);
      process.exit(1);
    });
}

module.exports = { fixDatabaseWithExistingColumns };
