const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('Navigating to grants page...');
    await page.goto('http://localhost:3000/grants', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get page content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyClasses: document.body.className,
        hasGrantsPage: !!document.querySelector('.grants-page'),
        hasGrantsPageAlt: !!document.querySelector('[class*="grants-page"]'),
        mainContent: document.querySelector('#root')?.innerHTML?.substring(0, 500),
        allDivClasses: Array.from(document.querySelectorAll('div')).slice(0, 10).map(div => div.className)
      };
    });

    console.log('\n=== PAGE CONTENT ANALYSIS ===');
    console.log('Title:', pageContent.title);
    console.log('Body classes:', pageContent.bodyClasses);
    console.log('Has .grants-page:', pageContent.hasGrantsPage);
    console.log('Has [class*="grants-page"]:', pageContent.hasGrantsPageAlt);
    console.log('\nFirst 10 div classes:');
    pageContent.allDivClasses.forEach((cls, i) => {
      console.log(`  ${i}: ${cls || '(no class)'}`);
    });
    console.log('\nMain content preview:');
    console.log(pageContent.mainContent);

    // Check for errors
    const errors = await page.evaluate(() => {
      return window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.rendererInterfaces?.size > 0 ? 'React loaded' : 'React not detected';
    });
    console.log('\nReact status:', errors);

    // Take screenshot
    await page.screenshot({ path: 'debug-grants-page.png' });
    console.log('\nScreenshot saved as debug-grants-page.png');

    console.log('\nKeeping browser open for 15 seconds...');
    await new Promise(resolve => setTimeout(resolve, 15000));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();