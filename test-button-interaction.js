const puppeteer = require('puppeteer');

async function testButtonInteraction() {
  console.log('🎯 Testing Chat Button Interaction\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser so we can see what happens
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
    
    console.log('1. Loading page...');
    await page.goto('https://civil-society-grants-database.netlify.app/', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Find the button
    console.log('2. Finding chat button...');
    const chatButton = await page.$('button[aria-label*="chat" i]');
    
    if (!chatButton) {
      console.log('❌ Chat button not found!');
      return;
    }
    
    console.log('✅ Chat button found!');
    
    // Get button info before clicking
    const buttonInfo = await page.evaluate((btn) => {
      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      return {
        text: btn.textContent,
        ariaLabel: btn.getAttribute('aria-label'),
        visible: btn.offsetParent !== null,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
        backgroundColor: style.backgroundColor,
        color: style.color,
        innerHTML: btn.innerHTML
      };
    }, chatButton);
    
    console.log('3. Button details:');
    console.log(`   Text: "${buttonInfo.text}"`);
    console.log(`   Aria-label: "${buttonInfo.ariaLabel}"`);
    console.log(`   Visible: ${buttonInfo.visible}`);
    console.log(`   Size: ${buttonInfo.width}x${buttonInfo.height}`);
    console.log(`   Position: ${buttonInfo.x}, ${buttonInfo.y}`);
    console.log(`   Colors: bg=${buttonInfo.backgroundColor}, color=${buttonInfo.color}`);
    console.log(`   HTML: ${buttonInfo.innerHTML}`);
    
    // Take a screenshot before clicking
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/before-click.png',
      fullPage: true 
    });
    console.log('   Screenshot saved: before-click.png');
    
    // Try to click the button
    console.log('\n4. Clicking chat button...');
    try {
      await chatButton.click();
      console.log('✅ Button clicked successfully');
      
      // Wait for any animations/changes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if chat widget opened
      const chatWidget = await page.$('div[class*="fixed"][class*="bottom"]');
      if (chatWidget) {
        const widgetVisible = await chatWidget.isIntersectingViewport();
        console.log(`✅ Chat widget appeared: ${widgetVisible}`);
        
        // Check for chat messages
        const messages = await page.$$eval('*', elements => {
          return Array.from(elements).filter(el => 
            el.textContent && el.textContent.toLowerCase().includes('grants assistant')
          ).length;
        });
        console.log(`   Found ${messages} elements with "grants assistant" text`);
        
      } else {
        console.log('❌ Chat widget did not appear');
      }
      
      // Take screenshot after clicking
      await page.screenshot({ 
        path: '/Users/winzendwyers/grants website/after-click.png',
        fullPage: true 
      });
      console.log('   Screenshot saved: after-click.png');
      
    } catch (error) {
      console.log(`❌ Failed to click button: ${error.message}`);
    }
    
    // Check for any errors in console
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    if (errors.length > 0) {
      console.log('\n5. Console errors detected:');
      errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n5. No console errors detected');
    }
    
    // Keep browser open for manual inspection
    console.log('\n6. Browser will stay open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testButtonInteraction();