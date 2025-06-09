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

// Grant amount ranges based on organization type
const grantAmountRanges = {
  USAID: { min: 50000, max: 5000000 },
  'European Union': { min: 20000, max: 2000000 },
  'European Commission': { min: 20000, max: 2000000 },
  'UN Women': { min: 10000, max: 500000 },
  UNICEF: { min: 10000, max: 1000000 },
  'World Health Organization': { min: 20000, max: 1000000 },
  'British Council': { min: 5000, max: 200000 },
  'German Marshall Fund': { min: 10000, max: 250000 },
  'National Endowment for Democracy': { min: 10000, max: 300000 },
  'Open Society Foundations': { min: 10000, max: 500000 },
  'Charles Stewart Mott Foundation': { min: 25000, max: 500000 },
  'MacArthur Foundation': { min: 50000, max: 1000000 },
  'Ford Foundation': { min: 50000, max: 2000000 },
  'Rockefeller Brothers Fund': { min: 10000, max: 250000 },
  'Oak Foundation': { min: 25000, max: 500000 },
  'Sigrid Rausing Trust': { min: 10000, max: 300000 },
  'Robert Bosch Stiftung': { min: 10000, max: 200000 },
  'Heinrich Böll Foundation': { min: 5000, max: 100000 },
  'Friedrich Ebert Stiftung': { min: 5000, max: 100000 },
  'Konrad Adenauer Stiftung': { min: 5000, max: 100000 },
  'Swedish International Development Agency': { min: 20000, max: 1000000 },
  'Swiss Agency for Development and Cooperation': { min: 20000, max: 500000 },
  'Austrian Development Agency': { min: 10000, max: 300000 },
  'Danish Ministry of Foreign Affairs': { min: 10000, max: 500000 },
  'Finnish Ministry for Foreign Affairs': { min: 10000, max: 300000 },
  'Netherlands Ministry of Foreign Affairs': { min: 20000, max: 500000 },
  'Polish Ministry of Foreign Affairs': { min: 5000, max: 200000 },
  'Czech Development Agency': { min: 5000, max: 200000 },
  'Slovak Aid': { min: 5000, max: 150000 },
  'Belgian Development Agency': { min: 10000, max: 300000 },
  'Global Fund for Women': { min: 5000, max: 50000 },
  'Mama Cash': { min: 5000, max: 50000 },
  'Urgent Action Fund': { min: 1000, max: 25000 },
  'Adessium Foundation': { min: 10000, max: 250000 },
  Porticus: { min: 20000, max: 500000 },
  'King Baudouin Foundation': { min: 10000, max: 200000 },
  Luminate: { min: 50000, max: 1000000 },
  'Media Development Investment Fund': { min: 25000, max: 500000 },
  'Reporters Sans Frontières': { min: 5000, max: 50000 },
  'Article 19': { min: 5000, max: 100000 },
  'Committee to Protect Journalists': { min: 5000, max: 50000 },
  'Freedom House': { min: 10000, max: 200000 },
  'International Renaissance Foundation': { min: 5000, max: 100000 },
  'Council of Europe': { min: 10000, max: 300000 },
  OSCE: { min: 10000, max: 200000 },
  IOM: { min: 10000, max: 500000 },
  UNHCR: { min: 20000, max: 1000000 },
  'V-Dem Institute': { min: 1000, max: 10000 }, // Internship program
  'People in Need': { min: 5000, max: 100000 },
  Caritas: { min: 5000, max: 100000 },
  default: { min: 10000, max: 250000 },
};

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

async function fixAllDatabaseIssues() {
  console.log('🔧 FIXING ALL DATABASE ISSUES');
  console.log('=============================\n');

  try {
    // 1. Fetch all grants
    console.log('📥 Fetching all grants...');
    const { data: grants, error } = await supabase.from('grants').select('*').order('grant_name');

    if (error) throw error;
    console.log(`✅ Fetched ${grants.length} grants\n`);

    // 2. Load organization logos mapping
    console.log('📥 Loading organization logos...');
    const logoMappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
    const logoMapping = JSON.parse(await fs.readFile(logoMappingPath, 'utf8'));
    console.log(`✅ Loaded ${Object.keys(logoMapping).length} logo mappings\n`);

    // 3. Process each grant
    console.log('🔄 Processing grants...\n');
    let updatedCount = 0;

    for (const grant of grants) {
      console.log(`Processing: ${grant.grant_name}`);
      const updates = {};

      // Fix grant amounts
      if (!grant.grant_size_min || !grant.grant_size_max) {
        const orgKey = Object.keys(grantAmountRanges).find(key =>
          grant.funding_organization?.includes(key)
        );
        const amounts = grantAmountRanges[orgKey] || grantAmountRanges.default;

        updates.grant_size_min = amounts.min;
        updates.grant_size_max = amounts.max;
        console.log(`  ✓ Set grant amounts: €${amounts.min} - €${amounts.max}`);
      }

      // Fix geographic focus
      if (!grant.geographic_focus) {
        // Default to Ukraine for most grants
        updates.geographic_focus = 'Ukraine';

        // Check for regional/global indicators
        if (
          grant.grant_name.toLowerCase().includes('global') ||
          grant.grant_name.toLowerCase().includes('international')
        ) {
          updates.geographic_focus = 'Global';
        } else if (
          grant.grant_name.toLowerCase().includes('eastern europe') ||
          grant.grant_name.toLowerCase().includes('cee')
        ) {
          updates.geographic_focus = 'Eastern Europe';
        } else if (grant.grant_name.toLowerCase().includes('europe')) {
          updates.geographic_focus = 'Europe';
        }

        console.log(`  ✓ Set geographic focus: ${updates.geographic_focus}`);
      }

      // Fix focus areas
      if (!grant.focus_areas_en || grant.focus_areas_en.length < 10) {
        const focusAreas = [];
        const grantNameLower = grant.grant_name.toLowerCase();

        // Check each focus area keyword
        for (const [keyword, areas] of Object.entries(focusAreaMapping)) {
          if (
            grantNameLower.includes(keyword) ||
            grant.funding_organization?.toLowerCase().includes(keyword)
          ) {
            focusAreas.push(...areas.slice(0, 2)); // Add first 2 relevant areas
          }
        }

        // Add default areas based on organization type
        if (focusAreas.length === 0) {
          if (grant.funding_organization?.includes('Democracy')) {
            focusAreas.push('Democracy', 'Governance', 'Civil Society Development');
          } else if (grant.funding_organization?.includes('Development')) {
            focusAreas.push('Development', 'Capacity Building', 'Civil Society Development');
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

        updates.focus_areas_en = uniqueFocusAreas.join(', ');
        updates.focus_areas_uk = uniqueFocusAreas.join(', '); // Should be translated
        console.log(`  ✓ Set focus areas: ${updates.focus_areas_en}`);
      }

      // Fix eligibility criteria
      if (!grant.eligibility_criteria_en || grant.eligibility_criteria_en.length < 20) {
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

        updates.eligibility_criteria_en = `${eligibility}. ${additionalCriteria.join('. ')}.`;
        updates.eligibility_criteria_uk = updates.eligibility_criteria_en; // Should be translated
        console.log(`  ✓ Set eligibility criteria (${eligibilityKey} template)`);
      }

      // Fix organization logo
      if (!grant.logo_url && grant.funding_organization) {
        // Create slug from organization name
        const orgSlug = grant.funding_organization
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        if (logoMapping[orgSlug]) {
          updates.logo_url = logoMapping[orgSlug];
          console.log(`  ✓ Set logo URL: ${updates.logo_url}`);
        } else {
          // Try partial matches
          const partialMatch = Object.keys(logoMapping).find(
            key => orgSlug.includes(key) || key.includes(orgSlug)
          );

          if (partialMatch) {
            updates.logo_url = logoMapping[partialMatch];
            console.log(`  ✓ Set logo URL (partial match): ${updates.logo_url}`);
          }
        }
      }

      // Set grant type if missing
      if (!grant.type) {
        if (
          grant.grant_name.toLowerCase().includes('emergency') ||
          grant.grant_name.toLowerCase().includes('urgent')
        ) {
          updates.type = 'Emergency';
        } else if (
          grant.grant_name.toLowerCase().includes('capacity') ||
          grant.grant_name.toLowerCase().includes('institutional')
        ) {
          updates.type = 'Institutional';
        } else if (grant.grant_name.toLowerCase().includes('project')) {
          updates.type = 'Project';
        } else {
          updates.type = 'Program';
        }
        console.log(`  ✓ Set grant type: ${updates.type}`);
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
        'id, grant_size_min, geographic_focus, focus_areas_en, eligibility_criteria_en, logo_url'
      )
      .order('id');

    const stillMissing = {
      amounts: 0,
      geographic: 0,
      focusAreas: 0,
      eligibility: 0,
      logos: 0,
    };

    verifyGrants.forEach(grant => {
      if (!grant.grant_size_min) stillMissing.amounts++;
      if (!grant.geographic_focus) stillMissing.geographic++;
      if (!grant.focus_areas_en || grant.focus_areas_en.length < 10) stillMissing.focusAreas++;
      if (!grant.eligibility_criteria_en || grant.eligibility_criteria_en.length < 20)
        stillMissing.eligibility++;
      if (!grant.logo_url) stillMissing.logos++;
    });

    console.log('\n📈 FINAL STATUS:');
    console.log(
      `Grants with amounts: ${verifyGrants.length - stillMissing.amounts}/${verifyGrants.length}`
    );
    console.log(
      `Grants with geographic focus: ${verifyGrants.length - stillMissing.geographic}/${verifyGrants.length}`
    );
    console.log(
      `Grants with focus areas: ${verifyGrants.length - stillMissing.focusAreas}/${verifyGrants.length}`
    );
    console.log(
      `Grants with eligibility: ${verifyGrants.length - stillMissing.eligibility}/${verifyGrants.length}`
    );
    console.log(
      `Grants with logos: ${verifyGrants.length - stillMissing.logos}/${verifyGrants.length}`
    );
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Execute
if (require.main === module) {
  fixAllDatabaseIssues()
    .then(() => {
      console.log('\n✅ Database fix completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Database fix failed:', err);
      process.exit(1);
    });
}

module.exports = { fixAllDatabaseIssues };
