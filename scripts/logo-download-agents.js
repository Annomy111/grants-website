const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to download file
async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = require('fs').createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath).catch(() => {});
      reject(err);
    });
  });
}

// Agent 1: Logo Discovery Agent
async function logoDiscoveryAgent() {
  console.log('\n🔍 AGENT 1: Logo Discovery Agent\n');
  console.log('Identifying organizations without logos...\n');
  
  // Load existing logo mapping
  let existingLogos = {};
  try {
    const logoData = await fs.readFile(
      path.join(__dirname, '../client/public/data/organization-logos.json'),
      'utf8'
    );
    existingLogos = JSON.parse(logoData);
  } catch (err) {
    console.log('Starting with empty logo mapping');
  }
  
  // Get all unique organizations
  const { data: grants, error } = await supabase
    .from('grants')
    .select('funding_organization, website_link');
    
  if (error) {
    console.error('Error fetching organizations:', error);
    return { missingLogos: [] };
  }
  
  // Create unique organization list with their websites
  const organizations = {};
  for (const grant of grants) {
    if (!organizations[grant.funding_organization]) {
      organizations[grant.funding_organization] = grant.website_link;
    }
  }
  
  // Find organizations without logos
  const missingLogos = [];
  for (const [org, website] of Object.entries(organizations)) {
    const slug = org.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!existingLogos[slug]) {
      missingLogos.push({
        organization: org,
        slug: slug,
        website: website,
        potentialLogoFile: `${slug}.svg`
      });
    }
  }
  
  console.log(`Found ${missingLogos.length} organizations without logos`);
  
  return {
    totalOrganizations: Object.keys(organizations).length,
    existingLogos: Object.keys(existingLogos).length,
    missingLogos: missingLogos
  };
}

// Agent 2: Logo URL Research Agent
async function logoUrlResearchAgent(missingLogos) {
  console.log('\n🌐 AGENT 2: Logo URL Research Agent\n');
  console.log('Researching potential logo URLs...\n');
  
  const logoUrls = [];
  
  // Common logo URL patterns
  const logoPatterns = [
    '/logo.svg',
    '/logo.png',
    '/images/logo.svg',
    '/images/logo.png',
    '/assets/logo.svg',
    '/assets/logo.png',
    '/img/logo.svg',
    '/img/logo.png',
    '/favicon.ico',
    '/apple-touch-icon.png'
  ];
  
  for (const org of missingLogos.slice(0, 20)) { // Process first 20
    const potentialUrls = [];
    
    if (org.website) {
      try {
        const baseUrl = new URL(org.website).origin;
        
        // Try common patterns
        for (const pattern of logoPatterns) {
          potentialUrls.push({
            organization: org.organization,
            slug: org.slug,
            url: baseUrl + pattern,
            type: path.extname(pattern).slice(1) || 'ico'
          });
        }
        
        // Add organization-specific patterns
        const orgSpecificPatterns = [
          `/images/${org.slug}-logo.svg`,
          `/assets/${org.slug}.png`,
          `/logos/${org.slug}.svg`
        ];
        
        for (const pattern of orgSpecificPatterns) {
          potentialUrls.push({
            organization: org.organization,
            slug: org.slug,
            url: baseUrl + pattern,
            type: path.extname(pattern).slice(1)
          });
        }
      } catch (err) {
        console.log(`Invalid website URL for ${org.organization}: ${org.website}`);
      }
    }
    
    if (potentialUrls.length > 0) {
      logoUrls.push(...potentialUrls.slice(0, 5)); // Keep first 5 attempts per org
    }
  }
  
  console.log(`Generated ${logoUrls.length} potential logo URLs to test`);
  
  return {
    potentialUrls: logoUrls,
    organizationsProcessed: Math.min(20, missingLogos.length)
  };
}

// Agent 3: Logo Download Agent
async function logoDownloadAgent(potentialUrls) {
  console.log('\n⬇️ AGENT 3: Logo Download Agent\n');
  console.log('Attempting to download logos...\n');
  
  const downloadedLogos = [];
  const tempDir = path.join(__dirname, '../temp-logos');
  
  // Create temp directory
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (err) {
    console.error('Error creating temp directory:', err);
  }
  
  // Try downloading logos
  for (const logoUrl of potentialUrls.slice(0, 50)) { // Limit to 50 attempts
    const filename = `${logoUrl.slug}.${logoUrl.type}`;
    const filepath = path.join(tempDir, filename);
    
    try {
      console.log(`Trying ${logoUrl.url}...`);
      await downloadFile(logoUrl.url, filepath);
      
      // Check if file was downloaded successfully
      const stats = await fs.stat(filepath);
      if (stats.size > 0) {
        downloadedLogos.push({
          organization: logoUrl.organization,
          slug: logoUrl.slug,
          originalUrl: logoUrl.url,
          tempPath: filepath,
          filename: filename,
          size: stats.size,
          type: logoUrl.type
        });
        console.log(`✅ Downloaded logo for ${logoUrl.organization}`);
        break; // Got one logo for this org, move to next
      } else {
        await fs.unlink(filepath);
      }
    } catch (err) {
      // Silent fail - logo URL doesn't exist
      try {
        await fs.unlink(filepath).catch(() => {});
      } catch {}
    }
  }
  
  console.log(`\nSuccessfully downloaded ${downloadedLogos.length} logos`);
  
  return {
    downloadedLogos,
    tempDirectory: tempDir
  };
}

// Agent 4: Logo Processing Agent
async function logoProcessingAgent(downloadedLogos) {
  console.log('\n🎨 AGENT 4: Logo Processing Agent\n');
  console.log('Processing and optimizing logos...\n');
  
  const processedLogos = [];
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  
  for (const logo of downloadedLogos) {
    try {
      // Determine final filename (prefer SVG)
      let finalFilename = `${logo.slug}.svg`;
      if (logo.type !== 'svg') {
        finalFilename = `${logo.slug}.png`;
      }
      
      const finalPath = path.join(logoDir, finalFilename);
      
      // Copy to final location
      await fs.copyFile(logo.tempPath, finalPath);
      
      // Clean up temp file
      await fs.unlink(logo.tempPath).catch(() => {});
      
      processedLogos.push({
        organization: logo.organization,
        slug: logo.slug,
        filename: finalFilename,
        path: `/images/logos/${finalFilename}`,
        type: logo.type,
        size: logo.size
      });
      
      console.log(`✅ Processed logo for ${logo.organization}`);
      
    } catch (err) {
      console.error(`Error processing logo for ${logo.organization}:`, err.message);
    }
  }
  
  // Clean up temp directory
  try {
    await fs.rmdir(downloadedLogos.tempDirectory);
  } catch {}
  
  console.log(`\nProcessed ${processedLogos.length} logos successfully`);
  
  return {
    processedLogos
  };
}

// Agent 5: Logo Integration Agent
async function logoIntegrationAgent(processedLogos) {
  console.log('\n🔗 AGENT 5: Logo Integration Agent\n');
  console.log('Updating logo mappings...\n');
  
  // Load existing mapping
  let logoMapping = {};
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  
  try {
    const existingData = await fs.readFile(mappingPath, 'utf8');
    logoMapping = JSON.parse(existingData);
  } catch (err) {
    console.log('Starting with empty mapping');
  }
  
  // Add new logos to mapping
  let addedCount = 0;
  for (const logo of processedLogos) {
    if (!logoMapping[logo.slug]) {
      logoMapping[logo.slug] = logo.path;
      addedCount++;
      console.log(`✅ Added mapping for ${logo.organization}`);
    }
  }
  
  // Sort mapping alphabetically
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
    console.log(`\n✅ Updated logo mapping file with ${addedCount} new entries`);
  } catch (err) {
    console.error('Error saving mapping:', err);
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalLogosInMapping: Object.keys(sortedMapping).length,
    newLogosAdded: addedCount,
    processedLogos: processedLogos.map(l => ({
      organization: l.organization,
      file: l.filename,
      size: `${(l.size / 1024).toFixed(2)} KB`
    }))
  };
  
  return report;
}

// Main execution
async function runLogoAgents() {
  console.log('🤖 LOGO DOWNLOAD AGENTS ACTIVATED');
  console.log('==================================\n');
  
  try {
    // Run agents in sequence
    const discoveryResult = await logoDiscoveryAgent();
    
    if (discoveryResult.missingLogos.length === 0) {
      console.log('\n✅ All organizations already have logos!');
      return;
    }
    
    const researchResult = await logoUrlResearchAgent(discoveryResult.missingLogos);
    const downloadResult = await logoDownloadAgent(researchResult.potentialUrls);
    const processResult = await logoProcessingAgent(downloadResult.downloadedLogos);
    const integrationResult = await logoIntegrationAgent(processResult.processedLogos);
    
    // Save final report
    const reportPath = path.join(__dirname, `../logo-download-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify({
      discovery: {
        total: discoveryResult.totalOrganizations,
        missing: discoveryResult.missingLogos.length
      },
      research: researchResult,
      download: {
        attempted: researchResult.potentialUrls.length,
        successful: downloadResult.downloadedLogos.length
      },
      processing: {
        processed: processResult.processedLogos.length
      },
      integration: integrationResult
    }, null, 2));
    
    console.log(`\n📊 FINAL SUMMARY`);
    console.log(`================`);
    console.log(`Organizations checked: ${discoveryResult.totalOrganizations}`);
    console.log(`Missing logos found: ${discoveryResult.missingLogos.length}`);
    console.log(`Logos downloaded: ${downloadResult.downloadedLogos.length}`);
    console.log(`Logos integrated: ${integrationResult.newLogosAdded}`);
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