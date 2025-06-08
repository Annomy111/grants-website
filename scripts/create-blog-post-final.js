const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createBlogPost() {
  console.log('🚀 Starting blog post creation...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    // Navigate to login
    console.log('📍 Step 1: Going to login page...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/login');
    await page.waitForSelector('input[placeholder="Username"]');
    
    // Login
    console.log('📍 Step 2: Logging in...');
    
    // Clear and type username
    const usernameInput = await page.$('input[placeholder="Username"]');
    await usernameInput.click({ clickCount: 3 });
    await usernameInput.type('admin');
    
    // Clear and type password  
    const passwordInput = await page.$('input[placeholder="Password"]');
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('admin123');
    
    // Click Sign in button
    const signInButton = await page.$('button[type="submit"]');
    await signInButton.click();
    
    // Wait for navigation - increase timeout
    console.log('Waiting for login...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if we're logged in
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      console.log('❌ Login failed - still on login page');
      console.log('Please manually:');
      console.log('1. Log in with admin/admin123');
      console.log('2. Navigate to Blog Posts');
      console.log('3. Click New Post');
      console.log('4. Use the data from blog-post-data.json');
      
      // Keep browser open
      console.log('\nBrowser will stay open for manual entry.');
      return;
    }
    
    console.log('✅ Logged in successfully');
    console.log('Current URL:', currentUrl);
    
    // The rest would continue here if login worked...
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nManual steps:');
    console.log('1. Go to: https://civil-society-grants-database.netlify.app/admin/login');
    console.log('2. Login with: admin / admin123');
    console.log('3. Navigate to Blog Posts → New Post');
    console.log('4. Copy data from blog-post-data.json');
  }
}

createBlogPost();