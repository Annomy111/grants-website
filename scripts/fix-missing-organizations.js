#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping of grant names to their correct organizations
const organizationMappings = [
  {
    namePattern: /WHO.*Ukraine.*Health/i,
    organization_en: 'World Health Organization (WHO)',
    organization_uk: 'Всесвітня організація охорони здоров\'я (ВООЗ)'
  },
  {
    namePattern: /IOM.*Community.*Stabilization/i,
    organization_en: 'International Organization for Migration (IOM)',
    organization_uk: 'Міжнародна організація з міграції (МОМ)'
  },
  {
    namePattern: /ICMP.*Small.*Grants/i,
    organization_en: 'International Commission on Missing Persons (ICMP)',
    organization_uk: 'Міжнародна комісія з питань зниклих безвісти (ICMP)'
  },
  {
    namePattern: /U\.?S\.?.*Embassy.*Kyiv.*Democracy/i,
    organization_en: 'U.S. Embassy Kyiv',
    organization_uk: 'Посольство США в Києві'
  },
  {
    namePattern: /HOLD ON.*SetUp/i,
    organization_en: 'HOLD ON',
    organization_uk: 'HOLD ON'
  },
  {
    namePattern: /Internal.*Security.*Fund.*ISF/i,
    organization_en: 'European Union',
    organization_uk: 'Європейський Союз'
  },
  {
    namePattern: /SlovakAid.*Small.*Grants/i,
    organization_en: 'Slovak Aid',
    organization_uk: 'Словацька допомога'
  }
];

// Also check by ID if names are missing
const organizationByIdMappings = {
  297: {
    organization_en: 'World Health Organization (WHO)',
    organization_uk: 'Всесвітня організація охорони здоров\'я (ВООЗ)'
  },
  293: {
    organization_en: 'International Organization for Migration (IOM)',
    organization_uk: 'Міжнародна організація з міграції (МОМ)'
  },
  292: {
    organization_en: 'International Commission on Missing Persons (ICMP)',
    organization_uk: 'Міжнародна комісія з питань зниклих безвісти (ICMP)'
  },
  290: {
    organization_en: 'U.S. Embassy Kyiv',
    organization_uk: 'Посольство США в Києві'
  },
  289: {
    organization_en: 'HOLD ON',
    organization_uk: 'HOLD ON'
  },
  288: {
    organization_en: 'European Union',
    organization_uk: 'Європейський Союз'
  },
  295: {
    organization_en: 'Slovak Aid',
    organization_uk: 'Словацька допомога'
  }
};

async function fixMissingOrganizations() {
  try {
    console.log('Fetching grants with missing funding organizations...');
    
    // First, let's find grants with missing funding_organization
    const { data: missingOrgGrants, error: fetchError } = await supabase
      .from('grants')
      .select('id, grant_name, funding_organization')
      .or('funding_organization.is.null,funding_organization.eq.');
    
    if (fetchError) {
      console.error('Error fetching grants:', fetchError);
      return;
    }
    
    console.log(`Found ${missingOrgGrants.length} grants with missing funding organization:\n`);
    
    if (missingOrgGrants.length === 0) {
      console.log('No grants found with missing funding organizations.');
      return;
    }
    
    // Display the grants we found
    missingOrgGrants.forEach(grant => {
      console.log(`ID: ${grant.id}`);
      console.log(`Grant Name: ${grant.grant_name || 'MISSING'}`);
      console.log(`Current funding_organization: ${grant.funding_organization || 'NULL/EMPTY'}`);
      console.log('---');
    });
    
    // Now update each grant with the correct organization
    console.log('\nFixing organizations...\n');
    
    for (const grant of missingOrgGrants) {
      const grantName = grant.grant_name || '';
      let mapping = null;
      
      // First try to find matching organization by name pattern
      const nameMapping = organizationMappings.find(m => m.namePattern.test(grantName));
      
      // If no name match found, try ID mapping
      if (!nameMapping && organizationByIdMappings[grant.id]) {
        mapping = organizationByIdMappings[grant.id];
        console.log(`Using ID mapping for grant ${grant.id}`);
      } else {
        mapping = nameMapping;
      }
      
      if (mapping) {
        console.log(`Updating grant ID ${grant.id}: "${grantName || 'NO NAME'}" `);
        console.log(`  -> Setting organization to: ${mapping.organization_en}`);
        
        const { error: updateError } = await supabase
          .from('grants')
          .update({
            funding_organization: mapping.organization_en,
            funding_organization_uk: mapping.organization_uk
          })
          .eq('id', grant.id);
        
        if (updateError) {
          console.error(`  ERROR updating grant ${grant.id}:`, updateError);
        } else {
          console.log(`  ✓ Successfully updated grant ${grant.id}`);
        }
      } else {
        console.log(`WARNING: No mapping found for grant ID ${grant.id}: "${grantName}"`);
      }
      console.log('');
    }
    
    // Verify the updates
    console.log('\nVerifying updates...');
    const { data: verifyGrants, error: verifyError } = await supabase
      .from('grants')
      .select('id, grant_name, funding_organization, funding_organization_uk')
      .in('id', missingOrgGrants.map(g => g.id));
    
    if (verifyError) {
      console.error('Error verifying updates:', verifyError);
    } else {
      console.log('\nUpdated grants:');
      verifyGrants.forEach(grant => {
        console.log(`ID ${grant.id}: ${grant.funding_organization} / ${grant.funding_organization_uk}`);
      });
    }
    
    console.log('\n✓ Script completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
fixMissingOrganizations();