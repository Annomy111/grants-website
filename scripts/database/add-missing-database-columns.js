const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to database...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-missing-columns.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    // Execute SQL using Supabase's rpc
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql_query: sql,
      })
      .catch(async err => {
        // If RPC doesn't exist, try alternative approach
        console.log('RPC method not available, using alternative approach...\n');

        // Split SQL into individual statements
        const statements = sql.split(';').filter(s => s.trim());

        for (const statement of statements) {
          if (statement.trim()) {
            console.log(`Executing: ${statement.trim().substring(0, 50)}...`);

            // For ALTER TABLE statements, we need to use a different approach
            // Since Supabase doesn't allow direct SQL execution via the client library,
            // we'll need to run these migrations through the Supabase dashboard
            console.log('⚠️  This SQL needs to be run directly in Supabase SQL Editor:');
            console.log(statement.trim() + ';');
            console.log('');
          }
        }

        return { manual: true };
      });

    if (error) {
      throw error;
    }

    if (data?.manual) {
      console.log('\n📋 MANUAL STEPS REQUIRED:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the SQL from scripts/add-missing-columns.sql');
      console.log('4. Execute the SQL');
      console.log('\nSQL file location: scripts/add-missing-columns.sql');
    } else {
      console.log('✅ Columns added successfully!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);

    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to your Supabase dashboard at:');
    console.log(`   ${supabaseUrl}`);
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the following SQL:');
    console.log('\n--- START SQL ---');
    const sql = await fs.readFile(path.join(__dirname, 'add-missing-columns.sql'), 'utf8');
    console.log(sql);
    console.log('--- END SQL ---\n');
    console.log('4. Execute the SQL');
  }
}

addMissingColumns().catch(console.error);
