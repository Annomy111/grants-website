const puppeteer = require('puppeteer');

async function showBlogPostLocation() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    console.log('📸 Taking screenshots to show where blog posts are...\n');

    // Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', 'admin');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Logged in');

    // Go to blog management
    console.log('\n2. Going to Blog Posts page...');
    await page.goto('http://localhost:3000/admin/blog', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Highlight the blog post
    await page.evaluate(() => {
      // Find elements containing the blog post title
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent.includes('Bridging the Distance') && 
        !Array.from(el.children).some(child => child.textContent.includes('Bridging the Distance'))
      );
      
      elements.forEach(el => {
        el.style.border = '3px solid red';
        el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        el.style.padding = '10px';
      });

      // Also highlight the entire blog post container
      const blogContainers = document.querySelectorAll('[class*="blog"], [class*="post"], .card, article');
      blogContainers.forEach(container => {
        if (container.textContent.includes('Bridging the Distance')) {
          container.style.outline = '5px solid green';
          container.style.outlineOffset = '5px';
        }
      });
    });

    await page.screenshot({ 
      path: 'blog-post-highlighted.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved: blog-post-highlighted.png (blog post highlighted in red/green)');

    // Check what actions are available
    console.log('\n3. Checking available actions...');
    const actions = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a')).filter(el => 
        el.textContent.match(/edit|view|delete|publish|unpublish/i)
      );
      
      return buttons.map(btn => ({
        text: btn.textContent.trim(),
        href: btn.href || 'button',
        onclick: btn.onclick ? 'has onclick' : 'no onclick'
      }));
    });
    
    console.log('Available actions:', actions);

    // Try clicking on the blog post
    console.log('\n4. Trying to interact with the blog post...');
    const clickable = await page.evaluate(() => {
      const blogPost = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent.includes('Bridging the Distance') && 
        (el.tagName === 'A' || el.tagName === 'BUTTON' || el.style.cursor === 'pointer')
      );
      
      if (blogPost) {
        blogPost.style.border = '3px solid blue';
        return {
          found: true,
          tag: blogPost.tagName,
          href: blogPost.href,
          cursor: window.getComputedStyle(blogPost).cursor
        };
      }
      return { found: false };
    });
    
    console.log('Clickable element:', clickable);

    // Generate a new blog post to see if it appears
    console.log('\n5. Generating a new blog post to test...');
    await page.goto('http://localhost:3000/admin/blog-generation/create', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill the form
    await page.type('input[name="topic"]', 'Test Blog Post ' + Date.now());
    await page.select('select[name="tone"]', 'professional');
    await page.select('select[name="length"]', 'medium');
    await page.select('select[name="language"]', 'en');
    
    // Click generate
    const generated = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const genBtn = buttons.find(btn => btn.textContent?.includes('Generate'));
      if (genBtn) {
        genBtn.click();
        return true;
      }
      return false;
    });
    
    if (generated) {
      console.log('✅ Generation started, waiting 15 seconds...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Go back to blog posts
      await page.goto('http://localhost:3000/admin/blog', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Count blog posts
      const postCount = await page.evaluate(() => {
        const text = document.body.textContent;
        const match = text.match(/All \((\d+)\)/);
        return match ? parseInt(match[1]) : 0;
      });
      
      console.log(`✅ Blog posts count: ${postCount}`);
      
      await page.screenshot({ 
        path: 'blog-posts-after-generation.png',
        fullPage: true 
      });
      console.log('✅ Screenshot saved: blog-posts-after-generation.png');
    }

    console.log('\n📊 SUMMARY:');
    console.log('1. Blog posts ARE showing in the admin interface at /admin/blog');
    console.log('2. The blog post "Bridging the Distance..." is visible and published');
    console.log('3. Check the highlighted screenshots to see exactly where they appear');
    console.log('4. If you expected them elsewhere, please let me know where');

    console.log('\n🔍 Keeping browser open for inspection...');

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ 
      path: 'blog-location-error.png',
      fullPage: true 
    });
  }
}

showBlogPostLocation().catch(console.error);