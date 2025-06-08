const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function fillBlogForm() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  
  try {
    console.log('🚀 Direct blog form filling...\n');
    
    // Go directly to the new blog post page (assuming we're already logged in)
    console.log('📍 Going directly to new blog post form...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/blog/new', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait a bit for the form to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if we're on login page
    const isLoginPage = await page.evaluate(() => {
      return window.location.pathname.includes('login');
    });
    
    if (isLoginPage) {
      console.log('📍 Need to login first...');
      
      // Login
      await page.type('input[placeholder="Username"]', 'admin');
      await page.type('input[placeholder="Password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Navigate to blog new post
      await page.goto('https://civil-society-grants-database.netlify.app/admin/blog/new', {
        waitUntil: 'networkidle2'
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('📍 Filling the form using direct evaluation...');
    
    // Read blog content
    const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // Fill all fields at once using page.evaluate
    const formFilled = await page.evaluate((content) => {
      try {
        // Helper function to set value and trigger events
        const setValue = (element, value) => {
          if (!element) return false;
          
          // Set value
          element.value = value;
          
          // Trigger various events
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.dispatchEvent(new Event('blur', { bubbles: true }));
          
          // For React controlled components
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            element.constructor.prototype, 
            'value'
          ).set;
          nativeInputValueSetter.call(element, value);
          const evt = new Event('input', { bubbles: true });
          element.dispatchEvent(evt);
          
          return true;
        };
        
        let results = {};
        
        // Title
        const titleInput = document.querySelector('input#title, input[name="title"], input[placeholder*="Title"]');
        results.title = setValue(titleInput, "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)");
        
        // Slug
        const slugInput = document.querySelector('input#slug, input[name="slug"], input[placeholder*="slug"]');
        results.slug = setValue(slugInput, 'ukraine-civil-society-pulse-may-june-2025');
        
        // Content
        const contentArea = document.querySelector('textarea#content, textarea[name="content"], textarea[placeholder*="Content"]');
        results.content = setValue(contentArea, content);
        
        // Excerpt
        const excerptInput = document.querySelector('textarea#excerpt, textarea[name="excerpt"], input#excerpt, input[name="excerpt"]');
        results.excerpt = setValue(excerptInput, "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations.");
        
        // Category
        const categoryInput = document.querySelector('input#category, input[name="category"]');
        results.category = setValue(categoryInput, 'Reports');
        
        // Tags
        const tagsInput = document.querySelector('input#tags, input[name="tags"], textarea[name="tags"]');
        results.tags = setValue(tagsInput, 'Ukraine, Civil Society, Human Rights, Humanitarian Aid, EU Integration');
        
        // Status
        const statusSelect = document.querySelector('select[name="status"]');
        if (statusSelect) {
          statusSelect.value = 'published';
          statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
          results.status = true;
        }
        
        return results;
      } catch (error) {
        return { error: error.message };
      }
    }, blogContent);
    
    console.log('Form fill results:', formFilled);
    
    // Take screenshot
    await page.screenshot({ path: 'form-filled-direct.png', fullPage: true });
    console.log('\n📸 Screenshot saved: form-filled-direct.png');
    
    // Try to save
    console.log('\n📍 Attempting to save...');
    
    const saveResult = await page.evaluate(() => {
      // Find save button
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(btn => {
        const text = btn.textContent.toLowerCase();
        return text.includes('save') || text.includes('publish') || text.includes('create');
      });
      
      if (saveBtn && !saveBtn.disabled) {
        // Log button info
        const btnInfo = {
          text: saveBtn.textContent,
          disabled: saveBtn.disabled,
          className: saveBtn.className
        };
        
        // Click it
        saveBtn.click();
        
        return { success: true, buttonInfo: btnInfo };
      }
      
      return { success: false, buttons: buttons.map(b => b.textContent) };
    });
    
    console.log('Save result:', saveResult);
    
    if (saveResult.success) {
      console.log('\n✅ Save button clicked!');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await page.screenshot({ path: 'after-save-direct.png', fullPage: true });
      console.log('📸 Final screenshot: after-save-direct.png');
      
      console.log('\n🎉 Blog post should be created!');
      console.log('🔗 URL: https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025');
    } else {
      console.log('\n⚠️ Could not save automatically.');
      console.log('Available buttons:', saveResult.buttons);
      console.log('\nPlease manually click the Save/Publish button in the browser.');
    }
    
    console.log('\n📋 The blog post includes all 7 infographics:');
    console.log('   1. Key Statistics Infographic');
    console.log('   2. Focus Areas Chart');
    console.log('   3. Timeline Visualization');
    console.log('   4. Regional Impact Map');
    console.log('   5. International Support Graph');
    console.log('   6. Future Priorities Diagram');
    console.log('   7. Call to Action');
    console.log('\n👀 Browser will remain open.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'error-direct.png', fullPage: true });
  }
}

fillBlogForm().catch(console.error);