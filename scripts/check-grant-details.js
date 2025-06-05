const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data: grants } = await supabase
    .from('grants')
    .select('*')
    .limit(5);
  
  console.log('\n🔍 Sample Grants from Production Database:');
  console.log('==========================================');
  
  grants.forEach((grant, i) => {
    console.log(`\n${i + 1}. ${grant.grant_name}`);
    console.log('   Fields with data:');
    
    Object.entries(grant).forEach(([key, value]) => {
      if (value !== null && value !== '' && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        const displayValue = typeof value === 'string' && value.length > 100 
          ? value.substring(0, 100) + '...' 
          : value;
        console.log(`   - ${key}: ${displayValue}`);
      }
    });
    
    console.log('   Missing/Empty fields:');
    const importantFields = [
      'detailed_description', 
      'contact_email', 
      'contact_phone', 
      'application_procedure', 
      'required_documents',
      'eligibility_criteria',
      'focus_areas',
      'grant_amount',
      'duration',
      'website_link'
    ];
    
    importantFields.forEach(field => {
      if (!grant[field] || grant[field] === '') {
        console.log(`   ❌ ${field}`);
      }
    });
  });
  
  // Check overall statistics
  const { data: allGrants } = await supabase
    .from('grants')
    .select('*');
    
  console.log('\n📊 Overall Database Statistics:');
  console.log('================================');
  console.log(`Total grants: ${allGrants.length}`);
  
  const fieldStats = {};
  const importantFields = [
    'eligibility_criteria',
    'focus_areas', 
    'grant_amount',
    'duration',
    'website_link',
    'detailed_description',
    'contact_email',
    'application_procedure'
  ];
  
  importantFields.forEach(field => {
    const count = allGrants.filter(g => g[field] && g[field] !== '').length;
    fieldStats[field] = count;
    console.log(`${field}: ${count}/${allGrants.length} (${(count/allGrants.length*100).toFixed(1)}%)`);
  });
})();