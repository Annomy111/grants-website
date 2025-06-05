const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log('🌐 Navigating to grants page...');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait for grant cards to load
    await page.waitForSelector('[class*="rounded-xl"][class*="shadow-md"]', { timeout: 30000 });
    
    // Take screenshot
    await page.screenshot({ path: 'grants-display.png', fullPage: false });
    console.log('📸 Screenshot saved as grants-display.png');
    
    // Get detailed information from first 3 grant cards
    const grantInfo = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
      const results = [];
      
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const card = cards[i];
        const info = {
          index: i + 1,
          innerHTML: card.innerHTML.substring(0, 500) + '...',
          textContent: card.textContent.trim(),
          classes: card.className,
          childrenCount: card.children.length,
          sections: []
        };
        
        // Get all text elements
        const allText = card.querySelectorAll('h2, h3, p, div');
        allText.forEach(el => {
          if (el.textContent.trim()) {
            info.sections.push({
              tag: el.tagName,
              text: el.textContent.trim().substring(0, 100),
              classes: el.className
            });
          }
        });
        
        results.push(info);
      }
      
      return {
        totalCards: cards.length,
        firstThree: results
      };
    });
    
    console.log('\n📊 Grant Cards Analysis:');
    console.log('========================');
    console.log(`Total grant cards found: ${grantInfo.totalCards}`);
    
    grantInfo.firstThree.forEach(grant => {
      console.log(`\n🎯 Grant Card #${grant.index}:`);
      console.log(`Classes: ${grant.classes}`);
      console.log(`Children elements: ${grant.childrenCount}`);
      console.log('\nContent sections:');
      grant.sections.slice(0, 15).forEach(section => {
        console.log(`  ${section.tag}: "${section.text}"`);
      });
      console.log('\nFull text preview:');
      console.log(grant.textContent.substring(0, 300) + '...');
    });
    
    // Check what's NOT showing
    const missingElements = await page.evaluate(() => {
      const card = document.querySelector('[class*="rounded-xl"][class*="shadow-md"]');
      if (!card) return 'No cards found';
      
      const checks = {
        hasDeadline: !!card.textContent.match(/deadline|2025|2024/i),
        hasAmount: !!card.textContent.match(/€|\\$|grant amount/i),
        hasDuration: !!card.textContent.match(/duration|months|years/i),
        hasEligibility: !!card.textContent.match(/eligibility|eligible/i),
        hasFocusArea: !!card.textContent.match(/focus|area/i),
        hasApplyButton: !!card.querySelector('a[href*="http"]'),
        hasLogo: !!card.querySelector('img')
      };
      
      return checks;
    });
    
    console.log('\n❓ Element Presence Check:');
    console.log(missingElements);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();