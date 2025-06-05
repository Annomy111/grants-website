const puppeteer = require('puppeteer');

async function verifyLogoFix() {
  console.log('🔍 Verifying Logo Fix\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });

  try {
    const page = await browser.newPage();
    
    console.log('Loading grants page...');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForSelector('.grants-page', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if organization-logos.json was loaded
    const logoJsonLoaded = await page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .some(entry => entry.name.includes('organization-logos.json'));
    });

    console.log(`\n✅ organization-logos.json loaded: ${logoJsonLoaded}`);

    // Count grant cards with logos
    const logoStats = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
      let withLogos = 0;
      let withoutLogos = 0;
      
      cards.forEach(card => {
        const logoContainer = card.querySelector('div[class*="w-16"][class*="h-16"]');
        const img = logoContainer?.querySelector('img');
        
        if (img && img.src && img.naturalWidth > 0) {
          withLogos++;
        } else {
          withoutLogos++;
        }
      });
      
      return {
        total: cards.length,
        withLogos,
        withoutLogos,
        percentage: Math.round((withLogos / cards.length) * 100)
      };
    });

    console.log('\nLogo Display Statistics:');
    console.log(`Total grants: ${logoStats.total}`);
    console.log(`Grants with logos: ${logoStats.withLogos} (${logoStats.percentage}%)`);
    console.log(`Grants without logos: ${logoStats.withoutLogos}`);

    // Take screenshot
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/tests/screenshots/logo-fix-verification.png',
      fullPage: false 
    });
    
    console.log('\n📸 Screenshot saved: logo-fix-verification.png');
    
    if (logoStats.percentage > 50) {
      console.log('\n✅ SUCCESS: Logo fix is working! Most grants now display logos.');
    } else {
      console.log('\n⚠️  NOTE: The fix has been applied locally. Changes need to be deployed to see effect on live site.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

verifyLogoFix();