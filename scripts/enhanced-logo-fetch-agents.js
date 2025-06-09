const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const puppeteer = require('puppeteer');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Organizations that still need real logos
const targetOrganizations = [
  { name: 'Association for Women\'s Rights in Development (AWID)', domain: 'awid.org', wikipedia: 'Association_for_Women%27s_Rights_in_Development' },
  { name: 'Austrian Development Agency (ADA)', domain: 'entwicklung.at', wikipedia: 'Austrian_Development_Agency' },
  { name: 'Czech Development Agency (CZDA)', domain: 'czda.cz', wikipedia: null },
  { name: 'Danish Embassy/Danish Government', domain: 'um.dk', wikipedia: 'Ministry_of_Foreign_Affairs_of_Denmark' },
  { name: 'Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH', domain: 'giz.de', wikipedia: 'Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit' },
  { name: 'Enabel - Belgian Development Agency', domain: 'enabel.be', wikipedia: 'Enabel' },
  { name: 'European Endowment for Democracy (EED)', domain: 'democracyendowment.eu', wikipedia: 'European_Endowment_for_Democracy' },
  { name: 'Finnish Ministry for Foreign Affairs', domain: 'formin.fi', wikipedia: 'Ministry_for_Foreign_Affairs_(Finland)' },
  { name: 'Food and Agriculture Organization (FAO) Ukraine', domain: 'fao.org/ukraine', wikipedia: 'Food_and_Agriculture_Organization' },
  { name: 'German Marshall Fund (GMF) - Black Sea Trust', domain: 'gmfus.org/black-sea-trust', wikipedia: 'German_Marshall_Fund' },
  { name: 'Heinrich Böll Foundation', domain: 'boell.de', wikipedia: 'Heinrich_B%C3%B6ll_Foundation' },
  { name: 'International Organization for Migration Ukraine', domain: 'ukraine.iom.int', wikipedia: 'International_Organization_for_Migration' },
  { name: 'International Renaissance Foundation (IRF)', domain: 'irf.ua', wikipedia: 'International_Renaissance_Foundation' },
  { name: 'International Visegrad Fund', domain: 'visegradfund.org', wikipedia: 'International_Visegrad_Fund' },
  { name: 'National Endowment for Democracy (NED)', domain: 'ned.org', wikipedia: 'National_Endowment_for_Democracy' },
  { name: 'OSCE Project Coordinator in Ukraine', domain: 'osce.org/project-coordinator-in-ukraine', wikipedia: 'Organization_for_Security_and_Co-operation_in_Europe' },
  { name: 'Reporters Sans Frontières (RSF)', domain: 'rsf.org', wikipedia: 'Reporters_Without_Borders' },
  { name: 'Swiss Agency for Development and Cooperation (DEZA)', domain: 'eda.admin.ch/sdc', wikipedia: 'Swiss_Agency_for_Development_and_Cooperation' },
  { name: 'UK Government', domain: 'gov.uk', wikipedia: 'Government_of_the_United_Kingdom' },
  { name: 'UNDP Ukraine', domain: 'ua.undp.org', wikipedia: 'United_Nations_Development_Programme' },
  { name: 'UNICEF Ukraine', domain: 'unicef.org/ukraine', wikipedia: 'UNICEF' },
  { name: 'UN Women ECA', domain: 'eca.unwomen.org', wikipedia: 'UN_Women' },
  { name: 'V-Dem Institute (Varieties of Democracy)', domain: 'v-dem.net', wikipedia: 'V-Dem_Institute' },
  { name: 'Network 100 percent life Rivne (EU funded)', domain: 'network.org.ua', wikipedia: null }
];

// Agent 1: Advanced URL Discovery Agent
async function advancedUrlDiscoveryAgent() {
  console.log('\n🔍 AGENT 1: Advanced URL Discovery Agent\n');
  console.log('Discovering logo URLs through multiple channels...\n');
  
  const discoveredUrls = [];
  
  // Enhanced URL patterns based on organization type
  const urlPatterns = {
    'awid.org': [
      'https://www.awid.org/sites/default/files/logo/awid-logo.png',
      'https://www.awid.org/themes/custom/awid/logo.png',
      'https://cdn.awid.org/logo.png'
    ],
    'entwicklung.at': [
      'https://www.entwicklung.at/typo3conf/ext/ada_sitepackage/Resources/Public/Images/ada-logo.svg',
      'https://www.entwicklung.at/fileadmin/ada/logo.svg'
    ],
    'giz.de': [
      'https://www.giz.de/static/en/html/img/giz-logo-en.svg',
      'https://www.giz.de/en/html/img/giz-logo.svg',
      'https://static.giz.de/logos/giz-logo.svg'
    ],
    'ned.org': [
      'https://www.ned.org/wp-content/uploads/2020/05/ned-logo.svg',
      'https://www.ned.org/wp-content/themes/ned/assets/images/logo.svg'
    ],
    'boell.de': [
      'https://www.boell.de/themes/boell/logo.svg',
      'https://www.boell.de/sites/default/files/logo_hbs.svg'
    ],
    'ukraine.iom.int': [
      'https://ukraine.iom.int/themes/custom/free_blank/logo.svg',
      'https://www.iom.int/themes/custom/iom/logo.svg'
    ],
    'rsf.org': [
      'https://rsf.org/themes/custom/rsf_theme/logo.svg',
      'https://rsf.org/sites/default/files/logo-rsf.svg'
    ],
    'gov.uk': [
      'https://assets.publishing.service.gov.uk/static/govuk-logo.png',
      'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/image/uk-gov-logo.png'
    ],
    'ua.undp.org': [
      'https://www.ua.undp.org/content/dam/ukraine/img/logos/undp-logo-blue.svg',
      'https://www.undp.org/sites/g/files/zskgke326/files/undp-logo.svg'
    ],
    'eca.unwomen.org': [
      'https://www.unwomen.org/sites/default/files/Headquarters/Images/Logos/UN-Women-Logo-English.svg',
      'https://eca.unwomen.org/themes/unwomen/logo.svg'
    ]
  };
  
  // Process each organization
  for (const org of targetOrganizations) {
    const slug = org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const urls = [];
    
    // Add specific patterns if available
    if (urlPatterns[org.domain]) {
      urlPatterns[org.domain].forEach(url => {
        urls.push({
          organization: org.name,
          slug: slug,
          url: url,
          source: 'specific_pattern',
          priority: 1
        });
      });
    }
    
    // Add Wikipedia-based URLs if available
    if (org.wikipedia) {
      urls.push({
        organization: org.name,
        slug: slug,
        url: `https://upload.wikimedia.org/wikipedia/commons/thumb/${org.wikipedia}-logo.svg/200px-${org.wikipedia}-logo.svg.png`,
        source: 'wikipedia',
        priority: 2
      });
    }
    
    // Add generic patterns
    const baseUrl = `https://${org.domain}`;
    const genericPatterns = [
      '/logo.svg', '/logo.png', '/images/logo.svg', '/img/logo.png',
      '/assets/images/logo.svg', '/content/logo.png', '/media/logo.svg'
    ];
    
    genericPatterns.forEach((pattern, idx) => {
      urls.push({
        organization: org.name,
        slug: slug,
        url: baseUrl + pattern,
        source: 'generic_pattern',
        priority: 3 + idx
      });
    });
    
    discoveredUrls.push(...urls);
  }
  
  console.log(`Discovered ${discoveredUrls.length} potential logo URLs`);
  
  return { urls: discoveredUrls };
}

// Agent 2: Web Scraping Agent
async function webScrapingAgent(organizations) {
  console.log('\n🌐 AGENT 2: Web Scraping Agent\n');
  console.log('Scraping websites for logo URLs...\n');
  
  const scrapedLogos = [];
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  for (const org of organizations.slice(0, 10)) { // Limit to prevent timeout
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log(`Scraping ${org.domain}...`);
      await page.goto(`https://${org.domain}`, { 
        waitUntil: 'networkidle2',
        timeout: 15000 
      });
      
      // Extract logo URLs from the page
      const logoData = await page.evaluate(() => {
        const possibleLogos = [];
        
        // Check meta tags
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) possibleLogos.push(ogImage.content);
        
        // Check common logo selectors
        const selectors = [
          'img[class*="logo"]', 'img[id*="logo"]', 'img[alt*="logo"]',
          '.logo img', '#logo img', 'header img', '.header img',
          'img[src*="logo"]', 'svg[class*="logo"]'
        ];
        
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.src) possibleLogos.push(el.src);
            if (el.getAttribute('data-src')) possibleLogos.push(el.getAttribute('data-src'));
          });
        });
        
        // Check SVG elements
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(svg => {
          if (svg.id && svg.id.includes('logo')) {
            possibleLogos.push('SVG_INLINE');
          }
        });
        
        return [...new Set(possibleLogos)];
      });
      
      if (logoData.length > 0) {
        const slug = org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        scrapedLogos.push({
          organization: org.name,
          slug: slug,
          urls: logoData.filter(url => url !== 'SVG_INLINE').slice(0, 3),
          hasInlineSvg: logoData.includes('SVG_INLINE')
        });
        console.log(`✅ Found ${logoData.length} potential logos for ${org.name}`);
      }
      
      await page.close();
    } catch (error) {
      console.log(`❌ Error scraping ${org.domain}: ${error.message}`);
    }
  }
  
  await browser.close();
  
  console.log(`\nScraped ${scrapedLogos.length} organizations successfully`);
  
  return { scrapedLogos };
}

// Agent 3: Logo Download & Validation Agent
async function logoDownloadValidationAgent(discoveredUrls, scrapedData) {
  console.log('\n⬇️ AGENT 3: Logo Download & Validation Agent\n');
  console.log('Downloading and validating logos...\n');
  
  const tempDir = path.join(__dirname, '../temp-enhanced-logos');
  await fs.mkdir(tempDir, { recursive: true });
  
  const downloadedLogos = [];
  const processedOrgs = new Set();
  
  // Combine all URLs
  const allUrls = [...discoveredUrls];
  scrapedData.forEach(data => {
    data.urls.forEach(url => {
      allUrls.push({
        organization: data.organization,
        slug: data.slug,
        url: url,
        source: 'scraped',
        priority: 0
      });
    });
  });
  
  // Sort by priority
  allUrls.sort((a, b) => a.priority - b.priority);
  
  // Download logos
  for (const logoData of allUrls) {
    if (processedOrgs.has(logoData.slug)) continue;
    
    try {
      const url = logoData.url;
      if (!url || !url.startsWith('http')) continue;
      
      const ext = path.extname(url.split('?')[0]) || '.png';
      const filename = `${logoData.slug}${ext}`;
      const filepath = path.join(tempDir, filename);
      
      // Download with curl
      const cmd = `curl -L -s -o "${filepath}" --fail --max-time 20 -H "User-Agent: Mozilla/5.0" "${url}"`;
      await execAsync(cmd);
      
      // Validate file
      const stats = await fs.stat(filepath);
      if (stats.size > 500 && stats.size < 5000000) { // Between 500 bytes and 5MB
        // Additional validation for image files
        try {
          const identifyCmd = `file "${filepath}" | grep -E "image|SVG"`;
          await execAsync(identifyCmd);
          
          downloadedLogos.push({
            organization: logoData.organization,
            slug: logoData.slug,
            url: url,
            tempPath: filepath,
            filename: filename,
            source: logoData.source,
            size: stats.size
          });
          
          processedOrgs.add(logoData.slug);
          console.log(`✅ Downloaded valid logo for ${logoData.organization} (${(stats.size/1024).toFixed(2)} KB)`);
        } catch {
          await fs.unlink(filepath).catch(() => {});
        }
      } else {
        await fs.unlink(filepath).catch(() => {});
      }
    } catch (error) {
      // Silent fail
    }
  }
  
  console.log(`\nSuccessfully downloaded ${downloadedLogos.length} valid logos`);
  
  return { downloadedLogos, tempDir };
}

// Agent 4: Logo Optimization Agent
async function logoOptimizationAgent(downloadedLogos) {
  console.log('\n🎨 AGENT 4: Logo Optimization Agent\n');
  console.log('Optimizing logos for web use...\n');
  
  const optimizedLogos = [];
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  
  for (const logo of downloadedLogos) {
    try {
      const finalPath = path.join(logoDir, logo.filename);
      
      // Remove old placeholder
      const placeholderPath = path.join(logoDir, `${logo.slug}.svg`);
      try {
        const placeholderStats = await fs.stat(placeholderPath);
        // Check if it's a placeholder (small size)
        if (placeholderStats.size < 5000) {
          await fs.unlink(placeholderPath);
          console.log(`🗑️  Removed placeholder for ${logo.organization}`);
        }
      } catch {}
      
      // Copy optimized logo
      await fs.copyFile(logo.tempPath, finalPath);
      
      optimizedLogos.push({
        organization: logo.organization,
        slug: logo.slug,
        filename: logo.filename,
        path: `/images/logos/${logo.filename}`,
        source: logo.source,
        size: logo.size
      });
      
      console.log(`✅ Optimized logo for ${logo.organization}`);
      
    } catch (err) {
      console.error(`Error optimizing logo for ${logo.organization}:`, err.message);
    }
  }
  
  console.log(`\nOptimized ${optimizedLogos.length} logos`);
  
  return { optimizedLogos };
}

// Agent 5: Final Integration Agent
async function finalIntegrationAgent(optimizedLogos, tempDir) {
  console.log('\n🔄 AGENT 5: Final Integration Agent\n');
  console.log('Integrating logos into the system...\n');
  
  // Load and update mapping
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  let logoMapping = {};
  
  try {
    const existingData = await fs.readFile(mappingPath, 'utf8');
    logoMapping = JSON.parse(existingData);
  } catch {}
  
  // Update with new logos
  let updatedCount = 0;
  for (const logo of optimizedLogos) {
    const oldPath = logoMapping[logo.slug];
    if (oldPath !== logo.path) {
      logoMapping[logo.slug] = logo.path;
      updatedCount++;
      console.log(`✅ Updated ${logo.organization}`);
    }
  }
  
  // Sort and save
  const sortedMapping = {};
  Object.keys(logoMapping).sort().forEach(key => {
    sortedMapping[key] = logoMapping[key];
  });
  
  await fs.writeFile(mappingPath, JSON.stringify(sortedMapping, null, 2));
  
  // Clean up temp directory
  try {
    const files = await fs.readdir(tempDir);
    for (const file of files) {
      await fs.unlink(path.join(tempDir, file)).catch(() => {});
    }
    await fs.rmdir(tempDir).catch(() => {});
  } catch {}
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalLogosUpdated: updatedCount,
      totalMappings: Object.keys(sortedMapping).length,
      successRate: `${Math.round(updatedCount / targetOrganizations.length * 100)}%`
    },
    details: optimizedLogos.map(l => ({
      organization: l.organization,
      file: l.filename,
      source: l.source,
      size: `${(l.size / 1024).toFixed(2)} KB`
    }))
  };
  
  console.log(`\n📊 Integration Complete:`);
  console.log(`Updated: ${updatedCount} logos`);
  console.log(`Total mappings: ${Object.keys(sortedMapping).length}`);
  console.log(`Success rate: ${report.summary.successRate}`);
  
  return report;
}

// Main execution
async function runEnhancedLogoAgents() {
  console.log('🤖 ENHANCED LOGO FETCHING AGENTS ACTIVATED');
  console.log('==========================================\n');
  
  try {
    // Run all agents
    const discoveryResult = await advancedUrlDiscoveryAgent();
    const scrapingResult = await webScrapingAgent(targetOrganizations);
    const downloadResult = await logoDownloadValidationAgent(discoveryResult.urls, scrapingResult.scrapedLogos);
    const optimizationResult = await logoOptimizationAgent(downloadResult.downloadedLogos);
    const integrationResult = await finalIntegrationAgent(optimizationResult.optimizedLogos, downloadResult.tempDir);
    
    // Save report
    const reportPath = path.join(__dirname, `../enhanced-logo-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify({
      discovery: { urlsFound: discoveryResult.urls.length },
      scraping: { organizationsScraped: scrapingResult.scrapedLogos.length },
      download: { logosDownloaded: downloadResult.downloadedLogos.length },
      optimization: { logosOptimized: optimizationResult.optimizedLogos.length },
      integration: integrationResult
    }, null, 2));
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Execute
if (require.main === module) {
  runEnhancedLogoAgents().catch(console.error);
}

module.exports = { runEnhancedLogoAgents };