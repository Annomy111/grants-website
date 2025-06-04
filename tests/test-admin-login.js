const puppeteer = require('puppeteer');

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login Functionality');
  console.log('==================================');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true 
  });
  const page = await browser.newPage();
  
  try {
    // Monitor console for debugging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warn') {
        console.log(`🖥️  ${type.toUpperCase()}: ${msg.text()}`);
      }
    });
    
    // Test 1: Navigate to admin login
    console.log('\n🔍 Test 1: Navigate to admin login page...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/login', { 
      waitUntil: 'networkidle0' 
    });
    
    // Check if login form exists
    const loginForm = await page.$('form');
    const usernameInput = await page.$('input[name="username"]');
    const passwordInput = await page.$('input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    console.log(`✅ Login form found: ${!!loginForm}`);
    console.log(`✅ Username input found: ${!!usernameInput}`);
    console.log(`✅ Password input found: ${!!passwordInput}`);
    console.log(`✅ Submit button found: ${!!submitButton}`);
    
    if (!loginForm || !usernameInput || !passwordInput || !submitButton) {
      console.log('❌ Login form elements missing!');
      return false;
    }
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/tests/screenshots/admin-login-page.png',
      fullPage: true 
    });
    
    // Test 2: Test the auth API endpoint directly
    console.log('\n🔍 Test 2: Testing auth API endpoint...');
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/.netlify/functions/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
          })
        });
        
        const data = await response.json();
        
        return {
          status: response.status,
          ok: response.ok,
          data: data,
          hasToken: !!(data && data.token),
          hasUser: !!(data && data.user)
        };
      } catch (error) {
        return {
          error: error.message,
          status: 0,
          ok: false
        };
      }
    });
    
    console.log(`🔌 Auth API Status: ${apiTest.status}`);
    console.log(`🔌 Auth API OK: ${apiTest.ok}`);
    console.log(`🔌 Has Token: ${apiTest.hasToken}`);
    console.log(`🔌 Has User: ${apiTest.hasUser}`);
    
    if (apiTest.error) {
      console.log(`❌ API Error: ${apiTest.error}`);
    }
    
    if (apiTest.data) {
      console.log(`📊 API Response: ${JSON.stringify(apiTest.data, null, 2)}`);
    }
    
    // Test 3: Try to login via the form
    console.log('\n🔍 Test 3: Testing form login...');
    
    // Clear inputs and type credentials
    await usernameInput.click({ clickCount: 3 });
    await usernameInput.type('admin');
    
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('admin123');
    
    // Take screenshot before submit
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/tests/screenshots/admin-login-filled.png',
      fullPage: true 
    });
    
    // Submit form
    await submitButton.click();
    
    // Wait for navigation or error
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Check if redirected to dashboard
    const isOnDashboard = currentUrl.includes('/admin/dashboard') || currentUrl.includes('/admin');
    console.log(`🎯 Redirected to admin area: ${isOnDashboard}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/tests/screenshots/admin-login-result.png',
      fullPage: true 
    });
    
    // Check for any error messages
    const errorElement = await page.$('.text-red-800, .text-red-700, .bg-red-50');
    let errorMessage = null;
    if (errorElement) {
      errorMessage = await page.evaluate(el => el.textContent, errorElement);
      console.log(`❌ Error message: ${errorMessage}`);
    }
    
    // Summary
    console.log('\n📊 LOGIN TEST SUMMARY:');
    console.log('=====================');
    console.log(`Form elements: ${loginForm && usernameInput && passwordInput && submitButton ? '✅' : '❌'}`);
    console.log(`Auth API working: ${apiTest.ok ? '✅' : '❌'}`);
    console.log(`Login successful: ${isOnDashboard ? '✅' : '❌'}`);
    console.log(`Error present: ${errorMessage ? '❌' : '✅'}`);
    
    const success = loginForm && usernameInput && passwordInput && submitButton && 
                   apiTest.ok && isOnDashboard && !errorMessage;
    
    return {
      success,
      details: {
        formValid: !!(loginForm && usernameInput && passwordInput && submitButton),
        apiWorking: apiTest.ok,
        loginSuccessful: isOnDashboard,
        noErrors: !errorMessage,
        currentUrl,
        errorMessage
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser left open for manual inspection...');
    // await browser.close();
  }
}

testAdminLogin().then(result => {
  if (result && result.success) {
    console.log('\n🎉 Admin login test PASSED!');
  } else {
    console.log('\n❌ Admin login test FAILED!');
    if (result && result.details) {
      console.log('Details:', result.details);
    }
  }
});