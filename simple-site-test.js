const puppeteer = require('puppeteer');

async function simpleSiteTest() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔍 Testing current site deployment...\n');
    
    // Test different URLs to find working deployment
    const urlsToTest = [
      'https://extraordinary-semifreddo-0c5398.netlify.app/',
      'https://extraordinary-semifreddo-0c5398.netlify.app/grants',
      'https://extraordinary-semifreddo-0c5398.netlify.app/blog'
    ];
    
    for (const url of urlsToTest) {
      console.log(`📡 Testing: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        const pageInfo = await page.evaluate(() => {
          return {
            title: document.title,
            url: window.location.href,
            hasError: document.body.innerText.includes('Site not found') || 
                     document.body.innerText.includes('404') ||
                     document.body.innerText.includes('Page not found'),
            bodyLength: document.body.innerText.length,
            hasReactRoot: document.querySelector('#root') !== null,
            rootHasContent: document.querySelector('#root') ? document.querySelector('#root').innerHTML.length > 0 : false
          };
        });
        
        console.log(`   Result:`, pageInfo);
        
        if (!pageInfo.hasError && pageInfo.rootHasContent) {
          console.log(`   ✅ Working URL found: ${url}`);
          
          // Take a screenshot of the working page
          await page.screenshot({ path: `working-page-${Date.now()}.png` });
          console.log(`   📸 Screenshot saved`);
          break;
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

simpleSiteTest();