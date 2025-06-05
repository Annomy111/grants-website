require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getGrants() {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .gte('id', 164)
    .lte('id', 179)
    .order('id');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Found', data.length, 'grants to research:');
  data.forEach(grant => {
    console.log(`\nID: ${grant.id}`);
    console.log(`Name: ${grant.name}`);
    console.log(`Organization: ${grant.organization}`);
    console.log(`Website: ${grant.website_link}`);
    console.log(`Deadline: ${grant.deadline}`);
  });
  
  return data;
}

// Export for use in other scripts
module.exports = { getGrants, supabase };

// Run if called directly
if (require.main === module) {
  getGrants();
}