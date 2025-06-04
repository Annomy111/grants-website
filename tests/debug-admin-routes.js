const puppeteer = require('puppeteer');

async function debugAdminRoutes() {
  console.log('🔍 Debugging Admin Routes');
  console.log('========================');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test different admin URLs
    const testUrls = [
      'https://civil-society-grants-database.netlify.app/admin',
      'https://civil-society-grants-database.netlify.app/admin/login',
      'https://civil-society-grants-database.netlify.app/admin/dashboard'
    ];
    
    for (const url of testUrls) {
      console.log(`\n🔗 Testing: ${url}`);
      
      await page.goto(url, { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysis = await page.evaluate(() => {
        const title = document.title;
        const bodyText = document.body.textContent.substring(0, 200);
        const hasLoginForm = !!document.querySelector('input[name="username"]');
        const hasAdminContent = document.body.textContent.toLowerCase().includes('admin');
        const currentUrl = window.location.href;
        
        return {
          title,
          bodyText,
          hasLoginForm,
          hasAdminContent,
          currentUrl
        };
      });
      
      console.log(`  Title: ${analysis.title}`);
      console.log(`  Current URL: ${analysis.currentUrl}`);
      console.log(`  Has login form: ${analysis.hasLoginForm}`);
      console.log(`  Has admin content: ${analysis.hasAdminContent}`);
      console.log(`  Body preview: ${analysis.bodyText}`);
    }
    
    // Test auth API directly
    console.log('\n🔌 Testing Auth API directly...');
    const authTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/.netlify/functions/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        
        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log(`Auth API result:`, authTest);
    
  } finally {
    await browser.close();
  }
}

debugAdminRoutes();