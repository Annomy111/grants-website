const puppeteer = require('puppeteer');

async function debugChatWidget() {
  console.log('🔍 Puppeteer Chat Widget Debug Analysis\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });
    
    // Enable error logging
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });
    
    console.log('1. Loading main page...');
    await page.goto('https://civil-society-grants-database.netlify.app/', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for React to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('2. Checking for chat widget elements...');
    
    // Check for chat button
    const chatButton = await page.$('[data-testid="chat-button"], .chat-button, button[aria-label*="chat" i]');
    console.log(`   Chat button found: ${!!chatButton}`);
    
    // Look for any element with "chat" in className or id
    const chatElements = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const className = (el.className && typeof el.className === 'string') ? el.className : '';
        const id = el.id || '';
        const ariaLabel = el.getAttribute('aria-label') || '';
        return className.toLowerCase().includes('chat') || 
               id.toLowerCase().includes('chat') ||
               ariaLabel.toLowerCase().includes('chat');
      }).map(el => ({
        tag: el.tagName,
        className: (el.className && typeof el.className === 'string') ? el.className : '',
        id: el.id,
        ariaLabel: el.getAttribute('aria-label'),
        visible: el.offsetParent !== null
      }));
    });
    
    console.log(`   Found ${chatElements.length} elements with "chat" in attributes:`);
    chatElements.forEach((el, i) => {
      console.log(`     ${i + 1}. ${el.tag} - class: "${el.className}" - visible: ${el.visible}`);
    });
    
    // Check for GrantsChatWidget component specifically
    const grantsChatWidget = await page.evaluate(() => {
      // Look for React component instances
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        if (el._reactInternalFiber || el._reactInternals) {
          const fiber = el._reactInternalFiber || el._reactInternals;
          if (fiber && fiber.type && fiber.type.name === 'GrantsChatWidget') {
            return true;
          }
        }
      }
      return false;
    });
    
    console.log(`   GrantsChatWidget React component found: ${grantsChatWidget}`);
    
    // Check for floating elements (fixed/absolute positioning)
    const floatingElements = await page.$$eval('*', elements => {
      return Array.from(elements).filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' || style.position === 'absolute';
      }).map(el => ({
        tag: el.tagName,
        className: el.className,
        id: el.id,
        position: window.getComputedStyle(el).position,
        bottom: window.getComputedStyle(el).bottom,
        right: window.getComputedStyle(el).right,
        zIndex: window.getComputedStyle(el).zIndex,
        visible: el.offsetParent !== null
      }));
    });
    
    console.log(`\n3. Found ${floatingElements.length} floating elements:`);
    floatingElements.forEach((el, i) => {
      console.log(`     ${i + 1}. ${el.tag}.${el.className} - ${el.position} - bottom:${el.bottom} right:${el.right} z:${el.zIndex} - visible:${el.visible}`);
    });
    
    // Check React app structure
    console.log('\n4. Checking React app structure...');
    const reactInfo = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { found: false };
      
      return {
        found: true,
        hasChildren: root.children.length > 0,
        firstChildTag: root.children[0]?.tagName,
        firstChildClass: root.children[0]?.className,
        totalElements: root.querySelectorAll('*').length
      };
    });
    
    console.log(`   React root found: ${reactInfo.found}`);
    if (reactInfo.found) {
      console.log(`   Root has children: ${reactInfo.hasChildren}`);
      console.log(`   First child: ${reactInfo.firstChildTag}.${reactInfo.firstChildClass}`);
      console.log(`   Total elements in app: ${reactInfo.totalElements}`);
    }
    
    // Check for App.js imports by looking at source
    console.log('\n5. Checking App.js source for GrantsChatWidget import...');
    const scripts = await page.$$eval('script', scripts => {
      return scripts.map(script => ({
        src: script.src,
        hasContent: script.innerHTML.length > 0,
        includesChat: script.innerHTML.includes('GrantsChatWidget') || script.innerHTML.includes('chat-widget')
      }));
    });
    
    const chatInScripts = scripts.filter(s => s.includesChat);
    console.log(`   Scripts containing chat references: ${chatInScripts.length}`);
    
    // Check network requests for chat-related resources
    console.log('\n6. Analyzing network requests...');
    const requests = [];
    page.on('response', response => {
      if (response.url().includes('chat') || response.url().includes('Chat')) {
        requests.push({
          url: response.url(),
          status: response.status(),
          type: response.request().resourceType()
        });
      }
    });
    
    // Reload to capture network requests
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`   Chat-related network requests: ${requests.length}`);
    requests.forEach(req => {
      console.log(`     ${req.status} - ${req.type} - ${req.url}`);
    });
    
    // Check if the component might be hidden or has zero dimensions
    console.log('\n7. Checking for invisible chat elements...');
    const invisibleChatElements = await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      const chatRelated = [];
      
      for (let el of all) {
        const text = el.textContent || '';
        const className = el.className || '';
        const id = el.id || '';
        
        if (text.toLowerCase().includes('chat') || 
            (typeof className === 'string' && className.toLowerCase().includes('chat')) || 
            id.toLowerCase().includes('chat')) {
          
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          
          chatRelated.push({
            tag: el.tagName,
            className: className,
            id: id,
            text: text.substring(0, 50),
            width: rect.width,
            height: rect.height,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            position: style.position
          });
        }
      }
      return chatRelated;
    });
    
    console.log(`   Invisible/hidden chat elements found: ${invisibleChatElements.length}`);
    invisibleChatElements.forEach((el, i) => {
      console.log(`     ${i + 1}. ${el.tag}.${el.className} - size:${el.width}x${el.height} - display:${el.display} visibility:${el.visibility} opacity:${el.opacity}`);
      if (el.text.trim()) {
        console.log(`        Text: "${el.text}"`);
      }
    });
    
    // Take a screenshot for visual verification
    console.log('\n8. Taking screenshot for visual verification...');
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/chat-debug-screenshot.png',
      fullPage: true 
    });
    console.log('   Screenshot saved: chat-debug-screenshot.png');
    
    // Test other pages to see if chat appears anywhere
    console.log('\n9. Testing other pages...');
    const testPages = ['/grants', '/about', '/blog'];
    
    for (const testPage of testPages) {
      try {
        await page.goto(`https://civil-society-grants-database.netlify.app${testPage}`, { 
          waitUntil: 'networkidle2',
          timeout: 15000
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const pageChat = await page.$('[data-testid="chat-button"], .chat-button, button[aria-label*="chat" i]');
        console.log(`   ${testPage}: Chat button found: ${!!pageChat}`);
      } catch (error) {
        console.log(`   ${testPage}: Error loading - ${error.message}`);
      }
    }
    
    console.log('\n🎯 FINAL ANALYSIS');
    console.log('==================');
    
    if (chatButton) {
      console.log('✅ Chat widget appears to be present but might have issues');
    } else {
      console.log('❌ Chat widget is NOT found on the page');
      console.log('   Possible causes:');
      console.log('   - Component not imported in App.js');
      console.log('   - Build/deployment issue');
      console.log('   - CSS hiding the element');
      console.log('   - JavaScript error preventing render');
      console.log('   - Component conditional rendering logic');
    }
    
  } catch (error) {
    console.error('Error during debugging:', error.message);
  } finally {
    await browser.close();
  }
}

debugChatWidget();