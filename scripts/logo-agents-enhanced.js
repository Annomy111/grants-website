const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Agent 1: Logo Mapping Analysis Agent
async function logoMappingAnalysisAgent() {
  console.log('\n📊 AGENT 1: Logo Mapping Analysis Agent\n');
  console.log('Analyzing current logo coverage...\n');
  
  // Load existing logo mapping
  let existingLogos = {};
  try {
    const logoData = await fs.readFile(
      path.join(__dirname, '../client/public/data/organization-logos.json'),
      'utf8'
    );
    existingLogos = JSON.parse(logoData);
  } catch (err) {
    console.log('No existing logo mapping found');
  }
  
  // Get all organizations from database
  const { data: grants, error } = await supabase
    .from('grants')
    .select('funding_organization')
    .order('funding_organization');
    
  if (error) {
    console.error('Error fetching organizations:', error);
    return { missingLogos: [] };
  }
  
  // Get unique organizations
  const uniqueOrgs = [...new Set(grants.map(g => g.funding_organization))];
  
  // Analyze coverage
  const coverage = {
    total: uniqueOrgs.length,
    withLogos: 0,
    withoutLogos: 0,
    missingList: []
  };
  
  for (const org of uniqueOrgs) {
    const slug = org.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (existingLogos[slug]) {
      coverage.withLogos++;
    } else {
      coverage.withoutLogos++;
      coverage.missingList.push({
        organization: org,
        slug: slug
      });
    }
  }
  
  console.log(`Total organizations: ${coverage.total}`);
  console.log(`With logos: ${coverage.withLogos} (${Math.round(coverage.withLogos/coverage.total*100)}%)`);
  console.log(`Without logos: ${coverage.withoutLogos} (${Math.round(coverage.withoutLogos/coverage.total*100)}%)`);
  
  return coverage;
}

// Agent 2: Logo Creation Agent (Create placeholder SVGs)
async function logoCreationAgent(missingLogos) {
  console.log('\n🎨 AGENT 2: Logo Creation Agent\n');
  console.log('Creating placeholder logos for missing organizations...\n');
  
  const createdLogos = [];
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  
  // Ensure directory exists
  try {
    await fs.mkdir(logoDir, { recursive: true });
  } catch (err) {}
  
  // Color palette for logos
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];
  
  for (let i = 0; i < missingLogos.length && i < 30; i++) {
    const org = missingLogos[i];
    const initials = org.organization
      .split(/\s+/)
      .map(word => word[0])
      .filter(char => char && /[A-Za-z]/.test(char))
      .slice(0, 3)
      .join('')
      .toUpperCase();
    
    const color = colors[i % colors.length];
    const bgColor = color + '20'; // 20% opacity
    
    // Create SVG logo
    const svg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="20" fill="${bgColor}"/>
  <rect x="10" y="10" width="180" height="180" rx="15" fill="none" stroke="${color}" stroke-width="2"/>
  <text x="100" y="110" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="${color}">
    ${initials || '?'}
  </text>
  <text x="100" y="140" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="${color}" opacity="0.8">
    ${org.organization.substring(0, 20)}${org.organization.length > 20 ? '...' : ''}
  </text>
</svg>`;
    
    const filename = `${org.slug}.svg`;
    const filepath = path.join(logoDir, filename);
    
    try {
      await fs.writeFile(filepath, svg);
      createdLogos.push({
        organization: org.organization,
        slug: org.slug,
        filename: filename,
        path: `/images/logos/${filename}`,
        type: 'placeholder'
      });
      console.log(`✅ Created placeholder logo for ${org.organization}`);
    } catch (err) {
      console.error(`Error creating logo for ${org.organization}:`, err.message);
    }
  }
  
  console.log(`\nCreated ${createdLogos.length} placeholder logos`);
  
  return {
    createdLogos
  };
}

// Agent 3: Logo Optimization Agent
async function logoOptimizationAgent() {
  console.log('\n⚡ AGENT 3: Logo Optimization Agent\n');
  console.log('Checking and optimizing existing logos...\n');
  
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  const stats = {
    totalFiles: 0,
    svgFiles: 0,
    pngFiles: 0,
    otherFiles: 0,
    totalSize: 0,
    largeFiles: []
  };
  
  try {
    const files = await fs.readdir(logoDir);
    
    for (const file of files) {
      const filepath = path.join(logoDir, file);
      const stat = await fs.stat(filepath);
      
      if (stat.isFile()) {
        stats.totalFiles++;
        stats.totalSize += stat.size;
        
        const ext = path.extname(file).toLowerCase();
        if (ext === '.svg') stats.svgFiles++;
        else if (ext === '.png') stats.pngFiles++;
        else stats.otherFiles++;
        
        // Flag large files (> 100KB)
        if (stat.size > 100 * 1024) {
          stats.largeFiles.push({
            file: file,
            size: `${(stat.size / 1024).toFixed(2)} KB`
          });
        }
      }
    }
    
    console.log(`Total logo files: ${stats.totalFiles}`);
    console.log(`SVG files: ${stats.svgFiles} (preferred format)`);
    console.log(`PNG files: ${stats.pngFiles}`);
    console.log(`Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (stats.largeFiles.length > 0) {
      console.log(`\n⚠️  Large files that could be optimized:`);
      stats.largeFiles.forEach(f => console.log(`  - ${f.file}: ${f.size}`));
    }
    
  } catch (err) {
    console.error('Error reading logo directory:', err);
  }
  
  return stats;
}

// Agent 4: Logo Mapping Update Agent
async function logoMappingUpdateAgent(createdLogos) {
  console.log('\n🔄 AGENT 4: Logo Mapping Update Agent\n');
  console.log('Updating logo mapping file...\n');
  
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  let logoMapping = {};
  
  // Load existing mapping
  try {
    const existingData = await fs.readFile(mappingPath, 'utf8');
    logoMapping = JSON.parse(existingData);
  } catch (err) {
    console.log('Creating new mapping file');
  }
  
  // Add new logos
  let addedCount = 0;
  for (const logo of createdLogos) {
    if (!logoMapping[logo.slug]) {
      logoMapping[logo.slug] = logo.path;
      addedCount++;
    }
  }
  
  // Sort alphabetically
  const sortedMapping = {};
  Object.keys(logoMapping).sort().forEach(key => {
    sortedMapping[key] = logoMapping[key];
  });
  
  // Save updated mapping
  try {
    await fs.writeFile(
      mappingPath,
      JSON.stringify(sortedMapping, null, 2)
    );
    console.log(`✅ Updated mapping with ${addedCount} new logos`);
    console.log(`Total logos in mapping: ${Object.keys(sortedMapping).length}`);
  } catch (err) {
    console.error('Error saving mapping:', err);
  }
  
  return {
    totalMappings: Object.keys(sortedMapping).length,
    newMappings: addedCount
  };
}

// Agent 5: Logo Verification Agent
async function logoVerificationAgent() {
  console.log('\n✅ AGENT 5: Logo Verification Agent\n');
  console.log('Verifying logo system integrity...\n');
  
  const issues = [];
  
  // Check 1: Verify mapping file exists and is valid
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  let logoMapping = {};
  
  try {
    const mappingData = await fs.readFile(mappingPath, 'utf8');
    logoMapping = JSON.parse(mappingData);
    console.log('✅ Logo mapping file is valid JSON');
  } catch (err) {
    issues.push('Logo mapping file is missing or invalid');
  }
  
  // Check 2: Verify all mapped logos exist
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  let missingFiles = 0;
  
  for (const [slug, logoPath] of Object.entries(logoMapping)) {
    const filename = logoPath.replace('/images/logos/', '');
    const filepath = path.join(logoDir, filename);
    
    try {
      await fs.access(filepath);
    } catch {
      missingFiles++;
      issues.push(`Missing file: ${filename} (mapped to ${slug})`);
    }
  }
  
  if (missingFiles === 0) {
    console.log('✅ All mapped logo files exist');
  } else {
    console.log(`❌ ${missingFiles} mapped logos are missing files`);
  }
  
  // Check 3: Find orphaned logo files
  try {
    const files = await fs.readdir(logoDir);
    const mappedFiles = Object.values(logoMapping).map(p => p.replace('/images/logos/', ''));
    const orphaned = files.filter(f => !mappedFiles.includes(f) && f !== '.gitkeep');
    
    if (orphaned.length > 0) {
      console.log(`\n⚠️  Found ${orphaned.length} orphaned logo files (not in mapping):`);
      orphaned.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    }
  } catch (err) {
    issues.push('Could not read logo directory');
  }
  
  // Check 4: Test logo display function
  const testOrg = 'European Commission';
  const testSlug = testOrg.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const testLogo = logoMapping[testSlug];
  
  if (testLogo) {
    console.log(`\n✅ Logo lookup test passed: "${testOrg}" → "${testLogo}"`);
  } else {
    console.log(`\n❌ Logo lookup test failed for "${testOrg}"`);
  }
  
  // Summary
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('======================');
  console.log(`Total mapped logos: ${Object.keys(logoMapping).length}`);
  console.log(`Issues found: ${issues.length}`);
  
  return {
    mappedLogos: Object.keys(logoMapping).length,
    issues: issues
  };
}

// Main execution
async function runLogoAgents() {
  console.log('🤖 LOGO MANAGEMENT AGENTS ACTIVATED');
  console.log('===================================\n');
  
  try {
    // Run all agents
    const analysisResult = await logoMappingAnalysisAgent();
    
    let creationResult = { createdLogos: [] };
    if (analysisResult.missingList.length > 0) {
      creationResult = await logoCreationAgent(analysisResult.missingList);
    }
    
    const optimizationResult = await logoOptimizationAgent();
    
    let updateResult = { totalMappings: 0, newMappings: 0 };
    if (creationResult.createdLogos.length > 0) {
      updateResult = await logoMappingUpdateAgent(creationResult.createdLogos);
    }
    
    const verificationResult = await logoVerificationAgent();
    
    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalOrganizations: analysisResult.total,
        withLogos: analysisResult.withLogos + creationResult.createdLogos.length,
        coveragePercent: Math.round((analysisResult.withLogos + creationResult.createdLogos.length) / analysisResult.total * 100),
        newLogosCreated: creationResult.createdLogos.length
      },
      details: {
        analysis: analysisResult,
        creation: creationResult,
        optimization: optimizationResult,
        update: updateResult,
        verification: verificationResult
      }
    };
    
    // Save report
    const reportPath = path.join(__dirname, `../logo-management-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 FINAL SUMMARY');
    console.log('================');
    console.log(`Organizations analyzed: ${report.summary.totalOrganizations}`);
    console.log(`Logo coverage: ${report.summary.coveragePercent}%`);
    console.log(`New logos created: ${report.summary.newLogosCreated}`);
    console.log(`Total logos now: ${report.summary.withLogos}`);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error in logo agents:', error);
  }
}

// Execute if run directly
if (require.main === module) {
  runLogoAgents().catch(console.error);
}

module.exports = { runLogoAgents };