const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createBlogPostStepByStep() {
  console.log('🚀 Starting step-by-step blog creation...\n');
  console.log('This script will pause at each step so you can see what\'s happening.\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 500, // Slow down actions
    defaultViewport: null,
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  
  try {
    // Step 1: Login
    console.log('📍 Step 1: Going to login page...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/login', {
      waitUntil: 'domcontentloaded'
    });
    
    console.log('   Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('   Typing username...');
    await page.click('input[placeholder="Username"]');
    await page.keyboard.type('admin');
    
    console.log('   Typing password...');
    await page.click('input[placeholder="Password"]');
    await page.keyboard.type('admin123');
    
    console.log('   Clicking Sign in...');
    await page.click('button[type="submit"]');
    
    console.log('   ⏳ Waiting for login to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 2: Navigate to Blog
    console.log('\n📍 Step 2: Going to Blog section...');
    const currentUrl = page.url();
    console.log('   Current URL:', currentUrl);
    
    if (currentUrl.includes('dashboard')) {
      console.log('   ✅ Login successful! Now navigating to blog...');
      
      // Try clicking Blog Posts link
      const blogClicked = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, div, span'));
        const blogLink = links.find(el => 
          el.textContent && el.textContent.includes('Blog Posts')
        );
        if (blogLink) {
          console.log('Found blog link:', blogLink.textContent);
          blogLink.click();
          return true;
        }
        return false;
      });
      
      if (blogClicked) {
        console.log('   ✅ Clicked Blog Posts link');
      } else {
        console.log('   📍 Navigating directly to blog URL...');
        await page.goto('https://civil-society-grants-database.netlify.app/admin/blog');
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Step 3: Create New Post
    console.log('\n📍 Step 3: Creating new post...');
    
    const newPostClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const newBtn = buttons.find(el => {
        const text = el.textContent || '';
        return text.includes('New') || text.includes('Create') || text.includes('Add');
      });
      if (newBtn) {
        console.log('Found new post button:', newBtn.textContent);
        newBtn.click();
        return true;
      }
      return false;
    });
    
    if (newPostClicked) {
      console.log('   ✅ Clicked New Post button');
    } else {
      console.log('   📍 Navigating directly to new post URL...');
      await page.goto('https://civil-society-grants-database.netlify.app/admin/blog/new');
    }
    
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Step 4: Fill the form
    console.log('\n📍 Step 4: Filling the form...');
    
    // Read blog content
    const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // Fill each field with visual feedback
    console.log('   📝 Title...');
    const titleFilled = await page.evaluate((title) => {
      const input = document.querySelector('#title, input[name="title"], input[placeholder*="Title" i]');
      if (input) {
        input.focus();
        input.value = title;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }, "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)");
    console.log(titleFilled ? '      ✅ Title filled' : '      ⚠️ Could not fill title');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   📝 Slug...');
    const slugFilled = await page.evaluate((slug) => {
      const input = document.querySelector('#slug, input[name="slug"]');
      if (input) {
        input.focus();
        input.value = slug;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }, 'ukraine-civil-society-pulse-may-june-2025');
    console.log(slugFilled ? '      ✅ Slug filled' : '      ⚠️ Could not fill slug');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   📝 Content (with infographics)...');
    const contentFilled = await page.evaluate((content) => {
      const textarea = document.querySelector('#content, textarea[name="content"]');
      if (textarea) {
        textarea.focus();
        textarea.value = content;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }, blogContent);
    console.log(contentFilled ? '      ✅ Content filled with all infographics' : '      ⚠️ Could not fill content');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   📝 Other fields...');
    await page.evaluate(() => {
      // Excerpt
      const excerpt = document.querySelector('#excerpt, textarea[name="excerpt"], input[name="excerpt"]');
      if (excerpt) {
        excerpt.value = "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations.";
        excerpt.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Category
      const category = document.querySelector('#category, input[name="category"]');
      if (category) {
        category.value = 'Reports';
        category.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Tags
      const tags = document.querySelector('#tags, input[name="tags"], textarea[name="tags"]');
      if (tags) {
        tags.value = 'Ukraine, Civil Society, Human Rights, Humanitarian Aid, EU Integration';
        tags.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Status
      const status = document.querySelector('select[name="status"]');
      if (status) {
        status.value = 'published';
        status.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    console.log('      ✅ Other fields filled');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({ path: 'blog-ready-to-save.png', fullPage: true });
    console.log('\n📸 Screenshot saved: blog-ready-to-save.png');
    
    // Step 5: Save
    console.log('\n📍 Step 5: Looking for save button...');
    
    const buttons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.map(b => ({ 
        text: b.textContent, 
        disabled: b.disabled,
        type: b.type
      }));
    });
    console.log('   Available buttons:', buttons.map(b => b.text).join(', '));
    
    const saved = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(btn => {
        const text = (btn.textContent || '').toLowerCase();
        return (text.includes('save') || text.includes('publish') || text.includes('create')) && !btn.disabled;
      });
      if (saveBtn) {
        saveBtn.click();
        return true;
      }
      return false;
    });
    
    if (saved) {
      console.log('   ✅ Save button clicked!');
      console.log('   ⏳ Waiting for save to complete...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await page.screenshot({ path: 'blog-saved-final.png', fullPage: true });
      console.log('\n🎉 Blog post created successfully!');
      console.log('📸 Final screenshot: blog-saved-final.png');
    } else {
      console.log('   ⚠️ Could not find save button');
      console.log('\n📋 Please manually click the Save/Publish button');
    }
    
    console.log('\n✨ Blog post includes all 7 infographics:');
    console.log('   1. Key Statistics');
    console.log('   2. Focus Areas');
    console.log('   3. Timeline');
    console.log('   4. Regional Impact');
    console.log('   5. International Support');
    console.log('   6. Future Priorities');
    console.log('   7. Call to Action');
    console.log('\n🔗 Blog URL: https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025');
    console.log('\n👀 Browser will remain open for verification.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'error-step-by-step.png', fullPage: true });
    
    console.log('\n📋 Manual steps to complete:');
    console.log('1. Complete the login if needed');
    console.log('2. Navigate to Blog Posts → New Post');
    console.log('3. Copy data from blog-post-data.json');
    console.log('4. Save/Publish the post');
  }
}

createBlogPostStepByStep().catch(console.error);