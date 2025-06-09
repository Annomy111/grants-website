const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Alternative approaches for difficult organizations
const strategies = {
  'german-marshall-fund-gmf-black-sea-trust': [
    'https://www.gmfus.org',
    'https://www.gmfus.org/about'
  ],
  'ndi': [
    'https://www.ndi.org',
    'https://www.ndi.org/about'
  ],
  'internews': [
    'https://internews.org',
    'https://internews.org/about-us/'
  ],
  'luminate': [
    'https://www.luminategroup.com',
    'https://luminategroup.com'
  ],
  'norwegian-helsinki-committee': [
    'https://www.nhc.no',
    'https://www.nhc.no/en/'
  ],
  'pivot': [
    'https://www.pivotsupport.org',
    'https://www.pivot.org.au'
  ],
  'iri': [
    'https://www.iri.org',
    'https://www.iri.org/who-we-are/'
  ],
  'international-renaissance-foundation-irf': [
    'https://www.irf.ua',
    'https://www.irf.ua/en/'
  ]
};

// Backup high-quality image URLs
const backupUrls = {
  'german-marshall-fund-gmf-black-sea-trust': 'https://www.gmfus.org/sites/default/files/styles/large/public/2021-04/gmf-logo-primary.png',
  'ndi': 'https://pbs.twimg.com/profile_images/1575509421634015235/D3oRGjPh_400x400.jpg',
  'internews': 'https://pbs.twimg.com/profile_images/1189236652380770304/weBmW4mz_400x400.jpg',
  'luminate': 'https://pbs.twimg.com/profile_images/1538538927861567489/B-lBRQAS_400x400.jpg',
  'norwegian-helsinki-committee': 'https://pbs.twimg.com/profile_images/1050386551302684673/xxW3U7OT_400x400.jpg',
  'pivot': 'https://pbs.twimg.com/profile_images/1245621094221389824/Y5BEYGjU_400x400.jpg',
  'iri': 'https://pbs.twimg.com/profile_images/1621897048104624128/UcMNqjEO_400x400.jpg',
  'international-renaissance-foundation-irf': 'https://www.irf.ua/content/images/irf-logo-en.png'
};

function downloadLogo(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : require('http');
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };
    
    if (protocol === https) {
      options.rejectUnauthorized = false;
    }
    
    protocol.get(url, options, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        try { fs.unlinkSync(filepath); } catch {}
        downloadLogo(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(filepath); } catch {}
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        resolve(stats.size);
      });
      
      file.on('error', (err) => {
        file.close();
        try { fs.unlinkSync(filepath); } catch {}
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      try { fs.unlinkSync(filepath); } catch {}
      reject(err);
    }).setTimeout(15000, () => {
      reject(new Error('Timeout'));
    });
  });
}

async function aggressiveLogoFetch() {
  console.log('🔥 AGGRESSIVE PUPPETEER LOGO FETCHER');
  console.log('=====================================\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  const tempDir = path.join(__dirname, '../temp-aggressive-logos');
  fs.mkdirSync(tempDir, { recursive: true });
  
  const logoDir = path.join(__dirname, '../client/public/images/logos');
  const mappingPath = path.join(__dirname, '../client/public/data/organization-logos.json');
  
  let mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  let successCount = 0;
  
  for (const [slug, urls] of Object.entries(strategies)) {
    console.log(`🎯 Targeting ${slug}`);
    
    let logoFound = false;
    
    // Strategy 1: Try Puppeteer with multiple URLs
    for (const url of urls) {
      if (logoFound) break;
      
      try {
        console.log(`  🔍 Puppeteer: ${url}`);
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
        
        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 15000
        });
        
        // More aggressive logo detection
        const logoData = await page.evaluate(() => {
          const logos = [];
          
          // Comprehensive selectors
          const selectors = [
            'img[class*="logo" i]',
            'img[id*="logo" i]',
            'img[alt*="logo" i]',
            'img[src*="logo" i]',
            '.logo img', '#logo img', '.brand img', '.header img',
            'nav img', '.navbar img', '.site-header img',
            'header img[width]', 'img[width][height]'
          ];
          
          selectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach(img => {
                if (img.src && img.offsetWidth >= 30 && img.offsetHeight >= 15) {
                  const area = img.offsetWidth * img.offsetHeight;
                  logos.push({
                    src: img.src,
                    width: img.offsetWidth,
                    height: img.offsetHeight,
                    area: area,
                    alt: img.alt || '',
                    className: img.className || ''
                  });
                }
              });
            } catch {}
          });
          
          // Check for background images
          const elements = document.querySelectorAll('*');
          elements.forEach(el => {
            try {
              const style = window.getComputedStyle(el);
              const bgImage = style.backgroundImage;
              if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
                const url = bgImage.slice(4, -1).replace(/"/g, '');
                if (url.includes('logo') && el.offsetWidth >= 50) {
                  logos.push({
                    src: url,
                    width: el.offsetWidth,
                    height: el.offsetHeight,
                    area: el.offsetWidth * el.offsetHeight,
                    alt: 'Background Logo',
                    className: el.className || ''
                  });
                }
              }
            } catch {}
          });
          
          return logos.sort((a, b) => b.area - a.area);
        });
        
        if (logoData.length > 0) {
          const bestLogo = logoData[0];
          console.log(`    Found: ${bestLogo.width}x${bestLogo.height} - ${bestLogo.src.substring(0, 80)}...`);
          
          const ext = bestLogo.src.includes('.svg') ? '.svg' : 
                     bestLogo.src.includes('.png') ? '.png' : '.jpg';
          const tempPath = path.join(tempDir, `${slug}${ext}`);
          
          try {
            const size = await downloadLogo(bestLogo.src, tempPath);
            if (size > 1000) {
              const finalPath = path.join(logoDir, `${slug}${ext}`);
              
              // Remove old placeholder
              try {
                fs.unlinkSync(path.join(logoDir, `${slug}.svg`));
              } catch {}
              
              fs.copyFileSync(tempPath, finalPath);
              mapping[slug] = `/images/logos/${slug}${ext}`;
              
              console.log(`    ✅ SUCCESS: ${slug} (${(size/1024).toFixed(2)} KB)`);
              logoFound = true;
              successCount++;
            }
          } catch (err) {
            console.log(`    ❌ Download failed: ${err.message}`);
          }
        }
        
        await page.close();
        
      } catch (err) {
        console.log(`    ❌ Puppeteer failed: ${err.message}`);
      }
    }
    
    // Strategy 2: Try backup URLs
    if (!logoFound) {
      const backupUrl = backupUrls[slug];
      if (backupUrl) {
        console.log(`  🔄 Trying backup URL: ${backupUrl.substring(0, 50)}...`);
        
        try {
          const ext = backupUrl.includes('.svg') ? '.svg' : 
                     backupUrl.includes('.png') ? '.png' : '.jpg';
          const tempPath = path.join(tempDir, `${slug}${ext}`);
          
          const size = await downloadLogo(backupUrl, tempPath);
          if (size > 1000) {
            const finalPath = path.join(logoDir, `${slug}${ext}`);
            
            // Remove old placeholder
            try {
              fs.unlinkSync(path.join(logoDir, `${slug}.svg`));
            } catch {}
            
            fs.copyFileSync(tempPath, finalPath);
            mapping[slug] = `/images/logos/${slug}${ext}`;
            
            console.log(`  ✅ BACKUP SUCCESS: ${slug} (${(size/1024).toFixed(2)} KB)`);
            logoFound = true;
            successCount++;
          }
        } catch (err) {
          console.log(`  ❌ Backup failed: ${err.message}`);
        }
      }
    }
    
    if (!logoFound) {
      console.log(`  ❌ FAILED: ${slug} - No logo found`);
    }
    
    console.log('');
  }
  
  await browser.close();
  
  // Save updated mapping
  const sorted = {};
  Object.keys(mapping).sort().forEach(key => {
    sorted[key] = mapping[key];
  });
  fs.writeFileSync(mappingPath, JSON.stringify(sorted, null, 2));
  
  // Clean up
  try {
    fs.readdirSync(tempDir).forEach(file => {
      fs.unlinkSync(path.join(tempDir, file));
    });
    fs.rmdirSync(tempDir);
  } catch {}
  
  console.log('🏆 AGGRESSIVE FETCH COMPLETE');
  console.log('=============================');
  console.log(`Successfully extracted: ${successCount}/8`);
  console.log(`Success rate: ${((successCount/8)*100).toFixed(1)}%`);
  
  // Final count
  const finalRemaining = fs.readdirSync(logoDir).filter(file => {
    if (!file.endsWith('.svg')) return false;
    const stats = fs.statSync(path.join(logoDir, file));
    return stats.size < 1000;
  }).length;
  
  const totalLogos = fs.readdirSync(logoDir).length;
  const realLogos = totalLogos - finalRemaining;
  
  console.log('\n🎯 FINAL STATUS');
  console.log('===============');
  console.log(`Total organizations: ${totalLogos}`);
  console.log(`Real logos: ${realLogos}`);
  console.log(`Placeholders remaining: ${finalRemaining}`);
  console.log(`Overall success rate: ${((realLogos/totalLogos)*100).toFixed(1)}%`);
}

aggressiveLogoFetch().catch(console.error);