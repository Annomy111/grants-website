const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function addBlogPost() {
  console.log('Starting Puppeteer to add blog post...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Step 1: Navigate to admin login
    console.log('Step 1: Navigating to admin login...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/login', {
      waitUntil: 'networkidle0'
    });
    
    await page.waitForSelector('input[placeholder="Username"]', { visible: true });
    
    // Step 2: Fill login form
    console.log('Step 2: Filling login form...');
    
    // Type username
    await page.type('input[placeholder="Username"]', 'admin', { delay: 100 });
    
    // Type password
    await page.type('input[placeholder="Password"]', 'admin123', { delay: 100 });
    
    // Click Sign in button using evaluate
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const signInBtn = buttons.find(btn => btn.textContent.includes('Sign in'));
      if (signInBtn) signInBtn.click();
    });
    
    // Wait for navigation
    console.log('Waiting for login to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Step 3: Navigating to blog section...');
    
    // Try clicking Blog Posts in sidebar
    const blogClicked = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, div, button'));
      const blogLink = links.find(el => 
        el.textContent && el.textContent.trim() === 'Blog Posts'
      );
      if (blogLink) {
        blogLink.click();
        return true;
      }
      return false;
    });
    
    if (!blogClicked) {
      // Try direct navigation
      await page.goto('https://civil-society-grants-database.netlify.app/admin/blog', {
        waitUntil: 'networkidle0'
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Step 4: Creating new blog post...');
    
    // Click New Post button
    const newPostClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const newBtn = buttons.find(el => 
        el.textContent && (
          el.textContent.includes('New Post') || 
          el.textContent.includes('Create') ||
          el.textContent.includes('Add Post') ||
          el.textContent === '+'
        )
      );
      if (newBtn) {
        newBtn.click();
        return true;
      }
      return false;
    });
    
    if (!newPostClicked) {
      // Try direct navigation to new post
      await page.goto('https://civil-society-grants-database.netlify.app/admin/blog/new', {
        waitUntil: 'networkidle0'
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Step 5: Filling blog post form...');
    
    // Take a screenshot to see what we're working with
    await page.screenshot({ path: 'blog-form-state.png' });
    
    // Read blog content
    const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // Title
    const titleFilled = await page.evaluate((title) => {
      const titleInput = document.querySelector('input[name="title"], input[id="title"], input[placeholder*="title" i]');
      if (titleInput) {
        titleInput.value = title;
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }, "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)");
    console.log('Title filled:', titleFilled);
    
    // Slug
    await page.evaluate((slug) => {
      const slugInput = document.querySelector('input[name="slug"], input[id="slug"], input[placeholder*="slug" i]');
      if (slugInput) {
        slugInput.value = slug;
        slugInput.dispatchEvent(new Event('input', { bubbles: true }));
        slugInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 'ukraine-civil-society-pulse-may-june-2025');
    
    // Content
    await page.evaluate((content) => {
      const contentArea = document.querySelector('textarea[name="content"], textarea[id="content"], textarea[placeholder*="content" i]');
      if (contentArea) {
        contentArea.value = content;
        contentArea.dispatchEvent(new Event('input', { bubbles: true }));
        contentArea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, blogContent);
    
    // Excerpt
    await page.evaluate((excerpt) => {
      const excerptInput = document.querySelector('textarea[name="excerpt"], input[name="excerpt"], textarea[id="excerpt"], input[id="excerpt"]');
      if (excerptInput) {
        excerptInput.value = excerpt;
        excerptInput.dispatchEvent(new Event('input', { bubbles: true }));
        excerptInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations.");
    
    // Category
    await page.evaluate(() => {
      const categoryInput = document.querySelector('input[name="category"], input[id="category"]');
      if (categoryInput) {
        categoryInput.value = 'Reports';
        categoryInput.dispatchEvent(new Event('input', { bubbles: true }));
        categoryInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Tags
    await page.evaluate(() => {
      const tagsInput = document.querySelector('input[name="tags"], input[id="tags"], textarea[name="tags"]');
      if (tagsInput) {
        tagsInput.value = 'Ukraine, Civil Society, Human Rights, Humanitarian Aid, EU Integration';
        tagsInput.dispatchEvent(new Event('input', { bubbles: true }));
        tagsInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Status - try dropdown
    await page.evaluate(() => {
      const statusSelect = document.querySelector('select[name="status"]');
      if (statusSelect) {
        statusSelect.value = 'published';
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Step 6: Saving blog post...');
    
    // Take screenshot before save
    await page.screenshot({ path: 'blog-form-filled.png', fullPage: true });
    
    // Try to click save button
    const saved = await page.evaluate(() => {
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
    
    console.log('Save button clicked:', saved);
    
    // Wait for save
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take final screenshot
    await page.screenshot({ path: 'blog-post-final.png', fullPage: true });
    
    console.log('\n✅ Process completed!');
    console.log('Check screenshots: blog-form-state.png, blog-form-filled.png, blog-post-final.png');
    console.log('Blog post URL: https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025');
    console.log('\nBrowser will remain open for manual verification.');
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }
}

addBlogPost();