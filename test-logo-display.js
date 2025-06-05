const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('Testing logo display on grants page...');
    
    // Navigate to the grants page
    await page.goto('http://localhost:3000/grants', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for grants to load
    await page.waitForSelector('.grants-page', { timeout: 10000 });
    
    // Check if logos are loading
    const logoInfo = await page.evaluate(() => {
      const grants = document.querySelectorAll('[class*="rounded-xl shadow-md"]');
      const results = [];
      
      grants.forEach((grant, index) => {
        const orgNameEl = grant.querySelector('p[class*="text-lg font-medium"]');
        const orgName = orgNameEl ? orgNameEl.textContent.trim() : 'Unknown';
        
        // Look for logo img element
        const logoImg = grant.querySelector('img[alt*="logo"]');
        const hasLogo = !!logoImg;
        const logoSrc = logoImg ? logoImg.src : null;
        const logoVisible = logoImg ? window.getComputedStyle(logoImg).display !== 'none' : false;
        
        // Check if there's a logo container
        const logoContainer = grant.querySelector('div[class*="w-16 h-16"]');
        const hasLogoContainer = !!logoContainer;
        
        if (index < 10) { // Log first 10 grants
          results.push({
            organization: orgName,
            hasLogoContainer,
            hasLogoImg: hasLogo,
            logoSrc,
            logoVisible,
            containerClasses: logoContainer ? logoContainer.className : null
          });
        }
      });
      
      return results;
    });

    console.log('\n=== LOGO DISPLAY ANALYSIS ===');
    console.log(`Total grants checked: ${logoInfo.length}`);
    
    logoInfo.forEach((info, index) => {
      console.log(`\nGrant ${index + 1}: ${info.organization}`);
      console.log(`  Has logo container: ${info.hasLogoContainer}`);
      console.log(`  Has logo img: ${info.hasLogoImg}`);
      console.log(`  Logo visible: ${info.logoVisible}`);
      if (info.logoSrc) {
        console.log(`  Logo src: ${info.logoSrc}`);
      }
    });

    // Check network requests for logo files
    const failedLogos = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/images/logos/') && response.status() !== 200) {
        failedLogos.push({
          url,
          status: response.status()
        });
      }
    });

    // Reload to catch any failed logo requests
    await page.reload({ waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(3000);

    if (failedLogos.length > 0) {
      console.log('\n=== FAILED LOGO REQUESTS ===');
      failedLogos.forEach(failed => {
        console.log(`${failed.url} - Status: ${failed.status}`);
      });
    }

    // Test specific organizations
    console.log('\n=== TESTING SPECIFIC ORGANIZATIONS ===');
    const testOrgs = ['European Union', 'USAID', 'British Council', 'GIZ/German Government'];
    
    for (const org of testOrgs) {
      const hasLogo = await page.evaluate((orgName) => {
        const grants = Array.from(document.querySelectorAll('[class*="rounded-xl shadow-md"]'));
        const grant = grants.find(g => {
          const orgEl = g.querySelector('p[class*="text-lg font-medium"]');
          return orgEl && orgEl.textContent.includes(orgName);
        });
        
        if (!grant) return { found: false };
        
        const logoImg = grant.querySelector('img[alt*="logo"]');
        return {
          found: true,
          hasLogo: !!logoImg,
          logoSrc: logoImg ? logoImg.src : null,
          imgError: logoImg ? logoImg.naturalWidth === 0 : null
        };
      }, org);
      
      console.log(`\n${org}:`);
      if (!hasLogo.found) {
        console.log('  Grant not found on page');
      } else {
        console.log(`  Has logo: ${hasLogo.hasLogo}`);
        if (hasLogo.logoSrc) {
          console.log(`  Logo URL: ${hasLogo.logoSrc}`);
          console.log(`  Image error: ${hasLogo.imgError}`);
        }
      }
    }

    // Take a screenshot
    await page.screenshot({ 
      path: 'logo-test-screenshot.png',
      fullPage: false 
    });
    console.log('\nScreenshot saved as logo-test-screenshot.png');

    console.log('\nWaiting 10 seconds before closing...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();