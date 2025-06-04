const puppeteer = require('puppeteer');

async function verifyBlogDisplay() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--window-size=1920,1080']
  });

  try {
    const page = await browser.newPage();
    console.log('🔍 Verifying Blog Display...\n');

    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1920, height: 1080 });

    // Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    
    // Take screenshot of login page
    await page.screenshot({ path: '01-login-page.png' });
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Logged in successfully');

    // Wait a bit for any redirects
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Go to blog page
    console.log('\n2. Navigating to Blog Posts page...');
    await page.goto('http://localhost:3000/admin/blog', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot
    await page.screenshot({ path: '02-blog-posts-page.png', fullPage: true });
    console.log('✅ Screenshot saved: 02-blog-posts-page.png');

    // Analyze what's on the page
    const pageInfo = await page.evaluate(() => {
      const info = {
        url: window.location.href,
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        blogPosts: [],
        filters: [],
        error: null
      };

      // Check for error messages
      const errorEl = document.querySelector('.error, .alert-error, [class*="error"]');
      if (errorEl) {
        info.error = errorEl.textContent;
      }

      // Get filter buttons
      const filterButtons = document.querySelectorAll('button');
      filterButtons.forEach(btn => {
        if (btn.textContent.includes('All') || btn.textContent.includes('Published') || btn.textContent.includes('Draft')) {
          info.filters.push(btn.textContent.trim());
        }
      });

      // Find blog posts - look for common patterns
      const postSelectors = [
        '.grid > div', // Grid items
        '[class*="blog-post"]',
        '[class*="post-item"]',
        '.card',
        'article'
      ];

      for (const selector of postSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Check if this element contains blog post content
          const title = el.querySelector('h3, h2, h4')?.textContent;
          const status = el.querySelector('[class*="status"], .badge, span')?.textContent;
          const author = el.textContent.match(/By\s+(\w+)/)?.[1];
          
          if (title && (status || author)) {
            info.blogPosts.push({
              title: title.trim(),
              status: status?.trim(),
              author: author,
              html: el.outerHTML.substring(0, 200) + '...'
            });
          }
        });
      }

      // If no posts found, check the entire page text
      if (info.blogPosts.length === 0) {
        const bodyText = document.body.textContent;
        if (bodyText.includes('Bridging the Distance')) {
          info.blogPosts.push({
            title: 'Blog post found in page text but not in expected structure',
            pageText: bodyText.substring(0, 500)
          });
        }
      }

      return info;
    });

    console.log('\n📊 Page Analysis:');
    console.log('URL:', pageInfo.url);
    console.log('Title:', pageInfo.title);
    console.log('H1:', pageInfo.h1);
    console.log('Filters found:', pageInfo.filters);
    console.log('Error:', pageInfo.error || 'None');
    console.log('\nBlog Posts Found:', pageInfo.blogPosts.length);
    pageInfo.blogPosts.forEach((post, i) => {
      console.log(`\n${i + 1}. ${post.title}`);
      if (post.status) console.log('   Status:', post.status);
      if (post.author) console.log('   Author:', post.author);
    });

    // Check the network requests
    console.log('\n3. Checking API responses...');
    const apiCheck = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/blog?status=all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      return {
        status: response.status,
        count: data.length,
        posts: data.map(p => ({ id: p.id, title: p.title, status: p.status }))
      };
    });

    console.log('\nAPI Response:');
    console.log('Status:', apiCheck.status);
    console.log('Posts count:', apiCheck.count);
    apiCheck.posts.forEach(post => {
      console.log(`- ${post.title} (${post.status})`);
    });

    // Try clicking on All filter to refresh
    console.log('\n4. Clicking on filters to refresh view...');
    await page.evaluate(() => {
      const allButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('All (')
      );
      if (allButton) allButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: '03-after-filter-click.png', fullPage: true });

    // Highlight blog posts
    await page.evaluate(() => {
      // Find and highlight the grid container
      const grid = document.querySelector('.grid');
      if (grid) {
        grid.style.border = '3px solid red';
        grid.style.padding = '10px';
        
        // Highlight each grid item
        const items = grid.querySelectorAll(':scope > div');
        items.forEach((item, i) => {
          item.style.border = '2px solid blue';
          item.style.position = 'relative';
          
          const label = document.createElement('div');
          label.style.cssText = 'position: absolute; top: -20px; left: 0; background: yellow; color: black; padding: 2px 5px; font-weight: bold; z-index: 1000;';
          label.textContent = `Blog Post ${i + 1}`;
          item.appendChild(label);
        });
      }
    });

    await page.screenshot({ path: '04-blog-posts-highlighted.png', fullPage: true });
    console.log('✅ Screenshot with highlights saved: 04-blog-posts-highlighted.png');

    console.log('\n✅ VERIFICATION COMPLETE');
    console.log('Check the screenshots to see:');
    console.log('- 02-blog-posts-page.png: The blog posts page as it appears');
    console.log('- 04-blog-posts-highlighted.png: Blog posts highlighted in blue with red grid border');
    
    console.log('\n🔍 Keeping browser open for manual inspection...');

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }
}

verifyBlogDisplay().catch(console.error);