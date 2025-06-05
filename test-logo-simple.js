const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('Navigating to grants page...');
    await page.goto('http://localhost:3000/grants', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait a bit for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check for logo presence
    const logoAnalysis = await page.evaluate(() => {
      const results = {
        totalGrants: 0,
        grantsWithLogoContainers: 0,
        grantsWithLogoImages: 0,
        visibleLogos: 0,
        examples: []
      };

      // Find all grant cards
      const grantCards = document.querySelectorAll('.rounded-xl.shadow-md');
      results.totalGrants = grantCards.length;

      grantCards.forEach((card, index) => {
        // Find organization name
        const orgEl = card.querySelector('p.text-lg.font-medium, p[class*="text-lg"][class*="font-medium"]');
        const orgName = orgEl ? orgEl.textContent.trim() : 'Unknown';

        // Check for logo container
        const logoContainer = card.querySelector('div.w-16.h-16, div[class*="w-16"][class*="h-16"]');
        if (logoContainer) {
          results.grantsWithLogoContainers++;
        }

        // Check for logo image
        const logoImg = card.querySelector('img[alt*="logo"]');
        if (logoImg) {
          results.grantsWithLogoImages++;
          
          // Check if visible
          const isVisible = logoImg.offsetParent !== null && 
                          window.getComputedStyle(logoImg).display !== 'none';
          if (isVisible) {
            results.visibleLogos++;
          }

          // Collect first 5 examples
          if (results.examples.length < 5) {
            results.examples.push({
              organization: orgName,
              hasContainer: !!logoContainer,
              hasImage: true,
              imageSrc: logoImg.src,
              imageAlt: logoImg.alt,
              isVisible: isVisible,
              imageWidth: logoImg.naturalWidth,
              imageHeight: logoImg.naturalHeight
            });
          }
        } else if (results.examples.length < 5 && index < 10) {
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
    
    console.log('\n=== EXAMPLE GRANTS ===');
    logoAnalysis.examples.forEach((example, index) => {
      console.log(`\n${index + 1}. ${example.organization}`);
      console.log(`   Has container: ${example.hasContainer}`);
      console.log(`   Has image: ${example.hasImage}`);
      if (example.hasImage) {
        console.log(`   Image URL: ${example.imageSrc}`);
        console.log(`   Is visible: ${example.isVisible}`);
        console.log(`   Natural dimensions: ${example.imageWidth}x${example.imageHeight}`);
      }
    });

    // Check console errors
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Check for 404s on logo images
    const failed404s = [];
    page.on('response', response => {
      if (response.url().includes('/images/logos/') && response.status() === 404) {
        failed404s.push(response.url());
      }
    });

    // Reload to catch errors
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (failed404s.length > 0) {
      console.log('\n=== 404 ERRORS FOR LOGOS ===');
      failed404s.forEach(url => {
        console.log(`404: ${url}`);
      });
    }

    if (consoleMessages.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      consoleMessages.forEach(msg => {
        console.log(msg);
      });
    }

    // Take screenshot
    await page.screenshot({ path: 'logo-analysis-screenshot.png' });
    console.log('\nScreenshot saved as logo-analysis-screenshot.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();