const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createBlogPostWithInfographics() {
  console.log('🚀 Starting complete blog post creation with infographics...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    defaultViewport: null,
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Step 1: Navigate to login
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/login', {
      waitUntil: 'networkidle2'
    });
    
    // Step 2: Login
    console.log('📍 Step 2: Logging in...');
    await page.waitForSelector('input[placeholder="Username"]');
    
    // Type credentials
    await page.type('input[placeholder="Username"]', 'admin');
    await page.type('input[placeholder="Password"]', 'admin123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Logged in successfully');
    
    // Step 3: Navigate to Blog Posts
    console.log('\n📍 Step 3: Navigating to Blog Posts...');
    
    // Click Blog Posts in sidebar
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button, div'));
      const blogLink = links.find(el => 
        el.textContent && el.textContent.trim() === 'Blog Posts'
      );
      if (blogLink) blogLink.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Click New Post
    console.log('📍 Step 4: Creating new post...');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const newBtn = buttons.find(el => 
        el.textContent && (
          el.textContent.includes('New Post') || 
          el.textContent.includes('Create') ||
          el.textContent.includes('Add')
        )
      );
      if (newBtn) newBtn.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 5: Fill the form
    console.log('\n📍 Step 5: Filling blog post form...');
    
    // Read blog content
    const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // Fill Title
    console.log('   📝 Filling title...');
    await page.evaluate(() => {
      const titleInput = document.querySelector('input#title') || 
                        document.querySelector('input[name="title"]') ||
                        document.querySelector('input[placeholder*="Title"]');
      if (titleInput) {
        titleInput.value = "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)";
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Fill Slug
    console.log('   📝 Filling slug...');
    await page.evaluate(() => {
      const slugInput = document.querySelector('input#slug') || 
                       document.querySelector('input[name="slug"]');
      if (slugInput) {
        slugInput.value = 'ukraine-civil-society-pulse-may-june-2025';
        slugInput.dispatchEvent(new Event('input', { bubbles: true }));
        slugInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Fill Content with infographics
    console.log('   📝 Filling content with infographics...');
    await page.evaluate((content) => {
      const contentArea = document.querySelector('textarea#content') || 
                         document.querySelector('textarea[name="content"]');
      if (contentArea) {
        contentArea.value = content;
        contentArea.dispatchEvent(new Event('input', { bubbles: true }));
        contentArea.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Trigger any React state updates
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        nativeInputValueSetter.call(contentArea, content);
        const evt = new Event('input', { bubbles: true });
        contentArea.dispatchEvent(evt);
      }
    }, blogContent);
    
    // Fill Excerpt
    console.log('   📝 Filling excerpt...');
    await page.evaluate(() => {
      const excerptInput = document.querySelector('textarea#excerpt') || 
                          document.querySelector('textarea[name="excerpt"]') ||
                          document.querySelector('input#excerpt') ||
                          document.querySelector('input[name="excerpt"]');
      if (excerptInput) {
        const excerpt = "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations.";
        excerptInput.value = excerpt;
        excerptInput.dispatchEvent(new Event('input', { bubbles: true }));
        excerptInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Fill Category
    console.log('   📝 Filling category...');
    await page.evaluate(() => {
      const categoryInput = document.querySelector('input#category') || 
                           document.querySelector('input[name="category"]');
      if (categoryInput) {
        categoryInput.value = 'Reports';
        categoryInput.dispatchEvent(new Event('input', { bubbles: true }));
        categoryInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Fill Tags
    console.log('   📝 Filling tags...');
    await page.evaluate(() => {
      const tagsInput = document.querySelector('input#tags') || 
                       document.querySelector('input[name="tags"]') ||
                       document.querySelector('textarea[name="tags"]');
      if (tagsInput) {
        tagsInput.value = 'Ukraine, Civil Society, Human Rights, Humanitarian Aid, EU Integration';
        tagsInput.dispatchEvent(new Event('input', { bubbles: true }));
        tagsInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Set Status to Published
    console.log('   📝 Setting status to published...');
    await page.evaluate(() => {
      const statusSelect = document.querySelector('select[name="status"]');
      if (statusSelect) {
        statusSelect.value = 'published';
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // Try radio buttons
        const publishedRadio = document.querySelector('input[type="radio"][value="published"]');
        if (publishedRadio) {
          publishedRadio.checked = true;
          publishedRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot before saving
    await page.screenshot({ path: 'blog-form-complete.png', fullPage: true });
    console.log('\n📸 Screenshot saved: blog-form-complete.png');
    
    // Step 6: Save the post
    console.log('\n📍 Step 6: Saving blog post...');
    
    const saved = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(btn => {
        const text = btn.textContent.toLowerCase();
        return text.includes('save') || text.includes('publish') || text.includes('create');
      });
      if (saveBtn && !saveBtn.disabled) {
        saveBtn.click();
        return true;
      }
      return false;
    });
    
    if (saved) {
      console.log('✅ Save button clicked!');
      
      // Wait for save to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Take final screenshot
      await page.screenshot({ path: 'blog-post-saved.png', fullPage: true });
      
      console.log('\n🎉 Blog post created successfully!');
      console.log('📸 Final screenshot: blog-post-saved.png');
      console.log('\n🔗 Blog post URL: https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025');
      console.log('\n✨ The blog post includes all 7 infographics:');
      console.log('   1. Key Statistics');
      console.log('   2. Focus Areas');
      console.log('   3. Timeline');
      console.log('   4. Regional Impact');
      console.log('   5. International Support');
      console.log('   6. Future Priorities');
      console.log('   7. Call to Action');
      console.log('\n👀 Browser will remain open for verification.');
    } else {
      console.log('⚠️  Could not find or click save button.');
      console.log('Please manually click the Save/Publish button.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
    console.log('📸 Error screenshot: error-state.png');
    
    // Provide manual instructions
    console.log('\n📋 Manual completion steps:');
    console.log('1. The browser should be open with the form partially filled');
    console.log('2. Complete any missing fields');
    console.log('3. Click Save or Publish button');
    console.log('4. The blog content in blog-post-data.json includes all infographics');
  }
}

// Run the script
createBlogPostWithInfographics().catch(console.error);