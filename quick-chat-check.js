const puppeteer = require('puppeteer');

async function quickChatCheck() {
  console.log('🔍 Quick Chat Widget Check\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('Loading homepage...');
    await page.goto('https://civil-society-grants-database.netlify.app/', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for chat button with multiple selectors
    const chatSelectors = [
      'button[aria-label*="chat" i]',
      '.chat-button',
      '[data-testid="chat-button"]',
      'button:has-text("Chat")',
      'div[class*="chat" i]',
      'button[class*="chat" i]'
    ];
    
    console.log('Checking for chat elements...');
    
    for (const selector of chatSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.isIntersectingViewport();
          const boundingBox = await element.boundingBox();
          console.log(`✅ Found with selector "${selector}"`);
          console.log(`   Visible: ${isVisible}`);
          console.log(`   Position: x:${boundingBox?.x} y:${boundingBox?.y} w:${boundingBox?.width} h:${boundingBox?.height}`);
        }
      } catch (error) {
        // Selector not found or invalid
      }
    }
    
    // Check for any button in bottom-right area
    console.log('\nChecking bottom-right area for any buttons...');
    const bottomRightButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter(btn => {
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Check if button is in bottom-right area (last 20% of width/height)
        const inBottomRight = rect.right > viewportWidth * 0.8 && rect.bottom > viewportHeight * 0.8;
        const isFixed = style.position === 'fixed';
        
        return inBottomRight || isFixed;
      }).map(btn => ({
        text: btn.textContent.trim(),
        className: btn.className,
        id: btn.id,
        position: window.getComputedStyle(btn).position,
        display: window.getComputedStyle(btn).display,
        visibility: window.getComputedStyle(btn).visibility,
        width: btn.getBoundingClientRect().width,
        height: btn.getBoundingClientRect().height,
        bottom: window.getComputedStyle(btn).bottom,
        right: window.getComputedStyle(btn).right
      }));
    });
    
    console.log(`Found ${bottomRightButtons.length} buttons in bottom-right or fixed position:`);
    bottomRightButtons.forEach((btn, i) => {
      console.log(`   ${i + 1}. "${btn.text}" - ${btn.className}`);
      console.log(`      ${btn.position} - ${btn.width}x${btn.height} - bottom:${btn.bottom} right:${btn.right}`);
    });
    
    // Check React app status
    console.log('\nChecking React app status...');
    const reactStatus = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        rootExists: !!root,
        rootHasContent: root && root.innerHTML.length > 100,
        appLoaded: !!window.React || !!document.querySelector('[data-reactroot]'),
        totalElements: document.querySelectorAll('*').length
      };
    });
    
    console.log(`   React root exists: ${reactStatus.rootExists}`);
    console.log(`   Root has content: ${reactStatus.rootHasContent}`);
    console.log(`   App appears loaded: ${reactStatus.appLoaded}`);
    console.log(`   Total DOM elements: ${reactStatus.totalElements}`);
    
    // Check for any JavaScript errors
    console.log('\nConsole errors during load:');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Check current page source for GrantsChatWidget
    console.log('\nChecking for GrantsChatWidget in page source...');
    const pageContent = await page.content();
    const hasGrantsChatWidget = pageContent.includes('GrantsChatWidget') || 
                               pageContent.includes('chat-widget') ||
                               pageContent.includes('ChatMessage') ||
                               pageContent.includes('chatButton');
    
    console.log(`   GrantsChatWidget references in source: ${hasGrantsChatWidget}`);
    
    // Final assessment
    console.log('\n🎯 ASSESSMENT:');
    if (bottomRightButtons.length > 0) {
      console.log('✅ Found buttons in expected chat widget area');
      const chatLikeButton = bottomRightButtons.find(btn => 
        btn.text.toLowerCase().includes('chat') || 
        btn.className.toLowerCase().includes('chat') ||
        btn.id.toLowerCase().includes('chat')
      );
      
      if (chatLikeButton) {
        console.log('✅ Found chat-like button!');
      } else {
        console.log('⚠️  Found buttons but none appear to be chat-related');
        console.log('   This might be the issue - widget present but not identifiable');
      }
    } else {
      console.log('❌ NO buttons found in bottom-right area');
      console.log('   Chat widget is likely missing or not rendering');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickChatCheck();