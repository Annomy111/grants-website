const puppeteer = require('puppeteer');

async function verifyBlogFix() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    console.log('🔍 Verifying Blog Display Fix...\n');

    // Monitor errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });

    // Monitor API calls
    let apiCallCount = 0;
    page.on('response', response => {
      if (response.url().includes('/api/blog')) {
        apiCallCount++;
        console.log(`Blog API Call #${apiCallCount}: ${response.status()} ${response.url()}`);
      }
    });

    // 1. Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    console.log('✅ Logged in\n');

    // 2. Navigate to blog page
    console.log('2. Going to Blog Posts page...');
    await page.goto('http://localhost:3000/admin/blog');
    
    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Check what's displayed
    console.log('\n3. Analyzing page content...');
    const analysis = await page.evaluate(() => {
      const result = {
        pageTitle: document.querySelector('h1')?.textContent,
        hasGrid: !!document.querySelector('.grid'),
        gridChildren: document.querySelectorAll('.grid > div').length,
        allButtonText: '',
        publishedButtonText: '',
        blogPostTitles: [],
        hasNoPostsMessage: false,
        pageTextIncludes: {
          bridging: document.body.textContent.includes('Bridging'),
          diaspora: document.body.textContent.includes('Diaspora'),
          ukraine: document.body.textContent.includes('Ukraine')
        }
      };

      // Find filter buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      const allBtn = buttons.find(b => b.textContent.includes('All'));
      const pubBtn = buttons.find(b => b.textContent.includes('Published'));
      
      if (allBtn) result.allButtonText = allBtn.textContent;
      if (pubBtn) result.publishedButtonText = pubBtn.textContent;

      // Find blog post titles
      document.querySelectorAll('h3').forEach(h3 => {
        if (h3.textContent && !h3.textContent.includes('Blog Posts')) {
          result.blogPostTitles.push(h3.textContent.trim());
        }
      });

      // Check for no posts message
      const noPosts = Array.from(document.querySelectorAll('p')).find(p => 
        p.textContent.includes('No blog posts')
      );
      result.hasNoPostsMessage = !!noPosts;

      return result;
    });

    console.log('Page Analysis:');
    console.log('- Page Title:', analysis.pageTitle);
    console.log('- Has Grid:', analysis.hasGrid);
    console.log('- Grid Children:', analysis.gridChildren);
    console.log('- All Button:', analysis.allButtonText);
    console.log('- Published Button:', analysis.publishedButtonText);
    console.log('- Blog Post Titles Found:', analysis.blogPostTitles.length);
    analysis.blogPostTitles.forEach((title, i) => {
      console.log(`  ${i + 1}. ${title}`);
    });
    console.log('- Has "No posts" message:', analysis.hasNoPostsMessage);
    console.log('- Page contains keywords:', analysis.pageTextIncludes);

    // 4. Take screenshots
    await page.screenshot({ 
      path: 'blog-page-full.png',
      fullPage: true 
    });
    console.log('\n✅ Screenshot saved: blog-page-full.png');

    // 5. Highlight blog posts if found
    const highlighted = await page.evaluate(() => {
      let found = 0;
      
      // Highlight the grid
      const grid = document.querySelector('.grid');
      if (grid) {
        grid.style.border = '5px solid red';
        grid.style.padding = '10px';
        
        // Highlight each blog post
        grid.querySelectorAll(':scope > div').forEach((card, i) => {
          card.style.border = '3px solid blue';
          card.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
          found++;
        });
      }
      
      return found;
    });

    if (highlighted > 0) {
      await page.screenshot({ 
        path: 'blog-page-highlighted.png',
        fullPage: true 
      });
      console.log(`✅ Found and highlighted ${highlighted} blog post(s)`);
      console.log('✅ Screenshot saved: blog-page-highlighted.png');
    }

    // 6. Final diagnosis
    console.log('\n📊 DIAGNOSIS:');
    if (analysis.gridChildren > 0) {
      console.log('✅ SUCCESS! Blog posts ARE displayed in the admin interface!');
      console.log(`Found ${analysis.gridChildren} blog post card(s) in the grid.`);
      console.log('\nThe blog post "Bridging the Distance..." should be visible.');
      console.log('Check the screenshots to see where it appears.');
    } else if (analysis.hasNoPostsMessage) {
      console.log('❌ The UI shows "No blog posts found" message');
      console.log('But we know there IS 1 post in the database.');
      console.log('This indicates a frontend issue.');
    } else {
      console.log('⚠️ Cannot determine the exact issue.');
      console.log('Please check the screenshots.');
    }

    console.log('\n🔍 Keeping browser open for manual inspection...');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
  }
}

verifyBlogFix().catch(console.error);