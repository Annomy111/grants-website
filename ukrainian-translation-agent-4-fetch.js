const https = require('https');

// Supabase credentials
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.mXdJdUGX0t1E5Xj_pQkf7LIJlGCMR9qhMgH3v6oP1pM';

function fetchGrants() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'adpddtbsstunjotxaldb.supabase.co',
            path: '/rest/v1/grants?id=gte.204&order=id.asc&limit=30',
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const grants = JSON.parse(data);
                    resolve(grants);
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', (e) => {
            reject(e);
        });
        
        req.end();
    });
}

async function checkGrants() {
    console.log('Ukrainian Translation Agent 4 - Checking grants from ID 204...\n');
    
    try {
        const grants = await fetchGrants();
        console.log(`Found ${grants.length} grants starting from ID 204\n`);
        
        // Check which grants need translation
        const grantsNeedingTranslation = grants.filter(grant => 
            !grant.grant_name_uk || 
            !grant.funding_organization_uk || 
            !grant.country_region_uk
        );
        
        console.log(`${grantsNeedingTranslation.length} grants need translation\n`);
        
        // Display the grants we'll translate
        console.log('Grants to translate in this batch:');
        grantsNeedingTranslation.slice(0, 25).forEach((grant, index) => {
            console.log(`\n${index + 1}. ID: ${grant.id}`);
            console.log(`   Grant Name: ${grant.grant_name}`);
            console.log(`   Organization: ${grant.funding_organization}`);
            console.log(`   Country/Region: ${grant.country_region}`);
        });
        
        return grantsNeedingTranslation.slice(0, 25);
        
    } catch (err) {
        console.error('Error:', err);
    }
}

// Run the check
checkGrants();