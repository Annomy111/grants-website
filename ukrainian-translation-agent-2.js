const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjQ0MjYsImV4cCI6MjA1NjEwMDQyNn0.pRi-OjfTJnAA6OsJsxy-S9Xq7vRG54DzuKhdSNT9RFo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUntranslatedGrants() {
    console.log('Finding grants without Ukrainian translations...');
    
    try {
        // First, let's check which grants have Ukrainian translations
        const { data: allGrants, error } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk, funding_organization')
            .order('id', { ascending: true });
            
        if (error) {
            console.error('Error fetching grants:', error);
            return;
        }
        
        console.log(`Total grants in database: ${allGrants.length}`);
        
        // Find grants without Ukrainian translations
        const untranslatedGrants = allGrants.filter(grant => !grant.grant_name_uk);
        console.log(`Grants without Ukrainian translations: ${untranslatedGrants.length}`);
        
        // Show translated grants IDs to understand what Agent 1 did
        const translatedGrants = allGrants.filter(grant => grant.grant_name_uk);
        const translatedIds = translatedGrants.map(g => g.id).sort((a, b) => a - b);
        console.log(`\nTranslated grant IDs: ${translatedIds.join(', ')}`);
        
        // Get the next batch of 25 untranslated grants
        const nextBatch = untranslatedGrants.slice(0, 25);
        console.log(`\nNext batch for translation (${nextBatch.length} grants):`);
        nextBatch.forEach(grant => {
            console.log(`- ID ${grant.id}: ${grant.grant_name} (${grant.funding_organization})`);
        });
        
        return nextBatch.map(g => g.id);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Execute the function
findUntranslatedGrants().then(grantIds => {
    if (grantIds && grantIds.length > 0) {
        console.log(`\nGrant IDs to translate: ${grantIds.join(', ')}`);
    }
});