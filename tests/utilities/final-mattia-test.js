// Final focused test as Mattia the admin
const puppeteer = require('puppeteer');

async function finalMattiaTest() {
  console.log('🎯 FINAL MATTIA TEST: Complete Blog Generation Flow\n');
  
  let browser;
  let page;

  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1400, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Enable console monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🖥️ Console [error]:', msg.text());
      }
    });

    // Monitor network for API calls
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`📡 API Call: ${response.status()} ${response.url()}`);
      }
    });

    console.log('🔐 Step 1: Mattia logging in...');
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForSelector('input[name="username"]');
    
    await page.type('input[name="username"]', 'mattia');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin panel
    await page.waitForFunction(() => window.location.pathname !== '/admin/login', { timeout: 10000 });
    console.log('✅ Logged in successfully - redirected from login page');

    console.log('\n📝 Step 2: Navigating to blog generation...');
    await page.goto('http://localhost:3000/admin/blog-generation/create');
    await page.waitForSelector('input[name="topic"]', { timeout: 10000 });
    console.log('✅ Blog generation page loaded');

    console.log('\n✍️ Step 3: Filling the form...');
    const topic = "Critical Analysis: German-Ukrainian Civil Society Cooperation in 2024";
    await page.type('input[name="topic"]', topic);
    await page.select('select[name="tone"]', 'analytical');
    await page.select('select[name="length"]', 'medium');
    console.log(`✅ Form filled with topic: "${topic}"`);

    console.log('\n🚀 Step 4: Clicking Generate Content...');
    
    // Wait for and click the generate button
    const generateButton = await page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Generate Content'));
    }, { timeout: 5000 });
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const generateBtn = buttons.find(btn => btn.textContent.includes('Generate Content'));
      if (generateBtn) generateBtn.click();
    });
    console.log('✅ Generate button clicked');

    console.log('\n⏳ Step 5: Monitoring generation progress...');
    
    // Monitor for completion (look for preview tab becoming active or content appearing)
    let completed = false;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes
    
    while (!completed && attempts < maxAttempts) {
      try {
        // Check if we can find the Preview tab enabled or generated content
        const previewTab = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent.includes('Preview') && !btn.disabled);
        });
        const generatedTitle = await page.$('h2');
        
        if (previewTab || generatedTitle) {
          completed = true;
          console.log('✅ Generation completed! Content is ready');
          
          // Try to switch to preview if available
          if (previewTab) {
            await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const previewBtn = buttons.find(btn => btn.textContent.includes('Preview') && !btn.disabled);
              if (previewBtn) previewBtn.click();
            });
            await page.waitForTimeout(2000);
            
            // Get the generated content details
            const title = await page.$eval('h2', el => el.textContent).catch(() => 'Title not found');
            const wordCount = await page.evaluate(() => {
              const content = document.querySelector('.prose');
              return content ? content.textContent.split(' ').length : 0;
            }).catch(() => 0);
            
            console.log(`📄 Generated Title: "${title}"`);
            console.log(`📊 Word Count: ${wordCount} words`);
            console.log(`👤 Author: Mattia (expected)`);
          }
          
        } else {
          // Check for any error messages
          const errorMsg = await page.$('.text-red-500, .alert-error');
          if (errorMsg) {
            const errorText = await errorMsg.textContent();
            console.log(`❌ Error detected: ${errorText}`);
            break;
          }
          
          await page.waitForTimeout(1000);
          attempts++;
          
          if (attempts % 10 === 0) {
            console.log(`⏳ Still waiting... (${attempts}s elapsed)`);
          }
        }
        
      } catch (error) {
        attempts++;
        await page.waitForTimeout(1000);
      }
    }

    if (!completed) {
      console.log('⚠️ Generation timed out or failed');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'generation-timeout.png' });
      console.log('📸 Screenshot saved as generation-timeout.png');
    }

    console.log('\n🎉 FINAL TEST RESULTS:');
    console.log('✅ Login: SUCCESS');
    console.log('✅ Navigation: SUCCESS');
    console.log('✅ Form Filling: SUCCESS');
    console.log('✅ Generation Trigger: SUCCESS');
    console.log(`${completed ? '✅' : '❌'} Generation Completion: ${completed ? 'SUCCESS' : 'TIMEOUT/FAILED'}`);
    
    if (completed) {
      console.log('\n🎊 ALL SYSTEMS WORKING! Blog generation is fixed and operational.');
      console.log('💡 Mattia can now successfully generate expert blog content.');
    } else {
      console.log('\n⚠️ Generation process may need more time or investigation.');
      console.log('🔍 Check server logs and the screenshot for more details.');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (page) {
      await page.screenshot({ path: 'test-error.png' });
      console.log('📸 Error screenshot saved as test-error.png');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
finalMattiaTest().catch(console.error);