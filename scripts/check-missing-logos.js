const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  // Get all organizations from database
  const { data: grants } = await supabase
    .from('grants')
    .select('funding_organization')
    .limit(1000);
  
  const organizations = [...new Set(grants.map(g => g.funding_organization))].sort();
  
  // Get existing logos
  const logoDir = path.join(__dirname, '..', 'client', 'public', 'images', 'logos');
  const existingLogos = fs.readdirSync(logoDir)
    .filter(f => !f.includes('download-report') && (f.endsWith('.png') || f.endsWith('.svg') || f.endsWith('.jpg')))
    .map(f => f.replace(/\.(png|svg|jpg|pdf)$/, '').toLowerCase());
  
  // Check which organizations are missing logos
  const missingLogos = organizations.filter(org => {
    const slug = org.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return !existingLogos.some(logo => {
      const logoNormalized = logo.replace(/-/g, '');
      const slugNormalized = slug.replace(/-/g, '');
      return logoNormalized.includes(slugNormalized) || slugNormalized.includes(logoNormalized);
    });
  });
  
  console.log('\n📊 Logo Coverage Report:');
  console.log('========================');
  console.log('Total organizations:', organizations.length);
  console.log('Logos found:', existingLogos.length);
  console.log('Missing logos:', missingLogos.length);
  console.log('\n❌ Organizations Missing Logos:');
  console.log('================================');
  missingLogos.forEach((org, i) => {
    console.log(`${i + 1}. ${org}`);
  });
  
  // Save missing logos list
  fs.writeFileSync(
    path.join(__dirname, 'missing-logos.json'),
    JSON.stringify(missingLogos, null, 2)
  );
  console.log('\n✅ Missing logos list saved to scripts/missing-logos.json');
})();