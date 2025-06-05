const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.mXdJdUGX0t1E5Xj_pQkf7LIJlGCMR9qhMgH3v6oP1pM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGrantsFromId204() {
    console.log('Ukrainian Translation Agent 4 - Starting mission...');
    console.log('Checking grants starting from ID 204...\n');
    
    try {
        // Get grants starting from ID 204, limit to 30 to see what's available
        const { data: grants, error } = await supabase
            .from('grants')
            .select('*')
            .gte('id', 204)
            .order('id', { ascending: true })
            .limit(30);
            
        if (error) {
            console.error('Error fetching grants:', error);
            return;
        }
        
        console.log(`Found ${grants.length} grants starting from ID 204`);
        
        // Check which grants need translation
        const grantsNeedingTranslation = grants.filter(grant => 
            !grant.grant_name_uk || 
            !grant.funding_organization_uk || 
            !grant.country_region_uk
        );
        
        console.log(`${grantsNeedingTranslation.length} grants need translation\n`);
        
        // Display first few grants
        console.log('First few grants to translate:');
        grantsNeedingTranslation.slice(0, 5).forEach(grant => {
            console.log(`\nID: ${grant.id}`);
            console.log(`Grant Name: ${grant.grant_name}`);
            console.log(`Organization: ${grant.funding_organization}`);
            console.log(`Already has Ukrainian: ${grant.grant_name_uk ? 'Yes' : 'No'}`);
        });
        
        // Get count of all grants needing translation
        const { count, error: countError } = await supabase
            .from('grants')
            .select('*', { count: 'exact', head: true })
            .gte('id', 204)
            .or('grant_name_uk.is.null,funding_organization_uk.is.null,country_region_uk.is.null');
            
        if (!countError) {
            console.log(`\nTotal grants from ID 204 onwards needing translation: ${count}`);
        }
        
        return grantsNeedingTranslation;
        
    } catch (err) {
        console.error('Error:', err);
    }
}

// Run the check
checkGrantsFromId204();