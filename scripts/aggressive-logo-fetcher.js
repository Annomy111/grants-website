const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Organizations with placeholder logos
const remainingOrgs = [
  { name: 'Article 19', slug: 'article-19', urls: [
    'https://www.article19.org/wp-content/themes/article19/assets/images/logo.svg',
    'https://www.article19.org/wp-content/uploads/2021/02/ARTICLE-19-logo.png',
    'https://pbs.twimg.com/profile_images/1290617127803506689/fMnJpYDL_400x400.jpg'
  ]},
  { name: 'British Embassy Kyiv', slug: 'british-embassy-kyiv', urls: [
    'https://assets.publishing.service.gov.uk/media/5fbfdc18e90e0732c1b3e3e4/UK_government_logo.svg',
    'https://www.gov.uk/assets/static/govuk-crest-2x.png'
  ]},
  { name: 'Council of Europe', slug: 'council-of-europe', urls: [
    'https://www.coe.int/documents/16695/0/COE-Logo.png',
    'https://edoc.coe.int/img/logo_en.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Council_of_Europe_logo_%282013_revised_version%29.svg/200px-Council_of_Europe_logo.svg.png'
  ]},
  { name: 'European Union', slug: 'european-union', urls: [
    'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg',
    'https://europa.eu/!bY77DG/img/logos/logo_en.gif',
    'https://cdn.pixabay.com/photo/2020/03/11/15/16/european-union-4922525_960_720.png'
  ]},
  { name: 'GIZ German Government', slug: 'giz-german-government', urls: [
    'https://www.giz.de/static/en/images/giz-logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit_%28GIZ%29_logo.svg/200px-GIZ_logo.svg.png'
  ]},
  { name: 'Global Fund for Women', slug: 'global-fund-for-women', urls: [
    'https://www.globalfundforwomen.org/wp-content/themes/gfw/assets/images/logo.svg',
    'https://www.globalfundforwomen.org/wp-content/uploads/2020/08/gfw-logo.png'
  ]},
  { name: 'Heinrich Böll Foundation', slug: 'heinrich-boll-foundation', urls: [
    'https://www.boell.de/sites/default/files/2021-12/hbs_logo_en_green.svg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4a/Heinrich-B%C3%B6ll-Stiftung_Logo.svg'
  ]},
  { name: 'International Renaissance Foundation', slug: 'international-renaissance-foundation', urls: [
    'https://www.irf.ua/content/images/irf-logo-en.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/International_Renaissance_Foundation_logo.svg/200px-IRF_logo.svg.png'
  ]},
  { name: 'Internews', slug: 'internews', urls: [
    'https://internews.org/wp-content/themes/internews/assets/images/internews-logo.svg',
    'https://internews.org/wp-content/uploads/2021/02/internews-logo.png'
  ]},
  { name: 'IREX', slug: 'irex', urls: [
    'https://www.irex.org/themes/custom/irex/logo.svg',
    'https://www.irex.org/sites/default/files/irex-logo.png'
  ]},
  { name: 'IRI', slug: 'iri', urls: [
    'https://www.iri.org/wp-content/themes/iri/assets/images/iri-logo.svg',
    'https://www.iri.org/wp-content/uploads/2023/01/iri-logo.png'
  ]},
  { name: 'King Baudouin Foundation', slug: 'king-baudouin-foundation', urls: [
    'https://kbs-frb.be/themes/custom/kbs/logo.svg',
    'https://kbs-frb.be/sites/default/files/2021-03/kbf-logo.png'
  ]},
  { name: 'Lithuanian Ministry of Foreign Affairs', slug: 'lithuanian-ministry-foreign-affairs', urls: [
    'https://urm.lt/themes/custom/urm/logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Lithuania_MFA_logo.svg/200px-Lithuania_MFA_logo.svg.png'
  ]},
  { name: 'Luminate', slug: 'luminate', urls: [
    'https://www.luminategroup.com/themes/custom/luminate/logo.svg',
    'https://www.luminategroup.com/sites/default/files/luminate-logo.png'
  ]},
  { name: 'Mama Cash', slug: 'mama-cash', urls: [
    'https://www.mamacash.org/media/logo/logo-mama-cash.svg',
    'https://www.mamacash.org/themes/mamacash/images/logo.png'
  ]},
  { name: 'NDI', slug: 'ndi', urls: [
    'https://www.ndi.org/themes/ndi/logo.svg',
    'https://www.ndi.org/sites/default/files/ndi-logo.png'
  ]},
  { name: 'Nordic Council of Ministers', slug: 'nordic-council-of-ministers', urls: [
    'https://www.norden.org/themes/custom/nord/logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Nordic_Council_logo.svg/200px-Nordic_Council_logo.svg.png'
  ]},
  { name: 'Norwegian Helsinki Committee', slug: 'norwegian-helsinki-committee', urls: [
    'https://www.nhc.no/content/themes/nhc/assets/images/logo.svg',
    'https://www.nhc.no/content/uploads/2018/03/nhc-logo.png'
  ]},
  { name: 'Open Government Partnership', slug: 'open-government-partnership', urls: [
    'https://www.opengovpartnership.org/wp-content/themes/ogp/assets/images/logo.svg',
    'https://www.opengovpartnership.org/wp-content/uploads/2019/06/OGP-logo.png'
  ]},
  { name: 'People in Need', slug: 'people-in-need', urls: [
    'https://www.peopleinneed.net/media/logo/pin-logo.svg',
    'https://www.clovekvtisni.cz/themes/pin/logo.svg'
  ]},
  { name: 'Pivot', slug: 'pivot', urls: [
    'https://www.pivot.org.au/themes/custom/pivot/logo.svg',
    'https://cdn.thebigissue.org.au/wp-content/uploads/2021/03/pivot-logo.png'
  ]},
  { name: 'Porticus', slug: 'porticus-blue', urls: [
    'https://www.porticus.com/themes/custom/porticus/logo.svg',
    'https://www.porticus.com/wp-content/uploads/2020/12/porticus-logo.png'
  ]},
  { name: 'Robert Bosch Stiftung', slug: 'robert-bosch-stiftung', urls: [
    'https://www.bosch-stiftung.de/themes/custom/bosch/logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Bosch-logotype.svg/200px-Bosch-logotype.svg.png'
  ]},
  { name: 'Rockefeller Brothers Fund', slug: 'rockefeller-brothers-fund', urls: [
    'https://www.rbf.org/themes/custom/rbf/logo.svg',
    'https://www.rbf.org/sites/default/files/rbf-logo.png'
  ]},
  { name: 'SDC', slug: 'sdc', urls: [
    'https://www.eda.admin.ch/etc/designs/eda/media/deza/logo-deza-en.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Swiss_Agency_for_Development_and_Cooperation_logo.svg/200px-SDC_logo.svg.png'
  ]},
  { name: 'SIDA/NORAD', slug: 'sida-norad', urls: [
    'https://www.sida.se/globalassets/global/logo/sida-logo.svg',
    'https://www.norad.no/globalassets/norad-logo.svg'
  ]},
  { name: 'Slovak Agency for International Development', slug: 'slovak-agency-international-development', urls: [
    'https://slovakaid.sk/themes/custom/slovakaid/logo.svg',
    'https://www.mzv.sk/documents/10182/12495/samrs_logo.png'
  ]},
  { name: 'UNDP Denmark', slug: 'undp-denmark', urls: [
    'https://www.undp.org/themes/custom/undp/assets/images/undp-logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/UNDP_logo.svg/200px-UNDP_logo.svg.png'
  ]},
  { name: 'UK Government', slug: 'uk-government', urls: [
    'https://assets.publishing.service.gov.uk/static/govuk-logo-2x.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/HM_Government_logo.svg/200px-HM_Government_logo.svg.png'
  ]}
];

// Agent 1: Direct Download Agent
async function directDownloadAgent() {
  console.log('\n💪 AGENT 1: Aggressive Direct Download\n');
  
  const tempDir = path.join(__dirname, '../temp-aggressive-logos');
  await fs.mkdir(tempDir, { recursive: true });
  
  const downloaded = [];
  
  for (const org of remainingOrgs) {
    let success = false;
    
    for (const url of org.urls) {
      if (success) break;
      
      try {
        const ext = path.extname(url.split('?')[0]) || '.png';
        const filename = `${org.slug}${ext}`;
        const filepath = path.join(tempDir, filename);
        
        console.log(`Trying ${org.name}: ${url.substring(0, 50)}...`);
        
        // Try multiple download methods
        const commands = [
          `curl -L -s -o "${filepath}" --fail --max-time 30 -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" "${url}"`,
          `wget -q -O "${filepath}" --timeout=30 --tries=3 --user-agent="Mozilla/5.0" "${url}"`,
          `curl -L -s -o "${filepath}" --fail --max-time 30 -H "Accept: image/*" -H "Referer: https://google.com" "${url}"`
        ];
        
        for (const cmd of commands) {
          try {
            await execAsync(cmd);
            const stats = await fs.stat(filepath);
            if (stats.size > 500) {
              downloaded.push({
                organization: org.name,
                slug: org.slug,
                tempPath: filepath,
                filename: filename,
                size: stats.size
              });
              success = true;
              console.log(`✅ Downloaded ${org.name} (${(stats.size/1024).toFixed(2)} KB)`);
              break;
            }
          } catch {}
        }
        
        if (!success) {
          await fs.unlink(filepath).catch(() => {});
        }
      } catch {}
    }
    
    if (!success) {
      console.log(`❌ Failed to download ${org.name}`);
    }
  }
  
  return { downloaded, tempDir };
}

// Agent 2: Screenshot Agent  
async function screenshotAgent(remaining) {
  console.log('\n📸 AGENT 2: Screenshot Fallback\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const screenshots = [];
  
  for (const org of remaining.slice(0, 10)) { // Limit to prevent timeout
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      
      const domain = org.urls[0].match(/https?:\/\/([^\/]+)/)?.[1];
      if (!domain) continue;
      
      console.log(`Taking screenshot of ${domain}...`);
      
      await page.goto(`https://${domain}`, {
        waitUntil: 'networkidle2',
        timeout: 20000
      });
      
      // Try to find and screenshot logo
      const logoSelector = await page.evaluate(() => {
        const selectors = [
          'img[class*="logo"]', 'img[id*="logo"]', '.logo img',
          'header img', 'nav img', 'img[alt*="logo"]'
        ];
        
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.offsetWidth > 50) {
            return sel;
          }
        }
        return null;
      });
      
      if (logoSelector) {
        const element = await page.$(logoSelector);
        const tempPath = path.join(remaining.tempDir, `${org.slug}-screenshot.png`);
        await element.screenshot({ path: tempPath });
        
        const stats = await fs.stat(tempPath);
        if (stats.size > 1000) {
          screenshots.push({
            organization: org.name,
            slug: org.slug,
            tempPath: tempPath,
            filename: `${org.slug}.png`,
            size: stats.size
          });
          console.log(`✅ Screenshot captured for ${org.name}`);
        }
      }
    } catch (err) {
      console.log(`❌ Screenshot failed for ${org.name}`);
    }
  }
  
  await browser.close();
  return { screenshots };
}

// Agent 3: Wikipedia Agent
async function wikipediaAgent(remaining) {
  console.log('\n🌐 AGENT 3: Wikipedia Logo Hunter\n');
  
  const wikiLogos = [];
  
  const wikiPages = {
    'article-19': 'Article_19',
    'council-of-europe': 'Council_of_Europe',
    'global-fund-for-women': 'Global_Fund_for_Women',
    'king-baudouin-foundation': 'King_Baudouin_Foundation',
    'internews': 'Internews',
    'irex': 'IREX',
    'iri': 'International_Republican_Institute',
    'luminate': 'Luminate_(organization)',
    'mama-cash': 'Mama_Cash',
    'ndi': 'National_Democratic_Institute',
    'people-in-need': 'People_in_Need',
    'robert-bosch-stiftung': 'Robert_Bosch_Stiftung',
    'rockefeller-brothers-fund': 'Rockefeller_Brothers_Fund'
  };
  
  for (const [slug, wikiPage] of Object.entries(wikiPages)) {
    const org = remaining.find(o => o.slug === slug);
    if (!org) continue;
    
    try {
      const urls = [
        `https://upload.wikimedia.org/wikipedia/en/thumb/0/00/${wikiPage}_logo.svg/200px-${wikiPage}_logo.svg.png`,
        `https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/${wikiPage}_logo.svg/200px-${wikiPage}_logo.svg.png`,
        `https://upload.wikimedia.org/wikipedia/en/thumb/0/00/${wikiPage}.svg/200px-${wikiPage}.svg.png`
      ];
      
      for (const url of urls) {
        try {
          const filename = `${slug}.png`;
          const filepath = path.join(remaining.tempDir, filename);
          
          await execAsync(`curl -L -s -o "${filepath}" --fail --max-time 20 "${url}"`);
          
          const stats = await fs.stat(filepath);
          if (stats.size > 500) {
            wikiLogos.push({
              organization: org.name,
              slug: slug,
              tempPath: filepath,
              filename: filename,
              size: stats.size
            });
            console.log(`✅ Found Wikipedia logo for ${org.name}`);
            break;
          }
        } catch {}
      }
    } catch {}
  }
  
  return { wikiLogos };
}

// Agent 4: CDN Search Agent
async function cdnSearchAgent(remaining) {
  console.log('\n🔍 AGENT 4: CDN Pattern Search\n');
  
  const cdnLogos = [];
  
  const cdnPatterns = {
    'british-embassy-kyiv': [
      'https://cdn.jsdelivr.net/npm/country-flag-icons@latest/svg/GB.svg',
      'https://flagcdn.com/gb.svg'
    ],
    'european-union': [
      'https://cdn.jsdelivr.net/npm/country-flag-icons@latest/svg/EU.svg',
      'https://flagcdn.com/eu.svg'
    ],
    'finnish-ministry-for-foreign-affairs': [
      'https://cdn.jsdelivr.net/npm/country-flag-icons@latest/svg/FI.svg',
      'https://flagcdn.com/fi.svg'
    ]
  };
  
  for (const [slug, urls] of Object.entries(cdnPatterns)) {
    const org = remaining.find(o => o.slug === slug);
    if (!org) continue;
    
    for (const url of urls) {
      try {
        const ext = '.svg';
        const filename = `${slug}${ext}`;
        const filepath = path.join(remaining.tempDir, filename);
        
        await execAsync(`curl -L -s -o "${filepath}" --fail "${url}"`);
        
        const stats = await fs.stat(filepath);
        if (stats.size > 200) {
          cdnLogos.push({
            organization: org.name,
            slug: slug,
            tempPath: filepath,
            filename: filename,
            size: stats.size
          });
          console.log(`✅ Found CDN logo for ${org.name}`);
          break;
        }
      } catch {}
    }
  }
  
  return { cdnLogos };
}

// Agent 5: Logo Processor
async function logoProcessorAgent(allLogos, tempDir) {
  console.log('\n🚀 AGENT 5: Final Logo Processor\n');
  
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  const processed = [];
  
  for (const logo of allLogos) {
    try {
      // Remove placeholder
      const placeholderPath = path.join(logoDir, `${logo.slug}.svg`);
      try {
        await fs.unlink(placeholderPath);
        console.log(`🗑️  Removed placeholder for ${logo.organization}`);
      } catch {}
      
      // Copy new logo
      const finalPath = path.join(logoDir, logo.filename);
      await fs.copyFile(logo.tempPath, finalPath);
      
      processed.push({
        organization: logo.organization,
        slug: logo.slug,
        filename: logo.filename,
        path: `/images/logos/${logo.filename}`
      });
      
      console.log(`✅ Installed logo for ${logo.organization}`);
    } catch (err) {
      console.error(`Error processing ${logo.organization}:`, err.message);
    }
  }
  
  // Update mapping
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  const mapping = JSON.parse(await fs.readFile(mappingPath, 'utf8'));
  
  for (const logo of processed) {
    mapping[logo.slug] = logo.path;
  }
  
  const sorted = {};
  Object.keys(mapping).sort().forEach(key => {
    sorted[key] = mapping[key];
  });
  
  await fs.writeFile(mappingPath, JSON.stringify(sorted, null, 2));
  
  // Clean up
  try {
    const files = await fs.readdir(tempDir);
    for (const file of files) {
      await fs.unlink(path.join(tempDir, file)).catch(() => {});
    }
    await fs.rmdir(tempDir);
  } catch {}
  
  console.log(`\n✅ Processed ${processed.length} logos`);
  
  return { processed };
}

// Main execution
async function runAggressiveLogoFetcher() {
  console.log('🔥 AGGRESSIVE LOGO FETCHER ACTIVATED');
  console.log('====================================\n');
  
  try {
    // Run agents
    const downloadResult = await directDownloadAgent();
    
    // Find remaining
    const downloadedSlugs = downloadResult.downloaded.map(d => d.slug);
    const stillRemaining = remainingOrgs.filter(o => !downloadedSlugs.includes(o.slug));
    stillRemaining.tempDir = downloadResult.tempDir;
    
    const screenshotResult = await screenshotAgent(stillRemaining);
    const wikiResult = await wikipediaAgent(stillRemaining);
    const cdnResult = await cdnSearchAgent(stillRemaining);
    
    // Combine all results
    const allLogos = [
      ...downloadResult.downloaded,
      ...screenshotResult.screenshots,
      ...wikiResult.wikiLogos,
      ...cdnResult.cdnLogos
    ];
    
    const processResult = await logoProcessorAgent(allLogos, downloadResult.tempDir);
    
    // Report
    const report = {
      timestamp: new Date().toISOString(),
      downloaded: downloadResult.downloaded.length,
      screenshots: screenshotResult.screenshots.length,
      wikipedia: wikiResult.wikiLogos.length,
      cdn: cdnResult.cdnLogos.length,
      processed: processResult.processed.length,
      remaining: remainingOrgs.length - processResult.processed.length
    };
    
    const reportPath = path.join(__dirname, `../aggressive-logo-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Final Report:');
    console.log(`Direct downloads: ${report.downloaded}`);
    console.log(`Screenshots: ${report.screenshots}`);
    console.log(`Wikipedia: ${report.wikipedia}`);
    console.log(`CDN sources: ${report.cdn}`);
    console.log(`Total processed: ${report.processed}`);
    console.log(`Still remaining: ${report.remaining}`);
    console.log(`\nReport saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Execute
if (require.main === module) {
  runAggressiveLogoFetcher().catch(console.error);
}

module.exports = { runAggressiveLogoFetcher };