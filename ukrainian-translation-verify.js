const { createClient } = require('@supabase/supabase-js');

// Supabase connection with service role for admin operations
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.mXdJdUGX0t1E5Xj_pQkf7LIJlGCMR9qhMgH3v6oP1pM';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjQ0MjYsImV4cCI6MjA1NjEwMDQyNn0.pRi-OjfTJnAA6OsJsxy-S9Xq7vRG54DzuKhdSNT9RFo';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const supabaseAnon = createClient(supabaseUrl, anonKey);

async function verifyAndFixTranslations() {
    console.log('=== Verification and Fix Script ===');
    
    try {
        // First, verify with service role
        console.log('\n1. Checking with service role key...');
        const { data: adminGrants, error: adminError } = await supabaseAdmin
            .from('grants')
            .select('id, grant_name, grant_name_uk')
            .in('id', [178, 179, 180, 181, 182])
            .limit(5);
            
        if (adminError) {
            console.error('Admin query error:', adminError);
        } else {
            console.log('Admin query results:');
            adminGrants.forEach(g => {
                console.log(`- ID ${g.id}: ${g.grant_name} | UK: ${g.grant_name_uk || 'NULL'}`);
            });
        }
        
        // Check with anon key
        console.log('\n2. Checking with anon key...');
        const { data: anonGrants, error: anonError } = await supabaseAnon
            .from('grants')
            .select('id, grant_name, grant_name_uk')
            .in('id', [178, 179, 180, 181, 182])
            .limit(5);
            
        if (anonError) {
            console.error('Anon query error:', anonError);
        } else {
            console.log('Anon query results:');
            anonGrants.forEach(g => {
                console.log(`- ID ${g.id}: ${g.grant_name} | UK: ${g.grant_name_uk || 'NULL'}`);
            });
        }
        
        // If no Ukrainian translations exist, let's try updating with service role
        if (!adminGrants?.some(g => g.grant_name_uk)) {
            console.log('\n3. No Ukrainian translations found. Attempting update with service role...');
            
            // Test update on grant 178
            const { data: updateResult, error: updateError } = await supabaseAdmin
                .from('grants')
                .update({
                    grant_name_uk: 'Гранти Чорноморського Трасту Регіонального Співробітництва',
                    funding_organization_uk: 'Німецький фонд Маршалла (GMF) - Чорноморський траст'
                })
                .eq('id', 178)
                .select();
                
            if (updateError) {
                console.error('Update error:', updateError);
            } else {
                console.log('Update successful:', updateResult);
            }
        }
        
    } catch (error) {
        console.error('Verification error:', error);
    }
}

verifyAndFixTranslations();