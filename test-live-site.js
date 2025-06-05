const puppeteer = require('puppeteer');

async function testLiveSite() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🚀 Testing Live Site Directly...\n');
    
    // Test the grants page directly
    console.log('📊 Testing Grants Display');
    await page.goto('https://extraordinary-semifreddo-0c5398.netlify.app/grants', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.innerText.substring(0, 1000),
        hasGrantCards: document.querySelectorAll('[class*="rounded-xl"], [class*="shadow-md"]').length,
        hasLogos: document.querySelectorAll('img[alt*="logo"]').length,
        hasExpandButtons: Array.from(document.querySelectorAll('button')).filter(b => 
          b.textContent.includes('View Details') || b.textContent.includes('Show More')).length
      };
    });
    
    console.log('Page Content:', pageContent);
    
    if (pageContent.hasGrantCards > 0) {
      console.log(`✅ Found ${pageContent.hasGrantCards} grant cards`);
      
      // Try to expand a grant to see detailed information
      const expanded = await page.evaluate(() => {
        const detailButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('View Details') || btn.textContent.includes('Show More')
        );
        if (detailButtons.length > 0) {
          detailButtons[0].click();
          return true;
        }
        return false;
      });
      
      if (expanded) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const enhancedInfo = await page.evaluate(() => {
          const sections = [];
          const headings = Array.from(document.querySelectorAll('h3'));
          
          headings.forEach(h3 => {
            const text = h3.textContent.toUpperCase();
            if (text.includes('APPLICATION PROCEDURE')) sections.push('Application Procedure');
            if (text.includes('REQUIRED DOCUMENTS')) sections.push('Required Documents');
            if (text.includes('CONTACT INFORMATION')) sections.push('Contact Information');
            if (text.includes('EVALUATION CRITERIA')) sections.push('Evaluation Criteria');
            if (text.includes('ADDITIONAL REQUIREMENTS')) sections.push('Additional Requirements');
            if (text.includes('REPORTING REQUIREMENTS')) sections.push('Reporting Requirements');
          });
          
          return {
            enhancedSections: sections,
            emailLinks: document.querySelectorAll('a[href^="mailto:"]').length
          };
        });
        
        console.log(`✅ Enhanced sections found: ${enhancedInfo.enhancedSections.join(', ')}`);
        console.log(`✅ Email links: ${enhancedInfo.emailLinks}`);
      }
    }
    
    // Test blog page
    console.log('\n📝 Testing Blog Page');
    await page.goto('https://extraordinary-semifreddo-0c5398.netlify.app/blog', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const blogContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasBlogPosts: document.querySelectorAll('article, [class*="blog"], [class*="post"]').length,
        hasReadMore: Array.from(document.querySelectorAll('a, button')).filter(el => 
          el.textContent.includes('Read more') || el.textContent.includes('Continue')).length,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('Blog Content:', blogContent);
    
    // Take screenshots
    await page.screenshot({ path: 'grants-page-test.png', fullPage: true });
    console.log('\n📸 Screenshots saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testLiveSite();