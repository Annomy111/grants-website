const puppeteer = require('puppeteer');

async function findHiddenParent() {
  console.log('🔍 Finding Hidden Parent Element\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    await page.goto('https://civil-society-grants-database.netlify.app/', { 
      waitUntil: 'networkidle2' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('1. Tracing parent hierarchy...');
    
    const parentAnalysis = await page.evaluate(() => {
      const button = document.querySelector('button[aria-label*="chat" i]');
      if (!button) return { found: false };
      
      const parents = [];
      let current = button;
      
      // Walk up the DOM tree
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        
        parents.push({
          tagName: current.tagName,
          className: current.className,
          id: current.id,
          display: style.display,
          visibility: style.visibility,
          opacity: parseFloat(style.opacity),
          position: style.position,
          overflow: style.overflow,
          hasOffsetParent: current.offsetParent !== null,
          clientWidth: current.clientWidth,
          clientHeight: current.clientHeight,
          scrollWidth: current.scrollWidth,
          scrollHeight: current.scrollHeight
        });
        
        current = current.parentElement;
      }
      
      return { found: true, parents: parents };
    });
    
    if (!parentAnalysis.found) {
      console.log('❌ Button not found');
      return;
    }
    
    console.log('2. Parent Hierarchy (from button to body):');
    parentAnalysis.parents.forEach((parent, index) => {
      console.log(`   ${index}. ${parent.tagName}.${parent.className || '(no class)'}`);
      console.log(`      display: ${parent.display}, visibility: ${parent.visibility}, opacity: ${parent.opacity}`);
      console.log(`      position: ${parent.position}, overflow: ${parent.overflow}`);
      console.log(`      offsetParent: ${parent.hasOffsetParent}, size: ${parent.clientWidth}x${parent.clientHeight}`);
      
      // Flag potential issues
      if (parent.display === 'none') {
        console.log(`      🚨 HIDDEN: display: none`);
      }
      if (parent.visibility === 'hidden') {
        console.log(`      🚨 HIDDEN: visibility: hidden`);
      }
      if (parent.opacity < 1) {
        console.log(`      ⚠️  TRANSLUCENT: opacity: ${parent.opacity}`);
      }
      if (!parent.hasOffsetParent && index > 0) {
        console.log(`      🚨 NO OFFSET PARENT`);
      }
      if (parent.clientWidth === 0 || parent.clientHeight === 0) {
        console.log(`      🚨 ZERO SIZE: ${parent.clientWidth}x${parent.clientHeight}`);
      }
      
      console.log('');
    });
    
    // Check for React component structure
    console.log('3. Checking React component structure...');
    
    const reactStructure = await page.evaluate(() => {
      const button = document.querySelector('button[aria-label*="chat" i]');
      if (!button) return { found: false };
      
      // Look for React Fiber nodes
      let current = button;
      const components = [];
      
      while (current && current !== document.body) {
        // Check for React internal properties
        const fiber = current._reactInternalFiber || 
                     current._reactInternals || 
                     current.__reactInternalInstance;
                     
        if (fiber) {
          components.push({
            element: current.tagName + (current.className ? '.' + current.className.split(' ')[0] : ''),
            fiberType: fiber.type?.name || fiber.elementType?.name || 'Unknown',
            key: fiber.key,
            props: Object.keys(fiber.memoizedProps || {}),
          });
        }
        
        current = current.parentElement;
      }
      
      return { found: true, components: components };
    });
    
    if (reactStructure.found && reactStructure.components.length > 0) {
      console.log('   React Components found:');
      reactStructure.components.forEach((comp, i) => {
        console.log(`     ${i}. ${comp.element} (${comp.fiberType})`);
        if (comp.props.length > 0) {
          console.log(`        Props: ${comp.props.join(', ')}`);
        }
      });
    } else {
      console.log('   No React components detected in hierarchy');
    }
    
    // Check for conditional rendering
    console.log('\n4. Looking for conditional rendering clues...');
    
    const conditionalClues = await page.evaluate(() => {
      // Look for common conditional rendering patterns
      const button = document.querySelector('button[aria-label*="chat" i]');
      if (!button) return [];
      
      const clues = [];
      let current = button.parentElement;
      
      while (current && current !== document.body) {
        // Check for conditional class names
        if (current.className && current.className.includes('hidden')) {
          clues.push(`Element has 'hidden' class: ${current.tagName}.${current.className}`);
        }
        
        // Check for inline styles that might hide
        if (current.style.display === 'none') {
          clues.push(`Element has inline display:none: ${current.tagName}`);
        }
        
        // Check for data attributes that might indicate state
        if (current.dataset) {
          Object.keys(current.dataset).forEach(key => {
            if (key.includes('visible') || key.includes('show') || key.includes('hidden')) {
              clues.push(`Element has data-${key}="${current.dataset[key]}": ${current.tagName}`);
            }
          });
        }
        
        current = current.parentElement;
      }
      
      return clues;
    });
    
    if (conditionalClues.length > 0) {
      console.log('   Conditional rendering clues found:');
      conditionalClues.forEach(clue => console.log(`     - ${clue}`));
    } else {
      console.log('   No obvious conditional rendering patterns found');
    }
    
    // Try to force fix the issue
    console.log('\n5. Attempting to force-fix the visibility...');
    
    const fixAttempt = await page.evaluate(() => {
      const button = document.querySelector('button[aria-label*="chat" i]');
      if (!button) return false;
      
      // Force all parents to be visible
      let current = button;
      let fixedCount = 0;
      
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        
        if (style.display === 'none' || 
            style.visibility === 'hidden' || 
            parseFloat(style.opacity) < 1) {
          
          current.style.display = 'block';
          current.style.visibility = 'visible';
          current.style.opacity = '1';
          fixedCount++;
        }
        
        current = current.parentElement;
      }
      
      return {
        fixed: fixedCount,
        nowVisible: button.offsetParent !== null
      };
    });
    
    console.log(`   Fixed ${fixAttempt.fixed} parent elements`);
    console.log(`   Button now has offsetParent: ${fixAttempt.nowVisible}`);
    
    if (fixAttempt.nowVisible) {
      console.log('✅ SUCCESS: Button is now properly visible!');
    } else {
      console.log('❌ Still not visible after fixes');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/debug-final.png',
      fullPage: true 
    });
    console.log('   Screenshot saved: debug-final.png');
    
    // Keep browser open for inspection
    console.log('\n6. Browser open for 15 seconds for inspection...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

findHiddenParent();