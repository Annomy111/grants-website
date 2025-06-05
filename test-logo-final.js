const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('Navigating to grants page...');
    await page.goto('http://localhost:3000/grants', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Wait for React app to render
    console.log('Waiting for React app to render...');
    await page.waitForSelector('div.grants-page', { timeout: 30000 });
    
    // Wait for grants to load
    console.log('Waiting for grants to load...');
    await page.waitForSelector('div.rounded-xl.shadow-md', { timeout: 30000 });
    
    // Additional wait to ensure all images attempt to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for logo presence
    const logoAnalysis = await page.evaluate(() => {
      const results = {
        totalGrants: 0,
        grantsWithLogoContainers: 0,
        grantsWithLogoImages: 0,
        visibleLogos: 0,
        brokenImages: 0,
        examples: []
      };

      // Find all grant cards - use more flexible selector
      const grantCards = document.querySelectorAll('div[class*="rounded-xl"][class*="shadow-md"]');
      results.totalGrants = grantCards.length;

      grantCards.forEach((card, index) => {
        // Find organization name - be more flexible with selectors
        const orgEl = card.querySelector('p[class*="text-lg"][class*="font-medium"]') ||
                     card.querySelector('.text-lg.font-medium') ||
                     card.querySelector('p.text-blue-700') ||
                     card.querySelector('p.text-blue-300');
        const orgName = orgEl ? orgEl.textContent.trim() : 'Unknown';

        // Check for logo container - be flexible
        const logoContainer = card.querySelector('div[class*="w-16"][class*="h-16"]') ||
                            card.querySelector('.w-16.h-16') ||
                            card.querySelector('div[class*="flex-shrink-0"]');
        
        if (logoContainer) {
          results.grantsWithLogoContainers++;
        }

        // Check for logo image
        const logoImg = card.querySelector('img[alt*="logo"]') || 
                       card.querySelector('img[src*="/images/logos/"]');
        
        if (logoImg) {
          results.grantsWithLogoImages++;
          
          // Check if visible
          const isVisible = logoImg.offsetParent !== null && 
                          window.getComputedStyle(logoImg).display !== 'none' &&
                          window.getComputedStyle(logoImg.parentElement).display !== 'none';
          
          if (isVisible) {
            results.visibleLogos++;
          }
          
          // Check if image loaded successfully
          if (logoImg.naturalWidth === 0 || logoImg.naturalHeight === 0) {
            results.brokenImages++;
          }

          // Collect first 10 examples
          if (results.examples.length < 10) {
            results.examples.push({
              organization: orgName,
              hasContainer: !!logoContainer,
              hasImage: true,
              imageSrc: logoImg.src,
              imageAlt: logoImg.alt,
              isVisible: isVisible,
              imageWidth: logoImg.naturalWidth,
              imageHeight: logoImg.naturalHeight,
              isBroken: logoImg.naturalWidth === 0 || logoImg.naturalHeight === 0,
              displayStyle: window.getComputedStyle(logoImg).display,
              parentDisplay: logoImg.parentElement ? window.getComputedStyle(logoImg.parentElement).display : 'N/A'
            });
          }
        } else if (results.examples.length < 10 && index < 10) {
          // Also collect some without logos
          results.examples.push({
            organization: orgName,
            hasContainer: !!logoContainer,
            hasImage: false,
            imageSrc: null,
            imageAlt: null,
            isVisible: false
          });
        }
      });

      return results;
    });

    console.log('\n=== LOGO DISPLAY ANALYSIS ===');
    console.log(`Total grants found: ${logoAnalysis.totalGrants}`);
    console.log(`Grants with logo containers: ${logoAnalysis.grantsWithLogoContainers}`);
    console.log(`Grants with logo images: ${logoAnalysis.grantsWithLogoImages}`);
    console.log(`Visible logos: ${logoAnalysis.visibleLogos}`);
    console.log(`Broken images: ${logoAnalysis.brokenImages}`);
    
    console.log('\n=== EXAMPLE GRANTS ===');
    logoAnalysis.examples.forEach((example, index) => {
      console.log(`\n${index + 1}. ${example.organization}`);
      console.log(`   Has container: ${example.hasContainer}`);
      console.log(`   Has image: ${example.hasImage}`);
      if (example.hasImage) {
        console.log(`   Image URL: ${example.imageSrc}`);
        console.log(`   Is visible: ${example.isVisible}`);
        console.log(`   Natural dimensions: ${example.imageWidth}x${example.imageHeight}`);
        console.log(`   Is broken: ${example.isBroken}`);
        console.log(`   Display style: ${example.displayStyle}`);
        console.log(`   Parent display: ${example.parentDisplay}`);
      }
    });

    // Check for 404s on logo images
    const failed404s = [];
    page.on('response', response => {
      if (response.url().includes('/images/logos/') && response.status() === 404) {
        failed404s.push(response.url());
      }
    });

    // Reload to catch 404s
    console.log('\nReloading page to check for 404s...');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (failed404s.length > 0) {
      console.log('\n=== 404 ERRORS FOR LOGOS ===');
      failed404s.forEach(url => {
        console.log(`404: ${url}`);
      });
    }

    // Take screenshot
    await page.screenshot({ path: 'logo-final-screenshot.png', fullPage: false });
    console.log('\nScreenshot saved as logo-final-screenshot.png');
    
    console.log('\nTest complete. Browser will remain open for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();