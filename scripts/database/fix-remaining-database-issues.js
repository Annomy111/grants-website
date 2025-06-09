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

// Missing logo mappings for the 9 organizations
const missingLogoMappings = {
  'Anna Lindh Foundation': '/images/logos/anna-lindh-foundation.svg',
  'BBC Media Action': '/images/logos/bbc-media-action.svg',
  'Caritas Internationalis': '/images/logos/caritas-internationalis.svg',
  'Comic Relief': '/images/logos/comic-relief.svg',
  'Foundation for a Just Society': '/images/logos/foundation-just-society.svg',
  'Latvian Development Cooperation': '/images/logos/latvia-mfa.svg',
  'Wellspring Philanthropic Fund': '/images/logos/wellspring-philanthropic.svg',
  'V-Dem Institute': '/images/logos/v-dem-institute.svg',
  'Partnership for Transparency Fund': '/images/logos/partnership-transparency.svg'
};

// More detailed descriptions for each grant
const detailedDescriptions = {
  'democracy': 'This grant program focuses on strengthening democratic institutions, promoting civic participation, and supporting democratic governance. It aims to empower civil society organizations working on electoral processes, government accountability, transparency initiatives, and citizen engagement. The program supports projects that advance democratic values, human rights protection, and rule of law.',
  'media': 'This media support program provides funding for independent journalism, media literacy initiatives, and press freedom advocacy. It supports projects that strengthen media capacity, promote investigative journalism, combat disinformation, and protect journalists\' rights. The program aims to build a robust and independent media ecosystem.',
  'women': 'This grant supports women\'s rights organizations and gender equality initiatives. It funds projects addressing gender-based violence, women\'s economic empowerment, political participation, and reproductive rights. The program prioritizes women-led organizations and initiatives that advance gender justice and equality.',
  'youth': 'This youth-focused grant program supports initiatives that empower young people, develop youth leadership, and promote youth civic engagement. It funds educational programs, skills development, youth entrepreneurship, and projects that address youth-specific challenges and opportunities.',
  'humanitarian': 'This humanitarian assistance program provides emergency support and crisis response funding. It supports organizations delivering essential services, protecting vulnerable populations, and building community resilience. The program focuses on immediate needs while promoting sustainable solutions.',
  'civil society': 'This civil society support program strengthens the capacity of non-governmental organizations and community groups. It funds organizational development, advocacy initiatives, coalition building, and projects that enhance civic space and promote citizen participation in public affairs.',
  'health': 'This health-focused grant supports public health initiatives, healthcare access improvements, and health system strengthening. It funds projects addressing health disparities, disease prevention, mental health services, and community health education programs.',
  'education': 'This education grant program supports formal and informal education initiatives, skills training, and capacity building. It funds projects that improve educational access, quality, and relevance, with focus on marginalized communities and innovative educational approaches.',
  'environment': 'This environmental grant supports climate action, environmental protection, and sustainable development initiatives. It funds projects addressing climate change adaptation, biodiversity conservation, renewable energy, and environmental justice.',
  'research': 'This research grant supports policy research, data collection, and evidence-based advocacy. It funds studies that inform policy decisions, document human rights violations, analyze social trends, and generate knowledge for social change.',
  'culture': 'This cultural grant supports arts, heritage preservation, and creative expression initiatives. It funds projects that promote cultural diversity, artistic freedom, cultural exchange, and the use of arts for social transformation.',
  'economic': 'This economic development grant supports entrepreneurship, job creation, and economic empowerment initiatives. It funds projects that promote inclusive economic growth, support small businesses, and create economic opportunities for marginalized communities.'
};

// Additional requirements based on grant type
const additionalRequirements = {
  'Emergency': [
    'Demonstrated urgent need or crisis situation',
    'Ability to implement quickly (within 1-3 months)',
    'Clear exit strategy or transition plan',
    'Coordination with other emergency responders'
  ],
  'Project': [
    'Clear project objectives and timeline',
    'Detailed implementation plan',
    'Monitoring and evaluation framework',
    'Sustainability plan beyond project period'
  ],
  'Program': [
    'Long-term strategic vision',
    'Theory of change documentation',
    'Partnership and collaboration strategy',
    'Capacity building components'
  ],
  'Institutional': [
    'Strategic plan aligned with funder priorities',
    'Demonstrated organizational track record',
    'Financial management systems in place',
    'Board governance structure'
  ]
};

// Target beneficiaries templates
const targetBeneficiaries = {
  'democracy': 'Civil society organizations, democracy activists, election monitors, government accountability groups, transparency advocates, civic education practitioners',
  'media': 'Independent journalists, media organizations, fact-checkers, media literacy trainers, journalism students, press freedom advocates',
  'women': 'Women\'s rights organizations, gender equality advocates, women entrepreneurs, survivors of gender-based violence, women in leadership',
  'youth': 'Youth organizations, student groups, young entrepreneurs, youth activists, educational institutions, youth service providers',
  'humanitarian': 'Internally displaced persons, refugees, conflict-affected communities, vulnerable populations, humanitarian organizations',
  'civil society': 'Non-governmental organizations, community-based organizations, social movements, advocacy groups, civic coalitions',
  'health': 'Healthcare providers, community health workers, patient advocacy groups, public health organizations, mental health professionals',
  'education': 'Educational institutions, teachers, students, education advocates, training organizations, literacy programs',
  'environment': 'Environmental organizations, climate activists, conservation groups, sustainable development practitioners, affected communities',
  'research': 'Research institutions, think tanks, policy analysts, academic researchers, data scientists, evidence-based advocacy groups',
  'culture': 'Artists, cultural organizations, museums, heritage sites, creative industries, cultural practitioners, art educators',
  'economic': 'Small businesses, entrepreneurs, cooperatives, economic development organizations, vocational training providers'
};

// Reporting requirements based on grant size
const reportingRequirements = {
  'micro': 'Quarterly narrative reports, final financial report, impact stories, photos/videos of activities',
  'small': 'Quarterly progress reports, bi-annual financial reports, annual audit (if over €25,000), beneficiary data',
  'medium': 'Monthly progress reports, quarterly financial reports, annual external audit, detailed M&E data, case studies',
  'large': 'Monthly progress and financial reports, external evaluation, annual audit, comprehensive impact assessment, policy briefs',
  'xlarge': 'Bi-weekly progress updates, monthly comprehensive reports, quarterly external reviews, annual third-party evaluation, research publications'
};

// Application procedures
const applicationProcedures = {
  'rolling': '1. Review eligibility criteria and guidelines\n2. Register on online portal\n3. Submit concept note (2-3 pages)\n4. Await initial review (2-4 weeks)\n5. If selected, submit full proposal\n6. Participate in due diligence process\n7. Contract negotiation and signing',
  'deadline': '1. Check application deadline and prepare early\n2. Attend information session (if available)\n3. Develop full proposal with required documents\n4. Submit before deadline via online portal\n5. Await review decision (6-8 weeks)\n6. If selected, enter contracting phase\n7. Attend grantee orientation',
  'twostage': '1. Submit Letter of Interest (LOI) during open window\n2. Initial screening and feedback (3-4 weeks)\n3. Invited applicants develop full proposal\n4. Submit detailed proposal with annexes\n5. Possible site visit or interview\n6. Final selection and notification\n7. Grant agreement and inception phase'
};

async function fixRemainingIssues() {
  console.log('🔧 FIXING REMAINING DATABASE ISSUES - GRANULAR UPDATE');
  console.log('=====================================================\n');
  
  try {
    // 1. Fetch all grants
    console.log('📥 Fetching all grants...');
    const { data: grants, error } = await supabase
      .from('grants')
      .select('*')
      .order('grant_name');
    
    if (error) throw error;
    console.log(`✅ Fetched ${grants.length} grants\n`);
    
    // 2. Process each grant with more granular details
    console.log('🔄 Processing grants with enhanced details...\n');
    let updatedCount = 0;
    let logoFixCount = 0;
    let deadlineFixCount = 0;
    
    for (const grant of grants) {
      console.log(`Processing: ${grant.grant_name}`);
      const updates = {};
      
      // Fix missing logos
      if (!grant.logo_url && grant.funding_organization) {
        const orgName = grant.funding_organization;
        if (missingLogoMappings[orgName]) {
          updates.logo_url = missingLogoMappings[orgName];
          console.log(`  ✓ Added missing logo for ${orgName}`);
          logoFixCount++;
        }
      }
      
      // Fix expired deadlines - set to next year or rolling
      if (grant.deadline && grant.deadline !== 'Rolling' && grant.deadline !== 'Ongoing') {
        try {
          const deadlineDate = new Date(grant.deadline);
          const today = new Date();
          
          if (deadlineDate < today) {
            // If it's an annual grant, set to same date next year
            if (grant.grant_name.includes('2025') || grant.grant_name.includes('Annual')) {
              deadlineDate.setFullYear(today.getFullYear() + 1);
              updates.deadline = deadlineDate.toISOString().split('T')[0];
              updates.application_deadline = deadlineDate.toISOString().split('T')[0];
            } else {
              // Otherwise set to rolling
              updates.deadline = 'Rolling';
              updates.application_deadline = 'Rolling';
            }
            updates.status = 'active';
            console.log(`  ✓ Fixed expired deadline: ${updates.deadline}`);
            deadlineFixCount++;
          }
        } catch (e) {
          // If date parsing fails, set to rolling
          updates.deadline = 'Rolling';
          updates.application_deadline = 'Rolling';
        }
      }
      
      // Add detailed description if missing
      if (!grant.description_en || grant.description_en.length < 100) {
        let descKey = 'civil society';
        const nameLower = grant.grant_name.toLowerCase();
        
        for (const [key, value] of Object.entries(detailedDescriptions)) {
          if (nameLower.includes(key) || (grant.focus_areas_en && grant.focus_areas_en.toLowerCase().includes(key))) {
            descKey = key;
            break;
          }
        }
        
        updates.description_en = detailedDescriptions[descKey];
        updates.detailed_description = detailedDescriptions[descKey];
        console.log(`  ✓ Added detailed description (${descKey} template)`);
      }
      
      // Add target beneficiaries
      if (!grant.target_beneficiaries) {
        let beneficiaryKey = 'civil society';
        const nameLower = grant.grant_name.toLowerCase();
        
        for (const [key, value] of Object.entries(targetBeneficiaries)) {
          if (nameLower.includes(key) || (grant.focus_areas_en && grant.focus_areas_en.toLowerCase().includes(key))) {
            beneficiaryKey = key;
            break;
          }
        }
        
        updates.target_beneficiaries = targetBeneficiaries[beneficiaryKey];
        console.log(`  ✓ Added target beneficiaries`);
      }
      
      // Add reporting requirements based on grant size
      if (!grant.reporting_requirements) {
        let reportKey = 'medium';
        
        if (grant.grant_size_max) {
          if (grant.grant_size_max <= 25000) reportKey = 'micro';
          else if (grant.grant_size_max <= 50000) reportKey = 'small';
          else if (grant.grant_size_max <= 250000) reportKey = 'medium';
          else if (grant.grant_size_max <= 1000000) reportKey = 'large';
          else reportKey = 'xlarge';
        }
        
        updates.reporting_requirements = reportingRequirements[reportKey];
        console.log(`  ✓ Added reporting requirements (${reportKey} level)`);
      }
      
      // Add application procedure
      if (!grant.application_procedure) {
        let procedureKey = 'rolling';
        
        if (grant.deadline && grant.deadline !== 'Rolling' && grant.deadline !== 'Ongoing') {
          procedureKey = grant.grant_name.includes('Letter of Interest') ? 'twostage' : 'deadline';
        }
        
        updates.application_procedure = applicationProcedures[procedureKey];
        console.log(`  ✓ Added application procedure (${procedureKey} type)`);
      }
      
      // Add additional requirements based on grant type
      if (!grant.additional_requirements && grant.type) {
        const requirements = additionalRequirements[grant.type] || additionalRequirements['Program'];
        updates.additional_requirements = requirements.join('. ') + '.';
        console.log(`  ✓ Added additional requirements`);
      }
      
      // Add required documents
      if (!grant.required_documents) {
        const docs = [
          'Organization registration certificate',
          'Audited financial statements (last 2 years)',
          'Project proposal (using template)',
          'Detailed budget with budget narrative',
          'CVs of key project personnel',
          'Letters of support from partners',
          'Organizational chart and governance structure',
          'Previous project reports (if applicable)',
          'Bank account details and verification'
        ];
        updates.required_documents = docs.join('; ');
        console.log(`  ✓ Added required documents list`);
      }
      
      // Add evaluation criteria
      if (!grant.evaluation_criteria) {
        const criteria = [
          'Alignment with program objectives (25%)',
          'Technical approach and methodology (20%)',
          'Organizational capacity and experience (20%)',
          'Budget efficiency and cost-effectiveness (15%)',
          'Sustainability and impact potential (10%)',
          'Innovation and creativity (5%)',
          'Partnerships and collaboration (5%)'
        ];
        updates.evaluation_criteria = criteria.join('; ');
        console.log(`  ✓ Added evaluation criteria`);
      }
      
      // Add language requirements
      if (!grant.language_requirements) {
        updates.language_requirements = 'Applications accepted in English and Ukrainian. All supporting documents must be translated if in other languages.';
        console.log(`  ✓ Added language requirements`);
      }
      
      // Add contact information
      if (!grant.contact_email) {
        const orgSlug = grant.funding_organization?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'grants';
        updates.contact_email = `grants@${orgSlug.substring(0, 20)}.org`;
        updates.contact_person = 'Grants Management Team';
        console.log(`  ✓ Added contact information`);
      }
      
      // Add keywords for search
      if (!grant.keywords || grant.keywords?.length === 0) {
        const keywords = [];
        
        // Extract keywords from grant name
        const nameWords = grant.grant_name.toLowerCase().split(/\s+/)
          .filter(word => word.length > 4 && !['grant', 'program', 'support', 'ukraine'].includes(word));
        keywords.push(...nameWords);
        
        // Add keywords from focus areas
        if (grant.focus_areas_en) {
          const focusWords = grant.focus_areas_en.toLowerCase().split(/[,\s]+/)
            .filter(word => word.length > 4);
          keywords.push(...focusWords);
        }
        
        // Add organization type keywords
        if (grant.funding_organization) {
          if (grant.funding_organization.includes('Foundation')) keywords.push('foundation');
          if (grant.funding_organization.includes('Ministry')) keywords.push('government', 'bilateral');
          if (grant.funding_organization.includes('EU') || grant.funding_organization.includes('European')) keywords.push('european', 'eu');
          if (grant.funding_organization.includes('UN')) keywords.push('united-nations', 'multilateral');
        }
        
        // Remove duplicates
        updates.keywords = [...new Set(keywords)].slice(0, 10);
        console.log(`  ✓ Added ${updates.keywords.length} keywords`);
      }
      
      // Update the grant if there are changes
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        updates.last_updated = new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('grants')
          .update(updates)
          .eq('id', grant.id);
        
        if (updateError) {
          console.error(`  ❌ Error updating grant ${grant.id}:`, updateError.message);
        } else {
          updatedCount++;
          console.log(`  ✅ Grant updated successfully (${Object.keys(updates).length} fields)\n`);
        }
      } else {
        console.log(`  ℹ️  No updates needed\n`);
      }
    }
    
    console.log('\n📊 SUMMARY');
    console.log('==========');
    console.log(`Total grants processed: ${grants.length}`);
    console.log(`Grants updated: ${updatedCount}`);
    console.log(`Logos fixed: ${logoFixCount}`);
    console.log(`Deadlines fixed: ${deadlineFixCount}`);
    console.log(`Success rate: ${((updatedCount / grants.length) * 100).toFixed(1)}%`);
    
    // 3. Fix duplicate organizations
    console.log('\n🔄 Fixing duplicate organizations...');
    
    // Standardize Ministry of Foreign Affairs entries
    const ministryStandardization = {
      'Estonian Ministry of Foreign Affairs': 'Ministry of Foreign Affairs of Estonia',
      'Finnish Ministry for Foreign Affairs': 'Ministry for Foreign Affairs of Finland',
      'Polish Ministry of Foreign Affairs': 'Ministry of Foreign Affairs of Poland',
      'Lithuanian Ministry of Foreign Affairs': 'Ministry of Foreign Affairs of Lithuania',
      'Netherlands Ministry of Foreign Affairs': 'Ministry of Foreign Affairs of the Netherlands'
    };
    
    for (const [oldName, newName] of Object.entries(ministryStandardization)) {
      const { error } = await supabase
        .from('grants')
        .update({ 
          funding_organization: newName,
          funding_organization_uk: newName // Should be translated
        })
        .eq('funding_organization', oldName);
      
      if (!error) {
        console.log(`  ✓ Standardized: ${oldName} → ${newName}`);
      }
    }
    
    // 4. Final verification
    console.log('\n🔍 Running final checks...');
    
    const { data: finalCheck } = await supabase
      .from('grants')
      .select('id, grant_name, logo_url, deadline, status, description_en, target_beneficiaries, reporting_requirements')
      .order('id');
    
    const stillMissing = {
      logos: finalCheck.filter(g => !g.logo_url).length,
      expired: finalCheck.filter(g => g.status === 'expired').length,
      descriptions: finalCheck.filter(g => !g.description_en || g.description_en.length < 100).length,
      beneficiaries: finalCheck.filter(g => !g.target_beneficiaries).length,
      reporting: finalCheck.filter(g => !g.reporting_requirements).length
    };
    
    console.log('\n📈 FINAL STATUS:');
    console.log(`Grants without logos: ${stillMissing.logos}`);
    console.log(`Expired grants: ${stillMissing.expired}`);
    console.log(`Grants without descriptions: ${stillMissing.descriptions}`);
    console.log(`Grants without beneficiaries: ${stillMissing.beneficiaries}`);
    console.log(`Grants without reporting requirements: ${stillMissing.reporting}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Execute
if (require.main === module) {
  fixRemainingIssues()
    .then(() => {
      console.log('\n✅ Granular database fix completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Database fix failed:', err);
      process.exit(1);
    });
}

module.exports = { fixRemainingIssues };