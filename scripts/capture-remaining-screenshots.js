const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function captureRemainingScreenshots() {
  console.log('📸 Capturing remaining screenshots...\n');
  
  const screenshotDir = path.join(__dirname, '..', 'pitches', 'screenshots');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1920,1080']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Helper function
    async function takeScreenshot(name, description) {
      const filepath = path.join(screenshotDir, name);
      await page.screenshot({ 
        path: filepath,
        fullPage: false
      });
      console.log(`✅ ${description}`);
      console.log(`   Saved: ${name}\n`);
    }

    // AI CHATBOT
    console.log('📍 Capturing AI Chatbot...');
    await page.goto('https://civil-society-grants-database.netlify.app', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Look for chatbot button with simpler selector
    const chatbotOpened = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chatButton = buttons.find(btn => 
        btn.textContent.includes('Chat') || 
        btn.querySelector('svg') || 
        btn.className.includes('chat')
      );
      if (chatButton) {
        chatButton.click();
        return true;
      }
      return false;
    });
    
    if (chatbotOpened) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await takeScreenshot('06-chatbot-open.png', 'AI Assistant interface opened');
    }

    // GRANT DETAIL
    console.log('📍 Capturing Grant Detail...');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Click first grant link
    const grantClicked = await page.evaluate(() => {
      const grantLinks = document.querySelectorAll('a[href*="/grant/"]');
      if (grantLinks.length > 0) {
        grantLinks[0].click();
        return true;
      }
      return false;
    });
    
    if (grantClicked) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await takeScreenshot('08-grant-detail.png', 'Detailed grant information page');
    }

    // LANGUAGE SWITCHING
    console.log('📍 Capturing Language Switch...');
    await page.goto('https://civil-society-grants-database.netlify.app', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to find and click language button
    const langSwitched = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const langButton = buttons.find(btn => 
        btn.textContent.includes('EN') || 
        btn.textContent.includes('UK') ||
        btn.getAttribute('aria-label')?.includes('language')
      );
      if (langButton) {
        langButton.click();
        return true;
      }
      return false;
    });
    
    if (langSwitched) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to click Ukrainian option
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const ukButton = buttons.find(btn => 
          btn.textContent.includes('UK') || 
          btn.textContent.includes('Українська')
        );
        if (ukButton) ukButton.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      await takeScreenshot('12-ukrainian-interface.png', 'Ukrainian language interface');
    }

    // SEARCH FUNCTIONALITY
    console.log('📍 Capturing Search...');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const searchPerformed = await page.evaluate(() => {
      const searchInput = document.querySelector('input[type="search"], input[type="text"]');
      if (searchInput) {
        searchInput.value = 'women rights';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    });
    
    if (searchPerformed) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await takeScreenshot('13-search-functionality.png', 'Search results for "women rights"');
    }

    // ABOUT PAGE
    console.log('📍 Capturing About Page...');
    await page.goto('https://civil-society-grants-database.netlify.app/about', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot('14-about-page.png', 'About page with mission statement');

    // BLOG SECTION
    console.log('📍 Capturing Blog...');
    await page.goto('https://civil-society-grants-database.netlify.app/blog', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot('15-blog-section.png', 'Blog with grant insights and resources');

    console.log('\n✨ Additional screenshots captured!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureRemainingScreenshots().catch(console.error);