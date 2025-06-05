const puppeteer = require('puppeteer');

async function debugSiteStatus() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔍 Debugging site status...\n');
    
    // Test the main site
    console.log('📡 Loading main site...');
    await page.goto('https://extraordinary-semifreddo-0c5398.netlify.app/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);
    
    // Check what's actually on the page
    const bodyContent = await page.evaluate(() => {
      return {
        hasNav: document.querySelector('nav') !== null,
        hasHeader: document.querySelector('header') !== null,
        hasMain: document.querySelector('main') !== null,
        bodyText: document.body.innerText.substring(0, 500),
        classes: document.body.className,
        url: window.location.href
      };
    });
    
    console.log(`✅ Page structure:`, bodyContent);
    
    // Try to navigate to grants page
    console.log('\n📊 Testing Grants page...');
    try {
      await page.goto('https://extraordinary-semifreddo-0c5398.netlify.app/grants', { waitUntil: 'networkidle0', timeout: 30000 });
      
      await page.waitForTimeout(5000); // Give extra time for React to load
      
      const grantsPageContent = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          hasGrantsClass: document.querySelector('.grants-page') !== null,
          hasAnyGrants: document.querySelectorAll('[class*="rounded"], [class*="shadow"], .grant').length,
          bodyText: document.body.innerText.substring(0, 500),
          reactLoaded: window.React !== undefined,
          anyErrors: document.querySelector('.error') !== null
        };
      });
      
      console.log(`✅ Grants page content:`, grantsPageContent);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'grants-page-debug.png', fullPage: true });
      console.log('📸 Grants page screenshot saved as grants-page-debug.png');
      
    } catch (grantsError) {
      console.log('❌ Grants page error:', grantsError.message);
    }
    
    // Try to navigate to blog page
    console.log('\n📝 Testing Blog page...');
    try {
      await page.goto('https://extraordinary-semifreddo-0c5398.netlify.app/blog', { waitUntil: 'networkidle0', timeout: 30000 });
      
      await page.waitForTimeout(5000); // Give extra time for React to load
      
      const blogPageContent = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          hasBlogClass: document.querySelector('.blog-page') !== null,
          hasAnyBlogs: document.querySelectorAll('[class*="blog"], [class*="post"], article').length,
          bodyText: document.body.innerText.substring(0, 500),
          anyErrors: document.querySelector('.error') !== null
        };
      });
      
      console.log(`✅ Blog page content:`, blogPageContent);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'blog-page-debug.png', fullPage: true });
      console.log('📸 Blog page screenshot saved as blog-page-debug.png');
      
    } catch (blogError) {
      console.log('❌ Blog page error:', blogError.message);
    }
    
    // Check console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 Console Error:', msg.text());
      }
    });
    
    // Check for React loading issues
    console.log('\n⚛️ Checking React app status...');
    const reactStatus = await page.evaluate(() => {
      return {
        reactVersion: window.React ? window.React.version : 'Not loaded',
        reactDom: window.ReactDOM !== undefined,
        hasReactRoot: document.querySelector('#root') !== null,
        rootContent: document.querySelector('#root') ? document.querySelector('#root').innerHTML.length : 0
      };
    });
    
    console.log(`✅ React status:`, reactStatus);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugSiteStatus();