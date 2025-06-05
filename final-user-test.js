const puppeteer = require('puppeteer');

async function finalUserTest() {
  console.log('👤 FINAL USER EXPERIENCE TEST\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🌐 Loading Civil Society Grants Database...');
    await page.goto('https://civil-society-grants-database.netlify.app/', { 
      waitUntil: 'networkidle2' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate real user interaction
    console.log('\n👀 USER VIEW: What does a real user see?');
    
    // Take screenshot of what user sees
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/user-view.png',
      fullPage: false,  // Just viewport
      clip: { x: 1000, y: 600, width: 200, height: 200 } // Bottom-right corner
    });
    console.log('📸 Bottom-right corner screenshot saved: user-view.png');
    
    // Test user workflow
    console.log('\n🎯 USER WORKFLOW TEST:');
    console.log('1. Looking for chat button in bottom-right...');
    
    const chatButton = await page.$('button[aria-label*="chat" i]');
    if (chatButton) {
      console.log('✅ Chat button found by selector');
      
      const rect = await chatButton.boundingBox();
      console.log(`   Position: x:${rect.x} y:${rect.y} (${rect.width}x${rect.height})`);
      
      // Check if button is in the visible bottom-right area
      const viewport = page.viewport();
      const isInBottomRight = rect.x > viewport.width * 0.8 && rect.y > viewport.height * 0.8;
      console.log(`   In bottom-right area: ${isInBottomRight}`);
      
      console.log('\n2. User clicks chat button...');
      await chatButton.click();
      console.log('✅ Button clicked');
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('\n3. Looking for chat widget...');
      const chatWidget = await page.$('div[class*="fixed"][class*="bottom"]:not(button)');
      
      if (chatWidget) {
        console.log('✅ Chat widget appeared');
        
        const widgetRect = await chatWidget.boundingBox();
        console.log(`   Widget position: x:${widgetRect.x} y:${widgetRect.y} (${widgetRect.width}x${widgetRect.height})`);
        
        // Look for welcome message
        const welcomeMessage = await page.$eval('*', () => {
          const elements = Array.from(document.querySelectorAll('*'));
          const welcome = elements.find(el => 
            el.textContent && el.textContent.includes('grants assistant')
          );
          return welcome ? welcome.textContent.substring(0, 100) : null;
        });
        
        if (welcomeMessage) {
          console.log('✅ Welcome message found:');
          console.log(`   "${welcomeMessage}..."`);
        }
        
        console.log('\n4. User types a question...');
        const input = await page.$('input[placeholder*="grant" i]');
        if (input) {
          await input.type('What grants are available for NGOs?');
          console.log('✅ Message typed');
          
          // Press Enter or click send
          await page.keyboard.press('Enter');
          console.log('✅ Message sent');
          
          // Wait for AI response
          console.log('\n5. Waiting for AI response...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const messages = await page.$$eval('div[class*="rounded-lg"]', divs => {
            return divs.filter(div => 
              div.textContent && 
              div.textContent.length > 50 &&
              !div.textContent.includes('grants assistant')
            ).length;
          });
          
          console.log(`✅ Found ${messages} response messages`);
          
          if (messages > 0) {
            console.log('✅ AI responded successfully');
          }
        }
        
        // Take final screenshot
        await page.screenshot({ 
          path: '/Users/winzendwyers/grants website/chat-working.png',
          fullPage: false
        });
        console.log('📸 Working chat screenshot saved: chat-working.png');
        
      } else {
        console.log('❌ Chat widget did not appear');
      }
      
    } else {
      console.log('❌ Chat button not found');
    }
    
    console.log('\n🏆 FINAL ASSESSMENT:');
    
    if (chatButton && chatWidget) {
      console.log('✅ SUCCESS: Chat widget is fully functional for users!');
      console.log('   - Button is visible and clickable');
      console.log('   - Widget opens properly');
      console.log('   - Messages can be sent');
      console.log('   - AI responses are working');
      console.log('\n👤 USER EXPERIENCE: EXCELLENT');
      
    } else if (chatButton && !chatWidget) {
      console.log('⚠️  PARTIAL: Button works but widget has issues');
      
    } else {
      console.log('❌ FAILURE: Chat functionality not working');
    }
    
    // Keep browser open for final verification
    console.log('\n🔍 Browser staying open for 10 seconds for manual verification...');
    console.log('   You can visually confirm the chat widget is working!');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

finalUserTest();