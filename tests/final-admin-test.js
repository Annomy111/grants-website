const puppeteer = require('puppeteer');

async function finalAdminTest() {
  console.log('🏁 FINAL ADMIN LOGIN TEST');
  console.log('========================');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100 // Slow down for debugging
  });
  const page = await browser.newPage();
  
  // Monitor all network requests
  page.on('request', request => {
    console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`❌ RESPONSE ERROR: ${response.status()} ${response.url()}`);
    } else if (response.url().includes('auth')) {
      console.log(`✅ AUTH RESPONSE: ${response.status()} ${response.url()}`);
    }
  });
  
  // Monitor console logs
  page.on('console', msg => {
    const type = msg.type();
    console.log(`🖥️  CONSOLE ${type.toUpperCase()}: ${msg.text()}`);
  });
  
  try {
    console.log('\n1️⃣ Testing API endpoint directly...');
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/.netlify/functions/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const data = await response.json();
        return { status: response.status, ok: response.ok, hasToken: !!data.token };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log(`🔌 Direct API test: ${JSON.stringify(apiTest)}`);
    
    console.log('\n2️⃣ Loading admin login page...');
    await page.goto('https://civil-society-grants-database.netlify.app/admin/login', { 
      waitUntil: 'networkidle0' 
    });
    
    // Wait for React to load
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    console.log('\n3️⃣ Checking login form...');
    const formCheck = await page.evaluate(() => {
      const form = document.querySelector('form');
      const username = document.querySelector('input[name="username"]');
      const password = document.querySelector('input[name="password"]');
      const submit = document.querySelector('button[type="submit"]');
      
      return {
        hasForm: !!form,
        hasUsername: !!username,
        hasPassword: !!password,
        hasSubmit: !!submit,
        formHTML: form?.outerHTML?.substring(0, 200) || 'No form found'
      };
    });
    
    console.log(`📋 Form check: ${JSON.stringify(formCheck, null, 2)}`);
    
    if (!formCheck.hasForm) {
      console.log('❌ No login form found - stopping test');
      return false;
    }
    
    console.log('\n4️⃣ Filling login form...');
    await page.type('input[name="username"]', 'admin', { delay: 100 });
    await page.type('input[name="password"]', 'admin123', { delay: 100 });
    
    console.log('\n5️⃣ Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for any auth request to complete
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    console.log('\n6️⃣ Checking results...');
    const finalUrl = page.url();
    const isLoggedIn = finalUrl.includes('/admin/dashboard') || 
                      (finalUrl.includes('/admin') && !finalUrl.includes('/login'));
    
    console.log(`🎯 Final URL: ${finalUrl}`);
    console.log(`🔓 Login successful: ${isLoggedIn}`);
    
    // Check for any error messages
    const errorCheck = await page.evaluate(() => {
      const errorEl = document.querySelector('.text-red-800, .text-red-700, [class*="error"]');
      return errorEl ? errorEl.textContent : null;
    });
    
    if (errorCheck) {
      console.log(`❌ Error message: ${errorCheck}`);
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/winzendwyers/grants website/tests/screenshots/final-admin-test.png',
      fullPage: true 
    });
    
    console.log('\n📊 FINAL SUMMARY:');
    console.log('================');
    console.log(`API Working: ${apiTest.ok ? '✅' : '❌'}`);
    console.log(`Form Found: ${formCheck.hasForm ? '✅' : '❌'}`);
    console.log(`Login Success: ${isLoggedIn ? '✅' : '❌'}`);
    console.log(`No Errors: ${!errorCheck ? '✅' : '❌'}`);
    
    const overallSuccess = apiTest.ok && formCheck.hasForm && isLoggedIn && !errorCheck;
    console.log(`Overall Result: ${overallSuccess ? '🎉 SUCCESS' : '❌ FAILED'}`);
    
    return overallSuccess;
    
  } finally {
    console.log('\n🔍 Keeping browser open for manual inspection...');
    // await browser.close();
  }
}

finalAdminTest().then(success => {
  if (success) {
    console.log('\n🎉 ADMIN LOGIN FULLY WORKING!');
  } else {
    console.log('\n❌ Admin login needs debugging');
  }
});