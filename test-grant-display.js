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
      timeout: 30000
    });
    
    // Wait for grant cards to load
    await page.waitForSelector('.rounded-xl.shadow-md', { timeout: 10000 });
    
    // Get information from first few grant cards
    const grantInfo = await page.evaluate(() => {
      const cards = document.querySelectorAll('.rounded-xl.shadow-md');
      const results = [];
      
      for (let i = 0; i < Math.min(3, cards.length); i++) {
        const card = cards[i];
        const info = {
          grantName: card.querySelector('h2')?.textContent?.trim() || 'Not found',
          organization: card.querySelector('p.text-lg')?.textContent?.trim() || 'Not found',
          amount: card.querySelector('.text-green-400, .text-green-600')?.textContent?.trim() || 'Not found',
          focusAreas: '',
          eligibility: '',
          duration: '',
          hasExpandButton: false,
          expandButtonText: ''
        };
        
        // Find focus areas section
        const sections = card.querySelectorAll('h3');
        sections.forEach(section => {
          const text = section.textContent;
          const parent = section.parentElement;
          
          if (text.includes('FOCUS AREA')) {
            info.focusAreas = parent.querySelector('p')?.textContent?.trim() || '';
            const button = parent.querySelector('button');
            if (button) {
              info.hasExpandButton = true;
              info.expandButtonText = button.textContent;
            }
          }
          
          if (text.includes('ELIGIBILITY')) {
            const eligDiv = parent.nextElementSibling || parent;
            info.eligibility = eligDiv.querySelector('p')?.textContent?.trim() || '';
          }
          
          if (text.includes('DURATION')) {
            info.duration = parent.querySelector('p')?.textContent?.trim() || '';
          }
        });
        
        results.push(info);
      }
      
      return results;
    });
    
    console.log('\n📋 Grant Information Display Analysis:');
    console.log('=====================================\n');
    
    grantInfo.forEach((grant, i) => {
      console.log(`Grant ${i + 1}: ${grant.grantName}`);
      console.log(`Organization: ${grant.organization}`);
      console.log(`Amount: ${grant.amount}`);
      console.log(`Duration: ${grant.duration}`);
      console.log(`\nFocus Areas (${grant.focusAreas.length} chars): ${grant.focusAreas}`);
      console.log(`Has expand button: ${grant.hasExpandButton} ${grant.expandButtonText ? `(${grant.expandButtonText})` : ''}`);
      console.log(`\nEligibility (${grant.eligibility.length} chars): ${grant.eligibility}`);
      console.log('\n' + '-'.repeat(50) + '\n');
    });
    
    // Test expand functionality
    console.log('🔍 Testing expand functionality...');
    const firstExpandButton = await page.$('button:has-text("Show more")');
    if (firstExpandButton) {
      await firstExpandButton.click();
      await page.waitForTimeout(500);
      
      const expandedInfo = await page.evaluate(() => {
        const card = document.querySelector('.rounded-xl.shadow-md');
        const focusSection = Array.from(card.querySelectorAll('h3')).find(h => h.textContent.includes('FOCUS AREA'));
        return focusSection?.parentElement.querySelector('p')?.textContent?.trim() || '';
      });
      
      console.log(`\nExpanded focus areas (${expandedInfo.length} chars): ${expandedInfo}`);
    } else {
      console.log('No expand button found - text may not be truncated');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'grant-display-test.png', fullPage: false });
    console.log('\n📸 Screenshot saved as grant-display-test.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();