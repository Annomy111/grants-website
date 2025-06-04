const puppeteer = require('puppeteer');

async function debugChat() {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://civil-society-grants-database.netlify.app/grants', { 
      waitUntil: 'networkidle0' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const chatDebug = await page.evaluate(() => {
      // Look for the chat widget
      const fixedElements = document.querySelectorAll('.fixed');
      const bottomRightElements = document.querySelectorAll('[class*="bottom"][class*="right"]');
      const chatButtons = document.querySelectorAll('button');
      const chatWidgets = document.querySelectorAll('[class*="chat"]');
      
      return {
        fixedElements: fixedElements.length,
        bottomRightElements: bottomRightElements.length,
        totalButtons: chatButtons.length,
        chatWidgets: chatWidgets.length,
        buttonDetails: Array.from(chatButtons).map(btn => ({
          classes: btn.className,
          text: btn.textContent.trim(),
          ariaLabel: btn.getAttribute('aria-label'),
          position: btn.style.position || getComputedStyle(btn).position
        })),
        bodyOverflow: getComputedStyle(document.body).overflow,
        chatWidgetComponents: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent.includes('GrantsChatWidget') || 
          el.className.includes('chat') ||
          el.getAttribute('data-testid')?.includes('chat')
        ).length
      };
    });
    
    console.log('🔍 CHAT DEBUG RESULTS:');
    console.log('====================');
    console.log(`Fixed elements: ${chatDebug.fixedElements}`);
    console.log(`Bottom-right elements: ${chatDebug.bottomRightElements}`);
    console.log(`Total buttons: ${chatDebug.totalButtons}`);
    console.log(`Chat widgets: ${chatDebug.chatWidgets}`);
    console.log(`Chat components: ${chatDebug.chatWidgetComponents}`);
    console.log(`Body overflow: ${chatDebug.bodyOverflow}`);
    
    console.log('\n🔘 BUTTON DETAILS:');
    chatDebug.buttonDetails.forEach((btn, i) => {
      if (btn.classes.includes('fixed') || btn.position === 'fixed') {
        console.log(`  FIXED BUTTON ${i+1}: "${btn.text}"`);
        console.log(`    Classes: ${btn.classes}`);
        console.log(`    Aria-label: ${btn.ariaLabel}`);
        console.log(`    Position: ${btn.position}`);
      }
    });
    
    // Check if GrantsChatWidget is actually rendered
    const hasChat = await page.evaluate(() => {
      return document.body.innerHTML.includes('GrantsChatWidget') ||
             document.body.innerHTML.includes('chat') ||
             document.body.innerHTML.includes('Chat');
    });
    
    console.log(`\n💬 Chat widget in DOM: ${hasChat}`);
    
    // Take screenshot for manual inspection
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/tests/screenshots/chat-debug.png',
      fullPage: true 
    });
    
    console.log('📸 Debug screenshot saved');
    
  } finally {
    await browser.close();
  }
}

debugChat();