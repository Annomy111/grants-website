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
            
            console.log('Status Code:', res.statusCode);
            console.log('Headers:', res.headers);
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Raw response:', data.substring(0, 500));
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    console.log('Parse error:', e);
                    resolve(data);
                }
            });
        });
        
        req.on('error', (e) => {
            reject(e);
        });
        
        req.end();
    });
}

fetchGrants();