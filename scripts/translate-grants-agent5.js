const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGrantsForTranslation() {
  console.log('Ukrainian Translation Agent 5 - Starting mission...\n');
  
  try {
    // Check grants starting from ID 229
    const { data: grants, error } = await supabase
      .from('grants')
      .select('*')
      .gte('id', 229)
      .order('id', { ascending: true })
      .limit(30);

    if (error) {
      console.error('Error fetching grants:', error);
      return;
    }

    console.log(`Found ${grants.length} grants starting from ID 229\n`);
    
    // Check which grants need translation
    const grantsNeedingTranslation = [];
    
    for (const grant of grants) {
      // Check if Ukrainian translation already exists
      if (!grant.grant_name_uk || !grant.funding_organization_uk || !grant.focus_areas_uk) {
        grantsNeedingTranslation.push(grant);
      }
    }
    
    console.log(`Grants needing translation: ${grantsNeedingTranslation.length}\n`);
    
    // Display first 25 grants that need translation
    const grantsToTranslate = grantsNeedingTranslation.slice(0, 25);
    
    console.log('Grants to translate in this batch:');
    console.log('=====================================\n');
    
    grantsToTranslate.forEach((grant, index) => {
      console.log(`${index + 1}. ID: ${grant.id}`);
      console.log(`   Grant Name: ${grant.grant_name}`);
      console.log(`   Organization: ${grant.funding_organization}`);
      console.log(`   Country/Region: ${grant.country_region}`);
      console.log(`   Focus Areas: ${grant.focus_areas}`);
      console.log(`   ---`);
    });
    
    console.log(`\nTotal grants to translate: ${grantsToTranslate.length}`);
    console.log(`ID Range: ${grantsToTranslate[0]?.id} - ${grantsToTranslate[grantsToTranslate.length - 1]?.id}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkGrantsForTranslation();