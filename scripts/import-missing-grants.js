const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   Please ensure REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Extract program type from grant name and organization
 * @param {string} grantName - Name of the grant
 * @param {string} organization - Funding organization
 * @returns {string} Program type
 */
function extractProgramType(grantName, organization) {
  const name = grantName.toLowerCase();

  if (name.includes('fellowship')) return 'Fellowship';
  if (name.includes('scholarship')) return 'Scholarship';
  if (name.includes('innovation') || name.includes('startup')) return 'Innovation Grant';
  if (name.includes('research')) return 'Research Grant';
  if (name.includes('emergency') || name.includes('humanitarian')) return 'Emergency Relief';
  if (name.includes('capacity') || name.includes('training')) return 'Capacity Building';
  if (name.includes('small grants') || name.includes('micro')) return 'Small Grant';
  if (name.includes('cooperation') || name.includes('partnership')) return 'Partnership Grant';
  if (name.includes('recovery') || name.includes('reconstruction')) return 'Recovery Grant';
  if (name.includes('women') || name.includes('gender')) return 'Gender-focused Grant';
  
  return 'Project Grant'; // Default
}

/**
 * Extract grant size range from grant amount text
 * @param {string} grantAmount - Grant amount text
 * @returns {object} Object with min and max values in EUR
 */
function extractGrantSize(grantAmount) {
  if (!grantAmount) return { min: null, max: null };
  
  // Convert to lowercase for easier parsing
  const amount = grantAmount.toLowerCase();
  
  // Extract numbers with various formats
  const numbers = amount.match(/[\d,]+/g);
  if (!numbers) return { min: null, max: null };
  
  // Clean numbers (remove commas)
  const cleanNumbers = numbers.map(n => parseInt(n.replace(/,/g, '')));
  
  // Handle currency conversions (rough estimates)
  let multiplier = 1;
  if (amount.includes('$') || amount.includes('usd')) {
    multiplier = 0.92; // USD to EUR
  } else if (amount.includes('£') || amount.includes('gbp')) {
    multiplier = 1.16; // GBP to EUR
  } else if (amount.includes('₴') || amount.includes('uah')) {
    multiplier = 0.024; // UAH to EUR
  }
  
  // Determine min and max
  if (cleanNumbers.length >= 2) {
    return {
      min: Math.round(cleanNumbers[0] * multiplier),
      max: Math.round(cleanNumbers[1] * multiplier)
    };
  } else if (cleanNumbers.length === 1) {
    if (amount.includes('up to')) {
      return { min: null, max: Math.round(cleanNumbers[0] * multiplier) };
    } else {
      return { min: Math.round(cleanNumbers[0] * multiplier), max: null };
    }
  }
  
  return { min: null, max: null };
}

/**
 * Generate keywords from grant data
 * @param {object} grant - Grant object
 * @returns {array} Array of keywords
 */
function generateKeywords(grant) {
  const keywords = [];
  
  // Add words from grant name
  const nameWords = grant.grant_name.toLowerCase().split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['grant', 'program', 'fund', 'the', 'for', 'and'].includes(word));
  keywords.push(...nameWords);
  
  // Add organization keywords
  const orgWords = grant.funding_organization.toLowerCase().split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['foundation', 'organization', 'the', 'for', 'and'].includes(word));
  keywords.push(...orgWords);
  
  // Add focus area keywords
  if (grant.focus_areas) {
    const focusWords = grant.focus_areas.toLowerCase().split(/[,;]/)
      .map(word => word.trim())
      .filter(word => word.length > 3);
    keywords.push(...focusWords);
  }
  
  // Remove duplicates
  return [...new Set(keywords)];
}

async function importMissingGrants() {
  try {
    console.log('🚀 Starting import of missing grants...');
    
    // Define the missing grants based on the verification report
    const missingGrants = [
      {
        grant_name: "Embassy of Finland's Fund for Local Cooperation",
        funding_organization: "Embassy of Finland in Kyiv",
        country_region: "Finland/Ukraine",
        eligibility_criteria: "Ukrainian civil society organizations (non-governmental, non-profit), registered at least three years prior. Proven experience with projects of at least €50,000 budget and financial capacity to cover part of project costs. Ineligible: individuals, political parties, basic research, single cultural events, charity, humanitarian aid (direct), personal grants.",
        focus_areas: "Supporting the resilience of Ukrainian society. Specifically: 1. Strengthening good governance, rule of law, human rights, and democracy. 2. Empowering women and advancing gender equality (women's rights, participation in decision-making, social inclusion, SRHR).",
        grant_amount: "€75,000 - €100,000 (Total of approx. €300,000 for 3-4 projects)",
        application_deadline: "May 31, 2025 (EXPIRED)",
        duration: "Maximum 24 months",
        website_link: "https://finlandabroad.fi/web/ukr/fund-for-local-cooperation",
        status: "inactive"
      },
      {
        grant_name: "US Embassy's Democracy Small Grants Program",
        funding_organization: "US Embassy in Ukraine",
        country_region: "United States/Ukraine",
        eligibility_criteria: "Ukrainian NGOs, civil society organizations, media organizations, academic institutions. Must be registered in Ukraine. Focus on democracy, human rights, and rule of law initiatives.",
        focus_areas: "Democracy promotion, human rights, rule of law, civic education, veteran support, media freedom, anti-corruption, transparency and accountability",
        grant_amount: "$5,000 - $24,000",
        application_deadline: "Rolling basis (EXPIRED)",
        duration: "Up to 12 months",
        website_link: "https://ua.usembassy.gov/education-culture/democracy-grants/",
        status: "inactive"
      },
      {
        grant_name: "UNEP Hazardous Waste Management Initiative",
        funding_organization: "United Nations Environment Programme (UNEP)",
        country_region: "International/Ukraine",
        eligibility_criteria: "Local authorities, NGOs working on environmental issues, environmental organizations with hazardous waste management expertise",
        focus_areas: "Environmental recovery from war-related damage, hazardous waste management, environmental protection, green recovery",
        grant_amount: "Varies by project scope",
        application_deadline: "To be announced",
        duration: "Project-based",
        website_link: "https://www.unep.org/",
        status: "active"
      },
      {
        grant_name: "Pact Institutional and Project Grants (RFA P4767-2023-06)",
        funding_organization: "Pact",
        country_region: "United States/Ukraine",
        eligibility_criteria: "Ukrainian CSOs with proven track record, institutional capacity, and experience in relevant thematic areas",
        focus_areas: "Civil society strengthening, organizational development, community mobilization, advocacy, governance",
        grant_amount: "Up to $100,000 (larger amounts considered if justified)",
        application_deadline: "Rolling basis until final cut-off (EXPIRED)",
        duration: "Varies by project",
        website_link: "https://www.pactworld.org/",
        status: "inactive"
      },
      {
        grant_name: "Ukrainian Women's Fund",
        funding_organization: "Ukrainian Women's Fund",
        country_region: "Ukraine",
        eligibility_criteria: "Women's rights organizations, feminist groups, initiatives supporting women and girls in Ukraine",
        focus_areas: "Women's rights, gender equality, prevention of gender-based violence, women's political participation, economic empowerment of women",
        grant_amount: "Small grants up to ₴150,000",
        application_deadline: "Regular calls throughout the year",
        duration: "Up to 12 months",
        website_link: "https://uwf.org.ua/",
        status: "active"
      },
      {
        grant_name: "Nova Ukraine Emergency Bridge Financing",
        funding_organization: "Nova Ukraine",
        country_region: "United States/Ukraine",
        eligibility_criteria: "Ukrainian nonprofits providing humanitarian aid, medical assistance, or emergency relief services",
        focus_areas: "Emergency humanitarian assistance, medical aid, refugee support, emergency supplies, bridge financing for critical needs",
        grant_amount: "Varies based on need",
        application_deadline: "Rolling basis",
        duration: "Emergency response timeframe",
        website_link: "https://novaukraine.org/",
        status: "active"
      },
      {
        grant_name: "SPIRIT Program - Supporting People Impacted by Russia's Invasion Together",
        funding_organization: "UK Government",
        country_region: "United Kingdom/Ukraine",
        eligibility_criteria: "Ukrainian CSOs, community organizations working on social recovery and community resilience",
        focus_areas: "Social recovery, community resilience, psychosocial support, veteran reintegration, IDP support, community cohesion",
        grant_amount: "Varies by project",
        application_deadline: "To be announced",
        duration: "Multi-year programs",
        website_link: "https://www.gov.uk/",
        status: "active"
      },
      {
        grant_name: "World Bank Recovery and Reconstruction Programs",
        funding_organization: "World Bank",
        country_region: "International/Ukraine",
        eligibility_criteria: "Government agencies, implementing partners, CSOs involved in reconstruction monitoring and community engagement",
        focus_areas: "Infrastructure reconstruction, economic recovery, social services restoration, transparency in reconstruction, community participation in recovery planning",
        grant_amount: "Large-scale funding (varies by component)",
        application_deadline: "Various components with different timelines",
        duration: "Multi-year programs",
        website_link: "https://www.worldbank.org/en/country/ukraine",
        status: "active"
      },
      {
        grant_name: "German Marshall Fund Ukraine: Relief, Resilience, Recovery (U3R) Program",
        funding_organization: "German Marshall Fund of the United States",
        country_region: "United States/Ukraine",
        eligibility_criteria: "Ukrainian CSOs, independent media organizations, civic initiatives working on democracy, resilience, and recovery",
        focus_areas: "Emergency support, media development, CSO capacity building, resilience and recovery, civic participation in reconstruction planning",
        grant_amount: "Up to $25,000",
        application_deadline: "Rolling basis (reviewed every 6-8 weeks)",
        duration: "Flexible based on project needs",
        website_link: "https://www.gmfus.org/action/democratic-resilience/ukraine-relief-resilience-recovery-u3r",
        status: "active"
      }
    ];
    
    // Process each grant
    for (const grant of missingGrants) {
      // Generate additional fields
      const programType = extractProgramType(grant.grant_name, grant.funding_organization);
      const keywords = generateKeywords(grant);
      const { min: grantSizeMin, max: grantSizeMax } = extractGrantSize(grant.grant_amount);
      
      // Prepare grant data
      const grantData = {
        ...grant,
        program_type: programType,
        keywords: keywords,
        target_beneficiaries: grant.eligibility_criteria,
        geographical_scope: grant.country_region,
        
        // Grant size fields
        grant_size_min: grantSizeMin,
        grant_size_max: grantSizeMax,
        
        // Geographic focus (extract from country/region)
        geographic_focus: grant.country_region?.includes('Ukraine') ? 'Ukraine' : 
                         grant.country_region?.includes('International') ? 'International' : 
                         'Europe',
        
        // Type field
        type: programType,
        
        // English versions of fields
        description_en: grant.focus_areas,
        focus_areas_en: grant.focus_areas,
        eligibility_criteria_en: grant.eligibility_criteria,
        
        // Additional fields from latest migration
        website: grant.website_link,
        deadline: grant.application_deadline,
        website_status: 'active',
        logo_url: null, // To be added later
        
        // Default values for additional fields
        detailed_description: null,
        contact_email: null,
        contact_phone: null,
        contact_person: null,
        application_procedure: null,
        required_documents: null,
        additional_requirements: null,
        language_requirements: null,
        partnership_requirements: false,
        renewable: false,
        application_fee: null,
        reporting_requirements: null,
        evaluation_criteria: null,
        
        // Ukrainian translations (to be added later)
        grant_name_uk: null,
        funding_organization_uk: null,
        country_region_uk: null,
        eligibility_criteria_uk: null,
        focus_areas_uk: null,
        grant_amount_uk: null,
        duration_uk: null,
        application_procedure_uk: null,
        required_documents_uk: null,
        evaluation_criteria_uk: null,
        additional_requirements_uk: null,
        reporting_requirements_uk: null,
        detailed_description_uk: null,
        description_uk: null,
        
        // Standard fields
        featured: false,
        view_count: 0,
        
        // Ensure we have a valid website link
        website_link: grant.website_link || null,
        application_url: grant.website_link || null
      };
      
      // Insert the grant
      const { data, error } = await supabase
        .from('grants')
        .insert(grantData)
        .select('id, grant_name');
      
      if (error) {
        console.error(`❌ Error importing "${grant.grant_name}":`, error.message);
      } else {
        console.log(`✅ Successfully imported: ${grant.grant_name} (ID: ${data[0].id})`);
      }
    }
    
    console.log('\n🎉 Import process completed!');
    
    // Verify the import
    console.log('\n📊 Verifying imported grants...');
    
    for (const grant of missingGrants) {
      const { data, error } = await supabase
        .from('grants')
        .select('id, grant_name, status')
        .eq('grant_name', grant.grant_name)
        .single();
      
      if (error) {
        console.log(`❌ Not found: ${grant.grant_name}`);
      } else {
        console.log(`✅ Verified: ${grant.grant_name} (ID: ${data.id}, Status: ${data.status})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importMissingGrants();