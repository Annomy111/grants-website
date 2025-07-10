const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function captureScreenshots() {
  console.log('📸 Starting screenshot capture for IRF presentation...\n');
  
  // Create screenshots directory
  const screenshotDir = path.join(__dirname, '..', 'pitches', 'screenshots');
  try {
    await fs.mkdir(screenshotDir, { recursive: true });
  } catch (e) {
    console.log('Screenshot directory already exists');
  }

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1920,1080']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Helper function to take screenshot
    async function takeScreenshot(name, description) {
      const filepath = path.join(screenshotDir, name);
      await page.screenshot({ 
        path: filepath,
        fullPage: false
      });
      console.log(`✅ ${description}`);
      console.log(`   Saved: ${name}\n`);
    }

    // 1. HOMEPAGE - Hero Section & Stats
    console.log('📍 1. Capturing Homepage...');
    await page.goto('https://civil-society-grants-database.netlify.app', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await takeScreenshot('01-homepage-hero.png', 'Homepage with €75M+ funding hero');

    // Scroll to statistics section
    await page.evaluate(() => {
      const stats = document.querySelector('h2');
      if (stats) stats.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await takeScreenshot('02-statistics-section.png', 'Statistics showing 136 grants');

    // Scroll to featured grants
    await page.evaluate(() => {
      window.scrollBy(0, 600);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await takeScreenshot('03-featured-grants.png', 'Featured opportunities section');

    // 2. GRANTS PAGE - Comprehensive View
    console.log('📍 2. Capturing Grants Page...');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
    await takeScreenshot('04-grants-list.png', 'Full grants list with 136 opportunities');

    // Apply filters to show functionality
    await page.evaluate(() => {
      // Click on type filter if available
      const typeFilter = document.querySelector('select');
      if (typeFilter) {
        typeFilter.value = 'foundation';
        typeFilter.dispatchEvent(new Event('change'));
      }
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await takeScreenshot('05-grants-filtered.png', 'Filtered grants demonstration');

    // 3. AI CHATBOT - Show it in action
    console.log('📍 3. Capturing AI Chatbot...');
    await page.goto('https://civil-society-grants-database.netlify.app', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Click chatbot button
    const chatbotButton = await page.$('[aria-label="Chat with AI Assistant"]');
    if (chatbotButton) {
      await chatbotButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await takeScreenshot('06-chatbot-open.png', 'AI Assistant interface');
      
      // Type a question
      const textarea = await page.$('textarea[placeholder*="Ask about grants"]');
      if (textarea) {
        await textarea.type('Show me grants for women rights organizations');
        await new Promise(resolve => setTimeout(resolve, 500));
        await takeScreenshot('07-chatbot-query.png', 'AI Assistant with user query');
      }
    }

    // 4. GRANT DETAIL PAGE
    console.log('📍 4. Capturing Grant Detail Page...');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Click on first grant
    const firstGrant = await page.$('a[href*="/grant/"]');
    if (firstGrant) {
      await firstGrant.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await takeScreenshot('08-grant-detail.png', 'Detailed grant information page');
    }

    // 5. MOBILE RESPONSIVENESS
    console.log('📍 5. Capturing Mobile Views...');
    
    // iPhone 12 Pro
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('https://civil-society-grants-database.netlify.app', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot('09-mobile-homepage.png', 'Mobile responsive homepage');
    
    // Mobile grants page
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot('10-mobile-grants.png', 'Mobile grants list');

    // iPad Pro
    await page.setViewport({ width: 1024, height: 1366 });
    await page.goto('https://civil-society-grants-database.netlify.app', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot('11-tablet-view.png', 'Tablet responsive view');

    // 6. LANGUAGE SWITCHING
    console.log('📍 6. Capturing Language Features...');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Switch to Ukrainian
    const langButton = await page.$('button[aria-label*="language"], button:has-text("EN")');
    if (langButton) {
      await langButton.click();
      await page.waitForTimeout(500);
      const ukButton = await page.$('button:has-text("UK"), button:has-text("Українська")');
      if (ukButton) {
        await ukButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await takeScreenshot('12-ukrainian-interface.png', 'Ukrainian language interface');
      }
    }

    // 7. SEARCH FUNCTIONALITY
    console.log('📍 7. Capturing Search Features...');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const searchInput = await page.$('input[type="search"], input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('women');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await takeScreenshot('13-search-results.png', 'Search functionality demonstration');
    }

    // 8. ABOUT PAGE
    console.log('📍 8. Capturing About Page...');
    await page.goto('https://civil-society-grants-database.netlify.app/about', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot('14-about-page.png', 'About page with mission');

    // 9. BLOG SECTION
    console.log('📍 9. Capturing Blog Section...');
    await page.goto('https://civil-society-grants-database.netlify.app/blog', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot('15-blog-section.png', 'Blog with grant insights');

    console.log('\n✨ Screenshot capture complete!');
    console.log(`📁 All screenshots saved to: ${screenshotDir}`);
    
    // Create index file
    const indexContent = `# Platform Screenshots for IRF Presentation

## Homepage & Core Features
1. **01-homepage-hero.png** - Main landing page with €75M+ hero message
2. **02-statistics-section.png** - Live statistics: 136 grants, €75M+ funding
3. **03-featured-grants.png** - Smart-selected featured opportunities

## Grants Discovery
4. **04-grants-list.png** - Complete grants database interface
5. **05-grants-filtered.png** - Advanced filtering capabilities
6. **08-grant-detail.png** - Detailed grant information page

## AI Assistant
6. **06-chatbot-open.png** - AI chatbot interface
7. **07-chatbot-query.png** - Natural language grant queries

## Mobile Experience
9. **09-mobile-homepage.png** - Mobile-optimized homepage
10. **10-mobile-grants.png** - Mobile grants interface
11. **11-tablet-view.png** - Tablet responsive design

## Additional Features
12. **12-ukrainian-interface.png** - Full Ukrainian translation
13. **13-search-results.png** - Intelligent search functionality
14. **14-about-page.png** - Mission and vision
15. **15-blog-section.png** - Grant insights and resources
`;
    
    await fs.writeFile(
      path.join(screenshotDir, 'screenshot-index.md'), 
      indexContent
    );

  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);