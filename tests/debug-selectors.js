const puppeteer = require('puppeteer');

async function debugSelectors() {
  console.log('🔍 Debugging DOM structure and selectors...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Navigate to grants page
    await page.goto('https://civil-society-grants-database.netlify.app/grants', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('📋 Page loaded, analyzing DOM structure...');
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(5000);
    
    // Get page structure
    const structure = await page.evaluate(() => {
      const results = {
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          tag: h.tagName,
          text: h.textContent.trim(),
          classes: h.className
        })),
        grantsElements: {
          // Try different possible grant container selectors
          divs: document.querySelectorAll('div').length,
          cards: document.querySelectorAll('.card, .grant-card, [class*="grant"]').length,
          items: document.querySelectorAll('[data-testid*="grant"], [class*="item"]').length,
          lists: document.querySelectorAll('ul, ol, .list, [class*="list"]').length
        },
        chatElements: {
          buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
            text: btn.textContent.trim(),
            classes: btn.className,
            ariaLabel: btn.getAttribute('aria-label'),
            title: btn.title
          })),
          chatRelated: document.querySelectorAll('[class*="chat"], [data-testid*="chat"]').length
        },
        bodyClasses: document.body.className,
        mainContent: document.querySelector('main, #root, .app')?.innerHTML?.substring(0, 500) || 'No main content found'
      };
      
      return results;
    });
    
    console.log('\n📊 DOM ANALYSIS:');
    console.log('='.repeat(50));
    console.log(`Title: ${structure.title}`);
    console.log(`Body classes: ${structure.bodyClasses}`);
    console.log(`Total divs: ${structure.grantsElements.divs}`);
    console.log(`Cards/grants: ${structure.grantsElements.cards}`);
    console.log(`Items: ${structure.grantsElements.items}`);
    console.log(`Lists: ${structure.grantsElements.lists}`);
    console.log(`Chat elements: ${structure.chatElements.chatRelated}`);
    
    console.log('\n🏷️  HEADINGS:');
    structure.headings.forEach(h => {
      console.log(`  ${h.tag}: "${h.text}" (classes: ${h.classes})`);
    });
    
    console.log('\n🔘 BUTTONS:');
    structure.chatElements.buttons.forEach((btn, i) => {
      if (btn.text || btn.ariaLabel || btn.title) {
        console.log(`  ${i+1}. "${btn.text}" (classes: ${btn.classes}, aria: ${btn.ariaLabel}, title: ${btn.title})`);
      }
    });
    
    console.log('\n📄 MAIN CONTENT PREVIEW:');
    console.log(structure.mainContent);
    
    // Take detailed screenshot
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/tests/screenshots/debug-full-page.png',
      fullPage: true 
    });
    
    console.log('\n📸 Screenshot saved: debug-full-page.png');
    
    // Try to find the actual grant containers
    const grantContainers = await page.evaluate(() => {
      const possibleSelectors = [
        'div[class*="grant"]',
        'div[class*="card"]',
        'div[class*="item"]',
        '.grants-container > div',
        '.grants-list > div',
        'main div > div',
        '[role="listitem"]',
        'article'
      ];
      
      const results = {};
      possibleSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          results[selector] = {
            count: elements.length,
            sample: elements[0]?.textContent?.substring(0, 100) || 'No text content'
          };
        }
      });
      
      return results;
    });
    
    console.log('\n🎯 POTENTIAL GRANT SELECTORS:');
    Object.entries(grantContainers).forEach(([selector, info]) => {
      console.log(`  ${selector}: ${info.count} elements`);
      console.log(`    Sample: "${info.sample}"`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser left open for manual inspection. Close when done.');
    // await browser.close();
  }
}

debugSelectors();