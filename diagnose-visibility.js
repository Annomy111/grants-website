const puppeteer = require('puppeteer');

async function diagnoseVisibility() {
  console.log('🔍 Diagnosing Chat Button Visibility Issues\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    await page.goto('https://civil-society-grants-database.netlify.app/', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('1. Analyzing chat button visibility...');
    
    const analysis = await page.evaluate(() => {
      const button = document.querySelector('button[aria-label*="chat" i]');
      if (!button) return { found: false };
      
      const rect = button.getBoundingClientRect();
      const style = window.getComputedStyle(button);
      
      // Check various visibility factors
      const checks = {
        // Basic element checks
        hasOffsetParent: button.offsetParent !== null,
        hasClientRect: rect.width > 0 && rect.height > 0,
        
        // CSS visibility checks  
        display: style.display,
        visibility: style.visibility,
        opacity: parseFloat(style.opacity),
        
        // Position checks
        position: style.position,
        zIndex: style.zIndex,
        bottom: style.bottom,
        right: style.right,
        
        // Viewport checks
        inViewportX: rect.left >= 0 && rect.right <= window.innerWidth,
        inViewportY: rect.top >= 0 && rect.bottom <= window.innerHeight,
        
        // Element positioning
        rectLeft: rect.left,
        rectTop: rect.top,
        rectRight: rect.right,
        rectBottom: rect.bottom,
        rectWidth: rect.width,
        rectHeight: rect.height,
        
        // Viewport dimensions
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        
        // Check if element is actually visible to user
        isIntersecting: rect.top < window.innerHeight && 
                       rect.bottom > 0 && 
                       rect.left < window.innerWidth && 
                       rect.right > 0,
        
        // Check for overlapping elements
        elementAtPoint: document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2)?.tagName,
        
        // Parent container checks
        parentDisplay: button.parentElement ? window.getComputedStyle(button.parentElement).display : 'none',
        parentVisibility: button.parentElement ? window.getComputedStyle(button.parentElement).visibility : 'hidden'
      };
      
      return {
        found: true,
        checks: checks,
        computedStyle: {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          position: style.position,
          zIndex: style.zIndex,
          transform: style.transform,
          overflow: style.overflow
        }
      };
    });
    
    if (!analysis.found) {
      console.log('❌ Button not found');
      return;
    }
    
    console.log('2. Visibility Analysis Results:');
    console.log('   Basic Visibility:');
    console.log(`     Has offset parent: ${analysis.checks.hasOffsetParent}`);
    console.log(`     Has client rect: ${analysis.checks.hasClientRect}`);
    console.log(`     Display: ${analysis.checks.display}`);
    console.log(`     Visibility: ${analysis.checks.visibility}`);
    console.log(`     Opacity: ${analysis.checks.opacity}`);
    
    console.log('\n   Positioning:');
    console.log(`     Position: ${analysis.checks.position}`);
    console.log(`     Z-index: ${analysis.checks.zIndex}`);
    console.log(`     Bottom: ${analysis.checks.bottom}`);
    console.log(`     Right: ${analysis.checks.right}`);
    
    console.log('\n   Viewport Position:');
    console.log(`     Element rect: ${analysis.checks.rectLeft}, ${analysis.checks.rectTop}, ${analysis.checks.rectRight}, ${analysis.checks.rectBottom}`);
    console.log(`     Viewport size: ${analysis.checks.viewportWidth} x ${analysis.checks.viewportHeight}`);
    console.log(`     In viewport X: ${analysis.checks.inViewportX}`);
    console.log(`     In viewport Y: ${analysis.checks.inViewportY}`);
    console.log(`     Is intersecting: ${analysis.checks.isIntersecting}`);
    
    console.log('\n   Element Detection:');
    console.log(`     Element at center point: ${analysis.checks.elementAtPoint}`);
    console.log(`     Parent display: ${analysis.checks.parentDisplay}`);
    console.log(`     Parent visibility: ${analysis.checks.parentVisibility}`);
    
    // Test Puppeteer's built-in visibility methods
    console.log('\n3. Puppeteer Visibility Methods:');
    
    const button = await page.$('button[aria-label*="chat" i]');
    if (button) {
      try {
        const isIntersecting = await button.isIntersectingViewport();
        const boundingBox = await button.boundingBox();
        
        console.log(`   isIntersectingViewport(): ${isIntersecting}`);
        console.log(`   boundingBox(): ${JSON.stringify(boundingBox)}`);
        
        // Try different ways to make it visible
        console.log('\n4. Attempting to make button visible:');
        
        // Scroll button into view
        await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label*="chat" i]');
          if (btn) btn.scrollIntoView();
        });
        
        // Wait and test again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const afterScrollIsIntersecting = await button.isIntersectingViewport();
        console.log(`   After scrollIntoView: ${afterScrollIsIntersecting}`);
        
        // Try to force visibility
        await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label*="chat" i]');
          if (btn) {
            btn.style.display = 'block';
            btn.style.visibility = 'visible';
            btn.style.opacity = '1';
            btn.style.zIndex = '9999';
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const afterForceIsIntersecting = await button.isIntersectingViewport();
        console.log(`   After force styles: ${afterForceIsIntersecting}`);
        
      } catch (error) {
        console.log(`   Error testing visibility: ${error.message}`);
      }
    }
    
    // Check if button works despite visibility issues
    console.log('\n5. Testing functionality despite visibility:');
    try {
      // Try to click and see if it works
      await button.click();
      
      // Check if chat opened
      await new Promise(resolve => setTimeout(resolve, 1000));
      const chatOpened = await page.$('div[class*="fixed"][class*="bottom"]:not(button)');
      console.log(`   Button click works: ${!!chatOpened}`);
      
      if (chatOpened) {
        const chatVisible = await chatOpened.isIntersectingViewport();
        console.log(`   Chat widget visible: ${chatVisible}`);
      }
      
    } catch (error) {
      console.log(`   Click test failed: ${error.message}`);
    }
    
    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    
    if (analysis.checks.isIntersecting && analysis.checks.hasOffsetParent) {
      console.log('✅ Button should be visible to users');
    } else if (!analysis.checks.isIntersecting) {
      console.log('⚠️  Button is outside viewport or not intersecting');
      console.log('   This might be a viewport size or positioning issue');
    } else if (!analysis.checks.hasOffsetParent) {
      console.log('❌ Button has no offset parent (likely hidden by CSS)');
    }
    
    if (analysis.checks.opacity < 1) {
      console.log('⚠️  Button has reduced opacity');
    }
    
    if (analysis.checks.zIndex === 'auto' || parseInt(analysis.checks.zIndex) < 1) {
      console.log('⚠️  Button might be behind other elements (low z-index)');
    }
    
    // Keep browser open for inspection
    console.log('\n6. Browser open for 10 seconds for visual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

diagnoseVisibility();