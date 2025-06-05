const puppeteer = require('puppeteer');

async function checkTranslationsStatus() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔍 Testing Ukrainian Translation Display...\n');
    
    await page.goto('https://civil-society-grants-database.netlify.app/grants', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Look for language switcher
    const languageSwitcher = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const ukButton = buttons.find(btn => 
        btn.textContent.includes('Ukrainian') || 
        btn.textContent.includes('Українська') ||
        btn.textContent.includes('UK') ||
        btn.textContent.includes('УКР')
      );
      return {
        found: \!\!ukButton,
        text: ukButton ? ukButton.textContent : 'Not found'
      };
    });
    
    console.log('Language Switcher:', languageSwitcher);
    
    // Try to switch to Ukrainian
    if (languageSwitcher.found) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const ukButton = buttons.find(btn => 
          btn.textContent.includes('Ukrainian') || 
          btn.textContent.includes('Українська') ||
          btn.textContent.includes('UK') ||
          btn.textContent.includes('УКР')
        );
        if (ukButton) ukButton.click();
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Check current language and grant display
    const pageAnalysis = await page.evaluate(() => {
      const grants = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
      let firstGrantTitle = '';
      let firstGrantOrg = '';
      
      if (grants.length > 0) {
        for (let grant of grants) {
          const title = grant.querySelector('h2');
          if (title && \!title.textContent.includes('Filters')) {
            firstGrantTitle = title.textContent;
            const org = grant.querySelector('[class*="text-blue"]');
            firstGrantOrg = org ? org.textContent : '';
            break;
          }
        }
      }
      
      return {
        currentUrl: window.location.href,
        htmlLang: document.documentElement.lang,
        bodyText: document.body.innerText.substring(0, 500),
        grantsCount: grants.length,
        firstGrantTitle: firstGrantTitle,
        firstGrantOrg: firstGrantOrg,
        hasUkrainianText: document.body.innerText.includes('Гранти') || 
                         document.body.innerText.includes('Пошук') ||
                         document.body.innerText.includes('Організація')
      };
    });
    
    console.log('\nPage Analysis:', pageAnalysis);
    
    // Check API response
    console.log('\n🌐 Checking API Response...');
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/.netlify/functions/grants');
        const data = await response.json();
        const firstGrant = data[0];
        return {
          status: response.status,
          hasData: \!\!data && data.length > 0,
          firstGrant: firstGrant ? {
            grant_name: firstGrant.grant_name,
            grant_name_uk: firstGrant.grant_name_uk,
            funding_organization: firstGrant.funding_organization,
            funding_organization_uk: firstGrant.funding_organization_uk
          } : null
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('API Response:', apiResponse);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

checkTranslationsStatus();
EOF < /dev/null