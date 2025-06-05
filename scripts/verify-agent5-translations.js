const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTranslations() {
  console.log('Verifying Agent 5 translations (grants 229-253)...\n');
  
  try {
    // Fetch translated grants
    const { data: grants, error } = await supabase
      .from('grants')
      .select('id, grant_name, grant_name_uk, funding_organization, funding_organization_uk, focus_areas_uk')
      .gte('id', 229)
      .lte('id', 253)
      .order('id');

    if (error) {
      console.error('Error fetching grants:', error);
      return;
    }

    console.log('Translation Verification Results:');
    console.log('================================\n');
    
    let translatedCount = 0;
    let untranslatedCount = 0;
    
    grants.forEach(grant => {
      const hasTranslation = grant.grant_name_uk && grant.funding_organization_uk && grant.focus_areas_uk;
      
      if (hasTranslation) {
        translatedCount++;
        console.log(`✓ Grant ${grant.id}: ${grant.grant_name}`);
        console.log(`  UK: ${grant.grant_name_uk}`);
      } else {
        untranslatedCount++;
        console.log(`✗ Grant ${grant.id}: ${grant.grant_name} - MISSING TRANSLATION`);
      }
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total grants checked: ${grants.length}`);
    console.log(`Successfully translated: ${translatedCount}`);
    console.log(`Missing translations: ${untranslatedCount}`);
    
    // Check overall translation progress
    const { data: allGrants, error: allError } = await supabase
      .from('grants')
      .select('id', { count: 'exact', head: true })
      .not('grant_name_uk', 'is', null);
      
    if (!allError && allGrants) {
      console.log(`\nTotal grants with Ukrainian translations in database: ${allGrants.length || 0}`);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

verifyTranslations().catch(console.error);