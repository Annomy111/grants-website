const fs = require('fs').promises;
const path = require('path');

async function fixLogoMappingFormat() {
  console.log('🔧 Fixing logo mapping format...\n');
  
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  
  try {
    // Read current mapping
    const data = await fs.readFile(mappingPath, 'utf8');
    const currentMapping = JSON.parse(data);
    
    // Convert to simple format
    const simpleMapping = {};
    
    for (const [key, value] of Object.entries(currentMapping)) {
      if (typeof value === 'string') {
        // Already in simple format
        simpleMapping[key] = value;
      } else if (value && typeof value === 'object' && value.logo) {
        // Convert from object format
        simpleMapping[key] = value.logo;
      }
    }
    
    // Sort alphabetically
    const sortedMapping = {};
    Object.keys(simpleMapping).sort().forEach(key => {
      sortedMapping[key] = simpleMapping[key];
    });
    
    // Save fixed mapping
    await fs.writeFile(
      mappingPath,
      JSON.stringify(sortedMapping, null, 2)
    );
    
    console.log(`✅ Fixed logo mapping format`);
    console.log(`Total mappings: ${Object.keys(sortedMapping).length}`);
    
  } catch (error) {
    console.error('Error fixing mapping:', error);
  }
}

fixLogoMappingFormat();