const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Agent 1: Website Discovery Agent
async function websiteDiscoveryAgent() {
  console.log('\n🌐 AGENT 1: Website Discovery Agent\n');
  console.log('Discovering organization websites and domains...\n');
  
  // Get organizations that need real logos
  const placeholderOrgs = [
    { name: 'Association for Women\'s Rights in Development (AWID)', domain: 'awid.org' },
    { name: 'Austrian Development Agency (ADA)', domain: 'entwicklung.at' },
    { name: 'Czech Development Agency (CZDA)', domain: 'czda.cz' },
    { name: 'Danish Embassy/Danish Government', domain: 'um.dk' },
    { name: 'Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH', domain: 'giz.de' },
    { name: 'Enabel - Belgian Development Agency', domain: 'enabel.be' },
    { name: 'European Endowment for Democracy (EED)', domain: 'democracyendowment.eu' },
    { name: 'Finnish Ministry for Foreign Affairs', domain: 'formin.fi' },
    { name: 'Food and Agriculture Organization (FAO) Ukraine', domain: 'fao.org' },
    { name: 'German Marshall Fund (GMF) - Black Sea Trust', domain: 'gmfus.org' },
    { name: 'Heinrich Böll Foundation', domain: 'boell.de' },
    { name: 'International Organization for Migration Ukraine', domain: 'iom.int' },
    { name: 'International Renaissance Foundation (IRF)', domain: 'irf.ua' },
    { name: 'International Visegrad Fund', domain: 'visegradfund.org' },
    { name: 'National Endowment for Democracy (NED)', domain: 'ned.org' },
    { name: 'Orange Projects Lithuania', domain: 'orangeprojects.lt' },
    { name: 'OSCE Project Coordinator in Ukraine', domain: 'osce.org' },
    { name: 'Reporters Sans Frontières (RSF)', domain: 'rsf.org' },
    { name: 'Swiss Agency for Development and Cooperation (DEZA)', domain: 'eda.admin.ch' },
    { name: 'UK Government', domain: 'gov.uk' },
    { name: 'UNDP Ukraine', domain: 'undp.org' },
    { name: 'UNICEF Ukraine', domain: 'unicef.org' },
    { name: 'UN Women ECA', domain: 'unwomen.org' },
    { name: 'V-Dem Institute (Varieties of Democracy)', domain: 'v-dem.net' },
    { name: 'World Health Organization Ukraine', domain: 'who.int' },
    { name: 'Network 100 percent life Rivne (EU funded)', domain: 'network100.org.ua' },
    { name: 'IRF/Open Society', domain: 'opensocietyfoundations.org' }
  ];
  
  const discovered = [];
  
  for (const org of placeholderOrgs) {
    const slug = org.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    discovered.push({
      organization: org.name,
      slug: slug,
      domain: org.domain,
      baseUrl: `https://${org.domain}`,
      potentialPaths: [
        '/logo.svg',
        '/logo.png',
        '/images/logo.svg',
        '/images/logo.png',
        '/assets/logo.svg',
        '/assets/logo.png',
        '/img/logo.svg',
        '/img/logo.png',
        '/media/logo.svg',
        '/media/logo.png',
        '/wp-content/themes/*/logo.png',
        '/wp-content/uploads/logo.png'
      ]
    });
  }
  
  console.log(`Discovered ${discovered.length} organization websites`);
  
  return {
    organizations: discovered,
    totalFound: discovered.length
  };
}

// Agent 2: Logo URL Intelligence Agent
async function logoUrlIntelligenceAgent(organizations) {
  console.log('\n🔍 AGENT 2: Logo URL Intelligence Agent\n');
  console.log('Using multiple strategies to find logo URLs...\n');
  
  const logoUrls = [];
  
  // Strategy 1: Common CDN patterns
  const cdnPatterns = {
    'awid.org': 'https://www.awid.org/sites/default/files/atoms/files/awid_logo.png',
    'entwicklung.at': 'https://www.entwicklung.at/fileadmin/user_upload/Dokumente/Logos/ADA_Logo.svg',
    'czda.cz': 'https://www.czda.cz/img/logo-czda.svg',
    'giz.de': 'https://www.giz.de/static/en/images/giz-logo.svg',
    'enabel.be': 'https://www.enabel.be/sites/default/files/logo_enabel.svg',
    'democracyendowment.eu': 'https://www.democracyendowment.eu/images/logos/eed-logo.svg',
    'formin.fi': 'https://um.fi/o/um-theme/images/um_logo_en.svg',
    'fao.org': 'https://www.fao.org/typo3temp/assets/images/fao-logo-en.svg',
    'gmfus.org': 'https://www.gmfus.org/themes/custom/gmfus/logo.svg',
    'boell.de': 'https://www.boell.de/sites/default/files/logo_boell_de.svg',
    'iom.int': 'https://www.iom.int/sites/g/files/tmzbdl486/files/iom-logo.svg',
    'irf.ua': 'https://www.irf.ua/content/images/logo.svg',
    'visegradfund.org': 'https://www.visegradfund.org/media/logo-ivf.svg',
    'ned.org': 'https://www.ned.org/wp-content/themes/ned/images/logo.svg',
    'osce.org': 'https://www.osce.org/files/f/images/4/5/450142.png',
    'rsf.org': 'https://rsf.org/themes/custom/rsf/logo.svg',
    'eda.admin.ch': 'https://www.eda.admin.ch/etc/designs/eda/media/logo/logo-ch.svg',
    'gov.uk': 'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/organization/logo/uk-government-logo.png',
    'undp.org': 'https://www.undp.org/themes/custom/undp_blt/images/undp-logo.svg',
    'unicef.org': 'https://www.unicef.org/themes/custom/unicef_b2/logo.svg',
    'unwomen.org': 'https://www.unwomen.org/themes/custom/unwomen/logo.svg',
    'v-dem.net': 'https://www.v-dem.net/static/img/v-dem-logo.png',
    'who.int': 'https://www.who.int/images/default-source/fallback/who-logo.png',
    'opensocietyfoundations.org': 'https://www.opensocietyfoundations.org/themes/custom/osf/logo.svg'
  };
  
  // Strategy 2: GitHub organizations
  const githubOrgs = {
    'giz.de': 'https://raw.githubusercontent.com/GIZ-Digital/logos/main/giz-logo.svg',
    'iom.int': 'https://raw.githubusercontent.com/IOM/logos/main/iom-logo.svg',
    'undp.org': 'https://raw.githubusercontent.com/UNDP/logos/main/undp-logo.svg'
  };
  
  // Strategy 3: Media kit URLs
  const mediaKitUrls = {
    'awid.org': 'https://www.awid.org/media-kit',
    'ned.org': 'https://www.ned.org/about/media-resources/',
    'rsf.org': 'https://rsf.org/en/press-resources'
  };
  
  for (const org of organizations) {
    const urls = [];
    
    // Try CDN pattern first
    if (cdnPatterns[org.domain]) {
      urls.push({
        organization: org.organization,
        slug: org.slug,
        url: cdnPatterns[org.domain],
        source: 'cdn_pattern',
        priority: 1
      });
    }
    
    // Try GitHub
    if (githubOrgs[org.domain]) {
      urls.push({
        organization: org.organization,
        slug: org.slug,
        url: githubOrgs[org.domain],
        source: 'github',
        priority: 2
      });
    }
    
    // Add common paths
    org.potentialPaths.forEach((path, index) => {
      urls.push({
        organization: org.organization,
        slug: org.slug,
        url: org.baseUrl + path,
        source: 'common_path',
        priority: 3 + index
      });
    });
    
    logoUrls.push(...urls.slice(0, 5)); // Keep top 5 URLs per org
  }
  
  console.log(`Generated ${logoUrls.length} potential logo URLs`);
  
  return {
    logoUrls: logoUrls.sort((a, b) => a.priority - b.priority)
  };
}

// Agent 3: Logo Fetching Agent
async function logoFetchingAgent(logoUrls) {
  console.log('\n⬇️ AGENT 3: Logo Fetching Agent\n');
  console.log('Attempting to download logos from discovered URLs...\n');
  
  const tempDir = path.join(__dirname, '../temp-real-logos');
  await fs.mkdir(tempDir, { recursive: true });
  
  const fetchedLogos = [];
  const processedOrgs = new Set();
  
  // Helper function to download with curl
  async function downloadWithCurl(url, filepath) {
    try {
      const cmd = `curl -L -s -o "${filepath}" --fail --connect-timeout 10 --max-time 30 -H "User-Agent: Mozilla/5.0" "${url}"`;
      await execAsync(cmd);
      
      // Check if file exists and has content
      const stats = await fs.stat(filepath);
      return stats.size > 100; // Minimum 100 bytes
    } catch (error) {
      return false;
    }
  }
  
  for (const logoUrl of logoUrls.slice(0, 100)) { // Limit attempts
    if (processedOrgs.has(logoUrl.slug)) continue;
    
    const ext = path.extname(logoUrl.url.split('?')[0]) || '.png';
    const filename = `${logoUrl.slug}${ext}`;
    const filepath = path.join(tempDir, filename);
    
    console.log(`Trying ${logoUrl.source}: ${logoUrl.url.substring(0, 60)}...`);
    
    const success = await downloadWithCurl(logoUrl.url, filepath);
    
    if (success) {
      fetchedLogos.push({
        organization: logoUrl.organization,
        slug: logoUrl.slug,
        url: logoUrl.url,
        tempPath: filepath,
        filename: filename,
        source: logoUrl.source
      });
      processedOrgs.add(logoUrl.slug);
      console.log(`✅ Downloaded logo for ${logoUrl.organization}`);
    } else {
      try {
        await fs.unlink(filepath).catch(() => {});
      } catch {}
    }
  }
  
  console.log(`\nSuccessfully fetched ${fetchedLogos.length} real logos`);
  
  return {
    fetchedLogos,
    tempDirectory: tempDir
  };
}

// Agent 4: Logo Processing & Optimization Agent
async function logoProcessingAgent(fetchedLogos) {
  console.log('\n🎨 AGENT 4: Logo Processing & Optimization Agent\n');
  console.log('Processing and optimizing fetched logos...\n');
  
  const processedLogos = [];
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  
  for (const logo of fetchedLogos) {
    try {
      // Check file type and size
      const stats = await fs.stat(logo.tempPath);
      console.log(`Processing ${logo.filename} (${(stats.size / 1024).toFixed(2)} KB)`);
      
      // Determine final filename
      let finalFilename = logo.filename;
      
      // For very large files, we might want to convert/optimize
      if (stats.size > 500 * 1024) {
        console.log(`⚠️  Large file detected: ${logo.filename} - keeping original`);
      }
      
      const finalPath = path.join(logoDir, finalFilename);
      
      // Remove placeholder if it exists
      const placeholderPath = path.join(logoDir, `${logo.slug}.svg`);
      try {
        await fs.unlink(placeholderPath);
        console.log(`🗑️  Removed placeholder for ${logo.organization}`);
      } catch {}
      
      // Copy to final location
      await fs.copyFile(logo.tempPath, finalPath);
      
      processedLogos.push({
        organization: logo.organization,
        slug: logo.slug,
        filename: finalFilename,
        path: `/images/logos/${finalFilename}`,
        source: logo.source,
        size: stats.size
      });
      
      console.log(`✅ Processed logo for ${logo.organization}`);
      
    } catch (err) {
      console.error(`Error processing logo for ${logo.organization}:`, err.message);
    }
  }
  
  // Clean up temp directory
  try {
    const tempFiles = await fs.readdir(fetchedLogos.tempDirectory);
    for (const file of tempFiles) {
      await fs.unlink(path.join(fetchedLogos.tempDirectory, file)).catch(() => {});
    }
    await fs.rmdir(fetchedLogos.tempDirectory).catch(() => {});
  } catch {}
  
  console.log(`\nProcessed ${processedLogos.length} logos successfully`);
  
  return {
    processedLogos
  };
}

// Agent 5: Logo Integration & Verification Agent
async function logoIntegrationAgent(processedLogos) {
  console.log('\n🔄 AGENT 5: Logo Integration & Verification Agent\n');
  console.log('Updating logo mappings and verifying integration...\n');
  
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  let logoMapping = {};
  
  // Load existing mapping
  try {
    const existingData = await fs.readFile(mappingPath, 'utf8');
    logoMapping = JSON.parse(existingData);
  } catch (err) {
    console.log('Starting with empty mapping');
  }
  
  // Update mapping with real logos
  let updatedCount = 0;
  for (const logo of processedLogos) {
    const oldPath = logoMapping[logo.slug];
    logoMapping[logo.slug] = logo.path;
    
    if (oldPath !== logo.path) {
      updatedCount++;
      console.log(`✅ Updated ${logo.organization}: ${oldPath} → ${logo.path}`);
    }
  }
  
  // Sort alphabetically
  const sortedMapping = {};
  Object.keys(logoMapping).sort().forEach(key => {
    sortedMapping[key] = logoMapping[key];
  });
  
  // Save updated mapping
  await fs.writeFile(
    mappingPath,
    JSON.stringify(sortedMapping, null, 2)
  );
  
  console.log(`\n✅ Updated logo mapping with ${updatedCount} real logos`);
  
  // Verify all logos exist
  let verifiedCount = 0;
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  
  for (const [slug, logoPath] of Object.entries(sortedMapping)) {
    const filename = logoPath.replace('/images/logos/', '');
    const filepath = path.join(logoDir, filename);
    
    try {
      await fs.access(filepath);
      verifiedCount++;
    } catch {
      console.log(`❌ Missing file: ${filename}`);
    }
  }
  
  console.log(`\n📊 Verification Complete:`);
  console.log(`Total mappings: ${Object.keys(sortedMapping).length}`);
  console.log(`Verified files: ${verifiedCount}`);
  console.log(`Real logos added: ${updatedCount}`);
  
  // Generate final report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalMappings: Object.keys(sortedMapping).length,
      realLogosAdded: updatedCount,
      verifiedFiles: verifiedCount
    },
    processedLogos: processedLogos.map(l => ({
      organization: l.organization,
      file: l.filename,
      source: l.source,
      size: `${(l.size / 1024).toFixed(2)} KB`
    }))
  };
  
  return report;
}

// Main execution
async function runRealLogoAgents() {
  console.log('🤖 REAL LOGO FETCHING AGENTS ACTIVATED');
  console.log('=====================================\n');
  
  try {
    // Run all agents in sequence
    const discoveryResult = await websiteDiscoveryAgent();
    const intelligenceResult = await logoUrlIntelligenceAgent(discoveryResult.organizations);
    const fetchResult = await logoFetchingAgent(intelligenceResult.logoUrls);
    const processResult = await logoProcessingAgent(fetchResult.fetchedLogos);
    const integrationResult = await logoIntegrationAgent(processResult.processedLogos);
    
    // Save final report
    const reportPath = path.join(__dirname, `../real-logo-fetch-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify({
      discovery: {
        organizationsFound: discoveryResult.totalFound
      },
      intelligence: {
        urlsGenerated: intelligenceResult.logoUrls.length
      },
      fetching: {
        logosDownloaded: fetchResult.fetchedLogos.length
      },
      processing: {
        logosProcessed: processResult.processedLogos.length
      },
      integration: integrationResult
    }, null, 2));
    
    console.log(`\n📊 FINAL SUMMARY`);
    console.log(`================`);
    console.log(`Organizations processed: ${discoveryResult.totalFound}`);
    console.log(`Real logos downloaded: ${fetchResult.fetchedLogos.length}`);
    console.log(`Logos integrated: ${integrationResult.summary.realLogosAdded}`);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error in real logo agents:', error);
  }
}

// Execute if run directly
if (require.main === module) {
  runRealLogoAgents().catch(console.error);
}

module.exports = { runRealLogoAgents };