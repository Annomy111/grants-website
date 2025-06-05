const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.mXdJdUGX0t1E5Xj_pQkf7LIJlGCMR9qhMgH3v6oP1pM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTranslations() {
    console.log('Ukrainian Translation Agent 6 - Verification Report\n');
    console.log('='.repeat(60) + '\n');
    
    try {
        // Get all grants
        const { data: grants, error } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk, funding_organization, funding_organization_uk')
            .order('id', { ascending: true });
            
        if (error) {
            console.error('Error fetching grants:', error.message || JSON.stringify(error));
            return;
        }
        
        if (!grants || grants.length === 0) {
            console.log('No grants found in database.');
            return;
        }
        
        console.log(`Total grants in database: ${grants.length}\n`);
        
        // Analyze translation status
        const translated = grants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
        const untranslated = grants.filter(g => !g.grant_name_uk || g.grant_name_uk.trim() === '');
        
        console.log('=== TRANSLATION STATUS ===');
        console.log(`Translated grants: ${translated.length}`);
        console.log(`Untranslated grants: ${untranslated.length}`);
        console.log(`Completion rate: ${((translated.length / grants.length) * 100).toFixed(2)}%\n`);
        
        // Check by ID ranges
        console.log('=== TRANSLATION COVERAGE BY AGENT ===');
        const ranges = [
            { agent: 1, start: 158, end: 177 },
            { agent: '2&3', start: 178, end: 203 },
            { agent: 4, start: 204, end: 228 },
            { agent: 5, start: 229, end: 253 },
            { agent: 6, start: 254, end: 999 }
        ];
        
        for (const range of ranges) {
            const rangeGrants = grants.filter(g => g.id >= range.start && g.id <= range.end);
            const rangeTranslated = rangeGrants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
            if (rangeGrants.length > 0) {
                console.log(`Agent ${range.agent} (IDs ${range.start}-${Math.min(range.end, grants[grants.length-1].id)}): ${rangeTranslated.length}/${rangeGrants.length} translated`);
            }
        }
        
        // Find gaps
        console.log('\n=== UNTRANSLATED GRANTS ===');
        if (untranslated.length === 0) {
            console.log('✅ All grants have been translated!');
        } else {
            console.log(`Found ${untranslated.length} untranslated grants:`);
            untranslated.slice(0, 10).forEach(g => {
                console.log(`- ID ${g.id}: ${g.grant_name}`);
            });
            if (untranslated.length > 10) {
                console.log(`... and ${untranslated.length - 10} more`);
            }
        }
        
        // Check grants after ID 253
        const highIdGrants = grants.filter(g => g.id > 253);
        console.log(`\n=== GRANTS AFTER ID 253 ===`);
        console.log(`Total grants with ID > 253: ${highIdGrants.length}`);
        if (highIdGrants.length > 0) {
            const highIdTranslated = highIdGrants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
            console.log(`Translated: ${highIdTranslated.length}`);
            console.log(`Untranslated: ${highIdGrants.length - highIdTranslated.length}`);
            
            // Show first few high ID grants
            console.log('\nFirst few grants after ID 253:');
            highIdGrants.slice(0, 5).forEach(g => {
                console.log(`- ID ${g.id}: ${g.grant_name} ${g.grant_name_uk ? '✅' : '❌'}`);
            });
        }
        
        // Sample translations
        console.log('\n=== SAMPLE TRANSLATIONS ===');
        const samples = translated.filter(g => g.id >= 254).slice(0, 3);
        if (samples.length > 0) {
            samples.forEach(g => {
                console.log(`\nID ${g.id}:`);
                console.log(`EN: ${g.grant_name}`);
                console.log(`UK: ${g.grant_name_uk}`);
                console.log(`Org EN: ${g.funding_organization}`);
                console.log(`Org UK: ${g.funding_organization_uk}`);
            });
        } else {
            console.log('No translated grants found after ID 253');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run verification
verifyTranslations();