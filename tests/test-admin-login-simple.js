const puppeteer = require('puppeteer');

async function testAdminLoginSimple() {
  console.log('🔐 Simple Admin Login Test');
  console.log('=========================');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📍 Navigating to admin login...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for loading animation to finish
    console.log('⏳ Waiting for loading animation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/tests/screenshots/admin-login-simple.png',
      fullPage: true 
    });
    
    // Check for login form
    const loginElements = await page.evaluate(() => {
      return {
        hasForm: !!document.querySelector('form'),
        hasUsernameInput: !!document.querySelector('input[name="username"]'),
        hasPasswordInput: !!document.querySelector('input[name="password"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
        hasAdminText: document.body.textContent.includes('Admin Login'),
        pageTitle: document.title,
        url: window.location.href,
        bodyText: document.body.textContent.substring(0, 300)
      };
    });
    
    console.log('📊 Page Analysis:');
    console.log(`  URL: ${loginElements.url}`);
    console.log(`  Title: ${loginElements.pageTitle}`);
    console.log(`  Has Form: ${loginElements.hasForm}`);
    console.log(`  Has Username Input: ${loginElements.hasUsernameInput}`);
    console.log(`  Has Password Input: ${loginElements.hasPasswordInput}`);
    console.log(`  Has Submit Button: ${loginElements.hasSubmitButton}`);
    console.log(`  Has Admin Text: ${loginElements.hasAdminText}`);
    console.log(`  Body Preview: ${loginElements.bodyText}`);
    
    if (loginElements.hasForm && loginElements.hasUsernameInput && loginElements.hasPasswordInput) {
      console.log('\n✅ Admin login form found! Testing login...');
      
      // Fill in credentials
      await page.type('input[name="username"]', 'admin');
      await page.type('input[name="password"]', 'admin123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check if redirected
      const finalUrl = page.url();
      console.log(`🎯 Final URL: ${finalUrl}`);
      
      const isLoggedIn = finalUrl.includes('/admin/dashboard') || finalUrl.includes('/admin') && !finalUrl.includes('/login');
      console.log(`🔓 Login Success: ${isLoggedIn}`);
      
      // Take final screenshot
      await page.screenshot({ 
        path: '/Users/winzendwyers/grants website/tests/screenshots/admin-login-result-simple.png',
        fullPage: true 
      });
      
      return isLoggedIn;
    } else {
      console.log('❌ Admin login form not found!');
      return false;
    }
    
  } finally {
    console.log('\n📸 Screenshots saved in tests/screenshots/');
    console.log('🔍 Browser window left open for inspection...');
    // await browser.close();
  }
}

testAdminLoginSimple().then(success => {
  console.log(success ? '\n🎉 Admin login test PASSED!' : '\n❌ Admin login test FAILED!');
});