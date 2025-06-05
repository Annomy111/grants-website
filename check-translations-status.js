const { createClient } = require('@supabase/supabase-js');

// Use anon key for read operations
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjQ0MjYsImV4cCI6MjA1NjEwMDQyNn0.pRi-OjfTJnAA6OsJsxy-S9Xq7vRG54DzuKhdSNT9RFo';

const supabase = createClient(supabaseUrl, anonKey);

async function checkTranslationStatus() {
  console.log('🔍 Checking Ukrainian Translation Status...\n');
  
  try {
    // Check total grants
    const { data: allGrants, error: countError } = await supabase
      .from('grants')
      .select('id, grant_name, grant_name_uk')
      .order('id');
      
    if (countError) {
      console.error('❌ Error fetching grants:', countError);
      return;
    }
    
    console.log(`📊 Total grants in database: ${allGrants.length}`);
    
    // Check which grants have Ukrainian translations
    const translatedGrants = allGrants.filter(g => g.grant_name_uk);
    const untranslatedGrants = allGrants.filter(g => !g.grant_name_uk);
    
    console.log(`✅ Translated grants: ${translatedGrants.length}`);
    console.log(`❌ Untranslated grants: ${untranslatedGrants.length}`);
    
    if (translatedGrants.length > 0) {
      console.log('\n📝 Translated grants:');
      translatedGrants.forEach(grant => {
        console.log(`   ID ${grant.id}: ${grant.grant_name} → ${grant.grant_name_uk}`);
      });
      
      const translatedIds = translatedGrants.map(g => g.id).sort((a, b) => a - b);
      console.log(`\n🎯 Translated IDs: ${translatedIds.join(', ')}`);
    }
    
    if (untranslatedGrants.length > 0) {
      console.log('\n📝 Next batch needing translation (first 25):');
      const nextBatch = untranslatedGrants.slice(0, 25);
      nextBatch.forEach(grant => {
        console.log(`   ID ${grant.id}: ${grant.grant_name}`);
      });
      
      const nextBatchIds = nextBatch.map(g => g.id);
      console.log(`\n🎯 Next batch IDs: ${nextBatchIds.join(', ')}`);
    }
    
    // Check Agent 1's work specifically
    const agent1Range = allGrants.filter(g => g.id >= 158 && g.id <= 177);
    const agent1Translated = agent1Range.filter(g => g.grant_name_uk);
    
    console.log(`\n🤖 Agent 1 Status (IDs 158-177):`);
    console.log(`   Total grants in range: ${agent1Range.length}`);
    console.log(`   Translated by Agent 1: ${agent1Translated.length}`);
    
    if (agent1Translated.length > 0) {
      const agent1Ids = agent1Translated.map(g => g.id).sort((a, b) => a - b);
      console.log(`   Agent 1 translated IDs: ${agent1Ids.join(', ')}`);
    }
    
    // Check Agent 2's target range
    const agent2Range = allGrants.filter(g => g.id >= 178 && g.id <= 203);
    const agent2Translated = agent2Range.filter(g => g.grant_name_uk);
    
    console.log(`\n🤖 Agent 2 Status (IDs 178-203):`);
    console.log(`   Total grants in range: ${agent2Range.length}`);
    console.log(`   Already translated: ${agent2Translated.length}`);
    console.log(`   Remaining to translate: ${agent2Range.length - agent2Translated.length}`);
    
    if (agent2Translated.length > 0) {
      const agent2Ids = agent2Translated.map(g => g.id).sort((a, b) => a - b);
      console.log(`   Agent 2 translated IDs: ${agent2Ids.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTranslationStatus();