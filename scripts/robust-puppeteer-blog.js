const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createBlogPost() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250, // Slow down by 250 ms
    defaultViewport: null,
    args: ['--window-size=1920,1080', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting blog post creation...\n');
    
    // Go to admin login
    console.log('📍 Step 1: Navigating to admin login...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait for login form
    await page.waitForSelector('input[placeholder="Username"]', { timeout: 30000 });
    console.log('✅ Login page loaded');
    
    // Login
    console.log('\n📍 Step 2: Logging in...');
    await page.click('input[placeholder="Username"]');
    await page.keyboard.type('admin');
    
    await page.click('input[placeholder="Password"]');
    await page.keyboard.type('admin123');
    
    // Submit login
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.keyboard.press('Enter')
    ]);
    
    console.log('✅ Logged in successfully');
    
    // Navigate to blog
    console.log('\n📍 Step 3: Going to blog section...');
    const currentUrl = page.url();
    
    if (!currentUrl.includes('/admin/blog')) {
      // Try to click on Blog Posts link
      try {
        await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('a, div'));
        const blogLink = elements.find(el => el.textContent && el.textContent.includes('Blog Posts'));
        if (blogLink) blogLink.click();
      });
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      } catch {
        // Direct navigation as fallback
        await page.goto('https://civil-society-grants-database.netlify.app/admin/blog', {
          waitUntil: 'networkidle2'
        });
      }
    }
    
    console.log('✅ In blog section');
    
    // Create new post
    console.log('\n📍 Step 4: Creating new post...');
    
    // Look for New Post button
    try {
      await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('button, a'));
        const newPostBtn = elements.find(el => 
          el.textContent && (
            el.textContent.includes('New Post') || 
            el.textContent.includes('Create') ||
            el.textContent.includes('Add')
          )
        );
        if (newPostBtn) newPostBtn.click();
      });
    } catch {
      // Try direct navigation
      await page.goto('https://civil-society-grants-database.netlify.app/admin/blog/new', {
        waitUntil: 'networkidle2'
      });
    }
    
    // Wait for form
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ New post form loaded');
    
    // Fill form
    console.log('\n📍 Step 5: Filling form...');
    
    // Read content
    const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // Try multiple selectors for each field
    const fields = [
      {
        name: 'Title',
        selectors: ['#title', 'input[name="title"]', 'input[placeholder*="Title"]'],
        value: "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)"
      },
      {
        name: 'Slug',
        selectors: ['#slug', 'input[name="slug"]', 'input[placeholder*="slug"]'],
        value: 'ukraine-civil-society-pulse-may-june-2025'
      },
      {
        name: 'Excerpt',
        selectors: ['#excerpt', 'textarea[name="excerpt"]', 'input[name="excerpt"]'],
        value: "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations."
      },
      {
        name: 'Category',
        selectors: ['#category', 'input[name="category"]'],
        value: 'Reports'
      },
      {
        name: 'Tags',
        selectors: ['#tags', 'input[name="tags"]', 'textarea[name="tags"]'],
        value: 'Ukraine, Civil Society, Human Rights, Humanitarian Aid, EU Integration'
      }
    ];
    
    // Fill each field
    for (const field of fields) {
      let filled = false;
      for (const selector of field.selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          await page.keyboard.down('Control');
          await page.keyboard.press('A');
          await page.keyboard.up('Control');
          await page.keyboard.type(field.value);
          console.log(`✅ ${field.name} filled`);
          filled = true;
          break;
        } catch {
          // Try next selector
        }
      }
      if (!filled) {
        console.log(`⚠️  Could not fill ${field.name}`);
      }
    }
    
    // Fill content
    console.log('📝 Filling content...');
    const contentSelectors = ['#content', 'textarea[name="content"]', 'textarea[placeholder*="Content"]'];
    let contentFilled = false;
    
    for (const selector of contentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        
        // Type content in chunks
        const chunks = blogContent.match(/.{1,500}/g) || [];
        for (const chunk of chunks) {
          await page.keyboard.type(chunk);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('✅ Content filled');
        contentFilled = true;
        break;
      } catch {
        // Try next selector
      }
    }
    
    if (!contentFilled) {
      console.log('⚠️  Could not fill content');
    }
    
    // Set status to published
    try {
      await page.select('select[name="status"]', 'published');
      console.log('✅ Status set to published');
    } catch {
      console.log('⚠️  Could not set status');
    }
    
    // Take screenshot before saving
    await page.screenshot({ path: 'before-save.png', fullPage: true });
    
    // Save
    console.log('\n📍 Step 6: Saving post...');
    
    const saveSelectors = [
      'button[type="submit"]'
    ];
    
    let saved = false;
    
    // First try standard selectors
    for (const selector of saveSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        saved = true;
        console.log('✅ Save button clicked');
        break;
      } catch {
        // Try next selector
      }
    }
    
    // If that fails, use evaluate
    if (!saved) {
      saved = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('save') || text.includes('publish') || text.includes('create');
        });
        if (saveBtn) {
          saveBtn.click();
          return true;
        }
        return false;
      });
      
      if (saved) {
        console.log('✅ Save button clicked (via evaluate)');
      }
    }
    
    if (!saved) {
      console.log('⚠️  Could not find save button');
    }
    
    // Wait for save
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take final screenshot
    await page.screenshot({ path: 'after-save.png', fullPage: true });
    
    console.log('\n✨ Process complete!');
    console.log('📸 Screenshots saved: before-save.png, after-save.png');
    console.log('🔗 Blog URL: https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025');
    console.log('\n👀 Browser will stay open for verification');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'error.png', fullPage: true });
  }
}

createBlogPost().catch(console.error);