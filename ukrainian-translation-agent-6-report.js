const { createClient } = require('@supabase/supabase-js');

// Direct Supabase connection
const supabase = createClient(
  'https://adpddtbsstunjotxaldb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM'
);

async function generateFinalReport() {
    console.log('=== UKRAINIAN TRANSLATION PROJECT - FINAL REPORT ===\n');
    console.log('Agent 6 - Final Verification Report');
    console.log('Date:', new Date().toISOString());
    console.log('=' + '='.repeat(50) + '\n');
    
    try {
        // Fetch all grants
        const { data: grants, error } = await supabase
            .from('grants')
            .select('id, grant_name, grant_name_uk, funding_organization, funding_organization_uk')
            .order('id', { ascending: true });
            
        if (error) {
            console.error('Error fetching data:', error);
            return;
        }
        
        // Overall statistics
        const totalGrants = grants.length;
        const translatedGrants = grants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
        const untranslatedGrants = grants.filter(g => !g.grant_name_uk || g.grant_name_uk.trim() === '');
        
        console.log('OVERALL STATISTICS');
        console.log('-'.repeat(50));
        console.log(`Total grants in database: ${totalGrants}`);
        console.log(`Translated grants: ${translatedGrants.length}`);
        console.log(`Untranslated grants: ${untranslatedGrants.length}`);
        console.log(`Completion rate: ${((translatedGrants.length / totalGrants) * 100).toFixed(2)}%\n`);
        
        // Agent coverage report
        console.log('AGENT COVERAGE REPORT');
        console.log('-'.repeat(50));
        
        const agentRanges = [
            { agent: '1', start: 158, end: 177, description: 'Initial batch' },
            { agent: '2&3', start: 178, end: 203, description: 'Second batch' },
            { agent: '4', start: 204, end: 228, description: 'Third batch' },
            { agent: '5', start: 229, end: 253, description: 'Fourth batch' },
            { agent: '6', start: 254, end: 999, description: 'Final batch & cleanup' }
        ];
        
        let totalAgentTranslations = 0;
        
        for (const range of agentRanges) {
            const rangeGrants = grants.filter(g => g.id >= range.start && g.id <= range.end);
            const rangeTranslated = rangeGrants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
            
            if (rangeGrants.length > 0) {
                const maxId = Math.max(...rangeGrants.map(g => g.id));
                const coverage = ((rangeTranslated.length / rangeGrants.length) * 100).toFixed(1);
                console.log(`Agent ${range.agent} (IDs ${range.start}-${maxId}): ${rangeTranslated.length}/${rangeGrants.length} translated (${coverage}%) - ${range.description}`);
                totalAgentTranslations += rangeTranslated.length;
            }
        }
        
        // Grants outside agent ranges
        const outsideRangeGrants = grants.filter(g => g.id < 158);
        const outsideRangeTranslated = outsideRangeGrants.filter(g => g.grant_name_uk && g.grant_name_uk.trim() !== '');
        if (outsideRangeGrants.length > 0) {
            console.log(`\nOther grants (IDs < 158): ${outsideRangeTranslated.length}/${outsideRangeGrants.length} translated`);
        }
        
        // Untranslated grants report
        if (untranslatedGrants.length > 0) {
            console.log('\nUNTRANSLATED GRANTS');
            console.log('-'.repeat(50));
            console.log(`Found ${untranslatedGrants.length} grants without Ukrainian translations:\n`);
            
            // Group by ID ranges
            const below158 = untranslatedGrants.filter(g => g.id < 158);
            const range158_253 = untranslatedGrants.filter(g => g.id >= 158 && g.id <= 253);
            const above253 = untranslatedGrants.filter(g => g.id > 253);
            
            if (below158.length > 0) {
                console.log(`Grants with ID < 158 (${below158.length} grants):`);
                below158.forEach(g => console.log(`  - ID ${g.id}: ${g.grant_name}`));
            }
            
            if (range158_253.length > 0) {
                console.log(`\nGrants with ID 158-253 (${range158_253.length} grants):`);
                range158_253.forEach(g => console.log(`  - ID ${g.id}: ${g.grant_name}`));
            }
            
            if (above253.length > 0) {
                console.log(`\nGrants with ID > 253 (${above253.length} grants):`);
                above253.forEach(g => console.log(`  - ID ${g.id}: ${g.grant_name}`));
            }
        } else {
            console.log('\n✅ ALL GRANTS HAVE BEEN TRANSLATED!');
        }
        
        // Quality check - sample translations
        console.log('\nQUALITY CHECK - SAMPLE TRANSLATIONS');
        console.log('-'.repeat(50));
        
        const recentTranslations = translatedGrants.slice(-5);
        recentTranslations.forEach(g => {
            console.log(`\nGrant ID ${g.id}:`);
            console.log(`  EN: ${g.grant_name}`);
            console.log(`  UK: ${g.grant_name_uk}`);
        });
        
        // Final summary
        console.log('\n' + '='.repeat(50));
        console.log('MISSION SUMMARY');
        console.log('='.repeat(50));
        
        if (untranslatedGrants.length === 0) {
            console.log('STATUS: ✅ MISSION COMPLETE');
            console.log('All grants have been successfully translated to Ukrainian!');
        } else {
            console.log('STATUS: ⚠️  TRANSLATION IN PROGRESS');
            console.log(`${untranslatedGrants.length} grants still need translation.`);
            console.log('Run the translation script again to complete the remaining grants.');
        }
        
        console.log(`\nTotal completion: ${((translatedGrants.length / totalGrants) * 100).toFixed(2)}%`);
        console.log('Report generated:', new Date().toISOString());
        
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Generate report
generateFinalReport();